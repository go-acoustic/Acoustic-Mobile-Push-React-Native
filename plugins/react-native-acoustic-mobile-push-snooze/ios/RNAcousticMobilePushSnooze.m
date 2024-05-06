/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
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
#import <UserNotifications/UserNotifications.h>

@interface MCEPayload : NSObject
-(instancetype)initWithPayload:(NSDictionary*)payload;
@end

@interface MCENotificationPayload : MCEPayload <NSURLSessionDownloadDelegate, NSURLSessionDataDelegate, NSURLSessionTaskDelegate, NSURLSessionDataDelegate>
- (void) addNotificationCategoryWithCompletionHandler: ( void (^ _Nullable)(void)) completionHandler;
- (UNMutableNotificationContent * _Nonnull) notificationContent;
- (NSString * _Nullable) extractAlertString;
@end

@protocol MCEActionProtocol <NSObject>
@optional
-(void)configureAlertTextField:(UITextField*)textField;
@end

@interface MCEActionRegistry : NSObject
@property(class, nonatomic, readonly) MCEActionRegistry * sharedInstance NS_SWIFT_NAME(shared);
-(BOOL)registerTarget:(NSObject <MCEActionProtocol> *)target withSelector:(SEL)selector forAction:(NSString*)type;
@end

@interface RNAcousticMobilePushSnooze()
@property NSString * snoozeActionModule;
@property MCENotificationPayload * notificationPayload;
@end

@implementation RNAcousticMobilePushSnooze

-(void)performAction:(NSDictionary*)action payload:(NSDictionary*)payload {

    if(!self.snoozeActionModule) {
        NSLog(@"Snooze Action Module is not registered, can not show snooze interface!");
        return;
    }

    NSNumber * value = action[@"value"][@"time"];
    if(![value respondsToSelector:@selector(isEqualToNumber:)]) {
        NSLog(@"Snooze value is not numeric");
        return;
    }
            
    NSLog(@"Snooze for %f minutes", [value doubleValue]);

    self.notificationPayload = [[MCENotificationPayload alloc] initWithPayload: payload];
    [self.notificationPayload addNotificationCategoryWithCompletionHandler:^{
        UNMutableNotificationContent * content = self.notificationPayload.notificationContent;
        UNTimeIntervalNotificationTrigger * trigger = [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:[value doubleValue] * 60 repeats:false];
        UNNotificationRequest * request = [UNNotificationRequest requestWithIdentifier:[[NSUUID UUID] UUIDString] content:content trigger:trigger];
        [UNUserNotificationCenter.currentNotificationCenter addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
            
            if(error) {
                NSLog(@"Could not add notification request");
            } else {
                NSLog(@"Will resend notification %@ with content %@ at %@", request, content, [trigger nextTriggerDate]);
            }
        }];

    }];
}

RCT_EXPORT_METHOD(registerPlugin:(NSString*)module)
{
    self.snoozeActionModule = module;
    MCEActionRegistry * registry = [MCEActionRegistry sharedInstance];
    [registry registerTarget: self withSelector:@selector(performAction:payload:) forAction: @"snooze"];
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


