# react-native-acoustic-mobile-push
Main Campaign plugin required for mobile push features.

### Plugin Dependencies
None
----

[Overview](https://developer.goacoustic.com/acoustic-campaign/docs/add-the-react-native-plug-in-to-your-app#overview)
---

## Install

1. Add `react-native-acoustic-mobile-push` to the project.

```shell yarn
yarn add react-native-acoustic-mobile-push
```

```shell npm
npm i react-native-acoustic-mobile-push
```

2. Edit `App.js` to include the following two lines after the existing import statements:

```javascript
import { NativeModules } from 'react-native';
const { RNAcousticMobilePush } = NativeModules;
RNAcousticMobilePush.requestPushPermission();
```

Alternatively, you can import the SDK into the component you need.

## Update CampaignConfig.json

After the plugin is installed, 'CampaignConfig.json' file will be created if not found.  Example screenshot of the file and the json properties:

![](https://files.readme.io/53a3b4b-image.png)Recipes on how to configure the Campaign SDK for iOS/android platforms:

<https://developer.goacoustic.com/acoustic-campaign/recipes/configure-mobile-sdks-ios>

<https://developer.goacoustic.com/acoustic-campaign/recipes/configure-mobile-sdks-android>

For production plugin, set "useRelease" to true, false uses beta build version.  Note:  Beta build plugin ends with ''.

```shell json
  "useRelease": true,
```

For iOS Campaign SDK version, update "iOS"

```shell json
  "iOSVersion": "x.x.x",
```


For android Campaign SDK version, update "androidVersion"

```shell json
  "androidVersion": "x.x.x",
```

 Run node.js command from project's folder to automatically apply all updates in the json file

```Text shell
node node_modules/react-native-acoustic-mobile-push/postinstall.js ./
```

## Set up your Android project

1. Copy your _google-services.json_ file with your Google-provided FCM credentials to your android project folder: `android/app/google-services.json`.
2. Edit 'CampaignConfig.json' file 'android' section and fill in the appKey`and`baseUrl\` provided by your account team.

```json
"baseUrl": "https://mobile-sdk-lib-XX-Y.brilliantcollector.com",
"appKey": {
"prod": "INSERT APP KEY HERE"
},
```

3. Additionally, you should support location services. Add the following line to your _build.gradle app_ file:

```Text build.gradle
implementation 'com.google.android.gms:play-services-location:<play-services version>'
```

4. Launch Android app.

```text shell
npx react-native run-android
```

## Set up your iOS project

1. Open the iOS project in Xcode.
2. Fix up the `bundle ID and signing` to use a bundle ID and profile with appropriate capabilities.
3. Add the `Push Notification` capability to your project: Go to **Signing & Capabilities**, Click **+Capability **, and select **Push Notification**.
4. Turn on the `Location Updates` background mode to your project: Go to **Signing & Capabilities** and check **Location Updates** checkbox.
5. Add the _MceConfig.json_ file in the project directory to the Xcode project to **Application target** and fill in the `baseUrl` and `appKey` provided by your account team.
   ```json
   "baseUrl": "https://mobile-sdk-lib-XX-Y.brilliantcollector.com",
   "appKey": {
   "prod": "INSERT APP KEY HERE"
   },
   ```

Run iOS

Run 'pod install' from the App's ios folder.

```Text shell
pod install
```

Launch iOS app.

```Text shell
npx react-native run-ios
```

> 📘 Note:
> 
> The iOS Simulator is unable to handle push messages.

### Optional: Integrating the iOS notification service

The iOS notification service requires separate provisioning. This plug-in is required if you need to access **push received events**, **dynamic action categories**, and **media attachments**. 

1. Add framework file `AcousticMobilePushNotification.xcframework`on your main target at the **Frameworks, Libraries, and Embedded Content** section.
2. Make sure that on your main target **Build Phases**, there's only one Framework `AcousticMobilePush.xcframework` added on the **Link Binary with Libraries** and that both frameworks are present in the **Embed Frameworks** section.
3. Add a new `Notification Service Extension` target:  
   a. In your XCode project, go to the **File** menu and select **New > Target**. A dialog box opens.  
   b. In the dialog box, select **iOS** at the top and then select **Notification Service Extension**.  
   c.  Select **Next**, enter the extension name `NewAppNotificationService`, and choose **Objective-C **as  
   **Language**.  
   d. Click **Finish**. If a dialog box opens, select **Activate**. The new target is added to the project. Xcode created a new folder with files in it.  
   e. Change the new target bundle identifier prefix and use `.notification`.  
   f. Verify that the new target has the same iOS version as the application target. SDK minimum supported version is 12.0.  
   g. Add the _MceConfig.json_ file to the **Notification Service** target. Open the file and check the notification service target membership in the **Target Membership** of the **File Inspector** in the Xcode pane.  
   h. Add `-ObjC` to the **Other Linker Flags** build options for the Notification Service.  
   d. Add `App Group` capability to both your notification service extension and Application target. Be sure to use the same app group as the main application.  
   e. Add the `Keychain Sharing capability` to both your notification service extension and Application target. Be sure to use the same value as the main application.  
   f. Replace the contents of _NotificationService.m_ and _NotificationService.h_ with the following code:

```javascript NotificationService.h
// NotificationService.h
#import <UserNotifications/UserNotifications.h>
#import <AcousticMobilePushNotification/AcousticMobilePushNotification.h>

@interface NotificationService : MCENotificationService

@end
```
```javascript NotificationService.m
// NotificationService.m
#import "NotificationService.h"

@implementation NotificationService

@end
```

## Add other Campaign features

1. To add other features, update the 'plugins' section in the 'CampaignConfig.json' file.  Below is default recommended settings:

```Text CampaignConfig.json
 "plugins": {
    "Required Mobile-Push plugins": "<true/false>, enable or disable plugin",
    "react-native-acoustic-mobile-push": true,
    "react-native-acoustic-mobile-push-ios-notification-service": true,
    "react-native-acoustic-mobile-push-inapp": true,
    "react-native-acoustic-mobile-push-inbox": true,

    "Optional Mobile-Push plugins": "<true/false>, enable or disable plugin",
    "react-native-acoustic-mobile-push-action-menu": true,
    "react-native-acoustic-mobile-push-beacon": true,
    "react-native-acoustic-mobile-push-calendar": true,
    "react-native-acoustic-mobile-push-displayweb": true,
    "react-native-acoustic-mobile-push-geofence": true,
    "react-native-acoustic-mobile-push-imagecarousel": true,
    "react-native-acoustic-mobile-push-location": true,
    "react-native-acoustic-mobile-push-snooze": true,
    "react-native-acoustic-mobile-push-textinput": true,
    "react-native-acoustic-mobile-push-wallet": true
  },
```

2. Run node.js command to automatically install from project folder

```Text shell
node node_modules/react-native-acoustic-mobile-push/postinstall.js ./
```

```

## Build the sample React-Native app

<https://github.com/go-acoustic/Acoustic-Mobile-Push-React-Native>