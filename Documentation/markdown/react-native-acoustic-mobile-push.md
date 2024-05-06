<ul id='nav'>
	<li><a href='index.html'>Acoustic Mobile Push Plugins</a></li>
	<li>
		<a href='#readme'><b>Base Plugin</b></a>
		<ul>
			<li><a href="#description">Description</a></li>
			<li><a href="#installation">Installation</a></li>
			<li>
				<a href="#user-content-constants-exported">Constants</a>
				<ul>
					<li><a href="#sdkversion">sdkVersion</a></li>
					<li><a href="#pluginversion">pluginVersion</a></li>
					<li><a href="#appkey">appKey</a></li>
				</ul>
			</li>
			<li>
				<a href="#user-content-module-api">API</a>
				<ul>
					<li><a href="#sendevents">sendEvents</a></li>
					<li><a href="#user-content-addeventevent-immediate">addEvent</a></li>
					<li><a href="#user-content-updateuserattributesattributes">updateUserAttributes</a></li>
					<li><a href="#user-content-deleteuserattributeskeys">deleteUserAttributes</a></li>
					<li><a href="#user-content-registrationdetailspromise">registrationDetails</a></li>
					<li><a href="#manualinitialization">manualInitialization</a></li>
					<li><a href="#requestpushpermission">requestPushPermission</a></li>
					<li><a href="#user-content-safeareainsetscallback">safeAreaInsets</a></li>
					<li><a href="#user-content-registeractiontype-callback">registerAction</a></li>
				</ul>
			</li>
			<li>
				<a href="#user-content-events-emitted">Events</a>
				<ul>
					<li><a href="#eventsuccess">EventSuccess</a></li>
					<li><a href="#eventfailure">EventFailure</a></li>
					<li><a href="#registered">Registered</a></li>
					<li><a href="#registrationchanged">RegistrationChanged</a></li>
					<li><a href="#updateuserattributeserror">UpdateUserAttributesError</a></li>
					<li><a href="#deleteuserattributeserror">DeleteUserAttributesError</a></li>
					<li><a href="#deleteuserattributessuccess">DeleteUserAttributesSuccess</a></li>
					<li><a href="#custompushnotyetregistered">CustomPushNotYetRegistered</a></li>
					<li><a href="#custompushnotregistered">CustomPushNotRegistered</a></li>
					<li><a href="#user-content-custom-action-events">Custom Action Events</a></li>
				</ul>
			</li>
		</ul>
	</li>
	<li>
		Content Plugins
		<ul>
			<li><a href="react-native-acoustic-mobile-push-inbox.html">Inbox Plugin</a></li>
			<li><a href="react-native-acoustic-mobile-push-inapp.html">InApp Plugin</a></li>
		</ul>
	</li>
	<li>
		Location Plugins
		<ul>
			<li><a href="react-native-acoustic-mobile-push-location.html">Base Location Plugin</a></li>
			<li><a href="react-native-acoustic-mobile-push-geofence.html">Geofence Plugin</a></li>
			<li><a href="react-native-acoustic-mobile-push-beacon.html">Beacon Plugin</a></li>
		</ul>
	</li>
	<li>
		Action Plugins
		<ul>
			<li><a href="react-native-acoustic-mobile-push-snooze.html">Snooze Action Plugin</a></li>
			<li><a href="react-native-acoustic-mobile-push-displayweb.html">DisplayWeb Action Plugin</a></li>
			<li><a href="react-native-acoustic-mobile-push-calendar.html">Calendar Action Plugin</a></li>
		</ul>
	</li>
</ul>

