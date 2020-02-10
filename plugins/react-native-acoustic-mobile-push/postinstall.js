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
const ncp = require('ncp');
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

		console.log("Adding required receivers to AndroidManifest.xml");
		var receivers = document.manifest.application[0].receiver;
		[
			'<receiver android:name="co.acoustic.mobile.push.sdk.wi.AlarmReceiver" ><intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter><intent-filter><action android:name="android.intent.action.TIMEZONE_CHANGED" /></intent-filter><intent-filter><action android:name="android.intent.action.PACKAGE_REPLACED" /><data android:scheme="package" /></intent-filter><intent-filter><action android:name="android.intent.action.LOCALE_CHANGED" /></intent-filter></receiver>',
			'<receiver android:name="co.acoustic.mobile.push.RNAcousticMobilePushBroadcastReceiver"><intent-filter><action android:name="co.acoustic.mobile.push.sdk.NOTIFIER" /></intent-filter></receiver>',
			'<receiver android:name="co.acoustic.mobile.push.sdk.notification.NotifActionReceiver" />'
		].forEach((receiver) => {
			receivers = verifyStanza(receivers, receiver);
		});
		document.manifest.application[0].receiver = receivers;

		console.log("Adding required providers to AndroidManifest.xml");
		var providers = document.manifest.application[0].provider;
		var provider = '<provider android:name="co.acoustic.mobile.push.sdk.db.Provider" android:authorities="${applicationId}.MCE_PROVIDER" android:exported="false" />';
		document.manifest.application[0].provider = verifyStanza(providers, provider);

		console.log("Adding required services to AndroidManifest.xml");
		var services = document.manifest.application[0].service;
		[
			'<service android:name="co.acoustic.mobile.push.sdk.session.SessionTrackingIntentService"/>',
			'<service android:name="co.acoustic.mobile.push.sdk.events.EventsAlarmListener" />',
			'<service android:name="co.acoustic.mobile.push.sdk.registration.PhoneHomeIntentService" />',
			'<service android:name="co.acoustic.mobile.push.sdk.registration.RegistrationIntentService" />',
			'<service android:name="co.acoustic.mobile.push.sdk.attributes.AttributesQueueConsumer" />',
			'<service android:name="co.acoustic.mobile.push.sdk.job.MceJobService" android:permission="android.permission.BIND_JOB_SERVICE"/>',
			'<service android:name="co.acoustic.mobile.push.sdk.messaging.fcm.FcmMessagingService"><intent-filter><action android:name="com.google.firebase.MESSAGING_EVENT"/></intent-filter></service>'
		].forEach((service) => {
			services = verifyStanza(services, service);
		});
		document.manifest.application[0].service = services;

		console.log("Adding internet, wake lock, boot, vibrate and call_phone permisssions to AndroidManifest.xml");
		var permissions = document.manifest['uses-permission'];
		[
			'<uses-permission android:name="android.permission.INTERNET"/>',
			'<uses-permission android:name="android.permission.WAKE_LOCK"/>',
			'<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>',
			'<uses-permission android:name="android.permission.VIBRATE"/>',
			'<uses-permission android:name="android.permission.CALL_PHONE"/>'
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

    var backgroundSet = new Set(infoPlist.UIBackgroundModes);
	console.log("Adding remote-notification and fetch to UIBackgroundModes of info.plist");
    backgroundSet.add("remote-notification");
    backgroundSet.add("fetch");
    infoPlist.UIBackgroundModes = Array.from(backgroundSet);

    fs.writeFileSync(infoPath, plist.build(infoPlist), "utf8");
}

