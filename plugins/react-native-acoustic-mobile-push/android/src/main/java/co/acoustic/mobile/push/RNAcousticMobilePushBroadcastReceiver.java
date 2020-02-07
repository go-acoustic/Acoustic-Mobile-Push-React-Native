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

import android.content.Intent;
import android.content.Context;
import android.os.Bundle;
import android.location.Location;

import co.acoustic.mobile.push.sdk.api.MceBroadcastReceiver;
import co.acoustic.mobile.push.sdk.api.MceSdk;
import co.acoustic.mobile.push.sdk.apiinternal.MceSdkInternal;
import co.acoustic.mobile.push.sdk.location.MceLocation;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;
import co.acoustic.mobile.push.sdk.api.attribute.AttributesOperation;
import co.acoustic.mobile.push.sdk.api.event.Event;
import co.acoustic.mobile.push.sdk.util.Logger;
import co.acoustic.mobile.push.sdk.api.attribute.DateAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.Attribute;
import co.acoustic.mobile.push.sdk.api.attribute.StringAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.BooleanAttribute;
import co.acoustic.mobile.push.sdk.api.attribute.NumberAttribute;

import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.json.JSONException;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Date;
import java.text.SimpleDateFormat;  

public class RNAcousticMobilePushBroadcastReceiver extends MceBroadcastReceiver {

    private static final String TAG = "RNAcousticMobilePushBroadcastReceiver";

    @Override
    public void onLocationUpdate(Context context, Location location) {
        RNAcousticMobilePushModule.sendEvent("DownloadedLocations", null);
    }

    @Override
    public void onActionNotYetRegistered(Context context, String actionType) {
        Logger.d(TAG, "Sending CustomPushNotYetRegistered event to Javascript");
        WritableNativeMap map = new WritableNativeMap();
        map.putString("type", actionType);
        RNAcousticMobilePushModule.sendEvent("CustomPushNotYetRegistered", map);
    }

    @Override
    public void onActionNotRegistered(Context context, String actionType) {
        Logger.d(TAG, "Sending CustomPushNotRegistered event to Javascript");
        WritableNativeMap map = new WritableNativeMap();
        map.putString("type", actionType);
        RNAcousticMobilePushModule.sendEvent("CustomPushNotRegistered", map);
    }

    @Override
    public void onSdkRegistered(Context context) {
        RNAcousticMobilePushModule.sendEvent("Registered", null);
        RNAcousticMobilePushModule.sendReactNativeChannelAttribute();
    }

    @Override
    public void onSdkRegistrationChanged(Context context) {
        RNAcousticMobilePushModule.sendEvent("RegistrationChanged", null);
        RNAcousticMobilePushModule.sendReactNativeChannelAttribute();
    }

    @Override
    public void onSdkRegistrationUpdated(Context context) {
        RNAcousticMobilePushModule.sendEvent("RegistrationChanged", null);
        RNAcousticMobilePushModule.sendReactNativeChannelAttribute();
    }

    @Override
    public void onMessage(Context context, NotificationDetails notificationDetails, Bundle bundle) {
    }

    @Override
    public void onMessagingServiceRegistered(Context context) {
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
        if(attributesOperation.getType() == AttributesOperation.Type.updateAttributes) {
            List<Attribute> attributes = attributesOperation.getAttributes();
            WritableNativeMap attributesMap = translateAttributes(attributes);
            WritableNativeMap map = new WritableNativeMap();
            map.putMap("attributes", attributesMap);
            RNAcousticMobilePushModule.sendEvent("UpdateUserAttributesSuccess", map);
        } else if(attributesOperation.getType() == AttributesOperation.Type.deleteAttributes) {
            List<String> keys = attributesOperation.getAttributeKeys();
            WritableNativeArray keyArray = new WritableNativeArray();
            Iterator keyIterator = keys.iterator();
            while(keyIterator.hasNext()) {
                String key = (String) keyIterator.next();
                keyArray.pushString(key);
            }

            WritableNativeMap map = new WritableNativeMap();
            map.putArray("keys", keyArray);
            RNAcousticMobilePushModule.sendEvent("DeleteUserAttributesSuccess", map);
        }
    }

    WritableNativeMap translateAttributes(List<Attribute> attributes) {
        WritableNativeMap attributesMap = new WritableNativeMap();
        Iterator attributeIterator = attributes.iterator();
        while(attributeIterator.hasNext()) {
            Attribute attribute = (Attribute) attributeIterator.next();
            if(attribute instanceof StringAttribute) {
                attributesMap.putString(attribute.getKey(), (String)attribute.getValue());
            } else if(attribute instanceof NumberAttribute) {
                Double doubleValue = (Double)attribute.getValue();
                attributesMap.putDouble(attribute.getKey(), doubleValue.doubleValue());
            } else if(attribute instanceof DateAttribute) {
                Date value = (Date) attribute.getValue();
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'");
                attributesMap.putString(attribute.getKey(), dateFormat.format(value));
            } else if(attribute instanceof BooleanAttribute) {
                Boolean booleanValue = (Boolean)attribute.getValue();
                attributesMap.putBoolean(attribute.getKey(), booleanValue.booleanValue() );
            }
        }
        return attributesMap;
    }

    @Override
    public void onEventsSend(Context context, List<Event> events) {
        WritableNativeMap map = new WritableNativeMap();
        WritableNativeArray eventArray = new WritableNativeArray();

        Iterator eventIterator = events.iterator();
        while(eventIterator.hasNext()) {
            Event event = (Event) eventIterator.next();

            WritableNativeMap eventMap = new WritableNativeMap();
            eventMap.putString("name", event.getName());
            eventMap.putString("type", event.getType());
            eventMap.putDouble("timestamp", event.getTimestamp().getTime());

            List<Attribute> attributes = event.getAttributes();
            WritableNativeMap attributesMap = translateAttributes(attributes);
            eventMap.putMap("attributes", attributesMap);

            eventMap.putString("attribution", event.getAttribution());
            eventMap.putString("mailingId", event.getMailingId());

            eventArray.pushMap(eventMap);
        }

        map.putArray("events", eventArray);
        RNAcousticMobilePushModule.sendEvent("EventSuccess", map);
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
        RNAcousticMobilePushModule.sendEvent("InboxCountUpdate", null);
    }

}