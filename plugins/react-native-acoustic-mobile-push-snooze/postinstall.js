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

		console.log("Adding required service to Android Manifest");
		var services = document.manifest.application[0].service;		
		var service = '<service android:name="co.acoustic.mobile.push.plugin.snooze.SnoozeIntentService" />';
		document.manifest.application[0].service = verifyStanza(services, service);

		var output = new xml2js.Builder().buildObject(document);
		fs.writeFileSync(manifestPath, output);
	});
}

if(process.env.MCE_RN_NOCONFIG) {
    console.log(chalk.yellow.bold("Acoustic Mobile Push Snooze Plugin installed, but will not be auto configured because MCE_RN_NOCONFIG environment flag detected."));
    return;
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push Snooze Plugin"));
const installDirectory = findInstallDirectory();
modifyManifest(installDirectory);
console.log(chalk.green("Installation Complete!"));
console.log(chalk.blue.bold("\nPost Installation Steps\n"));

console.log(chalk.blue('Link the plugin with:'));
console.log('react-native link react-native-acoustic-mobile-push-snooze\n');
