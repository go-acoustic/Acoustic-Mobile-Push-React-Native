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
			<li><a href="react-native-acoustic-mobile-push-location.html">Base Location Plugin</a></li>
			<li><a href="react-native-acoustic-mobile-push-geofence.html">Geofence Plugin</a></li>
			<li><a href="react-native-acoustic-mobile-push-beacon.html">Beacon Plugin</a></li>
		</ul>
	</li>
	<li>
		Action Plugins
		<ul>
			<li><a href="react-native-acoustic-mobile-push-snooze.html">Snooze Action Plugin</a></li>
			<li>
				<a href="#readme"><b>DisplayWeb Action Plugin</b></a>
				<ul>
					<li><a href="#requirements">Requirements</a></li>
					<li><a href="#description">Description</a></li>
					<li><a href="#installation">Installation</a></li>
					<li><a href="#payloads">Payloads</a></li>
				</ul>
			</li>
			<li><a href="react-native-acoustic-mobile-push-calendar.html">Calendar Action Plugin</a></li>
		</ul>
	</li>
</ul>

# Acoustic Mobile Push Display Web Action Plugin

## Requirements
- Acoustic Mobile Push Plugin (react-native-acoustic-mobile-push) 

## Description
This action provides a way to display urls within the application rather then send users to the browser app as the `url` action does.

## Installation
```sh
yarn add react-native-acoustic-mobile-push-displayweb
```
or 
```sh
npm install --save react-native-acoustic-mobile-push-displayweb
```

### Post Installation Steps
> For React Native v.059 and lower link the plugin with
```sh
react-native link react-native-acoustic-mobile-push-displayweb
```

## Payloads
The following action payloads can be sent to the device to trigger this plugin.

### iOS
```js
{
    "type": "displayWebView",
    "value": "https://acoustic.co"
}
```

### Android
```js
{
    "type": "displayweb",
    "value": "https://acoustic.co"
}
```
