/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "MCEConfig.h"

#if __has_feature(modules)
@import UIKit;
@import UserNotifications;
#else
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#endif

/** The MCESdk class is the central integration point for the SDK as a whole. */

@interface MCESdk : NSObject

/** This property sets the current alert view controller class, it can be customized by the developer of the application. */
@property Class _Nullable customAlertControllerClass;

/** This property can be used to override if a notification is delivered to the device when the app is running. */
@property (copy) BOOL (^ _Nullable presentNotification)(NSDictionary * _Nonnull userInfo);

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCESdk * _Nonnull sharedInstance NS_SWIFT_NAME(shared);

/** This method allows your app to respond to the open settings for notification request for notification quick settings **/
@property (copy) void (^ _Nullable openSettingsForNotification)(UNNotification * _Nonnull notification) API_AVAILABLE(ios(12.0));

/** @name Initialization */

/** Initialize SDK, must be called in either application delegate init or application:didFinishLaunchingWithOptions:.
 
 This method loads configuration from MceConfig.json. Either this method or handleApplicationLaunch: must be called before any other SDK method is called.
*/
- (void)handleApplicationLaunch;


/** Initialize SDK, must be called in either application delegate init or application:didFinishLaunchingWithOptions:. Either this method or handleApplicationLaunch must be called before any other SDK method is called.
 
 @param config Configuration is passed in via config dictionary instead of being loaded from MceConfig.json.
 */
- (void)handleApplicationLaunchWithConfig:(NSDictionary *_Nullable)config;

/** This method should be called if the application:didFailToRegisterForRemoteNotificationsWithError: method is called if manual integration is used. */
-(void)deviceTokenRegistartionFailed;

/** Register device token with Acoustic Push Notification servers
 @param deviceToken from APNS registration request in application delegate application:didRegisterForRemoteNotificationsWithDeviceToken:
 */
- (void)registerDeviceToken:(NSData * _Nonnull)deviceToken;

/** Manually initialize SDK, is used to wait until an event occurs before beginning to interact with the Acoustic servers. For example, you might not want to create a userid/channelid until after a user logs into your system. Requires  autoInitialize=FALSE MceConfig.json flag. This method may also be used if the autoReinitialize flag is set to false in the MceConfig.json file and the SDK is in the GDPR reset state.
 */
- (void) manualInitialization;

/** Manually initialize location services for SDK, requires location's autoInitialize=FALSE MceConfig.json flag. This is used to delay location services initialization until desired. */
-(void)manualLocationInitialization;

/** Shows a dynamic category notification, integration point of the application delegate application:didReceiveRemoteNotification:fetchCompletionHandler: method.

 @param userInfo passed from didReceiveRemoteNotification parameter of caller
 */
- (void)presentDynamicCategoryNotification:(NSDictionary * _Nullable)userInfo;

/** Performs action defined in "notification-action" part of the payload.
 @param userInfo push payload from APNS
 */
- (void)performNotificationAction: (NSDictionary * _Nullable)userInfo;

/** Process specified dynamic category notification for local notifications, integration point of the application delegate application:handleActionWithIdentifier:forLocalNotification:completionHandler:

 @param userInfo notification.userInfo of the forLocalNotification parameter of the caller
 @param identifier the identifier parameter of the caller
 */
- (void)processDynamicCategoryNotification:(NSDictionary * _Nonnull)userInfo identifier:(NSString * _Nonnull)identifier userText: (NSString * _Nullable)userText;


 /** Process specified dynamic category notification for remote notifications, integration point of the application delegate application:handleActionWithIdentifier:forRemoteNotification:completionHandler:
 
 @param userInfo notification.userInfo of the forLocalNotification parameter of the caller
 @param identifier the identifier parameter of the caller
 
 */
- (void)processCategoryNotification:(NSDictionary * _Nonnull)userInfo identifier:(NSString * _Nonnull)identifier;

/** Get the current SDK Version number as a string. */
- (NSString * _Nonnull) sdkVersion;

/* Current configuration object, loaded when handleApplicationLaunchWithConfig: or handleApplicationLaunch execute. */
@property (nonatomic) MCEConfig * _Nonnull config;

/** This method walks through the view controller stack for the top view controller.  */
- (UIViewController * _Nullable) findCurrentViewController;

/** This property returns the current alert view controller class, it can be customized by the developer of the application. */
-(Class _Nonnull) alertControllerClass;

/** This property returns true in the case that the SDK has been reset via a GDPR request but has not yet re-registered with the server. This could be due to the "autoReinitialize" flag being set to false or there is no connectivity. If the "autoReinitialize" flag is set to false and this property returns true, you could present a dialog to the user to verify that they agree to anonymous data collection and execute the manualInitialization method to re-register with the server.
 
Please note, this method is deprecated, please use MCERegistrationDetails.sharedInstance.userInvalidated instead.
 */
-(BOOL)gdprState __attribute__ ((deprecated));

@end
