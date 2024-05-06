/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "WebViewController.h"
#import "RNAcousticMobilePushDisplayWeb.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@interface MCESdk : NSObject
@property(class, nonatomic, readonly) MCESdk * sharedInstance NS_SWIFT_NAME(shared);
-(UIViewController*)findCurrentViewController;
@end

@protocol MCEActionProtocol <NSObject>
@optional
-(void)configureAlertTextField:(UITextField*)textField;
@end

@interface MCEActionRegistry : NSObject
@property(class, nonatomic, readonly) MCEActionRegistry * sharedInstance NS_SWIFT_NAME(shared);
-(BOOL)registerTarget:(NSObject <MCEActionProtocol> *)target withSelector:(SEL)selector forAction:(NSString*)type;
@end

@interface RNAcousticMobilePushDisplayWeb()
@property NSString * displayWebActionModule;
@end

@implementation RNAcousticMobilePushDisplayWeb


RCT_EXPORT_METHOD(registerPlugin:(NSString*)module)
{
    self.displayWebActionModule = module;
    MCEActionRegistry * registry = [MCEActionRegistry sharedInstance];
    [registry registerTarget: self withSelector:@selector(performAction:payload:) forAction: @"displayWebView"];
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

-(void)performAction:(NSDictionary*)action payload:(NSDictionary*)payload
{

    if(!self.displayWebActionModule) {
        NSLog(@"Display Web Action Module is not registered, can not show Display Web interface!");
        return;
    }

    WebViewController * viewController = [[WebViewController alloc] initWithNibName:@"WebViewController" bundle:nil url: [NSURL URLWithString:action[@"value"][@"url"]]];
    UIWindow * window = [[UIApplication sharedApplication] keyWindow];
                
    if(window.rootViewController) {
        [window.rootViewController presentViewController:viewController animated:TRUE completion:nil];
    } else {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.25 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self performAction:action payload: payload];
        });
    }
}

@end