# Acoustic Mobile Push Plugin
## Description
This plugin provides basic push message support using the [Acoustic Campaign](https://acoustic.co/products/campaign/) platform. Once it is installed your app will be able to receive push messages, react to those push message actions, send user attributes and send events.

## Installation
If your app is using React Native v0.60 or later and are using the AndroidX libraries instead of the Android Support libraries, set the following command line variable:
```sh
export ANDROID_X=1
```

Then install as normal
```sh
yarn add react-native-acoustic-mobile-push
```
or 
```sh
npm install --save react-native-acoustic-mobile-push
```

## Constants Exported

### From React Native v.060 and higher NativeModules are part of react-native. If you are using lower version of RN please use the following code to import RNAcoustic modules:

```js
import { RNAcousticMobilePush } from 'NativeModules';
````

### sdkVersion
#### Description
This constant provides the current sdk version number.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

console.log("The sdk version number is " + RNAcousticMobilePush.sdkVersion);
```

### pluginVersion
#### Description
This constant provides the current React Native plugin version number.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

console.log("The plugin version number is " + RNAcousticMobilePush.pluginVersion);
```

### appKey
#### Description
This constant provides the application's appKey from the MceConfig.json file.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

console.log("This application's appkey is " + RNAcousticMobilePush.appKey);
```

### Module API

### sendEvents()

##### Description
This function forces the events sitting in the queue to be sent to the server.

##### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

// Send events to server
RNAcousticMobilePush.sendEvents();
```

#### addEvent(event, immediate)
##### Description
This function sends custom events to the server for processing. Success can be observed via the <a href="#eventsuccess">`EventSuccess`</a> event. failure can be observed via the <a href="#eventfailure">`EventFailure`</a> event.

##### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const minimalEvent = {name: "minimal", type: "event"};
const nonImmediate = false; 

RNAcousticMobilePush.addEvent(minimalEvent, nonImmediate);

const event = {
	name: "required event name string",
	type: "required event type string",
	attribution: "optional attribution string",
	mailingId: "optional mailingId string",
	attributes: { // optional object
		stringKey: "value",
		numKey: 1,
		boolKey: true,
		dateKey: new Date()
	}
};
const immediate = true; 

RNAcousticMobilePush.addEvent(event, immediate);
```

#### updateUserAttributes(attributes)
##### Description
Updates user attributes on server for user record. Values can be numeric, boolean, date or string. However, the type of the value should match the type in the user record database. Success can be observed via the <a href="#updateuserattributessuccess">`UpdateUserAttributesSuccess`</a> event. Failure can be observed via the <a href="#updateuserattributeserror">`UpdateUserAttributesError`</a> event

##### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const attributes = {
	boolKey: false,
	numkey: 4,
	stringKey: "value",
	dateKey: new Date()
};

RNAcousticMobilePush.updateUserAttributes(attributes);
```

#### deleteUserAttributes(keys)
##### Description
Deletes user attributes on server for user record. Provide a list of keys to be removed. Success can be observed via the <a href="#deleteuserattributessuccess">`DeleteUserAttributesSuccess`</a> event. Failure can be observed via the <a href="#deleteuserattributeserror">`DeleteUserAttributesError`</a> event

##### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

RNAcousticMobilePush.deleteUserAttributes(['key1', 'key2']);
```

#### registrationDetails(promise)
##### Description
Retrieves current userId and channelId for device. Observing the <a href="#registered">`Registered`</a> event can be used to determine when the device first registers. Observing the <a href="#registrationchanged">`RegistrationChanged`</a> event can be used to determine when the device registration changes.

##### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

RNAcousticMobilePush.registrationDetails().then((registrationDetails) => {
	console.log("UserId = " + registrationDetails.userId);
	console.log("ChannelId = " + registrationDetails.channelId);
});
```

#### manualInitialization()
##### Description
This function starts the SDK if it has been configured for delayed startup. In the MceConfig.json file, the `autoInitialize` setting configures this behavior.

##### Example

*MceConfig.json*
```js
{
	...
	"autoInitialize": false
	...
}
```

*In Application*
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

// Start up the SDK when it makes sense to in the application
RNAcousticMobilePush.manualInitialization()
```

#### requestPushPermission()
##### Description
This function requests push permission from the user. Note, on iOS this is required and the SDK will not fully initialize until this is complete.

##### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

// Request push permission when app starts or defer it until later
RNAcousticMobilePush.requestPushPermission()
```

#### safeAreaInsets(callback)
##### Description
This function provides the safe area region of the screen for absolute location screen drawing and referencing.

##### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;

RNAcousticMobilePush.safeAreaInsets(function (safeArea) {
	console.log("Safe area for current device is left: " + safeArea.left + ", right: " + safeArea.right + ", top: " + safeArea.top + ", bottom: " + safeArea.bottom );
});
```

#### registerAction(type, callback)

##### Description
This function allows your application to register code to be run in the event of a specific action being called. These actions can be called for push messages, InApp messages and Inbox messages in response to user interaction.

> Note that this functions is called against a different module then the other functions in this plugin. The RNAcousticMobilePush plugin contains both of these modules to avoid conflicts between the namespaces.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePushActionHandler } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePushActionHandler);

export default function demonstrationAction(details) {
	// details.action contains the specific action payload ie {"type": "demonstration", "value": "acoustic"}
	// details.payload contains the entire push payload ie { "aps": { "alert": "test" }, "notification-action": {"type": "demonstration", "value": "acoustic"} }

	// You can place code here to use the values in those payloads to perform work on behalf of the user
}

// The registerAction call tells the SDK that you intend to handle actions of this type. In addition the function passed will be called for any missed actions received while your code was not running. 
RNAcousticMobilePushActionHandler.registerAction('demonstration', demonstrationAction);

