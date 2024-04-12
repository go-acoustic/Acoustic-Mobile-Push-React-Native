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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import co.acoustic.mobile.push.sdk.api.MceSdk;
import co.acoustic.mobile.push.sdk.api.notification.Action;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationOperation;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;
import co.acoustic.mobile.push.sdk.notification.NotificationsUtility;
import co.acoustic.mobile.push.sdk.util.Logger;
import co.acoustic.mobile.push.sdk.util.property.PropertyContainerJsonTemplate;

import org.json.JSONObject;

import java.util.Map;

public class CarouselIterationOperation implements MceNotificationOperation {

    private static final String TAG = "CarouselIterationOperation";

    public static final String ACTION_TYPE = "carouselIteration";

    public static final String FORWARD_KEY = "forward";
    public static final String DETAILS_KEY = "details";
    public static final String PREVIOUS_KEY = "previous";
    public static final String IMAGE_KEY = "image";

    public static final String DIALOG_TITLE = "dialogTitle";
    public static final String DIALOG_MESSAGE = "dialogMsg";
    public static final String DIALOG_TYPE = "dialogType";
    public static final String CAROUSEL_CLICK_EVENT = "CarouselClickEvent";

    private final ReactApplicationContext reactContext;

    public CarouselIterationOperation(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @Override
    public void handleAction(Context context, String type, String name, String attribution, String mailingId, Map<String, String> payload, boolean fromNotification) {
        try {
            boolean forward = payload.containsKey(FORWARD_KEY);
            boolean previous = payload.containsKey(PREVIOUS_KEY);

            PropertyContainerJsonTemplate propertyContainerJsonTemplate = new PropertyContainerJsonTemplate();
            CarouselNotificationDetails carouselNotificationDetails = (CarouselNotificationDetails) propertyContainerJsonTemplate.fromJSON(new JSONObject(payload.get(DETAILS_KEY)));
            if (forward) {
                carouselNotificationDetails.setCarouselIndex(carouselNotificationDetails.getCarouselIndex() + 1);
            } else if (previous) {
                carouselNotificationDetails.setCarouselIndex(carouselNotificationDetails.getCarouselIndex() - 1);
            } else {
                WritableMap initialProperties = Arguments.createMap();
                initialProperties.putString(DIALOG_TITLE, "Carousel Plugin");
                initialProperties.putString(DIALOG_TYPE, "carousel");
                initialProperties.putString(DIALOG_MESSAGE, name);
                try {
                    reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(CAROUSEL_CLICK_EVENT, initialProperties);
                } catch (Exception e){
                    Logger.e(TAG, "Caught Exception: " + e.getMessage());
                }

                Intent actionIntent = context.getPackageManager()
                    .getLaunchIntentForPackage(context.getPackageName());
                context.startActivity(actionIntent);
                return;
            }
            Notification notification = CarouselNotificationType.createNotification(context, carouselNotificationDetails, true);
            NotificationsUtility.postCreate(context, (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE), notification, carouselNotificationDetails, carouselNotificationDetails.getNotificationUUID());

        } catch (Throwable t) {
            Logger.e(TAG, "Failed to activate carousel iteration action", t);
        }
    }

    @Override
    public void init(Context context, JSONObject initOptions) {

    }

    @Override
    public void update(Context context, JSONObject updateOptions) {

    }

    @Override
    public boolean shouldDisplayNotification(Context context, NotificationDetails notificationDetails, Bundle sourceBundle) {
        return true;
    }

    @Override
    public boolean shouldSendDefaultEvent(Context context) {
        return false;
    }
}
