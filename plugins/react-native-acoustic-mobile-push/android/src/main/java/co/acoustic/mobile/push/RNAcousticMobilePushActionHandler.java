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

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;
import org.json.JSONException;
import org.json.JSONArray;

import co.acoustic.mobile.push.sdk.api.notification.DelayedNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationActionRegistry;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;

import android.os.Bundle;
import android.content.Context;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class RNAcousticMobilePushActionHandler extends ReactContextBaseJavaModule implements LifecycleEventListener {

	private static final String TAG = "RNAcousticMobilePushActionHandler";
	protected static ReactApplicationContext reactContext;

	@Override
	public String getName() {
		return "RNAcousticMobilePushActionHandler";
	}

    Map<String, Callback> registeredActions = new HashMap<>();

    public RNAcousticMobilePushActionHandler(ReactApplicationContext reactContext) {
	    super(reactContext);
        reactContext.addLifecycleEventListener(this);
        this.reactContext = reactContext;
    }

    static WritableNativeMap convertPayloadToWritableMap(String type, String name, Map<String, String> payload) {
        WritableNativeMap actionMap = new WritableNativeMap();
        if(type != null) {
            actionMap.putString("type", type);
        }
        if(name != null) {
            actionMap.putString("name", name);
        }

        Iterator<String> payloadIterator = payload.keySet().iterator();
        while(payloadIterator.hasNext()) {
            String key = payloadIterator.next();
            if(key.startsWith("co.acoustic.mobile.push.sdk")) {
                continue;
            }
            Object value = payload.get(key);
            if(value instanceof String) {
                String stringValue = (String) value;
                if (stringValue.startsWith("[") && stringValue.endsWith("]")) {
                    try {
                        JSONArray jsonValue = new JSONArray(stringValue);
                        actionMap.putArray(key, RNAcousticMobilePushModule.convertJsonArray(jsonValue));
                    } catch (JSONException e) {
                        actionMap.putString(key, stringValue);
                    }
                } else if (stringValue.startsWith("{") && stringValue.endsWith("}")) {
                    try {
                        JSONObject jsonValue = new JSONObject(stringValue);
                        actionMap.putMap(key, RNAcousticMobilePushModule.convertJsonObject(jsonValue));
                    } catch (JSONException e) {
                        actionMap.putString(key, stringValue);
                    }
                } else {
                    actionMap.putString(key, stringValue);
                }
            }
        }
        return actionMap;
    }


    @ReactMethod
    void registerAction(String name, final Callback callback) {
        registeredActions.put(name, callback);
        MceNotificationActionRegistry.registerNotificationAction(reactContext, name, new MceNotificationAction() {
                @Override
    public void handleAction(Context context, String type, String name, String attribution, String mailingId, Map<String, String> payload, boolean fromNotification) {
                    WritableNativeMap actionMap = RNAcousticMobilePushActionHandler.convertPayloadToWritableMap(type, name, payload);

                    WritableNativeMap map = new WritableNativeMap();
                    map.putMap("action", actionMap);

                    WritableNativeMap mce = new WritableNativeMap();
                    if(attribution != null) {
                        mce.putString("attribution", attribution);
                    }
                    if(mailingId != null) {
                        mce.putString("mailingId", mailingId);
                    }

                    String sourceValue = payload.get("co.acoustic.mobile.push.sdk.NOTIF_SOURCE");
                    WritableNativeMap payloadMap = null;
                    try {
                        payloadMap = RNAcousticMobilePushModule.convertJsonObject(new JSONObject(sourceValue));
                    } catch (Exception e) {}

                    if(payloadMap == null) {
                        payloadMap = new WritableNativeMap();
                    }

                    payloadMap.putMap("mce", mce);
                    map.putMap("payload", payloadMap);

                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(type, map);
                }

                @Override
                public void init(Context context, JSONObject initOptions) {

                }

                @Override
                public void update(Context context, JSONObject updateOptions) {

                }

                @Override
                public boolean shouldDisplayNotification(final Context context, NotificationDetails notificationDetails, final Bundle sourceBundle) {
                    return true;
                }
        });
    }

    @ReactMethod
    void unregisterAction(String name) {
        MceNotificationActionRegistry.registerNotificationAction(reactContext, name, null);
    }

    @Override
    public void onHostResume() {
        for (String name : registeredActions.keySet()) {
            Callback callback = registeredActions.get(name);
            registerAction(name, callback);
        }
    }

    @Override
    public void onHostPause() {
        for (String name : registeredActions.keySet()) {
            MceNotificationActionRegistry.registerNotificationAction(reactContext, name, new DelayedNotificationAction());
        }
    }

    @Override
    public void onHostDestroy() {

    }
}