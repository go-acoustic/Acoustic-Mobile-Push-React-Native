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
const path = require('path');
const xml2js = require('xml2js');
const chalk = require('chalk');

function findInstallDirectory() {
	// Mac
	var currentDirectory = process.env.INIT_CWD;
	if(typeof(currentDirectory) != "undefined") {
		return currentDirectory;
	}

	// Windows
	currentDirectory = process.cwd();
	while(!fs.existsSync(path.join(currentDirectory, "App.js"))) {		
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
		
		console.log("Adding required services to Android Manifest");
		var services = document.manifest.application[0].service;
		[
			'<service android:name="com.ibm.mce.sdk.beacons.MceBluetoothScanner" />',
            '<service android:name="com.ibm.mce.sdk.beacons.BeaconsVerifier" />'
		].forEach((service) => {
			services = verifyStanza(services, service);
		});
		document.manifest.application[0].service = services;

		console.log("Adding required permissions to Android Manifest");
		var permissions = document.manifest['uses-permission'];
		[
	        '<uses-permission android:name="android.permission.BLUETOOTH" />',
    	    '<uses-permission  android:name="android.permission.BLUETOOTH_ADMIN" />'
		].forEach((permission) => {
			permissions = verifyStanza(permissions, permission);
		});
		document.manifest['uses-permission'] = permissions;

		var output = new xml2js.Builder().buildObject(document);
		fs.writeFileSync(manifestPath, output);
	});    
}

function updateiOSConfigFile(mainAppPath) {
	const configName = 'MceConfig.json';
	const configPath = path.join(mainAppPath, configName);
	var config = JSON.parse(fs.readFileSync(configPath));

	if(typeof(config.location) == "undefined") {
		config.location = {};
	}

	console.log("Adding required beacon configuration to iOS MceConfig.json");
    config.location["Please note, the existince of the ibeacon key will enable iBeacon support, if iBeacon support is not desired, remove the key"] = "";
    config.location.ibeacon = {
		"UUID": "SET YOUR IBEACON UUID HERE"
	};

	fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function updateAndroidConfigFile(installDirectory) {
	const configName = 'MceConfig.json';
	const configPath = path.join(installDirectory, "android", "app", "src", "main", "assets", configName);
	var config = JSON.parse(fs.readFileSync(configPath));

	if(typeof(config.location) == "undefined") {
		config.location = {};
	}

	console.log("Adding required beacon configuration to Android MceConfig.json");
    config.location["Please note, unlike iOS, the existence of the ibeacon key does not enable iBeacon support, iBeacon support is enabled only if iBeacons are nearby"] = "";
    config.location.ibeacon = {
      "Please note: if this is not set, iBeacon events will not be sent": "This value should never be empty. Leave the default value if you don't want to use iBeacons",
      "uuid": "YOUR-IBEACONS-UUID",

      "Specify how much time the sdk will scan for iBeacons in every scan session while the application is in the foreground, default is 5 seconds": "",
      "beaconForegroundScanDuration": 5,

      "Specify how much time the sdk will wait between iBeacons scan sessions while the application is in the foreground, default is 30 seconds": "",
      "beaconForegroundScanInterval": 30,

      "Specify how much time the sdk will scan for iBeacons in every scan session while the application is in the background, default is 30 seconds": "",
      "beaconBackgroundScanDuration": 30,

      "Specify how much time the sdk will wait between iBeacons scan sessions while the application is in the background, default is 5 minutes": "",
      "beaconBackgroundScanInterval": 300
    };

	fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push Beacon Plugin"));
const installDirectory = findInstallDirectory();
const mainAppPath = findMainPath(installDirectory);
updateiOSConfigFile(mainAppPath);
updateAndroidConfigFile(installDirectory);
modifyManifest(installDirectory);

console.log(chalk.green("Installation Complete!"));

console.log(chalk.blue.bold("\nPost Installation Steps\n"));
console.log(chalk.blue('Link the plugin with:'));
console.log('react-native link react-native-acoustic-mobile-push-beacon\n');
console.log("Please set the UUID used by your beacons in the MceConfig.json file for both Android and iOS. Without this information the devices will not be able to locate the beacons.\n");

