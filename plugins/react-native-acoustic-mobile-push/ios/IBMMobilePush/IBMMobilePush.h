/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#if __has_feature(modules)
@import UIKit;
@import Foundation;
#else
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#endif

//! Project version number for IBMMobilePush.
FOUNDATION_EXPORT double IBMMobilePushVersionNumber;

//! Project version string for IBMMobilePush.
FOUNDATION_EXPORT const unsigned char IBMMobilePushVersionString[];

#import <IBMMobilePush/MCEActionRegistry.h>
#import <IBMMobilePush/MCEApiUtil.h>
#import <IBMMobilePush/MCEApiUtil.h>
#import <IBMMobilePush/MCEAppDelegate.h>
#import <IBMMobilePush/MCEAttributesClient.h>
#import <IBMMobilePush/MCEAttributesQueueManager.h>
#import <IBMMobilePush/MCECallbackDatabaseManager.h>
#import <IBMMobilePush/MCEClient.h>
#import <IBMMobilePush/MCEConfig.h>
#import <IBMMobilePush/MCEConstants.h>
#import <IBMMobilePush/MCEEvent.h>
#import <IBMMobilePush/MCEEventClient.h>
#import <IBMMobilePush/MCEEventService.h>
#import <IBMMobilePush/MCEGeofence.h>
#import <IBMMobilePush/MCEArea.h>
#import <IBMMobilePush/MCEInAppManager.h>
#import <IBMMobilePush/MCEInAppMessage.h>
#import <IBMMobilePush/MCEInAppTemplate.h>
#import <IBMMobilePush/MCEInAppTemplateRegistry.h>
#import <IBMMobilePush/MCEInboxDatabase.h>
#import <IBMMobilePush/MCEInboxMessage.h>
#import <IBMMobilePush/MCEInboxQueueManager.h>
#import <IBMMobilePush/MCELocationClient.h>
#import <IBMMobilePush/MCELocationDatabase.h>
#import <IBMMobilePush/MCENotificationDelegate.h>
#import <IBMMobilePush/MCEPhoneHomeManager.h>
#import <IBMMobilePush/MCERegistrationDetails.h>
#import <IBMMobilePush/MCESdk.h>
#import <IBMMobilePush/MCETemplate.h>
#import <IBMMobilePush/MCETemplateRegistry.h>
#import <IBMMobilePush/MCEWebViewActionDelegate.h>
#import <IBMMobilePush/UIColor+Hex.h>

