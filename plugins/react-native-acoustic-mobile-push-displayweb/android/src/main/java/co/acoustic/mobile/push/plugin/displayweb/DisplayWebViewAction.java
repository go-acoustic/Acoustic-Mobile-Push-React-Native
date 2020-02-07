/*
 * Copyright © 2011, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.displayweb;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;

import org.json.JSONObject;

import java.util.Map;

/**
 * This class is an MCE notification action implementation that displays a url within a native view. The event has one property - value, which is the
 * url for display.
 * When the action is clicked, the url is displayed in a url display activity
 */
public class DisplayWebViewAction implements MceNotificationAction {

    /**
     * This method handles the display url action
     * @param context The application context
     * @param type The notification action type
     * @param name The notification action name (can be null)
     * @param attribution The notification attribution (can be null)
     * @param mailingId The notification mailing id
     * @param payload The notification payload. The map containing the url under "value".
     */
    public void handleAction(Context context, String type, String name, String attribution, String mailingId, Map<String, String> payload, boolean fromNotification)  {
        Intent it = new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS);
        context.sendBroadcast(it);
        Intent intent = new Intent(context, DisplayWebViewActivity.class);
        intent.putExtra("url", payload.get("value"));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
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
}