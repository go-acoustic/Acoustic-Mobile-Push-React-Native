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
			<li><a href="react-native-acoustic-mobile-push-displayweb.html">DisplayWeb Action Plugin</a></li>
			<li>
				<a href="#readme"><b>Calendar Action Plugin</b></a>
				<ul>
					<li><a href="#requirements">Requirements</a></li>
					<li><a href="#description">Description</a></li>
					<li><a href="#installation">Installation</a></li>
					<li><a href="#payloads">Payloads</a></li>
				</ul>
			</li>
		</ul>
	</li>
</ul>

# Acoustic Mobile Push Calendar Action Plugin

## Requirements
- Acoustic Mobile Push Plugin (react-native-acoustic-mobile-push) 

## Description
This action plugin provides a way for push message actions to add events to the user's calendar.

## Installation
```sh
yarn add file:<sdk folder>/plugins/react-native-acoustic-mobile-push-calendar
```
or 
```sh
npm install --save <sdk folder>/plugins/react-native-acoustic-mobile-push-calendar
```

### Post Installation Steps
> For React Native v.059 and lower link the plugin with
```sh
react-native link react-native-acoustic-mobile-push-calendar
```

> Please replace the placeholder calendar usage descriptions in info.plist in the NSCalendarsUsageDescription key. This value helps inform your users how you're going to respectfully use the access.

## Payloads
The following action payloads can be sent to the device to trigger this plugin.

### iOS
```js
{
  "type": "calendar",
  "title": "Title of event",
  "description": "Description of event",
  "timeZone": "Short timezone code like EST, GMT, etc",
  "startDate": "ISO 8601 Timestamp, eg yyyy-MM-ddTHH:mm:ssZ",
  "endDate": "ISO 8601 Timestamp, eg yyyy-MM-ddTHH:mm:ssZ",
  "interactive": true 
}
```
> When interactive=true a system view controller is presented to add event, when interactive=false the event is added without user interaction.


### Android
```js
{
  "title": "Title of event",
  "description": "Description of event",
  "starts": {
    "date": "yyyy-MM-dd",
    "time": "HH:mm",
    "timezone": "short timezone code like EST, GMT, etc"
  },
  "ends": {
    "date": "yyyy-MM-dd",
    "time": "HH:mm",
    "timezone": "short timezone code like EST, GMT, etc"
  }
}
```
