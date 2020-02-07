/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.location;

// When using React Native 0.60+
//import androidx.core.app.ActivityCompat;
//import androidx.core.content.ContextCompat;

// When using React Native 0.59-
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import co.acoustic.mobile.push.sdk.location.LocationManager;
import co.acoustic.mobile.push.sdk.location.LocationRetrieveService;

public class RNAcousticMobilePushLocationModule extends ReactContextBaseJavaModule {
	private static String TAG = "RNAcousticMobilePushLocationModule";

	private static ReactApplicationContext reactContext;

	// Send event to javascript
	static protected void sendEvent(String eventName, WritableMap params) {
		reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
	}

	public RNAcousticMobilePushLocationModule(ReactApplicationContext reactContext) {
		super(reactContext);
		RNAcousticMobilePushLocationModule.reactContext = reactContext;
	}

	@Override
	public String getName() {
		return "RNAcousticMobilePushLocation";
	}

	@ReactMethod
	public void locationStatus(Callback callback) {
		SharedPreferences prefs = reactContext.getSharedPreferences("MCE", Context.MODE_PRIVATE);
		boolean status = prefs.getBoolean("locationInitialized", false);
		final Activity activity = getCurrentActivity();

		if(status && activity != null) {
			int access = ContextCompat.checkSelfPermission(activity, android.Manifest.permission.ACCESS_FINE_LOCATION);
			if(access == PackageManager.PERMISSION_GRANTED) {
				callback.invoke("always");
			} else {
				callback.invoke("denied");
			}
		} else {
			callback.invoke("disabled");
		}

	}

	@ReactMethod
	public void syncLocations() {
		LocationRetrieveService.startLocationUpdates(reactContext, false);
	}

	@ReactMethod
	public void enableLocation() {
		SharedPreferences prefs = reactContext.getSharedPreferences("MCE", Context.MODE_PRIVATE);
		SharedPreferences.Editor prefEditor = prefs.edit();
		prefEditor.putBoolean("locationInitialized", true);
		prefEditor.commit();

		final Activity activity = getCurrentActivity();
		if(activity != null) {
			activity.runOnUiThread(new Runnable() {
				public void run() {
					if (ContextCompat.checkSelfPermission(activity, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
						ActivityCompat.requestPermissions(activity, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION, android.Manifest.permission.ACCESS_COARSE_LOCATION, android.Manifest.permission.BLUETOOTH, android.Manifest.permission.BLUETOOTH_ADMIN}, 0);
					} else {
						LocationManager.enableLocationSupport(reactContext);
						RNAcousticMobilePushBroadcastReceiver.onLocationAuthorization(reactContext);
					}
				}
			});
		}
	}

}
