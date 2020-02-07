/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */
 
package co.acoustic.mobile.push.plugin.displayweb;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import co.acoustic.mobile.push.sdk.api.notification.DelayedNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationActionRegistry;

public class RNAcousticMobilePushDisplayWebModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
	private static String TAG = "RNAcousticMobilePushDisplayWebModule";
	private static final String TYPE = "displayWeb";

	private final ReactApplicationContext reactContext;
	
	public RNAcousticMobilePushDisplayWebModule(ReactApplicationContext reactContext) {
		super(reactContext);
		reactContext.addLifecycleEventListener(this);
		this.reactContext = reactContext;
	}

	@Override
	public String getName() {
	return "RNAcousticMobilePushDisplayWeb";
	}

	@Override
	public void onHostResume() {
		MceNotificationActionRegistry.registerNotificationAction(reactContext, TYPE, new DisplayWebViewAction());
	}

	@Override
	public void onHostPause() {
		MceNotificationActionRegistry.registerNotificationAction(reactContext, TYPE, new DelayedNotificationAction());
	}

	@Override
	public void onHostDestroy() {

	}
}
