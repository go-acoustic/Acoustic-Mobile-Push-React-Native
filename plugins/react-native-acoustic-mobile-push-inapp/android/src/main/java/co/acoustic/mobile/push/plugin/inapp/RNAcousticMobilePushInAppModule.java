/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.inapp;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.app.Activity;
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
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import co.acoustic.mobile.push.sdk.api.OperationCallback;
import co.acoustic.mobile.push.sdk.api.OperationResult;
import co.acoustic.mobile.push.sdk.plugin.inapp.InAppEvents;
import co.acoustic.mobile.push.sdk.plugin.inapp.InAppManager;
import co.acoustic.mobile.push.sdk.plugin.inapp.InAppPayload;
import co.acoustic.mobile.push.sdk.plugin.inapp.InAppPlugin;
import co.acoustic.mobile.push.sdk.plugin.inapp.InAppStorage;
import co.acoustic.mobile.push.sdk.api.message.MessageSync;
import co.acoustic.mobile.push.sdk.api.MceSdk;
import co.acoustic.mobile.push.sdk.api.attribute.Attribute;
import co.acoustic.mobile.push.sdk.api.attribute.StringAttribute;
import co.acoustic.mobile.push.sdk.api.event.Event;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationAction;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationActionRegistry;
import co.acoustic.mobile.push.sdk.notification.MceNotificationActionImpl;
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

public class RNAcousticMobilePushInAppModule extends ReactContextBaseJavaModule {
	private static String TAG = "RNAcousticMobilePushInAppModule";
	private static ReactApplicationContext reactContext;
	RelativeLayout relativeLayout = null;
	HashMap<String,ModuleHeight> inAppRegistry = new HashMap<String,ModuleHeight>();

	class ModuleHeight {
		public int height;
		public String module;
		public ModuleHeight(String module, int height) {
			this.height = height;
			this.module = module;
		}
	}

	// Send event to javascript
	static protected void sendEvent(String eventName, WritableMap params) {
		reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
	}

	public RNAcousticMobilePushInAppModule(ReactApplicationContext reactContext) {
		super(reactContext);
		RNAcousticMobilePushInAppModule.reactContext = reactContext;
	}

	@Override
	public String getName() {
		return "RNAcousticMobilePushInApp";
	}

