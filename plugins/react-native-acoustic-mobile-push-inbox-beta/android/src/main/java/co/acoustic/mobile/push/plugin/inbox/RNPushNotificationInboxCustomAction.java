/*
 * Copyright © 2019, 2025 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */
package co.acoustic.mobile.push.plugin.inbox;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import co.acoustic.mobile.push.sdk.api.OperationCallback;
import co.acoustic.mobile.push.sdk.api.OperationResult;
import co.acoustic.mobile.push.sdk.api.message.MessageProcessor;
import co.acoustic.mobile.push.sdk.api.message.MessageSync;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import co.acoustic.mobile.push.sdk.notification.ActionImpl;
import co.acoustic.mobile.push.sdk.plugin.inbox.InboxEvents;
import co.acoustic.mobile.push.sdk.plugin.inbox.InboxMessageProcessor;
import co.acoustic.mobile.push.sdk.plugin.inbox.InboxMessageReference;
import co.acoustic.mobile.push.sdk.plugin.inbox.RichContent;
import co.acoustic.mobile.push.sdk.util.Logger;

/**
 * A custom action handler for RNPushNotificationInbox, responsible for processing inbox messages and navigating to the inbox screen when a push notification is clicked.
 */
public class RNPushNotificationInboxCustomAction implements MceNotificationAction {
  final String TAG = "RNPushNotificationInboxCustomAction";

  private static WeakReference<ReactApplicationContext> weakReactContext;
  private static String inboxActionModule;
  private RelativeLayout relativeLayout = null;

  /**
   * Default constructor required by MceNotificationAction interface
   */
  public RNPushNotificationInboxCustomAction() {
    Logger.d(TAG, "RNPushNotificationInboxCustomAction initialized");
  }

  /**
   * Constructor with context and module name
   * @param reactContext The React application context
   * @param inboxActionModule The inbox action module name
   */
  public RNPushNotificationInboxCustomAction(ReactApplicationContext reactContext, String inboxActionModule) {
    if (reactContext != null) {
      weakReactContext = new WeakReference<>(reactContext);
    }
    RNPushNotificationInboxCustomAction.inboxActionModule = inboxActionModule;
  }

  /**
   * Safely get the React context from WeakReference
   * @return The ReactApplicationContext or null if not available
   */
  private ReactApplicationContext getReactContext() {
    return weakReactContext != null ? weakReactContext.get() : null;
  }

  /**
   * Clean up resources to prevent memory leaks
   */
  public static void clearContext() {
    if (weakReactContext != null) {
      weakReactContext.clear();
      weakReactContext = null;
    }
    inboxActionModule = null;
  }

