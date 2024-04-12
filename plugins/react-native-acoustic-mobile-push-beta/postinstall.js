/*
 * Copyright © 2019, 2024 Acoustic, L.P. All rights reserved.
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
const { execSync } = require('child_process');

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

		console.log("Adding required xmlns:tools schemas, tools:replace attributes to AndroidManifest.xml");

		// Add xmlns:tools attribute to manifest if not exists
		if (!document.manifest.$['xmlns:tools']) {
			document.manifest.$['xmlns:tools'] = "http://schemas.android.com/tools";
		}

		// Add tools:replace="android:name" to application if not exists
		if (!document.manifest.application[0].$['tools:replace']) {
			document.manifest.application[0].$['tools:replace'] = "android:name";
		}

		console.log("Adding required receivers to AndroidManifest.xml");
		var receivers = document.manifest.application[0].receiver;
		[
			'<receiver android:name="co.acoustic.mobile.push.sdk.wi.AlarmReceiver" tools:replace="android:exported" android:exported="true"><intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter><intent-filter><action android:name="android.intent.action.TIMEZONE_CHANGED" /></intent-filter><intent-filter><action android:name="android.intent.action.PACKAGE_REPLACED" /><data android:scheme="package" /></intent-filter><intent-filter><action android:name="android.intent.action.LOCALE_CHANGED" /></intent-filter></receiver>',
			'<receiver android:name="co.acoustic.mobile.push.RNAcousticMobilePushBroadcastReceiver" android:exported="true"><intent-filter><action android:name="co.acoustic.mobile.push.sdk.NOTIFIER" /></intent-filter></receiver>',
			'<receiver android:name="co.acoustic.mobile.push.sdk.notification.NotifActionReceiver" />',
			'<receiver android:name="co.acoustic.mobile.push.sdk.location.LocationBroadcastReceiver"/>'

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
		// TODO: it seems that both strings cannot be added to strings.xml as build will
		// fail with information about duplicated entries
		return;

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

/**
 * Copies the CampaignConfig.json file from the plugin directory to the project directory
 * if it does not exist. It then reads this configuration file to apply specific configurations
 * for iOS and Android.
 */
function addOrReplaceMobilePushConfigFile() {
	const configName = 'CampaignConfig.json';
	const currentAppWorkingDirectory = process.cwd();
	const pluginPath = path.resolve(__dirname, '');
	const configPath = path.join(pluginPath, configName);
	const appConfigPath = path.join(currentAppWorkingDirectory, configName);
	console.log("Add or Replace CampaignConfig.json file into the App - " + configPath);

	if(!fs.existsSync(appConfigPath)) {
		console.log("Copying CampaignConfig.json file into project - " + configPath);
		fs.copyFileSync(configPath, configName);
	} else {
		console.log("CampaignConfig.json already exists at " + currentAppWorkingDirectory + "/" + configName);
	}

	// Read and save cooresponding ios/android json sections to postinstall folders, in the plugin project
	readAndSaveMceConfig(pluginPath, appConfigPath);
}

/**
 * Reads the provided mobile push configuration file, extracts platform-specific configurations,
 * and saves these configurations to respective directories. Optionally updates Android's build.gradle.
 * 
 * @param {string} pluginPath - The path to the plugin directory.
 * @param {string} campaignConfigFilePath - The path to the CampaignConfig.json file.
 */
