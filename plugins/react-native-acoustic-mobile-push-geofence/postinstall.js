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

    console.log("Adding required receiver to Android Manifest");
    var receivers = document.manifest.application[0].receiver;
    var receiver = '<receiver android:name="co.acoustic.mobile.push.sdk.location.GeofenceBroadcastReceiver" android:enabled="true" android:exported="true" />';

    document.manifest.application[0].receiver = verifyStanza(receivers, receiver);

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
    "choose one of the following values for accuracy: ": ["best", "10m", "100m", "1km", "3km"],
    "accuracy": "3km"	};

	var config = JSON.parse(fs.readFileSync(campaignConfigPath));
  console.log("Adding geofence preferences to iOS CampaignConfig.json file.");

	if(typeof(config.iOS.location) == "undefined") {
    config.iOS.location = {};
  }

  config.iOS.location["Please note, the existince of the location key will enable geofence location support, if geofence support is not desired, remove the key"] = "";
  config.iOS.location.geofence = configTemplate;

  fs.writeFileSync(campaignConfigPath, JSON.stringify(config, null, 2));

  console.log("Adding geofence preferences to Android MceConfig.json file.");
  var appConfig = JSON.parse(fs.readFileSync(appConfigPath));

  if(typeof(appConfig.location) == "undefined") {
    appConfig.location = {};
  }

  appConfig.location.geofence = configTemplate;
  fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
}

if (process.env.MCE_RN_NOCONFIG) {
  console.log(chalk.yellow.bold("Acoustic Mobile Push Geofence Plugin installed, but will not be auto configured because MCE_RN_NOCONFIG environment flag detected."));
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push Geofence Plugin"));
const projectPath = process.cwd();
const installDirectory = findInstallDirectory();
const mainAppPath = findMainPath(installDirectory);
updateiOSConfigFile(projectPath, mainAppPath);
modifyManifest(installDirectory);

console.log(chalk.green("Installation Complete!"));