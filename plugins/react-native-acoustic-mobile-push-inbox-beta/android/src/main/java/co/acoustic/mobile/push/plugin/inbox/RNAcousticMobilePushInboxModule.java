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

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import android.app.Activity;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.RelativeLayout;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import co.acoustic.mobile.push.sdk.api.MceSdk;
import co.acoustic.mobile.push.sdk.api.OperationCallback;
import co.acoustic.mobile.push.sdk.api.OperationResult;
import co.acoustic.mobile.push.sdk.api.attribute.Attribute;
import co.acoustic.mobile.push.sdk.api.attribute.StringAttribute;
import co.acoustic.mobile.push.sdk.api.event.Event;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationActionRegistry;
import co.acoustic.mobile.push.sdk.notification.MceNotificationActionImpl;
import co.acoustic.mobile.push.sdk.plugin.inbox.InboxMessagesClient;
import co.acoustic.mobile.push.sdk.plugin.inbox.RichContent;
import co.acoustic.mobile.push.sdk.plugin.inbox.RichContentDatabaseHelper;
import co.acoustic.mobile.push.sdk.util.Logger;
import co.acoustic.mobile.push.sdk.api.message.MessageSync;
import co.acoustic.mobile.push.sdk.plugin.inbox.InboxEvents;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import static com.facebook.react.bridge.ReadableType.*;

public class RNAcousticMobilePushInboxModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private static final String TYPE = "openInboxMessage";
  private static String TAG = "RNAcousticMobilePushInboxModule";

  private ReactApplicationContext reactContext;
  private static String inboxActionModule;
  private MceNotificationAction inboxCustomAction;

  public static RelativeLayout relativeLayout = null;

  // Send event to javascript
  protected void sendEvent(String eventName, WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
  }

  public RNAcousticMobilePushInboxModule() {}

  public RNAcousticMobilePushInboxModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    reactContext.addLifecycleEventListener(this);

    registerInboxComponent();
  }

  @Override
  public String getName() {
    return "RNAcousticMobilePushInbox";
  }

  @ReactMethod
  public void registerInboxComponent(String component) {
    inboxActionModule = component;
    registerInboxComponent();
  }

  private void registerInboxComponent() {
    // Create an instance of the custom action handler
//    if (inboxActionModule == null) {
      inboxCustomAction = new RNPushNotificationInboxCustomAction(reactContext, inboxActionModule);
//    }

    /**
     * A custom action handler for RNPushNotificationInbox, responsible for processing inbox messages and navigating to the inbox screen when a push notification is clicked.
     */
    MceNotificationActionRegistry.registerNotificationAction(reactContext, TYPE, inboxCustomAction);
  }


  @ReactMethod
  public void inboxMessageCount(Callback callback) {
    RichContentDatabaseHelper.MessageCursor messageCursor = RichContentDatabaseHelper.getRichContentDatabaseHelper(reactContext).getMessages();
    int messages = 0;
    int unread = 0;
    while (messageCursor.moveToNext()) {
      RichContent message = messageCursor.getRichContent();
      messages++;
      if (!message.getIsRead()) {
        unread++;
      }
    }

    WritableNativeMap map = new WritableNativeMap();
    map.putInt("messages", messages);
    map.putInt("unread", unread);
    callback.invoke(map);
  }

  @ReactMethod
  public void deleteInboxMessage(String inboxMessageId) {
    InboxMessagesClient.deleteMessageById(reactContext, inboxMessageId);
  }

  @ReactMethod
  public void readInboxMessage(String inboxMessageId) {
    RichContentDatabaseHelper.MessageCursor messageCursor = RichContentDatabaseHelper.getRichContentDatabaseHelper(reactContext).getMessagesByMessageId(inboxMessageId);
    messageCursor.moveToFirst();
    RichContent message = messageCursor.getRichContent();
    InboxEvents.sendInboxMessageOpenedEvent(reactContext, message);
    InboxMessagesClient.setMessageReadById(reactContext, inboxMessageId);
  }

  @ReactMethod
  public void syncInboxMessages() {
    MessageSync.syncMessages(reactContext, new OperationCallback<MessageSync.SyncReport>() {
      @Override
      public void onSuccess(MessageSync.SyncReport syncReport, OperationResult result) {
        sendEvent("SyncInbox", null);
      }

      @Override
      public void onFailure(final MessageSync.SyncReport syncReport, final OperationResult result) {
        sendEvent("SyncInbox", null);
      }
    });
  }

  @ReactMethod
  public void listInboxMessages(boolean direction, Callback callback) {
    WritableNativeArray messages = new WritableNativeArray();
    RichContentDatabaseHelper.MessageCursor messageCursor = RichContentDatabaseHelper.getRichContentDatabaseHelper(reactContext).getMessages();
    while (messageCursor.moveToNext()) {
      RichContent message = messageCursor.getRichContent();
      WritableMap messageMap = new WritableNativeMap();
      messageMap.putString("inboxMessageId", message.getMessageId());
      messageMap.putString("richContentId", message.getContentId());
      messageMap.putString("templateName", message.getTemplate());
      messageMap.putString("attribution", message.getAttribution());
      messageMap.putString("mailingId", message.getMessageId());
      messageMap.putDouble("sendDate", message.getSendDate().getTime());
      messageMap.putDouble("expirationDate", message.getExpirationDate().getTime());
      messageMap.putBoolean("isDeleted", message.getIsDeleted());
      messageMap.putBoolean("isRead", message.getIsRead());
      messageMap.putBoolean("isExpired", message.getIsExpired());

      try {
        JSONObject content = message.getContent();
        if (content != null) {
          messageMap.putMap("content", convertJsonObject(content));
        }
      } catch (Exception ex) {
        Logger.d(TAG, "Couldn't convert inbox json content", ex);
      }

      messages.pushMap(messageMap);
    }
    callback.invoke(messages);
  }

  HashMap<String, String> convertFromMapToHash(ReadableMap map) {
    HashMap<String, String> hash = new HashMap<String, String>();
    ReadableMapKeySetIterator keys = map.keySetIterator();
    while (keys.hasNextKey()) {
      String key = keys.nextKey();
      ReadableType type = map.getType(key);
      switch (type) {
        case Array:
          try {
            JSONArray json = convertReadableArray(map.getArray(key));
            hash.put(key, json.toString());
          } catch (JSONException e) {
            e.printStackTrace();
          }
          break;
        case Boolean:
          Boolean bool = new Boolean(map.getBoolean(key));
          hash.put(key, bool.toString());
          break;
        case Map:
          try {
            JSONObject json = convertReadableMap(map.getMap(key));
            hash.put(key, json.toString());
          } catch (JSONException e) {
            e.printStackTrace();
          }
          break;
        case Null:
          hash.put(key, "<NULL>");
          break;
        case Number:
          hash.put(key, Double.toString(map.getDouble(key)));
          break;
        case String:
          hash.put(key, map.getString(key));
          break;
      }
    }
    return hash;
  }

  @ReactMethod
  public void clickInboxAction(ReadableMap action, String inboxMessageId) {
    RichContentDatabaseHelper.MessageCursor messageCursor = RichContentDatabaseHelper.getRichContentDatabaseHelper(reactContext).getMessagesByMessageId(inboxMessageId);
    messageCursor.moveToFirst();
    RichContent message = messageCursor.getRichContent();
    String richContentId = message.getContentId();
    String attribution = message.getAttribution();

    // get richContentId and attribution
    // put in event
    String actionType = action.getString("type");

    MceNotificationAction actionImpl = MceNotificationActionRegistry.getNotificationAction(reactContext, actionType);
    if (actionImpl != null) {
      HashMap<String, String> payload = convertFromMapToHash(action);

      actionImpl.handleAction(reactContext, actionType, null, null, null, payload, false);

      List<Attribute> eventAttributes = new LinkedList<Attribute>();
      eventAttributes.add(new StringAttribute("richContentId", richContentId));
      eventAttributes.add(new StringAttribute("inboxMessageId", inboxMessageId));
      eventAttributes.add(new StringAttribute("actionTaken", actionType));

      String name = actionType;
      MceNotificationActionImpl.ClickEventDetails clickEventDetails = MceNotificationActionImpl.getClickEventDetails(actionType);
      if (clickEventDetails != null) {
        name = clickEventDetails.eventName;
        String value = payload.get("value");
        eventAttributes.add(new StringAttribute(clickEventDetails.valueName, value));
      } else {
        for (String key : payload.keySet()) {
          eventAttributes.add(new StringAttribute(key, payload.get(key)));
        }
      }

      Event event = new Event("inboxMessage", name, new Date(), eventAttributes, attribution, null);

      MceSdk.getEventsClient(false).sendEvent(reactContext, event, new OperationCallback<Event>() {
        @Override
        public void onSuccess(Event event, OperationResult result) {

        }

        @Override
        public void onFailure(Event event, OperationResult result) {
          MceSdk.getQueuedEventsClient().sendEvent(reactContext, event);
        }
      });
    }
  }

  @ReactMethod
  public void hideInbox() {
    final Activity activity = reactContext.getCurrentActivity();
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

  public static JSONArray convertReadableArray(ReadableArray readableArray) throws JSONException {
    JSONArray jsonArray = new JSONArray();
    for (int i = 0; i < readableArray.size(); i++) {
      ReadableType type = readableArray.getType(i);
      if (type == String) {
        jsonArray.put(readableArray.getString(i));
      } else if (type == Boolean) {
        jsonArray.put(readableArray.getBoolean(i));
      } else if (type == Null) {
        jsonArray.put(JSONObject.NULL);
      } else if (type == Number) {
        jsonArray.put(readableArray.getDouble(i));
      } else if (type == Map) {
        jsonArray.put(convertReadableMap(readableArray.getMap(i)));
      } else if (type == Array) {
        jsonArray.put(convertReadableArray(readableArray.getArray(i)));
      }
    }
    return jsonArray;
  }

  public static JSONObject convertReadableMap(ReadableMap readableMap) throws JSONException {
    JSONObject jsonObject = new JSONObject();
    ReadableMapKeySetIterator keys = readableMap.keySetIterator();
    while (keys.hasNextKey()) {
      String key = keys.nextKey();
      ReadableType type = readableMap.getType(key);
      if (type == String) {
        jsonObject.put(key, readableMap.getString(key));
      } else if (type == Boolean) {
        jsonObject.put(key, readableMap.getBoolean(key));
      } else if (type == Null) {
        jsonObject.put(key, JSONObject.NULL);
      } else if (type == Number) {
        jsonObject.put(key, readableMap.getDouble(key));
      } else if (type == Map) {
        jsonObject.put(key, convertReadableMap(readableMap.getMap(key)));
      } else if (type == Array) {
        jsonObject.put(key, convertReadableArray(readableMap.getArray(key)));
      }
    }
    return jsonObject;
  }

  public static WritableNativeArray convertJsonArray(JSONArray jsonArray) throws JSONException {
    WritableNativeArray array = new WritableNativeArray();
    for (int i = 0; i < jsonArray.length(); i++) {
      Object value = jsonArray.get(i);

      if (value == null || value == JSONObject.NULL) {
        array.pushNull();
      } else if (value instanceof Boolean) {
        array.pushBoolean((Boolean) value);
      } else if (value instanceof Integer) {
        array.pushInt((Integer) value);
      } else if (value instanceof Long) {
        Long longValue = (Long) value;
        array.pushDouble(longValue.doubleValue());
      } else if (value instanceof Double) {
        array.pushDouble((Double) value);
      } else if (value instanceof String) {
        array.pushString((String) value);
      } else if (value instanceof JSONObject) {
        array.pushMap(convertJsonObject((JSONObject) value));
      } else if (value instanceof JSONArray) {
        array.pushArray(convertJsonArray((JSONArray) value));
      } else {
        throw new IllegalArgumentException("Unsupported type: " + value.getClass());
      }
    }
    return array;
  }

  public static WritableNativeMap convertJsonObject(JSONObject jsonObject) throws JSONException {
    WritableNativeMap map = new WritableNativeMap();
    Iterator<String> jsonIterator = jsonObject.keys();
    while (jsonIterator.hasNext()) {
      String key = jsonIterator.next();
      Object value = jsonObject.get(key);

      if (value == null || value == JSONObject.NULL) {
        map.putNull(key);
      } else if (value instanceof Boolean) {
        map.putBoolean(key, (Boolean) value);
      } else if (value instanceof Integer) {
        map.putInt(key, (Integer) value);
      } else if (value instanceof Long) {
        Long longValue = (Long) value;
        map.putDouble(key, longValue.doubleValue());
      } else if (value instanceof Double) {
        map.putDouble(key, (Double) value);
      } else if (value instanceof String) {
        map.putString(key, (String) value);
      } else if (value instanceof JSONObject) {
        map.putMap(key, convertJsonObject((JSONObject) value));
      } else if (value instanceof JSONArray) {
        map.putArray(key, convertJsonArray((JSONArray) value));
      } else {
        throw new IllegalArgumentException("Unsupported type: " + value.getClass());
      }
    }

    return map;
  }

  @Override
  public void onHostResume() {
		registerInboxComponent();
  }

  @Override
  public void onHostPause() {
  }

  @Override
  public void onHostDestroy() {

  }

  @ReactMethod
  public void addListener(String eventName) {

  }

  @ReactMethod
  public void removeListeners(Integer count) {

  }
}
