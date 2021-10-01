/*
 * Copyright © 2011, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.calendar;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.provider.CalendarContract;

import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;
import co.acoustic.mobile.push.sdk.util.Logger;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Map;
import java.util.TimeZone;

/**
 * This class is an MCE notification action implementation that adds a calendar event. The event has the following properties:
 * <UL>,
 *     <LI>title - The event's title</LI>
 *     <LI>description - the event's description</LI>
 *     <LI>starts  The event start time</LI>
 *     <LI>ends - The event end time</LI>
 * </UL>
 * The "starts" & "ends" properties are complex elements that contain the following properties:
 * <UL>
 *     <LI>date - A string with format "yyyy-MM-dd"</LI>
 *     <LI>time - A string with format "HH:mm"</LI>
 *     <LI>timezone - The timezone id. e.g. "GMT", "EST", etc.</LI>
 * </UL>
 * When the action is clicked, an event add request appears and the user needs to approve or cancel.
 */
public class AddToCalendarAction implements MceNotificationAction{

    private static final String TAG = "AddToCalendarAction";

    /**
     * The "starts" property key
     */
    public static final String EVENT_START_KEY = "starts";
    /**
     * The "ends" property key
     */
    public static final String EVENT_END_KEY = "ends";
    /**
     * The "title" property key
     */
    public static final String EVENT_TITLE_KEY = "title";
    /**
     * The "description" property key
     */
    public static final String EVENT_DESCRIPTION_KEY = "description";

    /**
     * The "date" property key
     */
    public static final String DATE_KEY = "date";
    /**
     * The "time" property key
     */
    public static final String TIME_KEY = "time";
    /**
     * The "timezone" property key
     */
    public static final String TIMEZONE_KEY = "timezone";


    /**
     * This method generates the event add request
     * @param context The application context
     * @param type The notification action type
     * @param name The notification action name (can be null)
     * @param attribution The notification attribution (can be null)
     * @param mailingId The notification mailing id
     * @param payload The notification payload. The map contains event properties
     */
    @Override
    public void handleAction(Context context, String type, String name, String attribution, String mailingId, Map<String, String> payload, boolean fromNotification) {

        Intent it = new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS);
        context.sendBroadcast(it);
        Intent intent = new Intent(Intent.ACTION_INSERT);
        intent.setType("vnd.android.cursor.item/event");

        try {
            JSONObject starts = new JSONObject(payload.get(EVENT_START_KEY));
            addTime(intent, CalendarContract.EXTRA_EVENT_BEGIN_TIME, starts);
            JSONObject ends = new JSONObject(payload.get(EVENT_END_KEY));
            addTime(intent, CalendarContract.EXTRA_EVENT_END_TIME, ends);
            intent.putExtra(CalendarContract.Events.TITLE, payload.get(EVENT_TITLE_KEY));
            intent.putExtra(CalendarContract.Events.DESCRIPTION, payload.get(EVENT_DESCRIPTION_KEY));

            context.startActivity(intent);
        } catch (JSONException e) {
            Logger.e(TAG, "Failed to handle AddToCalendarAction", e);
        } catch (ParseException e) {
            Logger.e(TAG, "Failed to handle AddToCalendarAction", e);
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

    private void addTime(Intent intent, String key, JSONObject timeJSON) throws JSONException, ParseException {
        String date = timeJSON.getString(DATE_KEY);
        String time = timeJSON.getString(TIME_KEY);
        String timezoneId = timeJSON.getString(TIMEZONE_KEY);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        intent.putExtra(key, getTimeInMillis(date, time, parseTimezone(timezoneId)));
    }

    private long getTimeInMillis(String date, String time, TimeZone timeZone) throws ParseException {
        DateFormat format = new SimpleDateFormat("yyyy-MM-dd-HH:mm");
        format.setTimeZone(timeZone);
        return format.parse(date+"-"+time).getTime();
    }

    private TimeZone parseTimezone(String timezoneId) {
        String[] availableTimezoneIds = TimeZone.getAvailableIDs();
        for(String id : availableTimezoneIds) {
            if(id.equals(timezoneId)) {
                return TimeZone.getTimeZone(id);
            }
        }
        return TimeZone.getDefault();
    }

    @Override
    public boolean shouldSendDefaultEvent(Context context) {
        return true;
    }
}
