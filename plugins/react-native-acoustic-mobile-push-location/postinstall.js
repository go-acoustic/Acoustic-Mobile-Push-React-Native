/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

const fs = require('fs');
const plist = require('plist');
const path = require('path');
const xml2js = require('xml2js');
const chalk = require('chalk');

function findInstallDirectory() {
    if(process.env.MCE_RN_DIRECTORY) {
        console.log(chalk.yellow.bold("Using MCE_RN_DIRECTORY override instead of finding the application source directory."))
        return process.env.MCE_RN_DIRECTORY;
    }

	// Mac
	var currentDirectory = process.argv[ process.argv.length-1 ];
	if(currentDirectory != "$INIT_CWD") {
		return currentDirectory;
	}

	// Windows
	currentDirectory = process.cwd();
	while(!fs.existsSync(path.join(currentDirectory, "app.json"))) {
		var parentDirectory = path.dirname(currentDirectory);
		console.log("cwd: ", currentDirectory, ", parent: ", parentDirectory);
		if(parentDirectory == currentDirectory) {
			console.error(chalk.red("Could not find installation directory!"));
			return;
		}
		currentDirectory = parentDirectory;
	}
	console.log("Install Directory Found:", currentDirectory);
	
	return currentDirectory;
}

function findMainPath(installDirectory) {
	if(!fs.existsSync(installDirectory) || !fs.lstatSync(installDirectory).isDirectory()) {
		console.error("Couldn't locate install directory.");
		return;
	}

	const iosDirectory = path.join(installDirectory, 'ios');
	var directory;
	fs.readdirSync(iosDirectory).forEach((basename) => { 
		const mainPath = path.join(iosDirectory, basename);
		if(fs.lstatSync(mainPath).isDirectory()) {
			const filename = path.join(mainPath, "main.m");
			if(fs.existsSync(filename)) {
				directory = mainPath;
			}
		}
	});
	return directory;
}

function containsStanza(array, stanza, type) {
	for(var i = 0; i < array.length; i++) {
		if(array[i]['$']['android:name'] == stanza[type]['$']['android:name']) {
			return true
		}
	}
	return false;
}

function verifyStanza(array, stanzaString) {
	if(typeof array == "undefined") {
		array = [];
	}
	new xml2js.Parser().parseString(stanzaString, function (err, stanza) {
		const types = Object.getOwnPropertyNames(stanza);
		const type = types[0];
		if( !containsStanza(array, stanza, type) ) {
			console.log("Adding required " + type + " stanza to AndroidManifest.xml");
			array.push( stanza[type] )
		}
	});
	return array;
}

function modifyManifest(installDirectory) {
	let manifestPath = path.join(installDirectory, "android", "app", "src", "main", "AndroidManifest.xml");
	new xml2js.Parser().parseString(fs.readFileSync(manifestPath), function (err, document) {

		console.log("Adding required receivers to AndroidManifest.xml");
		var receivers = document.manifest.application[0].receiver;
		[
			'<receiver android:name="co.acoustic.mobile.push.sdk.location.LocationBroadcastReceiver" />', 
			'<receiver android:name="co.acoustic.mobile.push.sdk.location.LocationUpdateCaller" />',
			'<receiver android:name="co.acoustic.mobile.push.plugin.location.RNAcousticMobilePushBroadcastReceiver"><intent-filter><action android:name="co.acoustic.mobile.push.sdk.NOTIFIER" /></intent-filter></receiver>'
		].forEach((receiver) => {
			receivers = verifyStanza(receivers, receiver);
		});
		document.manifest.application[0].receiver = receivers;

		console.log("Adding required services to AndroidManifest.xml");
		var services = document.manifest.application[0].service;
		[
			'<service android:name="co.acoustic.mobile.push.sdk.location.LocationEventsIntentService" />',
            '<service android:name="co.acoustic.mobile.push.sdk.location.LocationSyncAlarmListener" />',
            '<service android:name="co.acoustic.mobile.push.sdk.location.LocationRetrieveService" />'
		].forEach((service) => {
			services = verifyStanza(services, service);
		});
		document.manifest.application[0].service = services;

		console.log("Adding fine and coarse location permission to AndroidManifest.xml");
		var permissions = document.manifest['uses-permission'];
		[
            '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
            '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />'
		].forEach((permission) => {
			permissions = verifyStanza(permissions, permission);
		});
		document.manifest['uses-permission'] = permissions;

		var output = new xml2js.Builder().buildObject(document);
		fs.writeFileSync(manifestPath, output);
	});    
}

