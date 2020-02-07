/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.inbox;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
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
import co.acoustic.mobile.push.sdk.api.notification.DelayedNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationActionRegistry;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;
import co.acoustic.mobile.push.sdk.notification.MceNotificationActionImpl;
import co.acoustic.mobile.push.sdk.plugin.inbox.InboxMessageReference;
import co.acoustic.mobile.push.sdk.plugin.inbox.InboxMessagesClient;
import co.acoustic.mobile.push.sdk.plugin.inbox.RichContent;
import co.acoustic.mobile.push.sdk.plugin.inbox.RichContentDatabaseHelper;
import co.acoustic.mobile.push.sdk.util.Logger;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import static com.facebook.react.bridge.ReadableType.*;
import static java.lang.Thread.sleep;

public class RNAcousticMobilePushInboxModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
	private static final String TYPE = "openInboxMessage";
	private static String TAG = "RNAcousticMobilePushInboxModule";
	private static ReactApplicationContext reactContext;
	private static String inboxActionModule;
	RelativeLayout relativeLayout = null;

	// Send event to javascript
	static protected void sendEvent(String eventName, WritableMap params) {
		reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
	}

	public RNAcousticMobilePushInboxModule(ReactApplicationContext reactContext) {
		super(reactContext);
		RNAcousticMobilePushInboxModule.reactContext = reactContext;
		reactContext.addLifecycleEventListener(this);
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

	void registerInboxComponent() {
		MceNotificationActionRegistry.registerNotificationAction(reactContext, TYPE, new MceNotificationAction() {

			@Override
			public void handleAction(Context context, String type, String name, String attribution, String mailingId, Map<String, String> payload, boolean fromNotification) {

				Activity currentActivity = getCurrentActivity();
				if(currentActivity == null) {
					Logger.i(TAG, "Can't find activity, starting");

					Intent it = new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS);
					context.sendBroadcast(it);

					Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
					intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
					context.startActivity(intent);
					return;
				}

				final Activity activity = currentActivity;
				final InboxMessageReference messageReference = new InboxMessageReference(payload.get("value"), payload.get(InboxMessageReference.INBOX_MESSAGE_ID_KEY));
				if (messageReference.hasReference()) {
					final RichContent inboxMessage = messageReference.getMessageFromDb(reactContext);
					if (inboxMessage == null) {
						Logger.d(TAG, "Inbox message not found");
						InboxMessagesClient.addMessageToLoad(messageReference);
						InboxMessagesClient.loadInboxMessages(reactContext, new OperationCallback<List<RichContent>>() {
							@Override
							public void onSuccess(List<RichContent> inboxMessages, OperationResult result) {
								Logger.i(TAG, "Downloaded messages");
								for (final RichContent inboxMessage : inboxMessages) {
									if(inboxMessage.getMessageId().equals(messageReference.getInboxMessageId())) {
										Logger.i(TAG, "Downloaded message");
										activity.runOnUiThread(new Runnable() {
											@Override
											public void run() {
												internalHideInbox();
												showInboxMessage(inboxMessage, activity);
											}
										});
										return;
									}
								}
								Logger.e(TAG, "Could not find downloaded message");
							}

							@Override
							public void onFailure(List<RichContent> richContents, OperationResult result) {
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
		});
	}

	@ReactMethod
	public void hideInbox() {
		final Activity activity = getCurrentActivity();
		if(activity == null) {
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
		if(this.relativeLayout != null) {
			ViewParent parent = this.relativeLayout.getParent();
			if(parent instanceof ViewGroup) {
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
		if(inboxActionModule==null) {
			Logger.e(TAG, "inbox action module is not registered");
			return;
		}

		this.relativeLayout = new RelativeLayout(reactContext);
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

		ReactRootView reactRootView = new ReactRootView(reactContext);
		reactRootView.setLayoutParams(viewLayout);
		reactRootView.startReactApplication(reactInstanceManager, inboxActionModule, initialProperties);
		relativeLayout.addView(reactRootView);

		Window window = activity.getWindow();
		FrameLayout.LayoutParams relativeLayoutParams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.FILL_PARENT, FrameLayout.LayoutParams.FILL_PARENT );
		window.addContentView(relativeLayout, relativeLayoutParams);
	}

	@ReactMethod
	public void inboxMessageCount(Callback callback) {
		RichContentDatabaseHelper.MessageCursor messageCursor = RichContentDatabaseHelper.getRichContentDatabaseHelper(reactContext).getMessages();
		int messages = 0;
		int unread = 0;
		while(messageCursor.moveToNext())
		{
			RichContent message = messageCursor.getRichContent();
			messages++;
			if(!message.getIsRead()) {
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
		InboxMessagesClient.setMessageReadById(reactContext, inboxMessageId);
	}

	@ReactMethod
	public void syncInboxMessages() {
		InboxMessagesClient.loadInboxMessages(reactContext, new OperationCallback<List<RichContent>>() {
			@Override
			public void onSuccess(List<RichContent> newRichContents, OperationResult result) {
				sendEvent("SyncInbox", null);
			}

			@Override
			public void onFailure(List<RichContent> richContents, OperationResult result) {
				sendEvent("SyncInbox", null);
			}
		});
	}

	@ReactMethod
	public void listInboxMessages(boolean direction, Callback callback) {
		WritableNativeArray messages = new WritableNativeArray();
		RichContentDatabaseHelper.MessageCursor messageCursor = RichContentDatabaseHelper.getRichContentDatabaseHelper(reactContext).getMessages();
		while(messageCursor.moveToNext()) {
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
					messageMap.putMap("content", convertJsonObject(content) );
				}
			} catch (Exception ex) {
				Logger.d(TAG, "Couldn't convert inbox json content", ex);
			}

			messages.pushMap(messageMap);
		}
		callback.invoke(messages);
	}

	HashMap<String,String> convertFromMapToHash(ReadableMap map) {
		HashMap<String, String> hash = new HashMap<String, String>();
		ReadableMapKeySetIterator keys = map.keySetIterator();
		while(keys.hasNextKey()) {
			String key = keys.nextKey();
			ReadableType type = map.getType(key);
			switch(type) {
				case Array:
					try {
						JSONArray json = convertReadableArray(map.getArray(key));
						hash.put(key, json.toString() );
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
						hash.put(key, json.toString() );
					} catch (JSONException e) {
						e.printStackTrace();
					}
					break;
				case Null:
					hash.put(key, "<NULL>");
					break;
				case Number:
					hash.put(key, Double.toString( map.getDouble(key) ));
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
			HashMap<String,String> payload = convertFromMapToHash(action);

			actionImpl.handleAction(reactContext, actionType, null, null, null, payload, false);

			List<Attribute> eventAttributes = new LinkedList<Attribute>();
			eventAttributes.add(new StringAttribute("richContentId", richContentId));
			eventAttributes.add(new StringAttribute("inboxMessageId", inboxMessageId));
			eventAttributes.add(new StringAttribute("actionTaken", actionType));

			String name = actionType;
			MceNotificationActionImpl.ClickEventDetails clickEventDetails = MceNotificationActionImpl.getClickEventDetails(actionType);
			if(clickEventDetails != null) {
				name = clickEventDetails.eventName;
				String value = payload.get("value");
				eventAttributes.add(new StringAttribute(clickEventDetails.valueName, value));
			} else {
				for(String key : payload.keySet()) {
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

	public static JSONArray convertReadableArray(ReadableArray readableArray) throws JSONException {
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<readableArray.size();i++) {
			ReadableType type = readableArray.getType(i);
			if(type == String) {
				jsonArray.put( readableArray.getString(i) );
			} else if (type == Boolean) {
				jsonArray.put( readableArray.getBoolean(i) );
			} else if (type == Null) {
				jsonArray.put( JSONObject.NULL );
			} else if (type == Number) {
				jsonArray.put( readableArray.getDouble(i) );
			} else if (type == Map) {
				jsonArray.put( convertReadableMap( readableArray.getMap(i) ) );
			} else if (type == Array) {
				jsonArray.put( convertReadableArray( readableArray.getArray(i) ) );
			}
		}
		return jsonArray;
	}

	public static JSONObject convertReadableMap(ReadableMap readableMap) throws JSONException {
		JSONObject jsonObject = new JSONObject();
		ReadableMapKeySetIterator keys = readableMap.keySetIterator();
		while(keys.hasNextKey()) {
			String key = keys.nextKey();
			ReadableType type = readableMap.getType(key);
			if(type == String) {
				jsonObject.put(key, readableMap.getString(key) );
			} else if (type == Boolean) {
				jsonObject.put(key, readableMap.getBoolean(key) );
			} else if (type == Null) {
				jsonObject.put(key, JSONObject.NULL );
			} else if (type == Number) {
				jsonObject.put(key, readableMap.getDouble(key) );
			} else if (type == Map) {
				jsonObject.put(key, convertReadableMap( readableMap.getMap(key) ) );
			} else if (type == Array) {
				jsonObject.put(key, convertReadableArray( readableMap.getArray(key) ) );
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
			} else if(value instanceof Boolean) {
				array.pushBoolean((Boolean) value);
			} else if(value instanceof Integer) {
				array.pushInt( (Integer) value);
			} else if(value instanceof Long) {
				Long longValue = (Long) value;
				array.pushDouble( longValue.doubleValue());
			} else if(value instanceof Double) {
				array.pushDouble( (Double) value);
			} else if(value instanceof String) {
				array.pushString( (String) value);
			} else if (value instanceof JSONObject) {
				array.pushMap( convertJsonObject( (JSONObject)value ));
			} else if(value instanceof JSONArray) {
				array.pushArray( convertJsonArray( (JSONArray)value ));
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
			} else if(value instanceof Boolean) {
				map.putBoolean(key, (Boolean) value);
			} else if(value instanceof Integer) {
				map.putInt(key, (Integer) value);
			} else if(value instanceof Long) {
				Long longValue = (Long) value;
				map.putDouble(key, longValue.doubleValue());
			} else if(value instanceof Double) {
				map.putDouble(key, (Double) value);
			} else if(value instanceof String) {
				map.putString(key, (String) value);
			} else if (value instanceof JSONObject) {
				map.putMap(key, convertJsonObject( (JSONObject)value ));
			} else if(value instanceof JSONArray) {
				map.putArray(key, convertJsonArray( (JSONArray)value ));
			} else {
				throw new IllegalArgumentException("Unsupported type: " + value.getClass());
			}
		}

		return map;
	}

	public Bundle convertJsonObjectToBundle(JSONObject jsonObject) throws JSONException {
		Bundle bundle = new Bundle();
		Iterator<String> jsonIterator = jsonObject.keys();
		while (jsonIterator.hasNext()) {
			String key = jsonIterator.next();
			Object value = jsonObject.get(key);

			if(value instanceof Boolean) {
				Boolean booleanValue = (Boolean)value;
				bundle.putShort(key, (short) (booleanValue.booleanValue() ? 1 : 0));
			} else if(value instanceof Integer) {
				Integer integerValue = (Integer)value;
				bundle.putFloat(key, integerValue.floatValue());
			} else if(value instanceof Long) {
				Long longValue = (Long)value;
				bundle.putFloat(key, longValue.floatValue());
			} else if(value instanceof Double) {
				Double doubleValue = (Double) value;
				bundle.putFloat(key, doubleValue.floatValue());
			} else if(value instanceof String) {
				bundle.putString(key, (String) value);
			} else if (value instanceof JSONObject) {
				bundle.putBundle(key, convertJsonObjectToBundle( (JSONObject)value ));
			} else if(value instanceof JSONArray) {
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

	@Override
	public void onHostResume() {
		registerInboxComponent();
	}

	@Override
	public void onHostPause() {
		MceNotificationActionRegistry.registerNotificationAction(reactContext, TYPE, new DelayedNotificationAction());
	}

	@Override
	public void onHostDestroy() {

	}
}
