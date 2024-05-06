/*
 * Copyright © 2022, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <CoreLocation/CoreLocation.h>
#import "AddToWalletClient.h"

@interface RNAcousticMobilePushWallet : RCTEventEmitter <RCTBridgeModule>
@property AddToWalletClient * client;
@property(class, nonatomic, readonly) RNAcousticMobilePushWallet * sharedInstance NS_SWIFT_NAME(shared);
@end
