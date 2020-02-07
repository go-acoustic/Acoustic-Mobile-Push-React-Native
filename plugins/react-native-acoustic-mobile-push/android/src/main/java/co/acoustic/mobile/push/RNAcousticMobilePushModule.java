/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */
 
package co.acoustic.mobile.push;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.DisplayCutout;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.security.ProviderInstaller;
import co.acoustic.mobile.push.sdk.Preferences;
import co.acoustic.mobile.push.sdk.SdkPreferences;
import co.acoustic.mobile.push.sdk.api.Endpoint;
import co.acoustic.mobile.push.sdk.api.MceSdk;
import co.acoustic.mobile.push.sdk.api.MceSdkConfiguration;
import co.acoustic.mobile.push.sdk.api.MediaManager;
import co.acoustic.mobile.push.sdk.api.SdkState;
import co.acoustic.mobile.push.sdk.api.attribute.Attribute;
import co.acoustic.mobile.push.sdk.api.attribute.BooleanAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.DateAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.NumberAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.StringAttribute;
import co.acoustic.mobile.push.sdk.api.event.Event;
import co.acoustic.mobile.push.sdk.api.notification.NotificationsPreference;
import co.acoustic.mobile.push.sdk.api.registration.RegistrationClient;
import co.acoustic.mobile.push.sdk.api.registration.RegistrationDetails;
import co.acoustic.mobile.push.sdk.apiinternal.MceSdkInternal;
import co.acoustic.mobile.push.sdk.beacons.IBeaconsPreferences;
import co.acoustic.mobile.push.sdk.beacons.MceBluetoothScanner;
import co.acoustic.mobile.push.sdk.db.DbAdapter;
import co.acoustic.mobile.push.sdk.encryption.EncryptionPreferences;
import co.acoustic.mobile.push.sdk.job.MceJobManager;
import co.acoustic.mobile.push.sdk.location.LocationManager;
import co.acoustic.mobile.push.sdk.location.LocationPreferences;
import co.acoustic.mobile.push.sdk.location.LocationRetrieveService;
import co.acoustic.mobile.push.sdk.messaging.MessagingManager;
import co.acoustic.mobile.push.sdk.notification.NotificationsUtility;
import co.acoustic.mobile.push.sdk.plugin.Plugin;
import co.acoustic.mobile.push.sdk.plugin.PluginRegistry;
import co.acoustic.mobile.push.sdk.registration.PhoneHomeManager;
import co.acoustic.mobile.push.sdk.registration.RegistrationClientImpl;
import co.acoustic.mobile.push.sdk.registration.RegistrationIntentService;
import co.acoustic.mobile.push.sdk.session.SessionManager;
import co.acoustic.mobile.push.sdk.session.SessionTrackingTask;
import co.acoustic.mobile.push.sdk.task.MceSdkTaskScheduler;
import co.acoustic.mobile.push.sdk.util.AssetsUtil;
import co.acoustic.mobile.push.sdk.util.Iso8601;
import co.acoustic.mobile.push.sdk.util.Logger;
import co.acoustic.mobile.push.sdk.wi.MceSdkWakeLock;
import co.acoustic.mobile.push.sdk.location.LocationBroadcastReceiver;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import static co.acoustic.mobile.push.sdk.SdkTags.TAG_BEACON;
import static co.acoustic.mobile.push.sdk.SdkTags.TAG_LOCATION;
import static co.acoustic.mobile.push.sdk.SdkTags.TAG_SDK_LIFECYCLE;
import static co.acoustic.mobile.push.sdk.SdkTags.TAG_SDK_LIFECYCLE_INIT;

