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

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.NotificationCompat;
import android.widget.RemoteViews;

import com.facebook.react.bridge.ReactApplicationContext;

import co.acoustic.mobile.push.sdk.api.MediaManager;
import co.acoustic.mobile.push.sdk.api.notification.Action;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationActionRegistry;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationType;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;
import co.acoustic.mobile.push.sdk.notification.ActionImpl;
import co.acoustic.mobile.push.sdk.notification.AlertProcessor;
import co.acoustic.mobile.push.sdk.notification.NotificationsUtility;
import co.acoustic.mobile.push.sdk.util.Logger;
import co.acoustic.mobile.push.sdk.util.property.PropertyContainerJsonTemplate;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class CarouselNotificationType implements MceNotificationType {

    private static final String TAG = "CarouselNotificationType";

    private static final String NEXT_LABEL_KEY = "next";
    private static final String PREV_LABEL_KEY = "prev";
    private static final String CAROUSEL_KEY = "carousel";

    private static final String IMAGE_URL_KEY = "image";
    private static final String ACTION_KEY = "action";

    private final ReactApplicationContext reactContext;

    public CarouselNotificationType(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @Override
    public Notification createNotification(Context context, Bundle extras, NotificationDetails notificationDetails, int icon, int actionFlags, UUID notifUUID) {
        return createNotification(context, new CarouselNotificationDetails(notificationDetails, notifUUID.toString(), 1), true);
    }


    public static Notification createNotification(final Context context, final CarouselNotificationDetails carouselNotificationDetails, boolean verifyImages) {
        try {
            Logger.d(TAG, "Creating notification from "+carouselNotificationDetails);
            JSONObject carouselPayload = new JSONObject(carouselNotificationDetails.getPayload());
            final List<CarouselItem> carouselItems = extractCarouselItems(carouselPayload.getJSONArray(CAROUSEL_KEY));
            int currentIndex = carouselNotificationDetails.getCarouselIndex();
            if (currentIndex > carouselItems.size()) {
                carouselNotificationDetails.setCarouselIndex(1);
            } else if (currentIndex < 1) {
                carouselNotificationDetails.setCarouselIndex(carouselItems.size());
            }
            final CarouselItem currentItem = carouselItems.get(carouselNotificationDetails.getCarouselIndex() - 1);
            if(Build.VERSION.SDK_INT>= Build.VERSION_CODES.LOLLIPOP) {
                return createLolipopOrAboveCarouselNotification(context, carouselNotificationDetails, verifyImages, carouselPayload, carouselItems, currentItem);
            } else {
                return createBelowLolipopCarouselNotification(context, carouselNotificationDetails, currentItem);
            }

        } catch (Throwable t) {
            Logger.e(TAG, "Failed to create carousel notification", t);
            return null;
        }

    }

    private static Notification createLolipopOrAboveCarouselNotification(Context context, CarouselNotificationDetails carouselNotificationDetails, boolean verifyImages, JSONObject carouselPayload, List<CarouselItem> carouselItems, CarouselItem currentItem) throws JSONException {
        if (verifyImages) {
            if (!verifyImages(context, carouselNotificationDetails, carouselItems))
                return null;
        }
        Logger.d(TAG, "Creating a new carousel notification");
        int carouselLayoutId = context.getResources().getIdentifier("mce_carousel_notification", "layout", context.getPackageName());
        final RemoteViews remoteViews = new RemoteViews(context.getPackageName(), carouselLayoutId);

        int imgLabelId = context.getResources().getIdentifier("mce_carousel_text", "id", context.getPackageName());
        int imgId = context.getResources().getIdentifier("mce_carousel_img", "id", context.getPackageName());
        int nextButtonId = context.getResources().getIdentifier("mce_carousel_next", "id", context.getPackageName());
        int prevButtonId = context.getResources().getIdentifier("mce_carousel_prev", "id", context.getPackageName());


        populateCarouselView(context, remoteViews, carouselPayload, carouselNotificationDetails, carouselItems, currentItem, nextButtonId, prevButtonId, imgLabelId, imgId);

        setCarouselNotificationActions(context, carouselNotificationDetails, currentItem, remoteViews, imgLabelId, imgId, nextButtonId, prevButtonId);


        NotificationCompat.Builder builder = NotificationsUtility.createCompatBuilder(context, carouselNotificationDetails);
        builder.setStyle(new NotificationCompat.DecoratedCustomViewStyle())
                .setOnlyAlertOnce(true)
                .setCustomBigContentView(remoteViews)
                .setAutoCancel(false)
                .setWhen(System.currentTimeMillis())
                .setCustomBigContentView(remoteViews);

        return builder.build();
    }

    private static Notification createBelowLolipopCarouselNotification(Context context, CarouselNotificationDetails carouselNotificationDetails, CarouselItem currentItem) {
        PendingIntent actionPendingIntent = NotificationsUtility.createActionPendingIntent(context, new Bundle(), currentItem.getAction(), carouselNotificationDetails.getMceNotificationPayload(), 0, null, carouselNotificationDetails.getNotificationUUID(), true);
        NotificationCompat.Builder builder = NotificationsUtility.createCompatBuilder(context, carouselNotificationDetails);
        builder.setAutoCancel(true)
                .setContentIntent(actionPendingIntent);
        return builder.build();
    }

    private static void setCarouselNotificationActions(Context context, CarouselNotificationDetails carouselNotificationDetails, CarouselItem currentItem, RemoteViews remoteViews, int imgLabelId, int imgId, int nextButtonId, int prevButtonId) throws JSONException {
        PropertyContainerJsonTemplate propertyContainerJsonTemplate = new PropertyContainerJsonTemplate();
        Map<String, String> imagePayload = new HashMap<String, String>();
        imagePayload.put(CarouselIterationOperation.IMAGE_KEY, "true");
        imagePayload.put(CarouselIterationOperation.DETAILS_KEY, propertyContainerJsonTemplate.toJSON(carouselNotificationDetails).toString());
        ActionImpl imageAction = new ActionImpl(CarouselIterationOperation.ACTION_TYPE, currentItem.getAction().getName(), imagePayload);
        PendingIntent actionPendingIntent = NotificationsUtility.createActionPendingIntent(context, new Bundle(), imageAction, carouselNotificationDetails.getMceNotificationPayload(), 0, null, carouselNotificationDetails.getNotificationUUID(), true);
        remoteViews.setOnClickPendingIntent(imgId, actionPendingIntent);
        remoteViews.setOnClickPendingIntent(imgLabelId, actionPendingIntent);

        Map<String, String> nextPayload = new HashMap<String, String>();
        nextPayload.put(CarouselIterationOperation.DETAILS_KEY, propertyContainerJsonTemplate.toJSON(carouselNotificationDetails).toString());
        nextPayload.put(CarouselIterationOperation.FORWARD_KEY, "true");
        ActionImpl nextAction = new ActionImpl(CarouselIterationOperation.ACTION_TYPE, "", nextPayload);
        PendingIntent nextPendingIntent = NotificationsUtility.createActionPendingIntent(context, new Bundle(), nextAction, carouselNotificationDetails.getMceNotificationPayload(), 0, null, carouselNotificationDetails.getNotificationUUID(), false);
        remoteViews.setOnClickPendingIntent(nextButtonId, nextPendingIntent);

        Map<String, String> previousPayload = new HashMap<String, String>();
        previousPayload.put(CarouselIterationOperation.DETAILS_KEY, propertyContainerJsonTemplate.toJSON(carouselNotificationDetails).toString());
        previousPayload.put(CarouselIterationOperation.PREVIOUS_KEY, "true");
        ActionImpl prevAction = new ActionImpl(CarouselIterationOperation.ACTION_TYPE, "", previousPayload);
        PendingIntent prevPendingIntent = NotificationsUtility.createActionPendingIntent(context, new Bundle(), prevAction, carouselNotificationDetails.getMceNotificationPayload(), 0, null, carouselNotificationDetails.getNotificationUUID(), false);
        remoteViews.setOnClickPendingIntent(prevButtonId, prevPendingIntent);
    }

    private static void populateCarouselView(final Context context, final RemoteViews remoteViews, JSONObject carouselPayload, CarouselNotificationDetails carouselNotificationDetails, List<CarouselItem> carouselItems, CarouselItem currentItem, int nextButtonId, int prevButtonId, int imgLabelId, final int imgId)
    {
        String nextLabel = carouselPayload.optString(NEXT_LABEL_KEY, NEXT_LABEL_KEY);
        remoteViews.setTextViewText(nextButtonId, nextLabel);
        String prevLabel = carouselPayload.optString(PREV_LABEL_KEY, PREV_LABEL_KEY);
        remoteViews.setTextViewText(prevButtonId, prevLabel);
        String imgLabel = currentItem.getAction().getName();
        remoteViews.setTextViewText(imgLabelId, imgLabel);
        Bitmap image = MediaManager.getImageCache().getImage(currentItem.getImageUrl(), false);
        if (image == null) {
            remoteViews.setImageViewResource(imgId, context.getResources().getIdentifier("mce_carousel_img_wait", "id", context.getPackageName()));
            MediaManager.loadImage(currentItem.getImageUrl(), null, new MediaManager.OnImageLoadTask() {
                @Override
                public void imageLoaded(String url, Bitmap image) {
                    remoteViews.setImageViewBitmap(imgId, image);
                }

                @Override
                public void imageLoadFailed(String url) {
                    remoteViews.setImageViewResource(imgId, context.getResources().getIdentifier("mce_carousel_img_fail", "id", context.getPackageName()));
                }
            });
        } else {
            remoteViews.setImageViewBitmap(imgId, image);
        }
    }

    private static boolean verifyImages(final Context context, final CarouselNotificationDetails carouselNotificationDetails, final List<CarouselItem> carouselItems) {
        for (CarouselItem carouselItem : carouselItems) {
            if (!MediaManager.getImageCache().hasImage(carouselItem.getImageUrl())) {
                (new Thread() {
                    @Override
                    public void run() {
                        for (CarouselItem carouselItem : carouselItems) {
                            if (!MediaManager.getImageCache().hasImage(carouselItem.getImageUrl())) {
                                MediaManager.loadImageInCurrentThread(carouselItem.getImageUrl());
                            }
                        }
                        Notification notification = createNotification(context, carouselNotificationDetails, false);
                        NotificationsUtility.postCreate(context, (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE), notification, carouselNotificationDetails, carouselNotificationDetails.getNotificationUUID());
                    }
                }).start();
                return false;
            }
        }
        return true;
    }

    private static List<CarouselItem> extractCarouselItems(JSONArray itemsArray) throws JSONException {
        List<CarouselItem> carouselItems = new LinkedList<CarouselItem>();
        for(int i = 0; i < itemsArray.length(); ++i) {
            JSONObject carouselItemJSON = itemsArray.getJSONObject(i);
            String imageUrl = carouselItemJSON.getString(IMAGE_URL_KEY);
            Action action = AlertProcessor.extractAction(carouselItemJSON.getJSONObject(ACTION_KEY), false);
            carouselItems.add(new CarouselItem(imageUrl, action));
        }
        return carouselItems;
    }

    @Override
    public void init(Context context, JSONObject initOptions) {
        MceNotificationActionRegistry.registerNotificationAction(context, CarouselIterationOperation.ACTION_TYPE, new CarouselIterationOperation(reactContext));
    }
}
