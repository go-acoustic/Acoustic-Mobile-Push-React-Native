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
						<a href="#user-content-constants-exported">Constants</a>
						<ul>
							<li><a href="#geofenceenabled">geofenceEnabled</a></li>
						</ul>
					</li>
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
npm install --save <sdk folder>/plugins/react-native-acoustic-mobile-push-geofence
```

### Post Installation Steps
> Link the plugin with
```sh
react-native link react-native-acoustic-mobile-push-geofence
```

## Constants Exported
### geofenceEnabled
#### Description
This constant reflects the geofence MceConfig.json configuration setting and can be used to verify that the geofence subsystem has been enabled. It will either have the value of `true` if the configuration has been setup for geofences or `false` otherwise.

#### Example
```js
import {RNAcousticMobilePushGeofence} from 'NativeModules';

if(RNAcousticMobilePushGeofence.geofenceEnabled) {
    console.log("Geofences are enabled in MceConfig.json");
} else {
    console.log("Geofences are disabled in MceConfig.json");
}
```

## Module API
### geofencesNearCoordinate(latitude, longitude, radius)

### Description
This function allows you to list the geofences that are near a specific point on the Earth. The geofences are setup on the Web interface and synced down to the device. It takes a `latitude` in decimal degrees, a `longitude` in decimal degrees and a `radius` in meters. It provides a promise with the list of geofences. Each geofence in the promise provided list has a `latitude` in decimal degrees, a `longitude` in decimal degrees, a `radius` in meters, an internal `id` string and a boolean flag named `active`.

### Example
```js
import {RNAcousticMobilePushGeofence} from 'NativeModules';

var latitude = 40.7128;
var longitude = -74.0060;
var radius = 1000; // Meters
RNAcousticMobilePushGeofence.geofencesNearCoordinate(latitude, longitude, radius).then((geofences) => { 
    geofences.forEach(function (geofence) {
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
import {RNAcousticMobilePushGeofence} from 'NativeModules';
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
import {RNAcousticMobilePushGeofence} from 'NativeModules';
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
import {RNAcousticMobilePushGeofence} from 'NativeModules';
const emitter = new NativeEventEmitter(RNAcousticMobilePushGeofence);

emitter.addListener('ExitedGeofence', (geofence) => { 
    console.log('The user has exited a geofence with the identifier: ' + geofence.id);
});
```
