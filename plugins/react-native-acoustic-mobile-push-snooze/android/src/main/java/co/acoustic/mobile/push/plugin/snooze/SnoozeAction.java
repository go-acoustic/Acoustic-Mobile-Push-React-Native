/*
 * Copyright © 2015, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.snooze;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import co.acoustic.mobile.push.sdk.api.Constants;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;
import co.acoustic.mobile.push.sdk.util.Logger;

import org.json.JSONObject;

import java.util.Map;

/**
 * This class is an MCE notification action implementation that snoozes a notification for a given amount of minutes. The event has one property - time, which is the
 * number of minutest the notification will snooze for.
 * When the action is clicked, the notification will disappear from the notification bar and reappear after the given number of minutes.
 */
public class SnoozeAction implements MceNotificationAction {

    private static final String TAG = "SnoozeAction";

    /**
     * The "time" property key.
     */
    public static final String TIME_KEY = "time";

    /**
     * This method implements the "snnoze" action.
     * @param context The application context
     * @param type The notification action type
     * @param name The notification action name (can be null)
     * @param attribution The notification attribution (can be null)
     * @param mailingId The notification mailing id
     * @param payload The notification payload. The map contains the time value.
     */
    @Override
    public void handleAction(Context context, String type, String name, String attribution, String mailingId, Map<String, String> payload, boolean fromNotification) {

        int notifId =  Integer.parseInt(payload.get(Constants.Notifications.SOURCE_NOTIF_ID_KEY));
        int delayInMinutes = Integer.parseInt(payload.get(TIME_KEY));
        Logger.d(TAG, "Source Delay: " + delayInMinutes);
        AlarmManager mgr = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent =  new Intent(context, SnoozeIntentService.class);
        intent.putExtra(Constants.Notifications.SOURCE_NOTIFICATION_KEY, payload.get(Constants.Notifications.SOURCE_NOTIFICATION_KEY));
        intent.putExtra(Constants.Notifications.SOURCE_MCE_PAYLOAD_KEY, payload.get(Constants.Notifications.SOURCE_MCE_PAYLOAD_KEY));
        PendingIntent pi = PendingIntent.getService(context, 0, intent, 0);
        (new SnoozeIntentService()).scheduleSnooze(mgr, pi, delayInMinutes);
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.cancel(notifId);

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
