<ul id='nav'>
	<li><a href='index.html'>Acoustic Mobile Push Plugins</a></li>
	<li><a href='react-native-acoustic-mobile-push.html'>Base Plugin</a></li>
	<li>
		Content Plugins
		<ul>
            <li>
				<a href="#readme"><b>Inbox Plugin</b></a>
				<ul>
					<li><a href="#requirements">Requirements</a></li>
					<li><a href="#description">Description</a></li>
					<li><a href="#installation">Installation</a></li>
                    <li>
                        <a href="#user-content-module-api">API</a>
                        <ul>
                            <li><a href="#user-content-inboxmessagecountcallback">inboxMessageCount</a></li>
                            <li><a href="#user-content-deleteinboxmessageinboxmessageid">deleteInboxMessage</a></li>
                            <li><a href="#user-content-readinboxmessageinboxmessageid">readInboxMessage</a></li>
                            <li><a href="#syncinboxmessages">syncInboxMessages</a></li>
                            <li><a href="#user-content-listinboxmessagesascending-callback">listInboxMessages</a></li>
                            <li><a href="#user-content-clickinboxactionaction-inboxmessageid">clickInboxAction</a></li>
							<li><a href="#user-content-registerinboxcomponentmodule">registerInboxComponent</a></li>
							<li><a href="#hideinbox">hideInbox</a></li>
                        </ul>
                    </li>
                    <li>
                        <a href="#user-content-events-emitted">Events</a>
                        <ul>
                            <li><a href="#syncinbox">SyncInbox</a></li>
                            <li><a href="#inboxcountupdate">InboxCountUpdate</a></li>
                        </ul>
                    </li>
                    <li><a href="#sample-payload">Sample Payload</a></li>
                </ul>
			</li>
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

# Acoustic Mobile Push Inbox Plugin

## Requirements
- Acoustic Mobile Push Plugin (react-native-acoustic-mobile-push) 

## Description
This plugin is used to add inbox functionality to your application. The messages are created on the server and passed to the device over a periodic sync process. They are displayed via templates that provide a means to display their content in both list form and full screen. These templates are designed to be customized for your application. You can also create additional inbox templates and register them with the server so other types of messages can be displayed to the user.

## Installation
```sh
yarn add file:<sdk folder>/plugins/react-native-acoustic-mobile-push-inbox
```
or 
```sh
npm install --save <sdk folder>/plugins/react-native-acoustic-mobile-push-inbox
```

### Post Installation Steps
> For React Native v.059 and lower link the plugin with
```sh
react-native link react-native-acoustic-mobile-push-inbox
```

> Template files in this plugins javascript directory will need to be integrated into your application and the templates will need to be imported so they can register with the SDK at startup like this:
```js
import './inbox/default-inbox-template';
import './inbox/post-inbox-template';
import './inbox/inbox-action';
``` 
Additionally, you will need to create pages to display the list of messages and the full screen messages. See the sample project's inbox-message-screen.js and inbox-screen.js for examples of how this can be done.

## Module API

### From React Native v.060 and higher NativeModules are part of react-native. If you are using lower version of RN please use the following code to import RNAcoustic modules:

```js
import { RNAcousticMobilePushInbox } from 'NativeModules';
````

### inboxMessageCount(`callback`)
#### Description
This function can be used to determine how many inbox messages are in the inbox and how many are unread. The counts are delivered to the `callback` function as an object with `unread` and `messages` keys.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;

RNAcousticMobilePushInbox.inboxMessageCount(function(counts) { 
	console.log("There are " + counts.messages + " messages in the inbox and " + counts.unread + " are unread");
});
```

### deleteInboxMessage(`inboxMessageId`)

#### Description
This function can be used to delete the inbox message with the provided `inboxMessageId` value. Note that the `inboxMessageId` comes from an inbox message that is currently displayed.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;
const inboxMessageId = "abc";

RNAcousticMobilePushInbox.deleteInboxMessage(inboxMessageId);
```

### readInboxMessage(`inboxMessageId`)

#### Description
This function can be used to mark an inbox message as read via the inbox message with the provided `inboxMessageId` value. Note that the `inboxMessageId` comes from an inbox message that is currently displayed.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;
const inboxMessageId = "abc";

RNAcousticMobilePushInbox.readInboxMessage(inboxMessageId);
```

### syncInboxMessages()
#### Description
This function requests the SDK to sync the inbox messages with the server.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;

RNAcousticMobilePushInbox.syncInboxMessages();
```

### listInboxMessages(`ascending`, `callback`)
#### Description
This function can be used to list the contents of the inbox. The `ascending` parameter can be `true` for messages sorted in ascending order of send date and `false` to sort the messages in descending order. The messages are provided to the `callback` function for processing.
#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;

RNAcousticMobilePushInbox.listInboxMessages(false, (inboxMessages) => {
	inboxMessages.forEach((inboxMessage) => {
		console.log("Inbox message found with inboxMessageId: " + inboxMessage.inboxMessageId + ", content: " + JSON.stringify(inboxMessage.content) + ", expirationDate: " + inboxMessage.expirationDate + ", sendDate: " + inboxMessage.sendDate +  ", displayed using template: " + inboxMessage.templateName + ", the message is" +  (inboxMessage.isRead ? "" : " NOT" ) + " read, the message is" + (inboxMessage.isDeleted ? "" : " NOT" ) + " deleted, and is" + (inboxMessage.isRead ? "" : " NOT" ) + " expired.");
	})
});
```

### clickInboxAction(`action`, `inboxMessageId`)
#### Description
This function can be used to trigger an inbox message action. The `action` is defined in the message which is referenced by it's `inboxMessageId`. Note: these should both come from valid inbox messages in the inbox. See default and post inbox templates for concrete examples.
#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;
const action = {type: "url", value: "http://accoustic.co"};
const inboxMessageId = "abc";

RNAcousticMobilePushInbox.clickInboxAction(actionFromMessage, inboxMessageId);
```

### registerInboxComponent(`module`)
#### Description
This function registers the root view for the inbox message push action handler. Typically this is setup in inbox-action.js and registers the InboxAction class to handle inbox push events. However, this can be customized if desired.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;

RNAcousticMobilePushInbox.registerInboxComponent("InboxAction");
```

### hideInbox()

#### Description
This function hides the inbox message overlay that is popped up when an inbox message action is handled.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;

RNAcousticMobilePushInbox.hideInbox();
```

## Events Emitted

### SyncInbox
#### Description
This event is emitted when the contents of the inbox have changed due to a sync with the server.

#### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePushInbox);

emitter.addListener('SyncInbox', () => { 
	// Update the list of messages displayed to the user here
});
```

### InboxCountUpdate
#### Description
Thie event is emitted when the number of messages or unread messages changes.

#### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePushInbox } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePushInbox);

emitter.addListener('InboxCountUpdate', () => { 
	// Update interfaces that show the current number of messages or unread messages
});
```

## Sample Action Payload
```js
{
	"type": "openInboxMessage",
	"template": "post", 
	"value": "A8HMqDEU"
}
```
