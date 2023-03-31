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
const plist = require('plist');
const path = require('path');
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
	console.log("Adding placeholder value to info.plist key NSCalendarsUsageDescription");
	if(typeof infoPlist.NSCalendarsUsageDescription == "undefined")
		infoPlist.NSCalendarsUsageDescription = "Adding interesting events to your calendar!";

    fs.writeFileSync(infoPath, plist.build(infoPlist), "utf8");
}

if(process.env.MCE_RN_NOCONFIG) {
    console.log(chalk.yellow.bold("Acoustic Mobile Push Calendar Plugin installed, but will not be auto configured because MCE_RN_NOCONFIG environment flag detected."));
    return;
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push Calendar Plugin"));
const installDirectory = findInstallDirectory();
const mainAppPath = findMainPath(installDirectory);
modifyInfoPlist(mainAppPath);

console.log(chalk.green("Installation Complete!"));
console.log(chalk.blue.bold("\nPost Installation Steps\n"));

console.log(chalk.blue('For react-native 0.59 and lower link the plugin with:'));
console.log("react-native link react-native-acoustic-mobile-push-calendar\n");
console.log(chalk.blue.bold("iOS Support"));
console.log("Please replace the placeholder calendar usage descriptions in info.plist in the NSCalendarsUsageDescription key. This value helps inform your users how you're going to respectfully use the access.\n");
