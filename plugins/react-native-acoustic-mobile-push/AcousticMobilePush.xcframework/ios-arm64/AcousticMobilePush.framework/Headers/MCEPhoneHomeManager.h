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

/** The MCEPhoneHomeManager class can be used to force a phone home update when you know the userId or channelId is updated on the server. */
@interface MCEPhoneHomeManager : NSObject

/** The phoneHome method tries to phone home, if a phone home was done less the 24 hours ago this method will do nothing. */
+(void)phoneHome;

/** The forcePhoneHome method forces a phone home update. */
+(void)forcePhoneHome;

@end
