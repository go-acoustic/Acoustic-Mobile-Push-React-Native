/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.geofence;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.location.Location;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.ibm.mce.sdk.location.LocationManager;
import com.ibm.mce.sdk.location.LocationPreferences;
import com.ibm.mce.sdk.location.LocationsDatabaseHelper;
import com.ibm.mce.sdk.location.MceLocation;

import java.util.HashMap;
import java.util.Map;

public class RNAcousticMobilePushGeofenceModule extends ReactContextBaseJavaModule {
	private static String TAG = "RNAcousticMobilePushGeofenceModule";

	private static ReactApplicationContext reactContext;

	// Send event to javascript
	static protected void sendEvent(String eventName, WritableMap params) {
		reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
	}

	public RNAcousticMobilePushGeofenceModule(ReactApplicationContext reactContext) {
		super(reactContext);
		RNAcousticMobilePushGeofenceModule.reactContext = reactContext;
	}

	@Override
	public Map<String, Object> getConstants() {
		final Map<String, Object> constants = new HashMap<>();
		constants.put("geofenceEnabled", LocationPreferences.isEnableLocations(reactContext));
		return constants;
	}

	@Override
	public String getName() {
	return "RNAcousticMobilePushGeofence";
	}

	@ReactMethod
	public void geofencesNearCoordinate(double latitude, double longitude, int radius, Promise promise) {
		Location location = new Location("SDK");
		location.setLatitude(latitude);
		location.setLongitude(longitude);

		WritableNativeArray geofenceList = new WritableNativeArray();
		LocationsDatabaseHelper locationsDatabaseHelper = LocationsDatabaseHelper.geGeofencesDatabaseHelper(reactContext);

		LocationManager.LocationsSearchResult relevantGeofences = LocationManager.findLocations(location, radius, locationsDatabaseHelper);
		LocationsDatabaseHelper.LocationCursor cursor = relevantGeofences.getSearchResults();
		if (cursor.getCount() > 0) {
			do {
				MceLocation geofence = cursor.getLocation();
				WritableNativeMap geofenceMap = new WritableNativeMap();
				geofenceMap.putDouble("latitude", geofence.getLatitude());
				geofenceMap.putDouble("longitude", geofence.getLongitude());
				geofenceMap.putDouble("radius", geofence.getRadius());
				geofenceList.pushMap( geofenceMap );
			} while (cursor.moveToNext());
		}

		promise.resolve(geofenceList);
	}
}
