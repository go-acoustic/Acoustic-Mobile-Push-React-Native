/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushActionMenu.h"

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

extern NSString * const InAppSource;

@protocol MCEActionProtocol <NSObject>
@optional
-(void)configureAlertTextField:(UITextField*)textField;
@end

@interface MCEActionRegistry : NSObject
@property(class, nonatomic, readonly) MCEActionRegistry * sharedInstance NS_SWIFT_NAME(shared);
-(BOOL)registerTarget:(NSObject <MCEActionProtocol> *)target withSelector:(SEL)selector forAction:(NSString*)type;
@end

@interface RNAcousticMobilePushActionMenu()
@property NSString * actionMenuActionModule;
@end

@interface MCEConfig
@property(class, nonatomic, readonly) MCEConfig * sharedInstance NS_SWIFT_NAME(shared);
@end

@interface MCESdk : NSObject
@property(class, nonatomic, readonly) MCESdk * sharedInstance NS_SWIFT_NAME(shared);
@property (nonatomic) MCEConfig* config;
@end

@implementation RNAcousticMobilePushActionMenu

-(void)performAction:(NSDictionary*)action payload:(NSDictionary*)payload {
    NSLog(@"RNAcousticMobilePushActionMenu: performAction");
    if(!self.actionMenuActionModule) {
        NSLog(@"Action Menu Module is not registered, can not show actions interface!");
        return;
    }

    MCENotificationPayload * notificationPayload = [[MCENotificationPayload alloc] initWithPayload: payload];
    NSString * alert = [notificationPayload extractAlertString];
    NSString * appName = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleName"];
    UIAlertController * alertController = [UIAlertController alertControllerWithTitle: appName message: alert preferredStyle: UIAlertControllerStyleAlert];
    
    int index=0;
    for (NSDictionary * action in payload[@"category-actions"]) {
        [alertController addAction: [UIAlertAction actionWithTitle:action[@"name"] style:UIAlertActionStyleDefault handler:^(UIAlertAction *alertAction) {
            // perform action
        }]];
        index++;
    }
    
    [alertController addAction: [UIAlertAction actionWithTitle:@"Cancel" style: UIAlertActionStyleCancel handler:^(UIAlertAction *action){
        // just dismiss alert
    }]];
    
    UIWindow * window = [[UIApplication sharedApplication] keyWindow];
    [window.rootViewController presentViewController:alertController animated:TRUE completion:nil];
}

RCT_EXPORT_METHOD(registerPlugin:(NSString*)module)
{
    NSLog(@"RNAcousticMobilePushActionMenu: registerPlugin");
    self.actionMenuActionModule = module;
    MCEActionRegistry * registry = [MCEActionRegistry sharedInstance];
    [registry registerTarget: self withSelector:@selector(performAction:payload:) forAction: @"showactions"];
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