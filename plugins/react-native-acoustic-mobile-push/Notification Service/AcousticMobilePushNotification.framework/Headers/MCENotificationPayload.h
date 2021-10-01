/*
* Copyright © 2020 Acoustic, L.P. All rights reserved.
*
* NOTICE: This file contains material that is confidential and proprietary to
* Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
* industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
* Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
* prohibited.
*/

#if __has_feature(modules)
@import Foundation;
@import UserNotifications;
#else
#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>
#endif

#import "MCEPayload.h"

/**
 This class represents the Notification Payload
 */
@interface MCENotificationPayload : MCEPayload <NSURLSessionDownloadDelegate, NSURLSessionDataDelegate, NSURLSessionTaskDelegate, NSURLSessionDataDelegate>
/**
 This method creates a notification category on demand for the current notification payload.
 */
- (void) addNotificationCategoryWithCompletionHandler: ( void (^ _Nullable)(void)) completionHandler;

/**
 This method generates a UNMutableNotificationContent object based on the current payload
 */
- (UNMutableNotificationContent * _Nonnull) notificationContent;

- (NSString * _Nullable) extractAlertString;

@end
