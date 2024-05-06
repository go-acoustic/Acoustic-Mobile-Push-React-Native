<ul id='nav'>
	<li><a href='index.html'>Acoustic Mobile Push Plugins</a></li>
	<li><a href='react-native-acoustic-mobile-push.html'>Base Plugin</a></li>
	<li>
		Content Plugins
		<ul>
			<li><a href="react-native-acoustic-mobile-push-inbox.html">Inbox Plugin</a></li>
            <li>
				<a href="#readme"><b>InApp Plugin</b></a>
				<ul>
					<li><a href="#requirements">Requirements</a></li>
					<li><a href="#description">Description</a></li>
					<li><a href="#installation">Installation</a></li>
                    <li>
                        <a href="#user-content-module-api">API</a>
                        <ul>
                            <li><a href="#hideinapp">hideInApp</a></li>
                            <li><a href="#user-content-createinappcontent-template-rules-maxviews-attribution-mailingid">createInApp</a></li>
                            <li><a href="#user-content-executeinapprules">executeInApp</a></li>
                            <li><a href="#user-content-registerinapptemplate-module-height">registerInApp</a></li>
                            <li><a href="#user-content-clickinappinappmessagebyid">clickInApp</a></li>
                            <li><a href="#syncinappmessages">syncInAppMessages</a></li>
							<li><a href="#user-content-deleteinappinappmessageid">deleteInApp</a></li>
                        </ul>
                    </li>
				</ul>
			</li>
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

# Acoustic Mobile Push InApp Plugin

## Requirements
- Acoustic Mobile Push Plugin (react-native-acoustic-mobile-push) 

## Description
This plugin is used to add InApp functionality to your application. The messages are created on the server and passed to the device over a periodic sync process. These messasges are displayed over the application content, typically as promotional messages. The messages are displayed vai templates that define how they should look and if they should cover the entire screen or only part of the screen. These templates are designed to be customized for your application and you can create addtional InApp templates to provide for additional use cases. 

## Installation
```sh
yarn add react-native-acoustic-mobile-push-inapp
```
or 
```sh
npm install --save react-native-acoustic-mobile-push-inapp
```

### Post Installation Steps
> For React Native v.059 and lower link the plugin with
```sh
react-native link react-native-acoustic-mobile-push-inapp
```

> Template files in this plugins javascript directory will need to be integrated into your application and the templates will need to be imported so they can register with the SDK at startup like this:
```js
import './in-app/in-app-banner';
import './in-app/in-app-media';
```
> You should also add appropriate places in the app that display messages. See <a href="#user-content-executeinapprules">executeInApp</a> for details.

## Module API

### From React Native v.060 and higher NativeModules are part of react-native. If you are using lower version of RN please use the following code to import RNAcoustic modules:

```js
import { RNAcousticMobilePushInapp } from 'NativeModules';
````

### hideInApp()
#### Description
This function hides the currently displayed InApp message.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInapp } = NativeModules;

RNAcousticMobilePushInapp.hideInApp();
```

### createInApp(`content`, `template`, `rules`, `maxViews`, `attribution`, `mailingId`)
#### Description
This function can be used to add a new InApp message to the system. Note: this is typically only done in a testing context. The `content` of the message is specified as a generic Javascript object and is entirely customizable by the `template`. The `rules` is an array of keywords that define when to display the message. The `maxViews` parameter defines how many times the message should be shown to the user. Note that when the user clicks on the message it is deleted reguardless of how many views are remaining. The `attribution` parameter optionally defines where the message came from and the `mailingid` optional parameter defines what mailing the message came from.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInapp } = NativeModules;
const content = {
	text: "Minimal Banner Message",
	action: {
		type: "url",
		value: "http://acoustic.co"
	}
};
const template = "default";
const rules = ['product', 'home']; // Keywords of when to display this InApp message 
const maxViews = 5; // Maximum number of times a message is displayed
const attribution = "optional attribution string";
const mailingId = "optional mailing id string";

RNAcousticMobilePushInapp.createInApp(content, template, rules, maxViews, attribution, mailingId);
```

### executeInApp(`rules`)
#### Description
This function executes the specified `rules`, which is an array of keywords. If there is a message with any of those rules in the database, that message will be displayed on the top of the current content.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInapp } = NativeModules;
const rules = ["product", "about"];

RNAcousticMobilePushInapp.executeInApp(rules);
```

### registerInApp(`template`, `module`, `height`)
#### Description
This function registers an InApp template with the sdk. The `template` name should be unique across all registered templates, the `module` specifies what module is registered with react native and the `height` optionally specifies a desired height of the InApp message. Please see the included banner and media templates for concrete examples.

#### Example
```js
import { AppRegistry, NativeModules } from 'react-native';
import { InAppTemplate } from './in-app-template';

const { RNAcousticMobilePushInapp } = NativeModules;

export default class ExampleTemplate extends InAppTemplate {
	render() {
		return (
			<View />
		);
	}
}

AppRegistry.registerComponent("ExampleTemplate", () => ExampleTemplate);
RNAcousticMobilePushInapp.registerInApp("example", "ExampleTemplate", 44);
```

### clickInApp(`inAppMessageById`)
#### Description
This function registers a click of an InApp message which sends an event back to the server, opens the action associated with the message and dismisses the message. The `inAppMessageId` comes from the current InApp message that is displayed. Please see the included banner and media templates for concrete examples.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInapp } = NativeModules;
const inAppMessageId = "ABCD";

RNAcousticMobilePushInapp.clickInApp(inAppMessageid)
```

### syncInAppMessages()
#### Description
This function requests the SDK to sync the inbox messages with the server.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInapp } = NativeModules;

RNAcousticMobilePushInapp.syncInAppMessages();
```

### deleteInApp(`inAppMessageId`)
#### Description
This function can be used to remove an InApp message from the database. The `inAppMessageId` comes from an InApp message object.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushInapp } = NativeModules;
const inAppMessageId = "ABCD";

RNAcousticMobilePushInapp.deleteInApp(inAppMessageid)
```
