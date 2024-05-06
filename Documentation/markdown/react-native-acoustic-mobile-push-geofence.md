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
			<li>
				<a href='#readme'><b>Geofence Plugin</b></a>
				<ul>
					<li><a href="#requirements">Requirements</a></li>
					<li><a href="#description">Description</a></li>
					<li><a href="#installation">Installation</a></li>
					<li>
						<a href="#user-content-module-api">API</a>
						<ul>
							<li><a href="#user-content-geofencesnearcoordinatelatitude-longitude-radius">geofencesNearCoordinate</a></li>
						</ul>
					</li>
					<li>
						<a href="#user-content-events-emitted">Events</a>
						<ul>
							<li><a href="#refreshactivegeofences">RefreshActiveGeofences</a></li>
							<li><a href="#enteredgeofence">EnteredGeofence</a></li>
							<li><a href="#exitedgeofence">ExitedGeofence</a></li>
						</ul>
					</li>
				</ul>
			</li>	
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

# Acoustic Mobile Push Geofence Plugin

## Requirements
- Acoustic Mobile Push Plugin (react-native-acoustic-mobile-push) 
- Acoustic Mobile Push Location Plugin (react-native-acoustic-mobile-push-location) 

## Description
This plugin adds geofence support to your application. Geofences are created on the web based console and synced down to the device. As the user moves around the closest geofences are added to the system to be monitored for. When a geofence is triggered an event is sent to the server that can trigger a push message back to the device. The application is also notified with an <a href="#enteredgeofence">`EnteredGeofence`</a> event when geofences are entered and an <a href="#exitedgeofence">`ExitedGeofence`</a> event when geofences are exited.

## Installation
```sh
yarn add react-native-acoustic-mobile-push-geofence
```
or 
```sh
npm install --save react-native-acoustic-mobile-push-geofence
```

### Post Installation Steps
> For React Native v.059 and lower link the plugin with
```sh
react-native link react-native-acoustic-mobile-push-geofence
```

## Module API

### From React Native v.060 and higher NativeModules are part of react-native. If you are using lower version of RN please use the following code to import RNAcoustic modules:

```js
import { RNAcousticMobilePushGeofence } from 'NativeModules';
````

### geofencesNearCoordinate(latitude, longitude, radius)

### Description
This function allows you to list the geofences that are near a specific point on the Earth. The geofences are setup on the Web interface and synced down to the device. It takes a `latitude` in decimal degrees, a `longitude` in decimal degrees and a `radius` in meters. It provides a promise with the list of geofences. Each geofence in the promise provided list has a `latitude` in decimal degrees, a `longitude` in decimal degrees, a `radius` in meters, an internal `id` string and a boolean flag named `active`.

### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushGeofence } = NativeModules;
const latitude = 40.7128;
const longitude = -74.0060;
const radius = 1000; // Meters

RNAcousticMobilePushGeofence.geofencesNearCoordinate(latitude, longitude, radius).then((geofences) => { 
    geofences.forEach((geofence) => {
        console.log("Geofence at latitude: " + geofence.latitude + ", longitude: " + geofence.longitude + ", radius: " + geofence.radius + ", has identifier: " + geofence.id + " and is " + (geofence.active ? "active" : "inactive") );
    });
}).catch((error) => {
    console.error("An error occured: " + error);
});
```

## Events Emitted
### RefreshActiveGeofences
#### Description
This event is emitted when geofences are updated on the device from the server durring a sync call.
#### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePushGeofence } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePushGeofence);

emitter.addListener('RefreshActiveGeofences', () => { 
    // Geofences have been updated, refresh UI if needed here.
});
```

### EnteredGeofence
#### Description
This event is emitted when a user enters a geofence.

#### Example
```js
import { NativeEventEmitter,  NativeModules } from 'react-native';

const { RNAcousticMobilePushGeofence } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePushGeofence);

emitter.addListener('EnteredGeofence', (geofence) => { 
    console.log('The user has entered a geofence with the identifier: ' + geofence.id);
});
```

### ExitedGeofence
#### Description
This event is emitted when a user exits a geofence.

#### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePushGeofence } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePushGeofence);

emitter.addListener('ExitedGeofence', (geofence) => { 
    console.log('The user has exited a geofence with the identifier: ' + geofence.id);
});
```