public class RNAcousticMobilePushModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

	private static final String TAG = "RNAcousticMobilePushModule";
	protected static ReactApplicationContext reactContext;
    private static boolean restart = false;
    private static MceSdkConfiguration mceSdkConfiguration;

    static String channelDescription = "This is the notification channel for the MCE SDK sample application";
    static CharSequence channelName = "MCE SDK Notification Channel";
    static String channelIdentifier = "mce_sample_channel";

    // Send event to javascript
    static protected void sendEvent(String eventName, WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    /**
     * This method should be used to reinitialize the sdk after user deletion if auto reinitialize is false
     */
    public static void reinitialize() {
        try {
            boolean sdkStopped = RegistrationClientImpl.isSdkStopped(reactContext);
            Logger.d(TAG, "SDK reinitialize: restart = "+restart+", sdkStopped = "+sdkStopped);
            if(sdkStopped && !restart) {
                restart();
            }
        } catch (Throwable t) {
            Logger.e(TAG, "Failed to reinitisalize SDK", t);
        }
    }

    static void restart() {
        try {
            restart = true;
            reinit();
            restart = false;
            RegistrationClientImpl.setSdkStopped(reactContext, false);
        } catch (Throwable t) {
            Logger.e(TAG, "Failed to restart SDK", t);
        }
    }
    
    private static void reinit() { 
        RegistrationClientImpl.markSdkAsInitiated(reactContext);
        boolean sdkStopped = RegistrationClientImpl.isSdkStopped(reactContext);
        setupSdkLogging();

        SdkPreferences.setDatabaseImpl(reactContext, mceSdkConfiguration.getDatabaseConfiguration().getDatabaseImplClassName());
        EncryptionPreferences.setEncryptionImpl(reactContext, mceSdkConfiguration.getDatabaseConfiguration().getEncryptionProviderClassName());
        EncryptionPreferences.setKeyGeneratorImpl(reactContext, mceSdkConfiguration.getDatabaseConfiguration().getKeyGeneratorClassName());
        EncryptionPreferences.setDatabaseEncrypted(reactContext, mceSdkConfiguration.getDatabaseConfiguration().isEncrypted());
        long keyRotationInterval = (long)Math.max(1, mceSdkConfiguration.getDatabaseConfiguration().getKeyRotationIntervalInDays()) * 24L * 60L * 60L * 1000L;
        EncryptionPreferences.setKeyRotationInterval(reactContext, keyRotationInterval);
        if(!DbAdapter.isDbAvailable(reactContext)) {
            Logger.e(TAG, "Database not available. Aborting init");
            return;
        }
        verifySdkState();
        if(restart || !sdkStopped || mceSdkConfiguration.isAutoReinitialize()) {
            Logger.d(TAG, "SDK configuration: " + mceSdkConfiguration);
            Logger.d(TAG, "SDK initialize: restart = "+restart+", sdkStopped = "+sdkStopped+", auto reinitialize: "+mceSdkConfiguration.isAutoReinitialize());
            startMceSdk();
        } else {
            Logger.d(TAG,"GDPR State detected. SDK start disabled");
        }

        SdkPreferences.setMceConfiguration(reactContext, mceSdkConfiguration);
        if(LocationPreferences.isEnableLocations(reactContext)) {
            LocationBroadcastReceiver.startLocationUpdates(reactContext);
        }
    }

    static void sendReactNativeChannelAttribute() {
        List<Attribute> attributes = new LinkedList<Attribute>();
        attributes.add(new StringAttribute("sdk", "react-native"));
        attributes.add(new StringAttribute("react-native", MceSdk.getSdkVerNumber() ));
        try {
            Logger.d(TAG, "Sending react-native channel attribute");
            MceSdkInternal.getQueuedAttributesClient().updateChannelAttributes(reactContext, attributes);
        } catch (JSONException ex) {
            Logger.d(TAG, "Couldn't create channel attribute", ex);
        }
    }

    private static void startMceSdk() {
        applyMceSdkConfiguration();
        Logger.d(TAG, "SDK configuration was applied");
        try {
            Class inAppPluginClass = Class.forName("co.acoustic.mobile.push.sdk.plugin.inapp.InAppPlugin");
            Plugin inAppPlugin = (Plugin)inAppPluginClass.newInstance();
            PluginRegistry.registerPlugin("inApp", inAppPlugin);
            Logger.d(TAG, "Registered inApp plugin");
        } catch (ClassNotFoundException e) {
            Logger.e(TAG, "No inApp plugin found");
        } catch (Exception e) {
            Logger.d(TAG, "Unexpected issue occurred while setting up InApp support");
        }
        MceSdk.getRegistrationClient().start(reactContext, mceSdkConfiguration);
        Log.d(TAG, "SDK started" + mceSdkConfiguration);
        PhoneHomeManager.onAppStartup(reactContext);

        if(MceSdk.getRegistrationClient().getRegistrationDetails(reactContext).getUserId() != null) {
            sendReactNativeChannelAttribute();
        }
    }

    private static void verifySdkState() {
        SdkState sdkState = MceSdk.getRegistrationClient().getSdkState(reactContext);
        if(sdkState == null) {
            if(RegistrationClientImpl.isSdkUpdating(reactContext)) {
                RegistrationClientImpl.setSdkState(reactContext, SdkState.UPDATING);
            } else if(RegistrationClientImpl.isSdkStopped(reactContext)) {
                RegistrationClientImpl.setSdkState(reactContext, SdkState.STOPPED);
            } else if(MceSdk.getRegistrationClient().getRegistrationDetails(reactContext).getChannelId() != null) {
                RegistrationClientImpl.setSdkState(reactContext, SdkState.REGISTERED);
            } else {
                RegistrationClientImpl.setSdkState(reactContext, SdkState.UNREGISTERED);
            }
        }
    }

    private static void initSdk() {
        final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread thread, Throwable throwable) {
                try {
                    Logger.d(TAG, "Unexpected error", throwable);
                    Logger.flush();
                } catch (Throwable t) {
                    Log.e(TAG, "Failed to log unexpected error ", t);
                }
                defaultHandler.uncaughtException(thread, throwable);
            }
        });
        if(Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
            try {
                ProviderInstaller.installIfNeeded(reactContext);
            } catch (Exception e) {
                Log.e(TAG, "Failed to install push provider", e);
            }
        }
        reinit();
    }

	public RNAcousticMobilePushModule(ReactApplicationContext reactContext) {
		super(reactContext);
        reactContext.addLifecycleEventListener(this);
        Logger.v(TAG, "RNAcousticMobilePushModule");
		RNAcousticMobilePushModule.reactContext = reactContext;
		try {            
			String configString = AssetsUtil.getAssetAsString(reactContext, "MceConfig.json");
			parseJsonConfiguration(configString);
            if(mceSdkConfiguration == null) {
                Logger.e(TAG, "Couldn't parse MceConfig.json file.");
                return;
            }

            SdkState sdkState = MceSdk.getRegistrationClient().getSdkState(reactContext);
            if (!mceSdkConfiguration.isAutoInitialize()) {
                if (!SdkState.STOPPED.equals(sdkState)) {
                    Logger.d(TAG, "Tentative init. Waiting for internal init call");
                    return;
                } else {
                    Logger.d(TAG, "SDK was initiated before. Tentative init is executed");
                }
            }
            if(SdkState.STOPPED.equals(sdkState)) {
                RegistrationClientImpl.setSdkState(reactContext, SdkState.UNREGISTERED);
            }
            initSdk();
		} catch(Exception ex) {
			Logger.e(TAG, "Couldn't initialize MCE SDK", ex);
		}
	}

    private static void setupSdkLogging() {
        if (mceSdkConfiguration.isLogFile()) {
            Logger.e(TAG, "External storage: " + Environment
                    .getExternalStorageState() + ", " + Environment
                    .getExternalStorageDirectory() + " " + (Environment
                    .getExternalStorageDirectory() != null ? Environment
                    .getExternalStorageDirectory().exists() : ""));
        } else {
            Logger.e(TAG, "No log to file");
        }

        try {
            if (Logger.initLogPersistence(reactContext, mceSdkConfiguration)) {
                Logger.writeToProfile("appKey", mceSdkConfiguration.getAppKey());
                Logger.writeToProfile("senderId", mceSdkConfiguration.getSenderId());
                Logger.writeToProfile("sessionEnabled", String.valueOf(mceSdkConfiguration.isSessionsEnabled()));
                Logger.writeToProfile("sessionDurationInMinutes", String.valueOf(mceSdkConfiguration.getSessionTimeout()));
                Logger.writeToProfile("metricsTimeInterval", String.valueOf(mceSdkConfiguration.getMetricTimeInterval()));
                Logger.writeToProfile("logLevel", String.valueOf(mceSdkConfiguration.getLogLevel()));
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to initiate logging: " + e);
        }
    }

    public static void parseJsonConfiguration(String configurationJSON) throws JSONException{
        JSONObject mceJSONConfiguration = new JSONObject(configurationJSON);
        String appKey = mceJSONConfiguration.getJSONObject("appKey").getString("prod");
        String senderId = mceJSONConfiguration.getString("senderId");
        mceSdkConfiguration = new MceSdkConfiguration(appKey, senderId);
        mceSdkConfiguration.setInvalidateExistingUser(mceJSONConfiguration.optBoolean("invalidateExistingUser", mceSdkConfiguration.isInvalidateExistingUser()));
        mceSdkConfiguration.setAutoReinitialize(mceJSONConfiguration.optBoolean("autoReinitialize", mceSdkConfiguration.isAutoReinitialize()));
        mceSdkConfiguration.setBaseUrl(mceJSONConfiguration.optString("baseUrl"));
        mceSdkConfiguration.setMessagingService(MceSdkConfiguration.MessagingService.valueOf(mceJSONConfiguration.optString("messagingService", mceSdkConfiguration.getMessagingService().name())));
        mceSdkConfiguration.setSessionsEnabled(mceJSONConfiguration.optBoolean("sessionsEnabled", mceSdkConfiguration.isSessionsEnabled()));
        mceSdkConfiguration.setSessionTimeout(mceJSONConfiguration.optInt("sessionTimeout", mceSdkConfiguration.getSessionTimeout()));
        mceSdkConfiguration.setMetricTimeInterval(mceJSONConfiguration.optInt("metricTimeInterval", mceSdkConfiguration.getMetricTimeInterval()));
        mceSdkConfiguration.setLogLevel(Logger.LogLevel.valueOf(mceJSONConfiguration.optString("loglevel", mceSdkConfiguration.getLogLevel().name())));
        mceSdkConfiguration.setLogFile(mceJSONConfiguration.optBoolean("logfile", mceSdkConfiguration.isLogFile()));
        mceSdkConfiguration.setLogIterations(mceJSONConfiguration.optInt("logIterations", mceSdkConfiguration.getLogIterations()));
        mceSdkConfiguration.setLogIterationDurationInHours(mceJSONConfiguration.optInt("logIterationDurationInHours", mceSdkConfiguration.getLogIterationDurationInHours()));
        mceSdkConfiguration.setLogBufferSize(mceJSONConfiguration.optInt("logBufferSize", mceSdkConfiguration.getLogBufferSize()));

        mceSdkConfiguration.setUseInMemoryImageCache(mceJSONConfiguration.optBoolean("useInMemoryImageCache", mceSdkConfiguration.isUseInMemoryImageCache()));
        mceSdkConfiguration.setUseFileImageCache(mceJSONConfiguration.optBoolean("useFileImageCache", mceSdkConfiguration.isUseFileImageCache()));
        mceSdkConfiguration.setInMemoryImageCacheCapacityInMB(mceJSONConfiguration.optInt("inMemoryImageCacheCapacityInMB", mceSdkConfiguration.getInMemoryImageCacheCapacityInMB()));
        mceSdkConfiguration.setFileImageCacheCapacityInMB(mceJSONConfiguration.optInt("fileImageCacheCapacityInMB", mceSdkConfiguration.getFileImageCacheCapacityInMB()));

        mceSdkConfiguration.setGroupNotificationsByAttribution(mceJSONConfiguration.optBoolean("groupNotificationsByAttribution", mceSdkConfiguration.isGroupNotificationsByAttribution()));
        mceSdkConfiguration.setMaxWakeLocksPerHour(mceJSONConfiguration.optLong("maxWakeLocksPerHour", mceSdkConfiguration.getMaxWakeLocksPerHour()));
        mceSdkConfiguration.setAutoInitialize(mceJSONConfiguration.optBoolean("autoInitialize", mceSdkConfiguration.isAutoInitialize()));

        JSONObject databaseConfigurationJSON = mceJSONConfiguration.optJSONObject("database");
        parseJsonDatabaseConfiguration(databaseConfigurationJSON);

        JSONObject locationConfigJSON = mceJSONConfiguration.optJSONObject("location");
        parseJsonLocationConfiguration(locationConfigJSON);

        RNAcousticMobilePushModule.mceSdkConfiguration = mceSdkConfiguration;
    }

    public static void parseJsonDatabaseConfiguration(JSONObject databaseConfigurationJSON) throws JSONException {
        if(databaseConfigurationJSON != null) {
            MceSdkConfiguration.DatabaseConfiguration databaseConfiguration = mceSdkConfiguration.getDatabaseConfiguration();
            String databaseImpl = databaseConfigurationJSON.optString("impl", databaseConfiguration.getDatabaseImplClassName());
            databaseConfiguration.setDatabaseImplClassName(databaseImpl);
            String encryptionProviderImpl = databaseConfigurationJSON.optString("encryptionProvider", databaseConfiguration.getEncryptionProviderClassName());
            databaseConfiguration.setEncryptionProviderClassName(encryptionProviderImpl);
            String keyGeneratorIMpl = databaseConfigurationJSON.optString("keyGenerator", databaseConfiguration.getKeyGeneratorClassName());
            databaseConfiguration.setKeyGeneratorClassName(keyGeneratorIMpl);
            int keyRotationIntervalInDays = databaseConfigurationJSON.optInt("keyRotationIntervalInDays", databaseConfiguration.getKeyRotationIntervalInDays());
            databaseConfiguration.setKeyRotationIntervalInDays(keyRotationIntervalInDays);
            boolean encrypted = databaseConfigurationJSON.optBoolean("encrypted", databaseConfiguration.isEncrypted());
            databaseConfiguration.setEncrypted(encrypted);
        }
    }


    public static void parseJsonLocationConfiguration(JSONObject locationConfigJSON) throws JSONException{
        if (locationConfigJSON != null) {
            boolean autoInitializeLocation = locationConfigJSON.optBoolean("autoInitialize", true);
            if (autoInitializeLocation) {
                Log.v(TAG, "Location Auto Initialize");
                SharedPreferences prefs = reactContext.getSharedPreferences("MCE", Context.MODE_PRIVATE);
                SharedPreferences.Editor prefEditor = prefs.edit();
                prefEditor.putBoolean("locationInitialized", true);
                prefEditor.commit();
                LocationManager.enableLocationSupport(reactContext);
            } else {
                Log.v(TAG, "!Location Auto Initialize");
            }

            JSONObject syncConfigJSON = locationConfigJSON.optJSONObject("sync");
            if (syncConfigJSON != null) {
                MceSdkConfiguration.LocationConfiguration.SyncConfiguration syncConfiguration = mceSdkConfiguration.getLocationConfiguration().getSyncConfiguration();
                syncConfiguration.setLocationSearchRadius(syncConfigJSON.optInt("locationSearchRadius", syncConfiguration.getLocationSearchRadius()));
                syncConfiguration.setSyncRadius(syncConfigJSON.optInt("syncRadius", syncConfiguration.getSyncRadius()));
                syncConfiguration.setSyncInterval(syncConfigJSON.optInt("syncInterval", syncConfiguration.getSyncInterval()));
                syncConfiguration.setLocationResponsiveness(syncConfigJSON.optInt("locationResponsiveness", syncConfiguration.getLocationResponsiveness()));
                syncConfiguration.setMinLocationsForSearch(syncConfigJSON.optInt("minLocationsForSearch", LocationPreferences.DEFAULT_MIN_LOCATIONS_PER_SEARCH));
                syncConfiguration.setMaxLocationsForSearch(syncConfigJSON.optInt("maxLocationsForSearch", syncConfiguration.getMaxLocationsForSearch()));
            }
            JSONObject beaconConfigJSON = locationConfigJSON.optJSONObject("ibeacon");
            if (beaconConfigJSON != null) {
                MceSdkConfiguration.LocationConfiguration.IBeaconConfiguration iBeaconConfiguration = mceSdkConfiguration.getLocationConfiguration().getiBeaconConfiguration();
                iBeaconConfiguration.setUuid(beaconConfigJSON.optString("uuid", iBeaconConfiguration.getUuid()));
                iBeaconConfiguration.setBeaconForegroundScanDuration(beaconConfigJSON.optInt("beaconForegroundScanDuration", iBeaconConfiguration.getBeaconForegroundScanDuration()));
                iBeaconConfiguration.setBeaconForegroundScanInterval(beaconConfigJSON.optInt("beaconForegroundScanInterval", iBeaconConfiguration.getBeaconForegroundScanInterval()));
                iBeaconConfiguration.setBeaconBackgroundScanDuration(beaconConfigJSON.optInt("beaconBackgroundScanDuration", iBeaconConfiguration.getBeaconBackgroundScanDuration()));
                iBeaconConfiguration.setBeaconBackgroundScanInterval(beaconConfigJSON.optInt("beaconBackgroundScanInterval", iBeaconConfiguration.getBeaconBackgroundScanInterval()));
            }
        }
    }

	private static void applyMceSdkConfiguration() {
        MceSdk.getNotificationsClient().getNotificationsPreference().setGroupByAttribution(reactContext, mceSdkConfiguration.isGroupNotificationsByAttribution());
        MediaManager.initCache(reactContext, mceSdkConfiguration);
        Preferences.setLong(reactContext, MceSdkWakeLock.MCE_SDK_MAX_WAKELOCK_COUNT_PER_HOUR, mceSdkConfiguration.getMaxWakeLocksPerHour());

        MceSdkConfiguration.LocationConfiguration.SyncConfiguration syncConfiguration = mceSdkConfiguration.getLocationConfiguration().getSyncConfiguration();
        LocationPreferences.setLocationsSearchRadius(reactContext, syncConfiguration.getLocationSearchRadius());
        LocationPreferences.setMinLocationsPerSearch(reactContext, syncConfiguration.getMinLocationsForSearch());
        LocationPreferences.setMaxLocationsPerSearch(reactContext, syncConfiguration.getMaxLocationsForSearch());
        LocationPreferences.setRefAreaRadius(reactContext, syncConfiguration.getSyncRadius());
        LocationPreferences.setSyncInterval(reactContext, syncConfiguration.getSyncIntervalInMillis());
        LocationPreferences.setLocationResponsiveness(reactContext, syncConfiguration.getLocationResponsivenessInMillis());

        MceSdkConfiguration.LocationConfiguration.IBeaconConfiguration iBeaconConfiguration = mceSdkConfiguration.getLocationConfiguration().getiBeaconConfiguration();

        IBeaconsPreferences.setBluetoothForegroundScanDuration(reactContext, iBeaconConfiguration.getBeaconForegroundScanDuration() * 1000);
        IBeaconsPreferences.setBluetoothForegroundScanInterval(reactContext, iBeaconConfiguration.getBeaconForegroundScanInterval() * 1000);
        IBeaconsPreferences.setBluetoothBackgroundScanDuration(reactContext, iBeaconConfiguration.getBeaconBackgroundScanDuration() * 1000);
        IBeaconsPreferences.setBluetoothBackgroundScanInterval(reactContext, iBeaconConfiguration.getBeaconBackgroundScanInterval() * 1000);
        if(iBeaconConfiguration.getUuid() != null) {
            IBeaconsPreferences.setBeaconsUUID(reactContext,iBeaconConfiguration.getUuid());
        } else {
            Logger.w(TAG,"Beacon UUID is null");
        }

        if(LocationPreferences.isEnableLocations(reactContext)) {
            LocationPreferences.LocationsState locationsState = LocationPreferences.getCurrentLocationsState(reactContext);
            Logger.d(TAG,"@Location tracked beacons on start are: "+locationsState.getTrackedBeaconsIds(), TAG_SDK_LIFECYCLE, TAG_SDK_LIFECYCLE_INIT,TAG_LOCATION, TAG_BEACON);
            if(!locationsState.getTrackedBeaconsIds().isEmpty()) {
                Logger.v(TAG,"iBeacons found. Initializing bluetooth scanner", TAG_SDK_LIFECYCLE, TAG_SDK_LIFECYCLE_INIT,TAG_LOCATION, TAG_BEACON);
                MceBluetoothScanner.startBluetoothScanner(reactContext);
            } else {
                Logger.v(TAG,"iBeacons not found.", TAG_SDK_LIFECYCLE, TAG_SDK_LIFECYCLE_INIT,TAG_LOCATION, TAG_BEACON);
            }
            LocationManager.enableLocationSupport(reactContext);
        }

        if(mceSdkConfiguration.getBaseUrl() != null && !mceSdkConfiguration.getBaseUrl().isEmpty()) {
            Endpoint.getInstance().setCustomEndpoint(mceSdkConfiguration.getBaseUrl());
        }
        if(mceSdkConfiguration.getMetricTimeInterval() > 0) {
            SdkPreferences.setEventsInterval(reactContext, mceSdkConfiguration.getMetricTimeIntervalInMillis());
        }
        RegistrationClientImpl.setInvalidateExistingUser(reactContext, mceSdkConfiguration.isInvalidateExistingUser());
        RegistrationClientImpl.setAutoReinitialize(reactContext, mceSdkConfiguration.isAutoReinitialize());
        RegistrationDetails registrationDetails = MceSdk.getRegistrationClient().getRegistrationDetails(reactContext);
        MessagingManager.setMessagingServiceImpl(reactContext, mceSdkConfiguration.getMessagingService());
        if(registrationDetails.getChannelId() != null) {
            Logger.d(TAG,"SDK is registered. Verifying Zebra...");
            if(RegistrationIntentService.shouldUpdateZebraClientId(reactContext)) {
                RegistrationIntentService.addToQueue(reactContext, RegistrationIntentService.RegistrationType.ZEBRA_REGISTRATION);
            }
        }
    }

	@Override
	public String getName() {
		return "RNAcousticMobilePush";
	}

	@Override
	public Map<String, Object> getConstants() {
		RegistrationClient registrationClient = MceSdk.getRegistrationClient();
		String appKey = registrationClient.getAppKey(reactContext);

		final Map<String, Object> constants = new HashMap<>();
		constants.put("sdkVersion", MceSdk.getSdkVerNumber());
        constants.put("pluginVersion", "3.8.0");
		constants.put("appKey", appKey );
		return constants;
	}

    @TargetApi(26)
    private static void createNotificationChannel() {
        NotificationManager notificationManager = (NotificationManager) reactContext.getSystemService(reactContext.NOTIFICATION_SERVICE);
        NotificationChannel channel = notificationManager.getNotificationChannel(channelIdentifier);
        if(channel == null) {
            int importance = NotificationManager.IMPORTANCE_HIGH;
            channel = new NotificationChannel(channelIdentifier, channelName, importance);
            channel.setDescription(channelDescription);
            channel.setShowBadge(true);
            NotificationsPreference notificationsPreference = MceSdk.getNotificationsClient().getNotificationsPreference();
            notificationsPreference.setNotificationChannelId(reactContext, channelIdentifier);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @ReactMethod
    public void requestPushPermission() {
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel();
        }
    }

    @ReactMethod
    public void manualInitialization() {
        initSdk();
    }

	@ReactMethod
	public void registrationDetails(Promise promise) {
		try {
			RegistrationClient registrationClient = MceSdk.getRegistrationClient();
			RegistrationDetails registrationDetails = registrationClient.getRegistrationDetails(reactContext);

			WritableMap map = Arguments.createMap();
			map.putString("userId", registrationDetails.getUserId());
			map.putString("channelId", registrationDetails.getChannelId());
			promise.resolve(map);
		} catch(Exception e) {
			promise.reject("not_registered", e);
		}
	}

    public WritableMap zeroSafeAreaInsets() {
        WritableMap map = Arguments.createMap();
        map.putInt("left", 0);
        map.putInt("right", 0);
        map.putInt("top", 0);
        map.putInt("bottom", 0);
        return map;
    }

    @ReactMethod
    public void safeAreaInsets(Callback callback) {
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            Activity activity = getCurrentActivity();
            if(activity != null) {
                DisplayCutout cutout = activity.getWindow().getDecorView().getRootWindowInsets().getDisplayCutout();
                if(cutout != null) {
                    WritableMap map = Arguments.createMap();
                    map.putInt("left", cutout.getSafeInsetLeft());
                    map.putInt("right", cutout.getSafeInsetRight());
                    map.putInt("top", cutout.getSafeInsetTop());
                    map.putInt("bottom", cutout.getSafeInsetBottom());
                    callback.invoke(map);
                    return;
                }
            }
        }
        callback.invoke( zeroSafeAreaInsets() );
    }

    @ReactMethod
    public void sendEvents() {
        MceSdk.getQueuedEventsClient().sendEvent(reactContext, null, true);
    }

    @ReactMethod
    public void addEvent(ReadableMap eventMap, boolean immediate) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'");

        String type = eventMap.hasKey("type") ? eventMap.getString("type") : null;
        String name = eventMap.hasKey("name") ? eventMap.getString("name") : null;

        String timestampString = eventMap.hasKey("timestamp") ? eventMap.getString("timestamp") : null; 
        Date timestamp = null;
        if(timestampString != null) {
            try {
                timestamp = dateFormat.parse(timestampString);
            } catch(Exception ex) {
                Logger.i(TAG, "Couldn't parse date from string " + timestampString, ex);
            }
        }

        if(timestamp == null) {
            timestamp = new Date();
            Logger.i(TAG, "Using current timestamp for event date.");
        }

        List<Attribute> attributes = null;
        ReadableMap attributesMap = eventMap.hasKey("attributes") ? eventMap.getMap("attributes") : null;
        if(attributesMap != null) {
            attributes = convertReadableMapToAttributes(attributesMap);
        } 
        
        if(attributes == null) {
            attributes = new LinkedList<Attribute>();
        }
        
        String mailingId = eventMap.hasKey("mailingId") ? eventMap.getString("mailingId") : null;
        String attribution = eventMap.hasKey("attribution") ? eventMap.getString("attribution") : null;;

        Event event = new Event(type, name, timestamp, attributes, attribution, mailingId);
        MceSdk.getQueuedEventsClient().sendEvent(reactContext, event, immediate);
    }

    List<Attribute> convertReadableMapToAttributes(ReadableMap attributesMap) {
        List<Attribute> attributes = new ArrayList<Attribute>();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'");
        ReadableMapKeySetIterator iterator = attributesMap.keySetIterator();
        while(iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType readableType = attributesMap.getType(key);
            if(readableType == ReadableType.Null) {
                Logger.e(TAG, "Ignoring invalid value type NULL sent as value for attribute key " + key + " for event.");
            }
            else if(readableType == ReadableType.Boolean) {
                attributes.add(new BooleanAttribute(key, attributesMap.getBoolean(key)));
            }
            else if(readableType == ReadableType.Number) {
                attributes.add(new NumberAttribute(key, attributesMap.getDouble(key)));
            }
            else if(readableType == ReadableType.String) {
                String stringValue = attributesMap.getString(key);
                try {
                    attributes.add(new DateAttribute(key, dateFormat.parse(stringValue)));
                } catch (Exception ex) {
                    attributes.add(new StringAttribute(key, stringValue));
                }
                
            }
            else if(readableType == ReadableType.Map) {
                Logger.e(TAG, "Ignoring invalid value type Map sent as value for attribute key " + key + " for event.");
            }
            else if(readableType == ReadableType.Array) {
                Logger.e(TAG, "Ignoring invalid value type Array sent as value for attribute key " + key + " for event.");
            }
        }
        return attributes;
    }

    @ReactMethod
    public void updateUserAttributes(ReadableMap attributesMap) {
        List<Attribute> attributes = convertReadableMapToAttributes(attributesMap);
        try {
            MceSdk.getQueuedAttributesClient().updateUserAttributes(reactContext, attributes);
        } catch(Exception ex) {
            Logger.e(TAG, "Couldn't update user attriubtes", ex);
        }
    }

    @ReactMethod
    public void deleteUserAttributes(ReadableArray keys) {
        List<String> keyList = new ArrayList<String>();
        for(int i=0;i<keys.size();i++) {
            if(keys.getType(i) == ReadableType.String) {
                keyList.add(keys.getString(i));
            } else {
                Logger.e(TAG, "deleteUserAttribtes key list contains non string value.");
            }
        }
        try {
            MceSdk.getQueuedAttributesClient().deleteUserAttributes(reactContext, keyList); 
        } catch (Exception ex) {
            Logger.e(TAG, "Couldn't delete user attributes", ex);
        }
    }


    public static JSONArray convertReadableArray(ReadableArray readableArray) throws JSONException {
        JSONArray jsonArray = new JSONArray();
        for(int i=0;i<readableArray.size();i++) {
            ReadableType type = readableArray.getType(i);
            if(type == ReadableType.String) {
                jsonArray.put( readableArray.getString(i) );
            } else if (type == ReadableType.Boolean) {
                jsonArray.put( readableArray.getBoolean(i) );
            } else if (type == ReadableType.Null) {
                jsonArray.put( JSONObject.NULL );
            } else if (type == ReadableType.Number) {
                jsonArray.put( readableArray.getDouble(i) );
            } else if (type == ReadableType.Map) {
                jsonArray.put( convertReadableMap( readableArray.getMap(i) ) );
            } else if (type == ReadableType.Array) {
                jsonArray.put( convertReadableArray( readableArray.getArray(i) ) );
            }
        }
        return jsonArray;
    }

    public static JSONObject convertReadableMap(ReadableMap readableMap) throws JSONException {
        JSONObject jsonObject = new JSONObject();
        ReadableMapKeySetIterator keys = readableMap.keySetIterator();
        while(keys.hasNextKey()) {
            String key = keys.nextKey();
            ReadableType type = readableMap.getType(key);
            if(type == ReadableType.String) {
                jsonObject.put(key, readableMap.getString(key) );
            } else if (type == ReadableType.Boolean) {
                jsonObject.put(key, readableMap.getBoolean(key) );
            } else if (type == ReadableType.Null) {
                jsonObject.put(key, JSONObject.NULL );
            } else if (type == ReadableType.Number) {
                jsonObject.put(key, readableMap.getDouble(key) );
            } else if (type == ReadableType.Map) {
                jsonObject.put(key, convertReadableMap( readableMap.getMap(key) ) );
            } else if (type == ReadableType.Array) {
                jsonObject.put(key, convertReadableArray( readableMap.getArray(key) ) );
            }
        }
        return jsonObject;
    }

    public static WritableNativeArray convertJsonArray(JSONArray jsonArray) throws JSONException {
        WritableNativeArray array = new WritableNativeArray();
        for (int i = 0; i < jsonArray.length(); i++) {
            Object value = jsonArray.get(i);

            if (value == null || value == JSONObject.NULL) {
                array.pushNull();
            } else if(value instanceof Boolean) {
                array.pushBoolean((Boolean) value);
            } else if(value instanceof Integer) {
                array.pushInt( (Integer) value);
            } else if(value instanceof Long) {
                Long longValue = (Long) value;
                array.pushDouble( longValue.doubleValue());
            } else if(value instanceof Double) {
                array.pushDouble( (Double) value);
            } else if(value instanceof String) {
                array.pushString( (String) value);
            } else if (value instanceof JSONObject) {
                array.pushMap( convertJsonObject( (JSONObject)value ));
            } else if(value instanceof JSONArray) {
                array.pushArray( convertJsonArray( (JSONArray)value ));
            } else {
                throw new IllegalArgumentException("Unsupported type: " + value.getClass());
            }
        }
        return array;
    }

    public static WritableNativeMap convertJsonObject(JSONObject jsonObject) throws JSONException {
        WritableNativeMap map = new WritableNativeMap();
        Iterator<String> jsonIterator = jsonObject.keys();
        while (jsonIterator.hasNext()) {
            String key = jsonIterator.next();
            Object value = jsonObject.get(key);

            if (value == null || value == JSONObject.NULL) {
                map.putNull(key);
            } else if(value instanceof Boolean) {
                map.putBoolean(key, (Boolean) value);
            } else if(value instanceof Integer) {
                map.putInt(key, (Integer) value);
            } else if(value instanceof Long) {
                Long longValue = (Long) value;
                map.putDouble(key, longValue.doubleValue());
            } else if(value instanceof Double) {
                map.putDouble(key, (Double) value);
            } else if(value instanceof String) {
                map.putString(key, (String) value);
            } else if (value instanceof JSONObject) {
                map.putMap(key, convertJsonObject( (JSONObject)value ));
            } else if(value instanceof JSONArray) {
                map.putArray(key, convertJsonArray( (JSONArray)value ));
            } else {
                throw new IllegalArgumentException("Unsupported type: " + value.getClass());
            }
        }

        return map;
    }

    public Bundle convertJsonObjectToBundle(JSONObject jsonObject) throws JSONException {
        Bundle bundle = new Bundle();
        Iterator<String> jsonIterator = jsonObject.keys();
        while (jsonIterator.hasNext()) {
            String key = jsonIterator.next();
            Object value = jsonObject.get(key);

            if(value instanceof Boolean) {
                Boolean booleanValue = (Boolean)value;
                bundle.putShort(key, (short) (booleanValue.booleanValue() ? 1 : 0));
            } else if(value instanceof Integer) {
                Integer integerValue = (Integer)value;
                bundle.putFloat(key, integerValue.floatValue());
            } else if(value instanceof Long) {
                Long longValue = (Long)value;
                bundle.putFloat(key, longValue.floatValue());
            } else if(value instanceof Double) {
                Double doubleValue = (Double) value;
                bundle.putFloat(key, doubleValue.floatValue());
            } else if(value instanceof String) {
                bundle.putString(key, (String) value);
            } else if (value instanceof JSONObject) {
                bundle.putBundle(key, convertJsonObjectToBundle( (JSONObject)value ));
            } else if(value instanceof JSONArray) {
                ArrayList<String> array = new ArrayList<String>();
                JSONArray jsonArray = (JSONArray) value;
                for (int i = 0; i < jsonArray.length(); i++) {
                    Object arrayValue = jsonArray.get(i);
                    array.add(arrayValue.toString());
                }
                bundle.putStringArrayList(key, array);
            }
        }
        return bundle;
    }

    @Override
    public void onHostResume() {
        Logger.d(TAG, "SDK onResume");
        NotificationsUtility.checkOsNotificationsStatus(reactContext);
        MceJobManager.validateJobs(reactContext);
        if(SdkPreferences.isSessionServiceActivated(reactContext)) {
            Logger.d(TAG, "Deactivating session tracking service");
            MceSdkTaskScheduler.cancelQueuedTask(reactContext, SessionTrackingTask.getInstance());
            SdkPreferences.setSessionServiceActivated(reactContext, false);
        }
        SessionManager.SessionState sessionState = SessionManager.getSessionState(reactContext);
        if (SdkPreferences.isSessionTrackingEnabled(reactContext)) {
            long sessionTimeout = SdkPreferences.getSessionDuration(reactContext);
            Date now = new Date();

            Logger.d(TAG, "Session state on resume: [" + Iso8601.toPrintableString(sessionState.getSessionStartDate()) + " - " + Iso8601.toPrintableString(sessionState.getSessionEndDate()) + "]");
            if (sessionState.getSessionStartDate() != null) {
                if (sessionState.getSessionEndDate() != null) {
                    Logger.d(TAG, "Ending the timed out session and starting a new one at " + Iso8601.toPrintableString(now));
                    SessionManager.endSession(reactContext, sessionState, now);
                } else {
                    Date lastResumeTime = SdkPreferences.getLastResumeTime(reactContext);
                    if (lastResumeTime != null && now.getTime() - lastResumeTime.getTime() > sessionTimeout) {
                        Logger.d(TAG, "Application crash detected. Ending the timed out session and starting a new one at " + Iso8601.toPrintableString(now));
                        sessionState = new SessionManager.SessionState(lastResumeTime, new Date(lastResumeTime.getTime() + sessionTimeout));
                        SessionManager.endSession(reactContext, sessionState, now);
                    } else {
                        Logger.d(TAG, "Keeping current session. New on resume time is: " + Iso8601.toPrintableString(now));
                        SdkPreferences.setLastResumeTime(reactContext, now);
                        SdkPreferences.setLastPauseTime(reactContext, null);
                    }
                }
            } else {
                Logger.d(TAG, "No session was detected. Starting a new session at: " + Iso8601.toPrintableString(now));
                SessionManager.startSession(reactContext, now);
            }
        } else {
            if (sessionState.getSessionStartDate() != null && sessionState.getSessionEndDate() != null) {
                SessionManager.endSession(reactContext, sessionState, null);
            }
        }
        Logger.d(TAG, "SDK onResume end");
    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {

    }
}