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
@import PassKit;
#else
#import <PassKit/PassKit.h>
#endif

#import <objc/runtime.h>
#import "RNAcousticMobilePushWallet.h"

@implementation RNAcousticMobilePushWallet

+ (instancetype)sharedInstance
{
    static id sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (void)addPassesViewControllerDidFinish:(PKAddPassesViewController *)controller
{
    if(![PKPassLibrary isPassLibraryAvailable])
    {
        NSLog(@"Could not determine if the pass was added to the library, it is not available.");
        return;
    }
    
    PKPass * pass = (PKPass*) objc_getAssociatedObject(controller, @"pass");
    PKPassLibrary * library = [[PKPassLibrary alloc]init];
    if([library containsPass: pass])
    {
        NSLog(@"Pass added to user's library");
    }
    else
    {
        NSLog(@"Pass NOT added to user's library");
    }
    [controller dismissViewControllerAnimated:true completion:^(void){}];
}

-(void)performAction:(NSDictionary*)action
{
    NSURL * url = [NSURL URLWithString: action[@"value"][@"url"]];
    if([PKAddPassesViewController canAddPasses]) {
        [self.client getPassFrom:url withCompletion:^(PKPass * pass, NSError * error){
            dispatch_async(dispatch_get_main_queue(), ^{
                if(error)
                {
                    NSLog(@"Pass error %@", [error localizedDescription]);

                    UIAlertController * alert = [UIAlertController alertControllerWithTitle:@"Pass Verifcation Failed" message:[error localizedDescription] preferredStyle: UIAlertControllerStyleAlert];
                    [alert addAction: [UIAlertAction actionWithTitle:@"Ok" style: UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
                    }]];
                    
                    UIViewController * controller = MCESdk.sharedInstance.findCurrentViewController;
                    [controller presentViewController:alert animated:TRUE completion:^{}];
                    return;
                }
            
                NSLog(@"Pass downloaded");
                PKAddPassesViewController * passVC = [[PKAddPassesViewController alloc] initWithPass:pass];
                passVC.delegate=self;
                
                UIViewController * controller = MCESdk.sharedInstance.findCurrentViewController;
                [controller presentViewController:passVC animated:TRUE completion:^(void){
                    NSLog(@"Pass presented to user");
                }];
            });
        }];
    } else if(url) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [UIApplication.sharedApplication openURL:url options:@{} completionHandler:^(BOOL success) {
                NSLog(@"Pass presented to user via OpenURL");
            }];
        });
    }
}


RCT_EXPORT_METHOD(registerPlugin:(NSString*)module)
{
    MCEActionRegistry * registry = [MCEActionRegistry sharedInstance];
    [[RNAcousticMobilePushWallet sharedInstance] setClient: [[AddToWalletClient alloc] init]];
    [registry registerTarget: [RNAcousticMobilePushWallet sharedInstance] withSelector:@selector(performAction:) forAction: @"passbook"];
}

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (NSDictionary *)constantsToExport {
    return @{};
}

@end