	// Needs to be run on the main thread.
	private void internalHideInApp() {
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

	@ReactMethod
	public void hideInApp() {
		final Activity activity = getCurrentActivity();
		if(activity == null) {
			Logger.e(TAG, "Can't find activity");
			return;
		}

		activity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				internalHideInApp();
			}
		});
	}

	@ReactMethod
	public void deleteInApp(String inAppMessageId) {
		InAppManager.delete(reactContext, inAppMessageId);
	}

	@ReactMethod
	public void createInApp(ReadableMap content, String template, ReadableArray rules, int maxViews, String mailingId) {

		JSONArray rulesJson = new JSONArray();
		for(int i=0;i<rules.size();i++) {
			if(rules.getType(i) == ReadableType.String) {
				rulesJson.put(rules.getString(i));
			} else {
				Logger.e(TAG, "createInApp rule list contains non string value.");
			}
		}

		JSONObject inAppMessage = new JSONObject();
		try {
			inAppMessage.put("template", template);
			inAppMessage.put("rules", rulesJson);

			inAppMessage.put("maxViews", maxViews);
			inAppMessage.put("mailingId", mailingId);
			inAppMessage.put("content",  convertReadableMap(content));
		} catch (Exception ex) {
			Logger.e(TAG, "Couldn't assemble inAppMessage JSON", ex);
		}
		Bundle extras = new Bundle();
		extras.putString("inApp", inAppMessage.toString());
		InAppManager.handleNotification(reactContext, extras, null, null);
	}

	// Needs to be run on the main thread.
	private void showInApp(InAppPayload inAppMessage, Activity activity) {
		Bundle messageBundle = packageInAppMessage(inAppMessage);
		String template = inAppMessage.getTemplateName();
		ModuleHeight moduleHeight = inAppRegistry.get(template);
		if(moduleHeight == null) {
			Logger.e(TAG, "Can not find registered inapp template for " + template);
			return;
		}

		this.relativeLayout = new RelativeLayout(reactContext);
		relativeLayout.setLayoutParams(new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.FILL_PARENT, RelativeLayout.LayoutParams.FILL_PARENT));

		float scale = reactContext.getResources().getDisplayMetrics().density;
		int height = (int) scale * moduleHeight.height;

		RelativeLayout.LayoutParams viewLayout;
		if(height > 0) {
			viewLayout = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.FILL_PARENT, height);
		} else {
			viewLayout = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.FILL_PARENT, RelativeLayout.LayoutParams.FILL_PARENT);
		}

    List<String> rules = inAppMessage.getRules();
    
		if(rules != null && rules.contains("bottomBanner")) {
			viewLayout.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
		} else {
			viewLayout.addRule(RelativeLayout.ALIGN_PARENT_TOP);
		}

		ReactApplication application = (ReactApplication) activity.getApplication();
		ReactNativeHost reactNativeHost = application.getReactNativeHost();
		ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();

		Bundle initialProperties = new Bundle();
		initialProperties.putBundle("message", messageBundle);
		// TODO take into account the Android notch here?
		initialProperties.putFloat("containerHeight", moduleHeight.height);
		initialProperties.putFloat("contentHeight", moduleHeight.height);

		ReactRootView reactRootView = new ReactRootView(reactContext);
		reactRootView.setLayoutParams(viewLayout);
		reactRootView.startReactApplication(reactInstanceManager, moduleHeight.module, initialProperties);
		relativeLayout.addView(reactRootView);

		Window window = activity.getWindow();
		FrameLayout.LayoutParams relativeLayoutParams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.FILL_PARENT, FrameLayout.LayoutParams.FILL_PARENT );
		window.addContentView(relativeLayout, relativeLayoutParams);
	}

	@ReactMethod
	public void executeInApp(ReadableArray rules) {
		final Activity activity = getCurrentActivity();
		if(activity == null) {
			Logger.e(TAG, "Can't find activity");
			return;
		}

		ArrayList<String> ruleList = new ArrayList<String>();
		for(int i=0;i<rules.size();i++) {
			if(rules.getType(i) == ReadableType.String) {
				ruleList.add(rules.getString(i));
			} else {
				Logger.e(TAG, "executeInApp rule list contains non string value.");
			}
		}

		final InAppPayload inAppMessage = InAppStorage.findFirst(reactContext, InAppStorage.KeyName.RULE, ruleList);

		if(inAppMessage == null) {
			Logger.d(TAG, "No inAppMessages to display for provided rules");
			return;
		}

		activity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				internalHideInApp();
				showInApp(inAppMessage, activity);
			}
		});

		InAppEvents.sendInAppMessageOpenedEvent(reactContext, inAppMessage);
		InAppStorage.updateMaxViews(reactContext, inAppMessage);
		if(inAppMessage.isFromPull()) {
			InAppPlugin.updateInAppMessage(reactContext, inAppMessage);
		}
	}

	public Bundle packageInAppMessage(InAppPayload inAppMessage) {
		Bundle message = new Bundle();
		message.putString("inAppMessageId", inAppMessage.getId() );
		message.putStringArrayList("rules", (ArrayList<String>) inAppMessage.getRules());
		message.putFloat("expirationDate", inAppMessage.getExpirationDate().getTime() );
		message.putFloat("triggerDate", inAppMessage.getTriggerDate().getTime() );
		message.putString("templateName", inAppMessage.getTemplateName());
		message.putShort("numViews", (short) inAppMessage.getViews());
		message.putShort("maxViews", (short) inAppMessage.getMaxViews());

		try {
			Bundle content = convertJsonObjectToBundle(inAppMessage.getTemplateContent());
			message.putBundle("content", content);
		} catch (Exception ex) {
			Logger.e(TAG, "Couldn't translate template content", ex);
		}

		return message;
	}

	@ReactMethod
	public void registerInApp(String template, String module, int height) {
		this.inAppRegistry.put(template, new ModuleHeight(module, height));
	}

	@ReactMethod
	public void clickInApp(String inAppMessageId) throws JSONException {

		InAppPayload inAppPayload = InAppStorage.getInappPayload(reactContext, inAppMessageId);
		if(inAppPayload == null) {
			return;
		}

		JSONObject content = inAppPayload.getTemplateContent();
		if(content == null) {
			Logger.e(TAG, "Can't find content");
			return;
		}
		JSONObject action = content.getJSONObject("action");
		if(action == null) {
			Logger.e(TAG, "Can't find action");
			return;
		}
		String actionType = action.getString("type");
		if(actionType == null) {
			Logger.e(TAG, "Can't find action type");
			return;
		}

		MceNotificationAction actionImpl = MceNotificationActionRegistry.getNotificationAction(reactContext, actionType);
		if(actionImpl == null) {
			Logger.e(TAG, "Can't find a notification registered action for " + actionType);
			return;
		}

		List<Attribute> eventAttributes = new LinkedList<Attribute>();
		eventAttributes.add(new StringAttribute("actionTaken", actionType));

		HashMap<String, String> payload = new HashMap<String, String>();
		Iterator<String> actionIterator = action.keys();
		while (actionIterator.hasNext()) {
			String key = actionIterator.next();
			String value = action.getString(key);
			payload.put(key, value);
			eventAttributes.add(new StringAttribute(key, value));
		}

		actionImpl.handleAction(reactContext, actionType, null, null,null, payload, false);


		String name = actionType;
		MceNotificationActionImpl.ClickEventDetails clickEventDetails = MceNotificationActionImpl.getClickEventDetails(actionType);
		if(clickEventDetails != null) {
			name = clickEventDetails.eventName;
			eventAttributes.add(new StringAttribute(clickEventDetails.valueName, action.toString()));
		}

		Event event = new Event("inAppMessage", name, new Date(), eventAttributes, null, null);
		MceSdk.getQueuedEventsClient().sendEvent(reactContext, event, true);

		InAppManager.delete(reactContext, inAppMessageId);
	}


	public static JSONArray convertReadableArray(ReadableArray readableArray) throws JSONException {
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<readableArray.size();i++) {
			ReadableType type = readableArray.getType(i);
			if(type == ReadableType.String) {
				jsonArray.put( readableArray.getString(i) );
			} else if (type == ReadableType.Boolean) {
				jsonArray.put( readableArray.getBoolean(i) );
			} else if (type == ReadableType.Null) {
				jsonArray.put( JSONObject.NULL );
			} else if (type == ReadableType.Number) {
				jsonArray.put( readableArray.getDouble(i) );
			} else if (type == ReadableType.Map) {
				jsonArray.put( convertReadableMap( readableArray.getMap(i) ) );
			} else if (type == ReadableType.Array) {
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
			if(type == ReadableType.String) {
				jsonObject.put(key, readableMap.getString(key) );
			} else if (type == ReadableType.Boolean) {
				jsonObject.put(key, readableMap.getBoolean(key) );
			} else if (type == ReadableType.Null) {
				jsonObject.put(key, JSONObject.NULL );
			} else if (type == ReadableType.Number) {
				jsonObject.put(key, readableMap.getDouble(key) );
			} else if (type == ReadableType.Map) {
				jsonObject.put(key, convertReadableMap( readableMap.getMap(key) ) );
			} else if (type == ReadableType.Array) {
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

	@ReactMethod
	public void syncInAppMessages() {
		MessageSync.syncMessages(reactContext, new OperationCallback<MessageSync.SyncReport>() {
			@Override
			public void onSuccess(MessageSync.SyncReport newSyncReport, OperationResult result) {
				sendEvent("SyncInbox", null);
			}

			@Override
			public void onFailure(MessageSync.SyncReport syncReport, OperationResult result) {
				sendEvent("SyncInbox", null);
			}
		});
	}

  @ReactMethod
  public void addListener(String eventName) {

  }

  @ReactMethod
  public void removeListeners(Integer count) {

  }
}