function readAndSaveMceConfig(pluginPath, campaignConfigFilePath) {
	try {
	  // Read the file synchronously
	  const fileData = fs.readFileSync(campaignConfigFilePath, 'utf8');
  
	  const jsonData = JSON.parse(fileData);
  
	  if (jsonData.android && jsonData.iOS) {
		if (jsonData.android) {
		  const androidConfig = JSON.stringify(jsonData.android, null, 2);
		  const androidDestinationPath = path.join(pluginPath, 'postinstall/android/MceConfig.json');
  
		  saveConfig(androidConfig, androidDestinationPath);
		  
		  updateAndroidBuildGradle(jsonData.useRelease);

		  const gradlePropertiesPath = path.join(campaignConfigFilePath, '../android/gradle.properties');
		  updateCampaignSDKVersionInProperties(gradlePropertiesPath, jsonData.androidVersion);
		}
  
		if (jsonData.iOS) {
		  const iosConfig = JSON.stringify(jsonData.iOS, null, 2);
		  const iosDestinationPath = path.join(pluginPath, 'postinstall/ios/MceConfig.json');
  
		  saveConfig(iosConfig, iosDestinationPath);
		}
	  } else {
		console.error('No "android/ios" object found in the JSON file.');
	  }

	  managePlugins(jsonData);
	} catch (error) {
	  if (error.code === 'ENOENT') { // Handle "file not found" error specifically
		console.error(`File not found: ${campaignConfigFilePath}`);
	  } else {
		console.error('Error reading or parsing JSON file:', error);
	  }
	}
  }
  
/**
 * Saves the specified configuration data to a given destination path.
 * 
 * @param {string} configData - The configuration data to be saved.
 * @param {string} destinationPath - The file path where the configuration data should be saved.
 */
function saveConfig(configData, destinationPath) {
	try {
		fs.writeFileSync(destinationPath, configData, { flag: 'w' });
		console.log(`${destinationPath} saved successfully!`);
	} catch (error) {
		console.error(`Error saving ${destinationPath}:`, error);
	}
}

/**
 * Checks if the specified plugin is installed by looking into the project's package.json.
 * 
 * @param {string} pluginName - The name of the plugin to check.
 * @returns {boolean} True if the plugin is installed, false otherwise.
 */
function isPluginInstalled(pluginName) {
	const packageJsonPath = 'package.json';

	const packageJsonData = fs.readFileSync(packageJsonPath, 'utf8');
	const packageJson = JSON.parse(packageJsonData);
	return packageJson.dependencies && packageJson.dependencies[pluginName] ||
		packageJson.devDependencies && packageJson.devDependencies[pluginName];
}

/**
 * Manages the installation or removal of plugins based on the specified configuration object.
 * The choice of package manager (npm or yarn) is determined by the presence of their respective lock files.
 * 
 * @param {Object} config - An object containing the configuration for plugins.
 */
function managePlugins(config) {
	// Determine the package manager by checking for lock files
	const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
	const hasNpmLock = fs.existsSync(path.join(process.cwd(), 'package-lock.json'));
	const packageManager = hasYarnLock ? 'yarn' : (hasNpmLock ? 'npm' : null);

	if (!packageManager) {
		console.error('No lock file found. Please ensure you are in the correct directory and try again.');
		return;
	}

	Object.entries(config.plugins).forEach(([plugin, isEnabled]) => {
		if (plugin.includes("plugins")) return;

		const installed = isPluginInstalled(plugin);

		try {
			if (isEnabled && !installed) {
				console.log(`Adding ${plugin}...`);
				if (packageManager === 'yarn') {
					execSync(`yarn add ${plugin}`, { stdio: 'inherit', cwd: process.cwd() });
				} else {
					execSync(`npm install ${plugin}`, { stdio: 'inherit', cwd: process.cwd() });
				}
			} else if (!isEnabled && installed) {
				console.log(`Removing ${plugin}...`);
				if (packageManager === 'yarn') {
					execSync(`yarn remove ${plugin}`, { stdio: 'inherit', cwd: process.cwd() });
				} else {
					execSync(`npm uninstall ${plugin}`, { stdio: 'inherit', cwd: process.cwd() });
				}
			}
		} catch (error) {
			console.error(`Failed to manage plugin ${plugin}:`, error);
		}
	});
}

/**
 * Updates build.gradle file for Android project to remove Maven URL if useRelease is true and it exists.
 * Adds Maven URL if useRelease is true and it doesn't already exist.
 * Logs a message indicating whether changes were made or not.
 *
 * 
 * @param {Object} useRelease - True/False for release version of SDK.
 */
