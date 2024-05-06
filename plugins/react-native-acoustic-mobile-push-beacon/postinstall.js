/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
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
  if (process.env.MCE_RN_DIRECTORY) {
    console.log(chalk.yellow.bold("Using MCE_RN_DIRECTORY override instead of finding the application source directory."))
    return process.env.MCE_RN_DIRECTORY;
  }

  // Mac
  var currentDirectory = process.argv[process.argv.length - 1];
  if (currentDirectory != "$INIT_CWD") {
    return currentDirectory;
  }

  // Windows
  currentDirectory = process.cwd();
  while (!fs.existsSync(path.join(currentDirectory, "app.json"))) {
    var parentDirectory = path.dirname(currentDirectory);
    console.log("cwd: ", currentDirectory, ", parent: ", parentDirectory);
    if (parentDirectory == currentDirectory) {
      console.error(chalk.red("Could not find installation directory!"));
      return;
    }
    currentDirectory = parentDirectory;
  }
  console.log("Install Directory Found:", currentDirectory);

  return currentDirectory;
}

function findMainPath(installDirectory) {
  if (!fs.existsSync(installDirectory) || !fs.lstatSync(installDirectory).isDirectory()) {
    console.error("Couldn't locate install directory.");
    return;
  }

  const iosDirectory = path.join(installDirectory, 'ios');
  var directory;
  fs.readdirSync(iosDirectory).forEach((basename) => {
    const mainPath = path.join(iosDirectory, basename);
    if (fs.lstatSync(mainPath).isDirectory()) {
      const filename = path.join(mainPath, "main.m");
      if (fs.existsSync(filename)) {
        directory = mainPath;
      }
    }
  });
  return directory;
}

function containsStanza(array, stanza, type) {
  for (var i = 0; i < array.length; i++) {
    if (array[i]['$']['android:name'] == stanza[type]['$']['android:name']) {
      return true
    }
  }
  return false;
}

function verifyStanza(array, stanzaString) {
  if (typeof array == "undefined") {
    array = [];
  }
  new xml2js.Parser().parseString(stanzaString, function (err, stanza) {
    const types = Object.getOwnPropertyNames(stanza);
    const type = types[0];
    if (!containsStanza(array, stanza, type)) {
      console.log("Adding required " + type + " stanza to AndroidManifest.xml");
      array.push(stanza[type])
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
      '<service android:name="co.acoustic.mobile.push.sdk.beacons.MceBluetoothScanner" />',
      '<service android:name="co.acoustic.mobile.push.sdk.beacons.BeaconsVerifier" />'
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

function updateiOSConfigFile(projectPath, mainAppPath) {
  const campaignConfigName = 'CampaignConfig.json';
	const appConfigName = 'MceConfig.json';
	let campaignConfigPath = path.join(projectPath, campaignConfigName);
	const appConfigPath = path.join(mainAppPath, appConfigName);

	// Handles both plugin install, and manual script execution
	if (!fs.existsSync(campaignConfigPath)) {
		const tempPath = path.join(projectPath, "../../", campaignConfigName);
		if (fs.existsSync(tempPath)) {
			campaignConfigPath = tempPath;
		} else {
			console.error(chalk.red("Could not find CampaignConfig.json.  Install required react-native-acoustic-mobile-push plugin."));
			return;
		}
	}

	let configTemplate = {
		    "UUID": "SET YOUR IBEACON UUID HERE"
	};

	var config = JSON.parse(fs.readFileSync(campaignConfigPath));
  console.log("Adding beacon preferences to iOS CampaignConfig.json file.");

	if(typeof(config.iOS.location) == "undefined") {
    config.iOS.location = {};
  }
  
  config.iOS.location["Please note, the existince of the ibeacon key will enable iBeacon support, if iBeacon support is not desired, remove the key"] = "";
  config.iOS.location.ibeacon = configTemplate;

  fs.writeFileSync(campaignConfigPath, JSON.stringify(config, null, 2));

  console.log("Adding beacon preferences to Android MceConfig.json file.");
  var appConfig = JSON.parse(fs.readFileSync(appConfigPath));

  if(typeof(appConfig.location) == "undefined") {
    appConfig.location = {};
  }

  appConfig.location.ibeacon = configTemplate;
  fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
}

function updateAndroidConfigFile(projectPath, installDirectory) {
	const campaignConfigName = 'CampaignConfig.json';
	const appConfigName = 'MceConfig.json';
	let campaignConfigPath = path.join(projectPath, campaignConfigName);
	const appConfigPath = path.join(installDirectory, "android", "app", "src", "main", "assets", appConfigName);

	// Handles both plugin install, and manual script execution
	if (!fs.existsSync(campaignConfigPath)) {
		const tempPath = path.join(projectPath, "../../", campaignConfigName);
		if (fs.existsSync(tempPath)) {
			campaignConfigPath = tempPath;
		} else {
			console.error(chalk.red("Could not find CampaignConfig.json.  Install required react-native-acoustic-mobile-push plugin."));
			return;
		}
	}
  
	let configTemplate = {
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

	var config = JSON.parse(fs.readFileSync(campaignConfigPath));
  console.log("Adding beacon preferences to Android CampaignConfig.json file.");

	if(typeof(config.android.location) == "undefined") {
    config.android.location = {};
  }
  
  config.android.location["Please note, unlike iOS, the existence of the ibeacon key does not enable iBeacon support, iBeacon support is enabled only if iBeacons are nearby"] = "";
  config.android.location.ibeacon = configTemplate;
  fs.writeFileSync(campaignConfigPath, JSON.stringify(config, null, 2));

  console.log("Adding beacon preferences to Android MceConfig.json file.");
  var appConfig = JSON.parse(fs.readFileSync(appConfigPath));

  if(typeof(appConfig.location) == "undefined") {
    appConfig.location = {};
  }

  appConfig.location.ibeacon = configTemplate;
  fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
}

if (process.env.MCE_RN_NOCONFIG) {
  console.log(chalk.yellow.bold("Acoustic Mobile Push Beacon Plugin installed, but will not be auto configured because MCE_RN_NOCONFIG environment flag detected."));
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push Beacon Plugin"));
const projectPath = process.cwd();
const installDirectory = findInstallDirectory();
const mainAppPath = findMainPath(installDirectory);
updateiOSConfigFile(projectPath, mainAppPath);
updateAndroidConfigFile(projectPath, installDirectory);
modifyManifest(installDirectory);

console.log(chalk.green("Installation Complete!"));

console.log(chalk.blue.bold("\nPost Installation Steps\n"));
console.log("Please set the UUID used by your beacons in the CampaignConfig.json file for both Android and iOS. Without this information the devices will not be able to locate the beacons.\n");

