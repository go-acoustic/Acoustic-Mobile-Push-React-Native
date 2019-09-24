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

import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.os.Bundle;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.ibm.mce.sdk.api.MceBroadcastReceiver;
import com.ibm.mce.sdk.api.attribute.Attribute;
import com.ibm.mce.sdk.api.attribute.AttributesOperation;
import com.ibm.mce.sdk.api.attribute.BooleanAttribute;
import com.ibm.mce.sdk.api.attribute.DateAttribute;
import com.ibm.mce.sdk.api.attribute.NumberAttribute;
import com.ibm.mce.sdk.api.attribute.StringAttribute;
import com.ibm.mce.sdk.api.event.Event;
import com.ibm.mce.sdk.api.notification.NotificationDetails;
import com.ibm.mce.sdk.location.MceLocation;
import com.ibm.mce.sdk.util.Logger;

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
    public void onDeliveryChannelRegistered(Context context) {
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
        WritableNativeMap map = new WritableNativeMap();
        map.putString("id", location.getId());
        if(locationType == LocationType.ibeacon) {
            if(locationEventType == LocationEventType.enter) {
                RNAcousticMobilePushBeaconModule.sendEvent("EnteredBeacon", map);
            } else if(locationEventType == LocationEventType.exit) {
                RNAcousticMobilePushBeaconModule.sendEvent("ExitedBeacon", map);
            }
        }
    }

    @Override
    public void onInboxCountUpdate(Context context) {
    }

}