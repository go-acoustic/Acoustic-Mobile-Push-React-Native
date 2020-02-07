/*
 * Copyright © 2011, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.snooze;

import android.app.AlarmManager;
import android.app.IntentService;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Bundle;

import co.acoustic.mobile.push.sdk.api.Constants;
import co.acoustic.mobile.push.sdk.notification.NotificationsUtility;
import co.acoustic.mobile.push.sdk.util.Logger;

import org.json.JSONException;

import java.util.Calendar;

/**
 * This service restores the snoozed notification to the notification bar.
 */
public class SnoozeIntentService extends IntentService {
    private static final String TAG = "SnoozeIntentService";

    public SnoozeIntentService() {
        super("Snooze");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        Logger.d(TAG, "Snooze done");
        Bundle extras = new Bundle();
        extras.putString(Constants.Notifications.ALERT_KEY, intent.getStringExtra(Constants.Notifications.SOURCE_NOTIFICATION_KEY));
        extras.putString(Constants.Notifications.MCE_PAYLOAD_KEY, intent.getStringExtra(Constants.Notifications.SOURCE_MCE_PAYLOAD_KEY));
        try {
            NotificationsUtility.showNotification(getApplicationContext(), extras, 0, null);
        } catch (JSONException jsone) {
            Logger.e(TAG, "Failed to parse notification", jsone);
        }
    }


    /**
     * This method schedule a notification reappearance
     * @param mgr The alarm manager
     * @param pi The pending intent for the action
     * @param delayInMinutes The number of minutes after which the notification will reappear
     */
    public void scheduleSnooze(AlarmManager mgr, PendingIntent pi, int delayInMinutes) {
        Calendar alertTime = Calendar.getInstance();
        alertTime.setTimeInMillis(System.currentTimeMillis());
        alertTime.add(Calendar.MINUTE, delayInMinutes);
        mgr.set(AlarmManager.RTC, alertTime.getTimeInMillis(), pi);
        Logger.d(TAG, "Snooze service was scheduled with the date " + alertTime.getTime());
    }
}
