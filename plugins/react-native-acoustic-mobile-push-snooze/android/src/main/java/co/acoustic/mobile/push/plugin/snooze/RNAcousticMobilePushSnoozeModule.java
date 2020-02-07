/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.snooze;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import co.acoustic.mobile.push.sdk.api.notification.MceNotificationActionRegistry;

public class RNAcousticMobilePushSnoozeModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
	private static String TAG = "RNAcousticMobilePushSnoozeModule";
	private static final String TYPE = "snooze";

	private final ReactApplicationContext reactContext;
	
	public RNAcousticMobilePushSnoozeModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext = reactContext;
		reactContext.addLifecycleEventListener(this);

	}

	@Override
	public String getName() {
		return "RNAcousticMobilePushSnooze";
	}


	@Override
	public void onHostResume() {
		MceNotificationActionRegistry.registerNotificationAction(reactContext, TYPE, new SnoozeAction());
	}

	@Override
	public void onHostPause() {
	}

	@Override
	public void onHostDestroy() {

	}
}
