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

		var services = document.manifest.application[0].service;
		var service = '<service android:name="co.acoustic.mobile.push.sdk.plugin.inbox.InboxUpdateService" />';
		document.manifest.application[0].service = verifyStanza(services, service);

		var output = new xml2js.Builder().buildObject(document);
		fs.writeFileSync(manifestPath, output);
	});
}

if(process.env.MCE_RN_NOCONFIG) {
    console.log(chalk.yellow.bold("Acoustic Mobile Push InApp Plugin installed, but will not be auto configured because MCE_RN_NOCONFIG environment flag detected."));
    return;
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push InApp Plugin"));
// Holds the install lock of react-native-acoustic-mobile-push-beta/install-lock.js (a peer dependency of this plugin),
// so the plugins' postinstall scripts configure the app one at a time. Without it (an older push plugin, or a package
// manager that skips peer dependencies) this script configures the app without waiting for the others.
function holdInstallLock(installDirectory) {
	try {
		require('react-native-acoustic-mobile-push-beta/install-lock').holdInstallLock(installDirectory);
	} catch (error) {
		if (error.code !== 'MODULE_NOT_FOUND') {
			throw error;
		}
		console.log(chalk.yellow("react-native-acoustic-mobile-push-beta/install-lock not found; configuring without the install lock."));
	}
}

const installDirectory = findInstallDirectory();
holdInstallLock(installDirectory);
modifyManifest(installDirectory);

console.log(chalk.green("Installation Complete!"));

console.log(chalk.blue.bold("\nPost Installation Steps\n"));

console.log(chalk.blue('Application Support:'));
console.log('Template files in this plugins javascript directory will need to be integrated into your application and the templates will need to be imported so they can register with the SDK at startup like this:');
console.log("import {InAppBanner} from './in-app/in-app-banner';");
console.log("import {inAppMedia} from './in-app/in-app-media';");
console.log("\nYou should also add appropriate places in the app that display messages. See executeInApp documenation for details.\n");