  /**
   * Inbox SDK callback to handle custom actions triggered from the inbox
   * @param context The application context
   * @param type The type of action triggered
   * @param name The name of the action triggered
   * @param attribution The attribution data for the action
   * @param mailingId The ID of the mailing that triggered the action
   * @param payload The payload data associated with the action
   * @param fromNotification boolean indicating whether the action was triggered from a notification
   */
  @Override
  public void handleAction(final Context context, final String type, final String name, final String attribution, final String mailingId, final Map<String, String> payload, final boolean fromNotification) {
    Logger.i(TAG, "currentActivity is ");

    Activity currentActivity = Objects.requireNonNull(getReactContext()).getCurrentActivity();
    if (currentActivity == null) {
      Logger.i(TAG, "Can't find activity, starting");

      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        Intent it = new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS);
        context.sendBroadcast(it);
      }

      Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
      intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(intent);
      return;
    }

    final Activity activity = currentActivity;
    final InboxMessageReference messageReference = new InboxMessageReference(payload.get("value"), payload.get(InboxMessageReference.INBOX_MESSAGE_ID_KEY));
    if (messageReference.hasReference()) {
      final RichContent inboxMessage = messageReference.getMessageFromDb(getReactContext());
      if (inboxMessage == null) {
        Logger.d(TAG, "Inbox message not found");
        InboxMessageProcessor.addMessageToLoad(messageReference);
        MessageSync.syncMessages(getReactContext(), new OperationCallback<MessageSync.SyncReport>() {
          @Override
          public void onSuccess(MessageSync.SyncReport syncReport, OperationResult result) {
            Logger.i(TAG, "Downloaded messages");
            InboxMessageProcessor.Report report = null;
            for (MessageProcessor.ProcessReport processReport : syncReport.getReports()) {
              if (processReport instanceof InboxMessageProcessor.Report) {
                report = (InboxMessageProcessor.Report) processReport;
              }
            }
            for (int i = 0; i < report.getNewMessages().size(); i++) {
              RichContent message = report.getNewMessages().get(i);
              if (message.getMessageId().equals(messageReference.getInboxMessageId())) {
                Logger.i(TAG, "Downloaded message");
                final RichContent msg = message;
                activity.runOnUiThread(new Runnable() {
                  @Override
                  public void run() {
                    internalHideInbox();

                    showInboxMessage(msg, activity);
                  }
                });
                if (fromNotification) {
                  InboxEvents.sendInboxNotificationOpenedEvent(context, new ActionImpl(type, name, payload), attribution, mailingId);
                }
                return;
              }
            }
            Logger.e(TAG, "Could not find downloaded message");
          }

          @Override
          public void onFailure(MessageSync.SyncReport syncReport, OperationResult result) {
            Logger.e(TAG, "Could not download message");
          }
        });
      } else {
        activity.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            internalHideInbox();
            showInboxMessage(inboxMessage, activity);
          }
        });
        if (fromNotification) {
          InboxEvents.sendInboxNotificationOpenedEvent(context, new ActionImpl(type, name, payload), attribution, mailingId);
        }
      }
    }
  }

  @Override
  public void init(Context context, JSONObject jsonObject) {

  }

  @Override
  public void update(Context context, JSONObject jsonObject) {

  }

  @Override
  public boolean shouldDisplayNotification(Context context, NotificationDetails notificationDetails, Bundle bundle) {
    return true;
  }

  @Override
  public boolean shouldSendDefaultEvent(Context context) {
    return false;
  }

  @ReactMethod
  public void hideInbox() {
    final Activity activity = Objects.requireNonNull(getReactContext()).getCurrentActivity();
    if (activity == null) {
      Logger.e(TAG, "Can't find activity");
      return;
    }

    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        internalHideInbox();
      }
    });
  }


  // Needs to be run on the main thread.
  private void internalHideInbox() {
    if (this.relativeLayout != null) {
      ViewParent parent = this.relativeLayout.getParent();
      if (parent instanceof ViewGroup) {
        ViewGroup group = (ViewGroup) parent;
        group.removeView(this.relativeLayout);
      } else {
        Logger.e(TAG, "InApp Parent is not a ViewGroup!");
      }
    }
    this.relativeLayout = null;
  }

  // Needs to be run on the main thread.
  private void showInboxMessage(RichContent inboxMessage, Activity activity) {
    if (inboxActionModule == null) {
      Logger.e(TAG, "inbox action module is not registered");
      return;
    }

    this.relativeLayout = new RelativeLayout(getReactContext());
    relativeLayout.setLayoutParams(new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.FILL_PARENT, RelativeLayout.LayoutParams.FILL_PARENT));
    RelativeLayout.LayoutParams viewLayout = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.FILL_PARENT, RelativeLayout.LayoutParams.FILL_PARENT);

    viewLayout.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);

    ReactApplication application = (ReactApplication) activity.getApplication();
    ReactNativeHost reactNativeHost = application.getReactNativeHost();
    ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();

    Bundle messageBundle = new Bundle();
    messageBundle.putLong("sendDate", inboxMessage.getSendDate().getTime());
    messageBundle.putLong("expirationDate", inboxMessage.getExpirationDate().getTime());
    messageBundle.putBoolean("isDeleted", inboxMessage.getIsDeleted());
    messageBundle.putBoolean("isRead", inboxMessage.getIsRead());
    messageBundle.putBoolean("isExpired", inboxMessage.getIsExpired());
    messageBundle.putString("templateName", inboxMessage.getTemplate());
    messageBundle.putString("attribution", inboxMessage.getAttribution());
    messageBundle.putString("mailingId", inboxMessage.getMessageId());
    messageBundle.putString("inboxMessageId", inboxMessage.getMessageId());
    messageBundle.putString("richContentId", inboxMessage.getContentId());

    try {
      JSONObject content = inboxMessage.getContent();
      if (content != null) {
        messageBundle.putBundle("content", convertJsonObjectToBundle(content));
      }
    } catch (Exception ex) {
      Logger.d(TAG, "Couldn't convert inbox json content", ex);
    }

    Bundle initialProperties = new Bundle();
    initialProperties.putBundle("message", messageBundle);

    ReactRootView reactRootView = new ReactRootView(getReactContext());
    reactRootView.setLayoutParams(viewLayout);
    reactRootView.startReactApplication(reactInstanceManager, inboxActionModule, initialProperties);
    relativeLayout.addView(reactRootView);

    Window window = activity.getWindow();
    FrameLayout.LayoutParams relativeLayoutParams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.FILL_PARENT, FrameLayout.LayoutParams.FILL_PARENT);
    window.addContentView(relativeLayout, relativeLayoutParams);

    RNAcousticMobilePushInboxModule.relativeLayout = relativeLayout;
  }

  public Bundle convertJsonObjectToBundle(JSONObject jsonObject) throws JSONException {
    Bundle bundle = new Bundle();
    Iterator<String> jsonIterator = jsonObject.keys();
    while (jsonIterator.hasNext()) {
      String key = jsonIterator.next();
      Object value = jsonObject.get(key);

      if (value instanceof Boolean) {
        Boolean booleanValue = (Boolean) value;
        bundle.putShort(key, (short) (booleanValue.booleanValue() ? 1 : 0));
      } else if (value instanceof Integer) {
        Integer integerValue = (Integer) value;
        bundle.putFloat(key, integerValue.floatValue());
      } else if (value instanceof Long) {
        Long longValue = (Long) value;
        bundle.putFloat(key, longValue.floatValue());
      } else if (value instanceof Double) {
        Double doubleValue = (Double) value;
        bundle.putFloat(key, doubleValue.floatValue());
      } else if (value instanceof String) {
        bundle.putString(key, (String) value);
      } else if (value instanceof JSONObject) {
        bundle.putBundle(key, convertJsonObjectToBundle((JSONObject) value));
      } else if (value instanceof JSONArray) {
        ArrayList<String> array = new ArrayList<String>();
        JSONArray jsonArray = (JSONArray) value;
        for (int i = 0; i < jsonArray.length(); i++) {
          Object arrayValue = jsonArray.get(i);
          array.add(arrayValue.toString());
        }
        bundle.putStringArrayList(key, array);
      }
    }
    return bundle;
  }
}
