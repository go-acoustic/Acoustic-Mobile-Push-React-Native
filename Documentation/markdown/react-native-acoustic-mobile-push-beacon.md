<ul id='nav'>
	<li><a href='index.html'>Acoustic Mobile Push Plugins</a></li>
	<li><a href="react-native-acoustic-mobile-push.html">Base Plugin</a></li>
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
			<li>
				<a href='#readme'><b>Beacon Plugin</b></a>
				<ul>
					<li><a href="#requirements">Requirements</a></li>
					<li><a href="#description">Description</a></li>
					<li><a href="#installation">Installation</a></li>
					<li>
						<a href="#user-content-constants-exported">Constants</a>
						<ul>
							<li><a href="#uuid">uuid</a></li>
						</ul>
					</li>
					<li>
						<a href="#user-content-module-api">API</a>
						<ul>
							<li><a href="#beaconregions">beaconRegions</a></li>
						</ul>
					</li>
					<li>
						<a href="#user-content-events-emitted">Events</a>
						<ul>
							<li><a href="#enteredbeacon">EnteredBeacon</a></li>
							<li><a href="#exitedbeacon">ExitedBeacon</a></li>
						</ul>
					</li>
				</ul>
			</li>			
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

# Acoustic Mobile Push Beacon Plugin

## Requirements
- Acoustic Mobile Push Plugin (react-native-acoustic-mobile-push) 
- Acoustic Mobile Push Location Plugin (react-native-acoustic-mobile-push-location) 

## Description
This plugin adds beacon support to your application. Beacons are defined on the web based console and synced down to the device. When a beacon fence is triggered an event is sent to the server that can trigger a push message back to the device. The application is also notified with an <a href="#enteredbeacon">`EnteredBeacon`</a> event when beacon fences are entered and an <a href="#exitedbeacon">`ExitedBeacon`</a> event when beacon fences are exited.

## Installation
```sh
npm install --save <sdk folder>/plugins/react-native-acoustic-mobile-push-beacon
```

### Post Installation Steps

**Link the plugin:**
```sh
react-native link react-native-acoustic-mobile-push-beacon
```

> Please set the UUID used by your beacons in the MceConfig.json file for both Android and iOS. Without this information the devices will not be able to locate the beacons.

### Constants Exported
#### uuid
##### Description
This constant provides access to the beacon UUID value in the MceConfig.json file.

##### Example
```js
import {RNAcousticMobilePushBeacon} from 'NativeModules';

console.log("iBeacon UUID: " + RNAcousticMobilePushBeacon.uuid);
```

## Module API
### beaconRegions()
#### Description
Lists major beacon regions via a promise. The promise includes a list of beacons with the values; `major` an integer and an identifier string named `id`.

#### Example
```js
import {RNAcousticMobilePushBeacon} from 'NativeModules';

var latitude = 40.7128;
var longitude = -74.0060;
var radius = 1000; // Meters
RNAcousticMobilePushBeacon.beaconRegions().then((beacons) => { 
    beacons.forEach(function (beacon) {
        console.log("Beacon with major " + beacon.major + " has identifier " + beacon.id);
    });
}).catch((error) => {
    console.error("An error occured: " + error);
});
```

## Events Emitted
### EnteredBeacon
##### Description
This event is emitted when a user enters a beacon fence.

##### Example
```js
import {RNAcousticMobilePushBeacon} from 'NativeModules';
const emitter = new NativeEventEmitter(RNAcousticMobilePushBeacon);

emitter.addListener('EnteredBeacon', (beacon) => { 
    console.log('The user has entered a beacon with the identifier: ' + beacon.id);
});
```

### ExitedBeacon
##### Description
This event is emitted when a user exits a beacon fence.

##### Example
```js
import {RNAcousticMobilePushBeacon} from 'NativeModules';
const emitter = new NativeEventEmitter(RNAcousticMobilePushBeacon);

emitter.addListener('ExitedBeacon', (beacon) => { 
    console.log('The user has exited a beacon with the identifier: ' + beacon.id);
});
```