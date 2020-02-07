/*
 * Copyright © 2016, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#if __has_feature(modules)
@import UserNotifications;
#else
#import <UserNotifications/UserNotifications.h>
#endif

/**
 MCENotificationDelegate provides SDK integration for the UNUserNotificationCenterDelegate methods introduced in iOS 10. 
 */
@interface MCENotificationDelegate : NSObject <UNUserNotificationCenterDelegate>

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCENotificationDelegate * sharedInstance NS_SWIFT_NAME(shared);

@end
