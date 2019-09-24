/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushSnooze.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@interface MCESdk : NSObject
@property(class, nonatomic, readonly) MCESdk * sharedInstance NS_SWIFT_NAME(shared);
- (NSString*)extractAlert:(NSDictionary*)aps;
@end

@protocol MCEActionProtocol <NSObject>
@optional
-(void)configureAlertTextField:(UITextField*)textField;
@end

@interface MCEActionRegistry : NSObject
@property(class, nonatomic, readonly) MCEActionRegistry * sharedInstance NS_SWIFT_NAME(shared);
-(BOOL)registerTarget:(NSObject <MCEActionProtocol> *)target withSelector:(SEL)selector forAction:(NSString*)type;
@end

@implementation RNAcousticMobilePushSnooze

+(void)initialize {
    [NSNotificationCenter.defaultCenter addObserverForName:UIApplicationDidFinishLaunchingNotification object:nil queue: NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
        [MCEActionRegistry.sharedInstance registerTarget:[[self alloc] init] withSelector:@selector(snooze:payload:) forAction:@"snooze"];
    }];
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

-(void) snooze:(NSDictionary *)action payload: (NSDictionary*)payload {
    NSInteger minutes = [[action valueForKey:@"value"] integerValue];
    NSLog(@"Snooze for %ld minutes", (long)minutes);
    UILocalNotification * notification = [[UILocalNotification alloc] init];
    
    notification.userInfo = payload;
    if(payload[@"aps"][@"category"]) {
        notification.category = payload[@"aps"][@"category"];
    }
    
    if(payload[@"aps"][@"sound"]) {
        notification.soundName = payload[@"aps"][@"sound"];
    }
    
    if(payload[@"aps"][@"badge"]) {
        notification.applicationIconBadgeNumber = [payload[@"aps"][@"badge"] integerValue];
    }
    
    if([payload[@"aps"][@"alert"] isKindOfClass:[NSDictionary class]] && payload[@"aps"][@"alert"][@"action-loc-key"]) {
        notification.alertAction = payload[@"aps"][@"alert"][@"action-loc-key"];
        notification.hasAction = true;
    } else {
        notification.hasAction = false;
    }
    
    NSString * alertBody = [[MCESdk sharedInstance] extractAlert:payload[@"aps"]];
    notification.alertBody = alertBody;
    
    notification.fireDate = [NSDate dateWithTimeIntervalSinceNow:minutes*60];
    [[UIApplication sharedApplication] scheduleLocalNotification: notification];
}

@end


