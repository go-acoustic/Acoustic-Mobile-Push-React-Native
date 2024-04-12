/*
 * Copyright © 2022, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "AddToWalletClient.h"

@implementation AddToWalletClient
-(void)getPassFrom: (NSURL*) url withCompletion:(PassCallback)callback
{
    [self get:url completion:^(NSData *result, NSError *error) {
        if(error) {
            callback(nil, error);
            return;
        }
        
        NSError * passError = nil;
        PKPass * pass = [[PKPass alloc]initWithData:result error:&passError];
        if(passError) {
            callback(nil, passError);
            return;
        }

        callback(pass, nil);
    }];
}
@end
