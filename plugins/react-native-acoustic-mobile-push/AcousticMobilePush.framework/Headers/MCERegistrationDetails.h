/*
 * Copyright © 2015, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#if __has_feature(modules)
@import Foundation;
#else
#import <Foundation/Foundation.h>
#endif

/** MCERegistrationDetails provides the userId, channelId and pushToken registration details. You might want to store the userId and channelId on your servers if you want to directly target users and channels. */
@interface MCERegistrationDetails : NSObject

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCERegistrationDetails * sharedInstance NS_SWIFT_NAME(shared);

/** When a user has been invalidated and the autoReinitialize flag is false in the MceConfig.json file, this value will be set to true. Applications must check this value if they want to manually reinitialize the registration and when this value is true, applications should execute MceSdk.sharedInstance's manualInitialization method.  */
@property BOOL userInvalidated;

/** Retrieve userId
 
 @return userId a string value assigned to the user (potentially multiple devices)
 */
@property NSString * userId;

/** Retrieve channelId
 
 @return channelId a string value assigned to the channel (device)
 */
@property NSString * channelId;

/** Push Token for APNS registration
 @return pushToken an NSData value representing the push token for the app installation on the device from APNS.
 */
@property NSData * pushToken;

/** Is registered with Apple Push Service
 @return TRUE or FALSE
 */
@property (readonly) BOOL apsRegistered;

/** Is registered with Acoustic Mobile Channel Engagement service
 @return TRUE or FALSE
 */
@property (readonly) BOOL mceRegistered;

/** Method is deprecated, please use instance method instead. */
+ (BOOL) mceRegistered __attribute__((deprecated));

/** Method is deprecated, please use instance method instead. */
+ (NSString*) channelId __attribute__((deprecated));

/** Method is deprecated, please use instance method instead. */
+ (NSString*) userId __attribute__((deprecated));

/** Method is deprecated, please use instance method instead. */
+ (NSData *) pushToken __attribute__((deprecated));

@property NSString * appKey;

@end

