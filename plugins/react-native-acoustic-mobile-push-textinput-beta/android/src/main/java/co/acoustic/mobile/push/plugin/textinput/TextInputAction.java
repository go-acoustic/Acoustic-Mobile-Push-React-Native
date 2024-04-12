/*
 * Copyright © 2022, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.textinput;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import org.json.JSONObject;

import java.util.Map;

import co.acoustic.mobile.push.sdk.api.notification.MceCustomNotificationInput;
import co.acoustic.mobile.push.sdk.api.notification.MceInputNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;

/**
 * 
 */
public class TextInputAction implements MceInputNotificationAction {

    private static final String TAG = "TextInputAction";

    @Override
    public void handleAction(Context context, String type, String name, String attribution, String mailingId, Map<String, String> payload, boolean fromNotification) {
        
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
        return true;
    }

    @Override
    public void handleAction(Context context, String input, String type, String name, String attribution, String mailingId, Map<String, String> payload, boolean fromNotification) {
        Toast.makeText(context, input, Toast.LENGTH_LONG).show();
    }

    @Override
    public MceCustomNotificationInput getCustomInput() {
        return null;
    }

}
