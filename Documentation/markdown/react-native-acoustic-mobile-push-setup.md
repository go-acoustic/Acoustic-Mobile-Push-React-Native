# Add the React Native plug-in to your app

---
## Overview
To start configuring basic mobile app messaging in React Native projects for iOS and Android apps, create an example app in React Native and then configure and build your Android and iOS apps. After configuring basic mobile app messages, you can configure advanced mobile app messaging features.

> 🚧 Warning: When Acoustic Mobile App Messaging stores data that you send, the data is not encrypted; therefore, it is recommended that you do not transmit sensitive information in the inbox, in-app, and mobile app messages. The data is not encrypted in our databases or log files or when stored on the device. If you must transmit sensitive information, encrypt the data before sending it and decrypt the data in memory on the device.


## Before you begin
* Install React Native command-line tools. For more information, see [React Native environment-setup](https://reactnative.dev/docs/environment-setup).
> 📘 Note: Expo CLI is not supported.


## Create a React Native application
```sh
npx react-native init NewApp --version 0.66.0
```

## Install Acoustic React Native plug-in
> 📘 Note: There are several know issues between npm install versus yarn install. Since yarn is a Facebook tool. It normally has fixes patched for installing dependencies.

1. Copy `react-native-acoustic-mobile-push` folder from the *SampleApp* project.
```sh
cd NewApp
mkdir plugins
cp -r ../ca-mce-react-native/plugins/react-native-acoustic-mobile-push plugins/react-native-acoustic-mobile-push
```

2. Add `react-native-acoustic-mobile-push` to the `package.json` file in your application under dependencies.
```
"dependencies": {
	"react-native-acoustic-mobile-push": "file:plugins/react-native-acoustic-mobile-push",
	//Other dependencies...
},
```

> 📘 Note: If your app is using React Native v.059 and lower link the plugin with: `react-native link react-native-acoustic-mobile-push`

3. Edit `App.js` to include the following two lines after the existing import statements:
```js
import { NativeModules } from 'react-native';
const { RNAcousticMobilePush } = NativeModules;
RNAcousticMobilePush.requestPushPermission();
```
Alternatively, you can import the SDK into the component you need.

4. Then install as normal.
```sh
yarn install
```


## Set up your Android project
> 📘 Note: If your app is using React Native v0.60 or later and are using the *AndroidX* libraries instead of the *Android Support* libraries, set the following command line variable: `export ANDROID_X=1`

> 📘 Note: From React Native v.060 and higher NativeModules are part of react-native. If you are using lower version of RN please use the following code to import RNAcoustic modules: `import { RNAcousticMobilePush } from 'NativeModules';`

1. Copy your `google-services.json` file with your Google provided FCM credentials to your android project folder: `android/app/google-services.json`.
<br></br>
2. Copy the `MceConfig.json` file from the *SampleApp* project to: `android/app/src/main/assets/MceConfig.json` 
```sh
cp ../ca-mce-react-native/SampleApp/android/app/src/main/assets/MceConfig.json android/app/src/main/assets/MceConfig.json
```
3. Edit and fill in the `appKey's` and `baseUrl` provided by your account team.
```json
"baseUrl": "https://mobile-sdk-lib-XX-Y.brilliantcollector.com",
"appKey": {
  "prod": "INSERT APP KEY HERE"
},
```
4. Add the Android SDK to your Gradle project by copying the *Android SDK AAR* file to your *libs* folder. If you do not have a libs folder, create one next to your src folder.
```sh
cp ../ca-mce-react-native/plugins/react-native-acoustic-mobile-push/android/libs/acoustic-mobile-push-android-sdk-3.8.7.aar android/app/libs/acoustic-mobile-push-android-sdk-3.8.7.aar
```
5. You could also require to add following attributes to `manifest`, `application` and `activity` tags in `AndroidManifest.xml`:
```xml
<manifest ... xmlns:tools="http://schemas.android.com/tools">
<application ... tools:replace="android:name">
<activity android:exported="true" ... android:name=".MainActivity">
```
6. Additionally, you should support location services. Add the following line in your `build.gradle` app file:
```groovy
implementation 'com.google.android.gms:play-services-location:<play-services version>'
```


## Set up your iOS project
1. Open the iOS project in Xcode.
2. Fix up the `bundle ID` and `signing` to use a bundle ID and profile with appropriate capabilities.
3. Add the `Push Notification` capability to your project: Go to *Signing & Capabilities*, Click *+Capability* and select *Push Notification*.
4. Turn on the `Location Updates` background mode to your project: Go to *Signing & Capabilities* and check *Location Updates* checkbox.
5. Add the `MceConfig.json` file in the project directory to the xcode project to *Application* target and fill in the `baseUrl` and `appKey's` provided by your account team.
```json
"baseUrl": "https://mobile-sdk-lib-XX-Y.brilliantcollector.com",
"appKey": {
  "prod": "INSERT APP KEY HERE"
},
```

**Optional: Integrating the iOS notification service**

The iOS notification service requires separate provisioning. This plug-in is required if you need to access **push received events, dynamic action categories, and media attachments**.

1. Copy `react-native-ios-notification-service` folder from the *SampleApp* project.
```sh
cp -r ../ca-mce-react-native/plugins/react-native-acoustic-mobile-push-ios-notification-service plugins/react-native-acoustic-mobile-push-ios-notification-service
```

2. Add `react-native-acoustic-mobile-push-ios-notification-service` to the `package.json` file in your application under dependencies.
```
"dependencies": {
	"react-native-acoustic-mobile-push-ios-notification-service": "file:plugins/react-native-acoustic-mobile-push-ios-notification-service",
	//Other dependencies...
},
```
3. Install the new plugin
```sh
yarn install
cd NewApp/ios
pod install
```


*Add a new `Notification Service Extension` target.*

6. In your XCode project, go to the *File* menu and select *New > Target*. A dialog box opens.
7. In the dialog box, select *iOS* at the top and *Notification Service Extension*.
8. Select *Next* button, enter the extension name (`NewAppNotificationService`) and choose *Objective-C* as Language.
9. Select *Finish* button and if a dialog box opens, select *Activate* button. The new target is added to the project.
10. Change the new target bundle identifier prefix and use `.notification`.
11. Verify that the new target has the same iOS version than application target. (SDK minimun supported version is 12.0)

*Add the framework to the notification service target.*

12. Select the new target `General` tab. Add `AcousticMobilePushNotification.xcframework` in *Frameworks and Libraries* section. It should be available in the list (Workspace/Pods). Verify that `Embed and Sign` is selected.
13. Add the `MceConfig.json` file to the Notification Service target. Open the file and check the notification service target membership in the Target Membership of the File Inspector in the Xcode pane.
14. Add `-ObjC` to the *Other Linker Flags* build options for the Notification Service.
15. Add `App Group` capability to both your notification service extension and *Application* target. Be sure to use the same app group as the main application.
16. Add the `Keychain Sharing` capability to both your notification service extension and *Application* target. Be sure to use the same value as the main application.
17. Replace the contents of `NotificationService.m` and `NotificationService.h` with the following code:
```objective-c
//  NotificationService.h
#import <UserNotifications/UserNotifications.h>
#import <AcousticMobilePushNotification/AcousticMobilePushNotification.h>

@interface NotificationService : MCENotificationService

@end
```

```objective-c
//  NotificationService.m
#import "NotificationService.h"

@implementation NotificationService

@end
```


## Test your React Native iOS and Android apps
Build once your environment is set up to install the packages - including sdk plugins.
```sh
cd NewApp
yarn install
```

**Run Android**
```sh
npx react-native run-android
```

**Run iOS**
```sh
cd NewApp/ios
pod install
```
* Open the ```.xcworkspace``` file in Xcode.
* Build to device or simulator.
> 📘 Note: The iOS Simulator is unable to handle push messages.
