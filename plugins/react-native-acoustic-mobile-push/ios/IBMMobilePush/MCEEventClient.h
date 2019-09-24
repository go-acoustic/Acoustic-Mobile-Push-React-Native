/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "MCEEvent.h"
#import "MCEClient.h"

/** The MCEEventClient class is used to send events directly to the server. If an error occurs, you can resend the request, if desired. If you want the SDK to handle retries, use the MCEEventService class.
 
    Please note, this class is deprecated, please use the MCEEventService class instead.
 */

__attribute__ ((deprecated))
@interface MCEEventClient : NSObject

/** The sendEvents:completion: method is used to send events directly to the server. If an error occurs, you can resend the request, if desired. */
- (void)sendEvents:(NSArray*)events completion:(void (^)(NSError * error))callback;

@end