// The listener call allows this function to be called when actions arrive
emitter.addListener('demonstration', demonstrationAction);
```

### Events Emitted

#### EventSuccess
##### Description
This event is emitted when events are successfully delivered to the server.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('EventSuccess', function (userInfo) {
	const events = [];
	for(let index in userInfo.events) {
		let event = userInfo.events[index];
		events.push("name: " + event.name + ", type: " + event.type);
	}
	console.log("Events sent to server: " + events.join(', ') );
});
```

#### EventFailure

##### Description
This event is emitted when events fail to send to the server. Note, the event send will be retried until it succeeds.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('EventFailure', function (userInfo) {
	const events = [];
	for(let index in userInfo.events) {
		let event = userInfo.events[index];
		events.push("name: " + event.name + ", type: " + event.type);
	}
	console.log("Could not send events to server: " + events.join(', ') + " because " + usearInfo.error );
});
```

#### Registered

##### Description
This event is emitted when the SDK registers with the server.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('Registered', ()=>{
	// Device is now registered with Acoustic servers
	RNAcousticMobilePush.registrationDetails().then((registrationDetails) => {
		// Optionally send registrationDetails.userId and registrationDetails.channelId to server
		console.log("UserId = " + registrationDetails.userId);
		console.log("ChannelId = " + registrationDetails.channelId);
	});
});
```

#### RegistrationChanged

##### Description
This event is emitted when the registration changes with the server.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('RegistrationChanged', ()=>{
	// Device registration has changed
	RNAcousticMobilePush.registrationDetails().then((registrationDetails) => {
		// Optionally send registrationDetails.userId and registrationDetails.channelId to server
		console.log("UserId = " + registrationDetails.userId);
		console.log("ChannelId = " + registrationDetails.channelId);
	});
});
```

#### UpdateUserAttributesSuccess

##### Description
This event is emitted when user attributes have been sent to the server.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('UpdateUserAttributesSuccess', (userInfo)=>{
	const attributes = [];
	const keys = Object.getOwnPropertyNames(userInfo.attributes);
	for(let index in keys) {
		let key = keys[index];
		let value = userInfo.attributes[key];
		attributes.push(key + '=' + value);
	}

	console.log("Sent attributes: " + attributes.join(', ') );
});
```

#### UpdateUserAttributesError

##### Description
This event is emitted when user attributes can not be sent to the server. Note: the SDK will retry until successful.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('UpdateUserAttributesSuccess', (userInfo)=>{
	const attributes = [];
	const keys = Object.getOwnPropertyNames(userInfo.attributes);
	for(let index in keys) {
		let key = keys[index];
		let value = userInfo.attributes[key];
		attributes.push(key + '=' + value);
	}

	console.log("Could not send attributes: " + attributes.join(', ') + " because " + userInfo.error );
});
```

#### DeleteUserAttributesSuccess

##### Description
This event is emitted when user attributes are successfully deleted from the server.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('DeleteUserAttributesSuccess', (userInfo) => { 
	console.log("Deleted attributes: " + userInfo.keys.join(', '));
});
```

#### DeleteUserAttributesError

##### Description
This event is emitted when user attribtes fail to delete from the server. Note: this operation will be retried until it's successful.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('DeleteUserAttributesSuccess', (userInfo) => { 
	console.log("Could not delete attributes: " + userInfo.keys.join(', ') + " because " + userInfo.error);
});
```

#### CustomPushNotYetRegistered

##### Description
This event is emitted when a custom action that was previously registered but is not currently registered receives a push action.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('CustomPushNotYetRegistered', function (userInfo) {
	console.log("Custom action received, but is not yet registered " + userInfo.type);
});
```

#### CustomPushNotRegistered

##### Description
This event is emitted when a custom action is received, but has never had a push action associated with it.

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePush } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePush);

emitter.addListener('CustomPushNotRegistered', function (userInfo) {
	console.log("Custom action received, but is not registered " + userInfo.type);
});
```

#### Custom Action Events

##### Description
Custom action events are emitted from a different `NativeEventEmitter` to prevent conflicts with preexisting events. 

##### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePushActionHandler } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePushActionHandler);

export default function demonstrationAction(details) {
	// details.action contains the specific action payload ie {"type": "demonstration", "value": "acoustic"}
	// details.payload contains the entire push payload ie { "aps": { "alert": "test" }, "notification-action": {"type": "demonstration", "value": "acoustic"} }

	// You can place code here to use the values in those payloads to perform work on behalf of the user
}

// The registerAction call tells the SDK that you intend to handle actions of this type. In addition the function passed will be called for any missed actions received while your code was not running. 
RNAcousticMobilePushActionHandler.registerAction('demonstration', demonstrationAction);

// The listener call allows this function to be called when actions arrive
emitter.addListener('demonstration', demonstrationAction);
```