function modifyInfoPlist(mainAppPath) {
	if(!fs.existsSync(mainAppPath) || !fs.lstatSync(mainAppPath).isDirectory()) {
		console.error("Incorrect main app path: " + mainAppPath);
		return;
	}

	const infoPath = path.join(mainAppPath, "Info.plist");
	if(!fs.existsSync(infoPath) || !fs.lstatSync(infoPath).isFile()) {
		console.error("Couldn't locate Info.plist.");
		return;
	}

    var infoPlist = plist.parse(fs.readFileSync(infoPath, 'utf8'));
    if(typeof infoPlist.UIBackgroundModes == "undefined") {
        infoPlist.UIBackgroundModes = [];
    }

	console.log("Adding location to UIBackgroundModes of info.plist");
    var backgroundSet = new Set(infoPlist.UIBackgroundModes);
    backgroundSet.add("location");
    infoPlist.UIBackgroundModes = Array.from(backgroundSet);

	if(typeof infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription == "undefined") {
		console.log("Adding placeholder value for NSLocationAlwaysAndWhenInUseUsageDescription in info.plist");
		infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription = "Show exciting things nearby!";
	}
	
	if(typeof infoPlist.NSLocationAlwaysUsageDescription == "undefined") {
		console.log("Adding placeholder value for NSLocationAlwaysUsageDescription in info.plist");
		infoPlist.NSLocationAlwaysUsageDescription = "Show exciting things nearby!";
	}
	
	if(typeof infoPlist.NSLocationWhenInUseUsageDescription == "undefined"){
		console.log("Adding placeholder value for NSLocationWhenInUseUsageDescription in info.plist");
		infoPlist.NSLocationWhenInUseUsageDescription = "Show exciting things nearby!";
	}

    fs.writeFileSync(infoPath, plist.build(infoPlist), "utf8");
}

function updateiOSConfigFile(mainAppPath) {
	const configName = 'MceConfig.json';
	const configPath = path.join(mainAppPath, configName);
	var config = JSON.parse(fs.readFileSync(configPath));

	console.log("Adding location preferences to iOS MceConfig.json file.");
	config["Please note, the existince of the location key is not required, if it is not present though, iBeacon and Geofence support will be disabled."] = ""
	
	if(typeof(config.location) == "undefined") {
		config.location = {
	        "The location autoInitialize flag can be set to false to delay turning on the location services until desired.": "",
	        "autoInitialize": true,
	        
	        "The sync key is only used to customize the iBeacon and Geofence syncing sevice, it is not required for those features": "",
	        "sync": {
	            "Location Sync radius is in meters, default 100km": "",
	            "syncRadius": 100000,
	            
	            "Specify how long to wait before syncing again on significant location change in seconds, default 5 minutes": "",
	            "syncInterval": 300
        	}
    	};
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function updateAndroidConfigFile(installDirectory) {
	const configName = 'MceConfig.json';
	const configPath = path.join(installDirectory, "android", "app", "src", "main", "assets", configName);
	var config = JSON.parse(fs.readFileSync(configPath));

	console.log("Adding location preferences to Android MceConfig.json file.");
	config["Please note, the existince of the location key is not required, if it is not present though, iBeacon and Geofence support will be disabled."] = "";
	
	if(typeof(config.location) == "undefined") {
		config.location = {
			"The location autoInitialize flag can be set to false to delay turning on the location services until desired.": "",
			"autoInitialize": true,
	
			"The sync key is only used to customize the iBeacon and Geofence syncing service, it is not required for those features": "",
			"sync": {
				"Specify how long to wait before syncing again on significant location change in seconds, default 5 minutes":"",
				"syncInterval": 300,
	
				"Location Sync radius is in meters, default 100km":"",
				"syncRadius": 100000,
	
				"Specify how long to wait before retrieving a new location from the device, default 5 minutes":"",
				"locationResponsiveness": 300,
	
				"Specify the minimum results when looking for locations nearby, default is 1, minimum value is 1":"",
				"minLocationsForSearch": 1,
	
				"Specify the maximum results when looking for locations nearby, default is 20, minimum value is 1":"",
				"maxLocationsForSearch": 20,
	
				"Specify the location providers that will be used to retrieve the device location. 'gps' - gps location. 'network' - wifi + cellular, default is gps + network":"",
				"providerPreferences": ["gps", "network"]
			}
		};
	}
	fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

if(process.env.MCE_RN_NOCONFIG) {
    console.log(chalk.yellow.bold("Acoustic Mobile Push Location Plugin installed, but will not be auto configured because MCE_RN_NOCONFIG environment flag detected."));
    return;
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push Location Plugin"));
const installDirectory = findInstallDirectory();
const mainAppPath = findMainPath(installDirectory);
modifyInfoPlist(mainAppPath);
updateiOSConfigFile(mainAppPath);
updateAndroidConfigFile(installDirectory);
modifyManifest(installDirectory);

console.log(chalk.green("Installation Complete!"));

console.log(chalk.blue.bold("\nPost Installation Steps\n"));
console.log(chalk.blue('Link the plugin with:'));
console.log('react-native link react-native-acoustic-mobile-push-location\n');

console.log(chalk.blue('iOS Support:'));
console.log("Please replace the placeholder location usage descriptions in info.plist in the NSLocationWhenInUseUsageDescription, NSLocationAlwaysUsageDescription and NSLocationAlwaysAndWhenInUseUsageDescription keys.\n");

console.log(chalk.blue('Android Support:'));
console.log("If your app is using React Native v0.60 or later and are using the AndroidX libraries instead of the Android Support libraries. You will need to adjust the imports in **RNAcousticMobilePushLocationModule.java** by removing:\nimport android.support.v4.app.ActivityCompat;\nimport android.support.v4.content.ContextCompat;\n\nand adding:\nimport androidx.core.app.ActivityCompat;\nimport androidx.core.content.ContextCompat;\n\n");