function updateAndroidBuildGradle(useRelease) {
	const buildGradlePath = path.join(process.cwd(), "android", "build.gradle");

	try {
		let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
		const mavenUrlRegex = /maven\s*{\s*url\s*"https:\/\/s01\.oss\.sonatype\.org\/content\/groups\/staging"\s*}/;

		if (useRelease && mavenUrlRegex.test(buildGradleContent)) {
			// Remove Maven URL if useRelease is true and it exists
			buildGradleContent = buildGradleContent.replace(mavenUrlRegex, '');
			fs.writeFileSync(buildGradlePath, buildGradleContent, 'utf8');
			console.log('Maven URL removed from build.gradle');
		} else if (!useRelease && !mavenUrlRegex.test(buildGradleContent)) {
			// Add Maven URL if useRelease is true and it doesn't already exist
			const repositoriesIndex = buildGradleContent.lastIndexOf('repositories {');
			const closingBracketIndex = buildGradleContent.indexOf('}', repositoriesIndex);
			const mavenUrlString = '    maven { url "https://s01.oss.sonatype.org/content/groups/staging" }\n';
			buildGradleContent = buildGradleContent.slice(0, closingBracketIndex) + mavenUrlString + buildGradleContent.slice(closingBracketIndex);
			fs.writeFileSync(buildGradlePath, buildGradleContent, 'utf8');
			console.log('Maven URL added to build.gradle');
		} else {
			console.log('No changes needed in build.gradle');
		}
	} catch (error) {
		console.error('Error updating build.gradle:', error);
	}
}

/**
 * Updates or inserts the 'campaignSDKVersion' property in the gradle.properties file.
 * @param {string} propertiesFilePath - The path to the gradle.properties file.
 * @param {string} version - The version value to set for 'campaignSDKVersion'.
 */
function updateCampaignSDKVersionInProperties(propertiesFilePath, version) {
	fs.readFile(propertiesFilePath, { encoding: 'utf-8' }, (err, data) => {
	  if (err) {
		console.error('Error reading gradle.properties:', err);
		return;
	  }
  
	  const propName = 'campaignSDKVersion';
	  const versionPattern = /^\d+\.\d+\.\d+$/; // Pattern to match x.x.x version format
	  const propRegex = new RegExp(`(^${propName}=).*`, 'm');
	  let updatedData;
  	  // Determine the value to set for campaignSDKVersion
  	  let versionValue = (version === '+' || version.match(versionPattern)) ? version : '+';

	  // Check if 'campaignSDKVersion' exists and update or insert it
	  if (data.match(propRegex)) {
		// Replace the existing value
		console.log('Version value invalid, default to use latest build.');
		updatedData = data.replace(propRegex, `$1${versionValue}`);
	  } else {
		// Insert the new property
		updatedData = data.trim() + `\n${propName}=${versionValue}\n`;
	  }
  
	  // Write the updated content back to the gradle.properties file
	  fs.writeFile(propertiesFilePath, updatedData, (err) => {
		if (err) {
		  console.error('Error writing gradle.properties:', err);
		  return;
		}
		console.log('gradle.properties has been updated successfully.');
	  });
	});
  }


console.log(chalk.green.bold("Setting up Acoustic Campaign SDK"));
const installDirectory = findInstallDirectory();
addOrReplaceMobilePushConfigFile();
const mainAppPath = findMainPath(installDirectory);
replaceMain(mainAppPath);
modifyInfoPlist(mainAppPath);
addiOSConfigFile(mainAppPath);
addAndroidConfigFile(installDirectory);
modifyManifest(installDirectory);
modifyStrings(installDirectory);

console.log(chalk.green("Installation Complete!"));

console.log(chalk.blue.bold("\nPost Installation Steps\n"));

console.log(chalk.blue('iOS Support:'));
console.log("1. Open the iOS project in Xcode.");
console.log("2. In the `Capabilities` tab of the main app target, enable push notifications by turning the switch to the on position");
console.log("3. Then add a new `Notification Service Extension` target");
console.log("4. Replace the contents of `NotificationService.m` and `NotificationService.h` with the ones provided in the `react-native-acoustic-mobile-push Notification Service` folder");
console.log("5. Add the `MceConfig.json` file in the project directory to the xcode project to **Application** AND **Notification Service** targets");
console.log("6. Adjust the `baseUrl` and `appKey`s provided by your account team");