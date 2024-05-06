/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */
 
package co.acoustic.mobile.push.plugin.inapp;

import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.os.Bundle;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import co.acoustic.mobile.push.sdk.api.MceBroadcastReceiver;
import co.acoustic.mobile.push.sdk.api.attribute.Attribute;
import co.acoustic.mobile.push.sdk.api.attribute.AttributesOperation;
import co.acoustic.mobile.push.sdk.api.attribute.BooleanAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.DateAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.NumberAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.StringAttribute;
import co.acoustic.mobile.push.sdk.api.event.Event;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;
import co.acoustic.mobile.push.sdk.location.MceLocation;
import co.acoustic.mobile.push.sdk.util.Logger;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

public class RNAcousticMobilePushBroadcastReceiver extends MceBroadcastReceiver {

    private static final String TAG = "RNAcousticMobilePushBroadcastReceiver";

    @Override
    public void onLocationUpdate(Context context, Location location) {
    }

    @Override
    public void onActionNotYetRegistered(Context context, String actionType) {
    }

    @Override
    public void onActionNotRegistered(Context context, String actionType) {
    }

    @Override
    public void onSdkRegistered(Context context) {
    }

    @Override
    public void onSdkRegistrationChanged(Context context) {
    }

    @Override
    public void onSdkRegistrationUpdated(Context context) {
    }

    @Override
    public void onMessagingServiceRegistered(Context context) {
    }

    @Override
    public void onMessage(Context context, NotificationDetails notificationDetails, Bundle bundle) {
    }

    @Override
    public void onC2dmError(Context context, String error) {
    }

    @Override
    public void onSessionStart(Context context, Date date) {
    }

    @Override
    public void onSessionEnd(Context context, Date date, long l) {
    }

    @Override
    public void onNotificationAction(Context context, Date date, String type, String name, String value) {
    }

    @Override
    public void onAttributesOperation(Context context, AttributesOperation attributesOperation) {
    }

    @Override
    public void onEventsSend(Context context, List<Event> events) {
    }

    @Override
    public void onIllegalNotification(Context context, Intent intent) {
    }

    @Override
    public void onNonMceBroadcast(Context context, Intent intent) {
    }

    @Override
    public void onLocationEvent(Context context, MceLocation location, LocationType locationType, LocationEventType locationEventType) {
    }

    @Override
    public void onInboxCountUpdate(Context context) {
    }
}