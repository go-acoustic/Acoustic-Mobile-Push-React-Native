/*
 * Copyright © 2022, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.imagecarousel;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import android.app.Activity;
import android.util.Log;

import co.acoustic.mobile.push.sdk.api.notification.MceNotificationActionRegistry;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationTypeRegistry;

public class RNAcousticMobilePushImageCarouselModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
	private static String TAG = "RNAcousticMobilePushImageCarouselModule";
	private static final String TYPE = "carousel";

	private final ReactApplicationContext reactContext;
	
	public RNAcousticMobilePushImageCarouselModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext = reactContext;
		reactContext.addLifecycleEventListener(this);
	}

	@Override
	public String getName() {
		return "RNAcousticMobilePushImageCarousel";
	}

	@Override
	public void onHostResume() {
		final Activity activity = getCurrentActivity();
    	MceNotificationActionRegistry.registerNotificationAction(reactContext, CarouselIterationOperation.ACTION_TYPE, new CarouselIterationOperation(reactContext));
		MceNotificationTypeRegistry.registerNotificationType(TYPE, new CarouselNotificationType(reactContext));
	}

	@Override
	public void onHostPause() {
	}

	@Override
	public void onHostDestroy() {

	}
}
