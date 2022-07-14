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

function updateiOSConfigFile(mainAppPath) {
  const configName = 'MceConfig.json';
  const configPath = path.join(mainAppPath, configName);
  var config = JSON.parse(fs.readFileSync(configPath));
  console.log("Adding geofence entries to MceConfig.json");

  if (typeof (config.location) == "undefined") {
    config.location = {};
  }

  config.location["Please note, the existince of the location key will enable geofence location support, if geofence support is not desired, remove the key"] = "";
  config.location.geofence = {
    "choose one of the following values for accuracy: ": ["best", "10m", "100m", "1km", "3km"],
    "accuracy": "3km"
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

if (process.env.MCE_RN_NOCONFIG) {
  console.log(chalk.yellow.bold("Acoustic Mobile Push Geofence Plugin installed, but will not be auto configured because MCE_RN_NOCONFIG environment flag detected."));
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push Geofence Plugin"));
const installDirectory = findInstallDirectory();
const mainAppPath = findMainPath(installDirectory);
updateiOSConfigFile(mainAppPath);
modifyManifest(installDirectory);

console.log(chalk.green("Installation Complete!"));

console.log(chalk.blue.bold("\nPost Installation Steps\n"));
console.log(chalk.blue('For react-native 0.59 and lower link the plugin with:'));
console.log('react-native link react-native-acoustic-mobile-push-geofence\n');
