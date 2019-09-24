/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.beacon;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.ibm.mce.sdk.beacons.IBeacon;
import com.ibm.mce.sdk.beacons.IBeaconsPreferences;
import com.ibm.mce.sdk.location.LocationApi;
import com.ibm.mce.sdk.location.LocationPreferences;
import com.ibm.mce.sdk.util.Logger;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class RNAcousticMobilePushBeaconModule extends ReactContextBaseJavaModule {
	private static String TAG = "RNAcousticMobilePushBeaconModule";

	private static ReactApplicationContext reactContext;

	// Send event to javascript
	static protected void sendEvent(String eventName, WritableMap params) {
		reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
	}

	public RNAcousticMobilePushBeaconModule(ReactApplicationContext reactContext) {
		super(reactContext);
		RNAcousticMobilePushBeaconModule.reactContext = reactContext;
	}

	@Override
	public Map<String, Object> getConstants() {
		final Map<String, Object> constants = new HashMap<>();
		constants.put("beaconEnabled", LocationPreferences.isEnableLocations(reactContext));
		constants.put("uuid", IBeaconsPreferences.getBeaconsUUID(reactContext) );
		return constants;
	}

	@Override
	public String getName() {
	return "RNAcousticMobilePushBeacon";
	}

	@ReactMethod
	public void beaconRegions(Promise promise) {
		WritableNativeArray beaconList = new WritableNativeArray();

		List<LocationApi> trackedIBeacons = new LinkedList<LocationApi>();
		try {
			trackedIBeacons = com.ibm.mce.sdk.location.LocationManager.getLocations(reactContext, LocationPreferences.getCurrentLocationsState(reactContext).getTrackedBeaconsIds());
			Logger.d(TAG,"Tracked iBeacons: "+trackedIBeacons);
		} catch (Exception e) {
			Logger.e(TAG, "Failed to get tracked beacons");
			promise.reject("Failed to get tracked beacons", e);
			return;
		}

		for(LocationApi location : trackedIBeacons)
		{
			IBeacon beaconLocation = (IBeacon)location;
			WritableNativeMap beacon = new WritableNativeMap();
			beacon.putInt("major", beaconLocation.getMajor());
			beacon.putString("id", beaconLocation.getId());
			beaconList.pushMap(beacon);
		}

		promise.resolve(beaconList);
	}
}
