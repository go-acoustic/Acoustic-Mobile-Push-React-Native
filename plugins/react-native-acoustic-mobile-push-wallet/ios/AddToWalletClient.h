/*
 * Copyright © 2022, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#if __has_feature(modules)
@import Foundation;
@import PassKit;
@import AcousticMobilePush;
#else
#import <Foundation/Foundation.h>
#import <PassKit/PassKit.h>
#import <AcousticMobilePush/AcousticMobilePush.h>
#endif

typedef void (^PassCallback)(PKPass * pass, NSError* error);

@interface AddToWalletClient : MCEClient
-(void)getPassFrom: (NSURL*) url withCompletion:(PassCallback)callback;
@end
