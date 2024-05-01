<ul id='nav'>
	<li><a href='index.html'>Acoustic Mobile Push Plugins</a></li>
	<li><a href='react-native-acoustic-mobile-push.html'>Base Plugin</a></li>
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
			<li>
				<a href="#readme"><b>Base Location Plugin</b></a>
				<ul>
					<li><a href="#requirements">Requirements</a></li>
					<li><a href="#description">Description</a></li>
					<li><a href="#installation">Installation</a></li>
					<li>
						<a href="#module-api">API</a>
						<ul>
							<li><a href="#user-content-locationstatuscallback">locationStatus</a></li>
							<li><a href="#synclocations">syncLocations</a></li>
							<li><a href="#enablelocation">enableLocation</a></li>
						</ul>
					</li>
					<li>
						<a href="#user-content-events-emitted">Events</a>
						<ul>
							<li><a href="downloadedlocations">DownloadedLocations</a></li>
						</ul>
					</li>
				</ul>
			</li>
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

# Acoustic Mobile Push Location Plugin

## Requirements
- Acoustic Mobile Push Plugin (react-native-acoustic-mobile-push) 

## Description
This module provides the infrastructure to support geofences and beacons. Note that other plugins are required to fully support geofences and beacons.

## Installation
If your app is using React Native v0.60 or later and are using the AndroidX libraries instead of the Android Support libraries, set the following command line variable:
```sh
export ANDROID_X=1
```

Then install as normal

## Installation
```sh
yarn add react-native-acoustic-mobile-push-location
```
or 
```sh
npm install --save react-native-acoustic-mobile-push-location
```

### Post Installation Steps
> For React Native v.059 and lower link the plugin with
```sh
react-native link react-native-acoustic-mobile-push-location
```

**Android Support** (with new SampleApp this step is already applied)

>If your app is using React Native v0.60 or later and are using the AndroidX libraries instead of the Android Support libraries. You will need to adjust the imports in **RNAcousticMobilePushLocationModule.java** by removing:
```java
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
```
and adding:
```java
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
```

**iOS Support**
> Please replace the placeholder location usage descriptions in info.plist in the NSLocationWhenInUseUsageDescription, NSLocationAlwaysUsageDescription and NSLocationAlwaysAndWhenInUseUsageDescription keys. These values help inform your users how you're going to respectfully use the access.

## Module API

### From React Native v.060 and higher NativeModules are part of react-native. If you are using lower version of RN please use the following code to import RNAcoustic modules:

```js
import { RNAcousticMobilePushLocation } from 'NativeModules';
````

### locationStatus(`callback`)

#### Description 
This method can be used to determine if the application has permission to use location.

#### Parameters
`callback` is executed with a single parameter value with one of the following values:
- `"denied"` - Android/iOS user disallowed location use
- `"delayed"` - iOS only value for not yet determined
- `"always"` - Android permission granted / iOS always allowed permission granted
- `"restricted"` - iOS restricted use permission granted
- `"enabled"` - iOS when in use permission granted
- `"disabled"` - Android/iOS disabled in MceConfig.json file

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushLocation } = NativeModules;

RNAcousticMobilePushLocation.locationStatus((status)=>{
	if(status == "denied") {
		// Do not use location features
	} else if(status == "delayed") {
		// Do not use location features yet
	} else if(status == "always") {
		// Can use location features in foreground or background
	} else if(status == "restricted") {
		// Restricted use of location features
	} else if(status == "enabled") {
		// Can use location features in foreground only
	} else if(status == "disabled") {
		// Location features are not enabled in config file
	}
});
```

### syncLocations()

#### Description
Request geofence and beacon sync with server. Use `DownloadedLocations` event to be informed of when this is finished.

#### Example
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushLocation } = NativeModules;

RNAcousticMobilePushLocation.syncLocations();
```

### enableLocation()

#### Description
Turns on location support when delayed in the MceConfig.json file.

#### Example
*MceConfig.json*
```js
{
	...
	"location": {"autoInitialize": false }
	...
}
```

*In Application*
```js
import { NativeModules } from 'react-native';

const { RNAcousticMobilePushLocation } = NativeModules;

// After user uses a feature that would require location features
RNAcousticMobilePushLocation.enableLocation();
```

## Events Emitted

### DownloadedLocations

#### Description
This event is emmited when the geofence/beacon list is updated from the server.

#### Example
```js
import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNAcousticMobilePushLocation } = NativeModules;
const emitter = new NativeEventEmitter(RNAcousticMobilePushLocation);

emitter.addListener('DownloadedLocations', () => { 
	// May need to refresh geofence interface display
});
```