function findMainPath(installDirectory) {
	if(!fs.existsSync(installDirectory)) {
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

function replaceMain(mainAppPath) {
	if(!fs.existsSync(mainAppPath) || !fs.lstatSync(mainAppPath).isDirectory()) {
		console.error(chalk.red("Incorrect main app path: " + mainAppPath));
		return;
	}

	const mainPath = path.join(mainAppPath, "main.m");
	if(!fs.existsSync(mainPath) || !fs.lstatSync(mainPath).isFile()) {
		console.error(chalk.red("Couldn't locate main.m."));
		return;
	}

	const backupMainPath = mainPath + "-backup";
	if(!fs.existsSync(backupMainPath)) {
		console.log("Backing up main.m as main.m-backup");
		fs.renameSync(mainPath, backupMainPath);

		console.log("Replacing main.m with SDK provided code");
		fs.copyFileSync( path.join("postinstall", "ios", "main.m"), mainPath);
	}
}

function addAndroidConfigFile(installDirectory) {
	const configName = 'MceConfig.json';
	const destinationDirectory = path.join(installDirectory, "android", "app", "src", "main", "assets");
	const configPath = path.join(destinationDirectory, configName);

	if(!fs.existsSync(destinationDirectory)) {
		console.log('Creating asset path');
		fs.mkdirSync(destinationDirectory, { recursive: true });
	}

	if(!fs.existsSync(configPath)) {
		console.log('Copying MceConfig.json file into Android project');
		ncp.ncp( path.join('postinstall', 'android', configName), configPath);
	}
}

function stringExists(name, strings) {
	for(var i=0; i<strings.resources.string.length; i++) {
		if(strings.resources.string[i]['$'].name == name) {
			return true;
		}
	}
	return false;
}

function verifyString(name, strings) {
	if(!stringExists(name, strings)) {	
		new xml2js.Parser().parseString('<string name="' + name + '">REPLACE THIS PLACEHOLDER</string>', function (err, string) { 
			strings.resources.string.push( string.string );
		});
	}
	return strings;
}

function modifyStrings(installDirectory) {
    if(process.env.MCE_RN_NOSTRINGS) {
        console.log(chalk.yellow.bold("Android strings.xml will not be modified because MCE_RN_NOSTRINGS environment flag detected."));
        return;
    }
    
	let stringsPath = path.join(installDirectory, "android", "app", "src", "main", "res", "values", "strings.xml");

	console.log("Modifying strings.xml in Android project");
	new xml2js.Parser().parseString(fs.readFileSync(stringsPath), function (err, strings) {
		["google_api_key", "google_app_id"].forEach((name) => {
			verifyString(name, strings);
		});
		var output = new xml2js.Builder().buildObject(strings);
		fs.writeFileSync(stringsPath, output);
	});
}

function addiOSConfigFile(mainAppPath) {
	const configName = 'MceConfig.json';
	const configPath = path.join(mainAppPath, configName);
	if(!fs.existsSync(configPath)) {
		console.log("Copying MceConfig.json file into iOS project - " + configPath);
		ncp.ncp( path.join('postinstall', 'ios', configName), configPath);
	} else {
		console.log("MceConfig.json already exists at " + configPath);
	}
}

if(process.env.MCE_RN_NOCONFIG) {
    console.log(chalk.yellow.bold("Acoustic Mobile Push SDK installed, but will not be auto configured because MCE_RN_NOCONFIG environment flag detected."));
    return;
}

console.log(chalk.green.bold("Setting up Acoustic Mobile Push SDK"));
const installDirectory = findInstallDirectory();
const mainAppPath = findMainPath(installDirectory);
replaceMain(mainAppPath);
modifyInfoPlist(mainAppPath);
addiOSConfigFile(mainAppPath);
addAndroidConfigFile(installDirectory);
modifyManifest(installDirectory);
modifyStrings(installDirectory);

console.log(chalk.green("Installation Complete!"));

console.log(chalk.blue.bold("\nPost Installation Steps\n"));
console.log(chalk.blue('Link the plugin with:'));
console.log('react-native link react-native-acoustic-mobile-push\n');

console.log(chalk.blue('iOS Support:'));
console.log("1. Open the iOS project in Xcode.");
console.log("2. In the `Capabilities` tab of the main app target, enable push notifications by turning the switch to the on position");
console.log("3. Drag and drop `react-native-acoustic-mobile-push/AcousticMobilePush.framework` from the Finder into the target's `General` tab, under `Linked Frameworks and Libraries`. Verify that 'embed and sign' is selected.");
console.log("4. Drag and drop `react-native-acoustic-mobile-push` folder from the Finder into the `Framework Search Paths` setting in the `Build Setting` tab of the new target.");
console.log("5. Then add a new `Notification Service Extension` target");
console.log("6. Drag and drop `react-native-acoustic-mobile-push/Notification Service/AcousticMobilePushNotification.framework` from the Finder into the new target's `General` tab, under `Linked Frameworks and Libraries`.");
console.log("7. Drag and drop `react-native-acoustic-mobile-push/Notification Service` folder from the Finder into the `Framework Search Paths` setting in the `Build Setting` tab of the new target.");
console.log("8. Replace the contents of `NotificationService.m` and `NotificationService.h` with the ones provided in the `react-native-acoustic-mobile-push Notification Service` folder");
console.log("9. Add the `MceConfig.json` file in the project directory to the xcode project to **Application** AND **Notification Service** targets");
console.log("10. Adjust the `baseUrl` and `appKey`s provided by your account team");

console.log(chalk.blue('Android Support:'));
console.log("1. Open the Android project in Android Studio.");
console.log("2. Replace the `google_api_key` and `google_app_id` placeholder values in `android/app/src/main/res/values/strings.xml` with your Google provided FCM credentials");
console.log("3. Then edit the MceConfig.json file in the project and fill in the appKeys and baseUrl provided by your account team.\n");
