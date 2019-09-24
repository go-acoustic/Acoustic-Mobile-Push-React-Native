/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushInApp.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

extern NSString * const InAppSource;

@protocol MCEActionProtocol <NSObject>
@optional
-(void)configureAlertTextField:(UITextField*)textField;
@end

@interface MCEActionRegistry : NSObject
@property(class, nonatomic, readonly) MCEActionRegistry * sharedInstance NS_SWIFT_NAME(shared);
-(BOOL)registerTarget:(NSObject <MCEActionProtocol> *)target withSelector:(SEL)selector forAction:(NSString*)type;
-(void)performAction:(NSDictionary*)action forPayload:(NSDictionary*)payload source: (NSString*) source attributes:(NSDictionary*)attributes userText: (NSString*)userText;
@end

@interface MCEInboxQueueManager : NSObject
@property(class, nonatomic, readonly) MCEInboxQueueManager * sharedInstance NS_SWIFT_NAME(shared);
-(void)syncInbox;
@end

@class MCEResultSet;
@interface MCEInAppMessage : NSObject
@property NSString * inAppMessageId;
@property NSInteger maxViews;
@property NSInteger numViews;
@property NSString * templateName;
@property NSDictionary * content;
@property NSDate * triggerDate;
@property NSDate * expirationDate;
@property NSArray * rules;
@property NSString * attribution;
@property NSString * mailingId;
+ (instancetype) inAppMessageFromResultSet: (MCEResultSet*) resultSet;
- (instancetype) initFromResultSet: (MCEResultSet*) resultSet;
+ (instancetype) inAppMessageWithPayload: (NSDictionary*) payload;
- (instancetype) initWithPayload: (NSDictionary*) payload;
- (NSData*) rulesData;
- (NSData*) contentData;
- (BOOL) execute;
- (BOOL) isExpired;
- (BOOL) isOverViewed;
- (BOOL) isTriggered;
@end

@interface MCEInAppManager : NSObject
@property(class, nonatomic, readonly) MCEInAppManager * sharedInstance NS_SWIFT_NAME(shared);
-(void) processPayload:(NSDictionary*)payload;
-(void) fetchInAppMessagesForRules: (NSArray*)names completion:(void (^)(NSMutableArray * inAppMessages, NSError * error))completion;
-(void) incrementView:(MCEInAppMessage*)inAppMessage;
-(void) executeRule: (NSArray*)rules;
-(void)disable:(MCEInAppMessage*)inAppMessage;
-(MCEInAppMessage*) inAppMessageById:(NSString*)inAppMessageId;
@end

@interface MCEConfig
@property(class, nonatomic, readonly) MCEConfig * sharedInstance NS_SWIFT_NAME(shared);
@property BOOL geofenceEnabled;
@end

@interface MCESdk : NSObject
@property(class, nonatomic, readonly) MCESdk * sharedInstance NS_SWIFT_NAME(shared);
@property (nonatomic) MCEConfig* config;
@end

@interface RNAcousticMobilePushInApp ()
@property UIViewController * inAppViewController;
@property UIWindow * inAppWindow;
@property RCTRootView * inAppView;
@property NSMutableDictionary * inAppTemplateModules;
@end

@implementation RNAcousticMobilePushInApp

+(void)initialize {
}

-(instancetype)init {
    if(self = [super init]) {
        self.inAppTemplateModules = [NSMutableDictionary dictionary];
    }
    return self;
}

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[ ];
}

- (NSDictionary *)constantsToExport {
    return @{ };
}

#pragma mark InApp

RCT_EXPORT_METHOD(hideInApp) {
    if(self.inAppWindow) {
        [self.inAppWindow removeFromSuperview];
        self.inAppWindow = nil;
    }
    if(self.inAppView) {
        [self.inAppView removeFromSuperview];
        self.inAppView = nil;
    }
    self.inAppViewController = nil;
}

RCT_EXPORT_METHOD(deleteInApp: (NSString*)inAppMessageId) {
    MCEInAppMessage * inAppMessage = [MCEInAppManager.sharedInstance inAppMessageById: inAppMessageId];
    if(inAppMessage) {
        [[MCEInAppManager sharedInstance] disable: inAppMessage];
    }
}


// This method is largely for testing the display of InApp messages
RCT_EXPORT_METHOD(createInApp: (NSDictionary*)content template:(NSString*)template rules: (NSArray*)rules maxViews:(NSInteger)maxViews attribution: (NSString*)attribution mailingId: (NSString*)mailingId ) {
    NSMutableDictionary * mce = [NSMutableDictionary dictionary];
    if(mailingId && [mailingId respondsToSelector:@selector(isEqualToString:)]) {
        mce[@"mailingId"] = mailingId;
    }
    if(attribution && [attribution respondsToSelector:@selector(isEqualToString:)]) {
        mce[@"attribution"] = attribution;
    }
    NSMutableDictionary * inApp = [NSMutableDictionary dictionary];
    if(maxViews) {
        inApp[@"maxViews"] = @(maxViews);
    }
    
    if(template && [template respondsToSelector:@selector(isEqualToString:)]) {
        inApp[@"template"] = template;
    } else {
        NSLog(@"Template is required for createInApp call.");
        return;
    }
    
    if(content && [content respondsToSelector:@selector(isEqualToDictionary:)]) {
        inApp[@"content"] = content;
    } else {
        NSLog(@"Content is required for createInApp call.");
        return;
    }
    
    if(rules && [rules respondsToSelector:@selector(isEqualToArray:)]) {
        inApp[@"rules"] = rules;
    } else {
        NSLog(@"Rules are required for createInApp call.");
        return;
    }
    
    NSDictionary * payload = @{@"mce": mce, @"inApp": inApp};
    [MCEInAppManager.sharedInstance processPayload: payload];
}

RCT_EXPORT_METHOD(executeInApp: (NSArray*) rules) {
    for(NSString * rule in rules) {
        if(![rule respondsToSelector:@selector(isEqualToString:)]) {
            NSLog(@"executeInApp should be called with an array of strings.");
            return;
        }
    }
    [MCEInAppManager.sharedInstance fetchInAppMessagesForRules:rules completion:^(NSMutableArray *inAppMessages, NSError *error) {
        for(MCEInAppMessage * inAppMessage in inAppMessages) {
            if([self showInAppMessage: inAppMessage]) {
                [[MCEInAppManager sharedInstance] incrementView: inAppMessage];
                return;
            }
        }
    }];
}

RCT_EXPORT_METHOD(registerInApp: (NSString*) template module: (NSString*) module height: (nonnull NSNumber*)height) {
    if(![template respondsToSelector:@selector(isEqualToString:)]) {
        NSLog(@"registerInApp should be called with a template as the first argument");
        return;
    }
    
    if(![module respondsToSelector:@selector(isEqualToString:)]) {
        NSLog(@"registerInApp should be called with a module as the second argument");
        return;
    }
    
    NSMutableDictionary * value = [@{@"module": module} mutableCopy];
    if(height && [height respondsToSelector:@selector(floatValue)]) {
        value[@"height"] = height;
    }
    
    self.inAppTemplateModules[template] = value;
}

-(BOOL)showInAppMessage: (MCEInAppMessage *) inAppMessage {
    NSDictionary * module = self.inAppTemplateModules[inAppMessage.templateName];
    if(!module) {
        return false;
    }
    
    [self hideInApp];
    UIWindow * currentWindow = UIApplication.sharedApplication.keyWindow;
    CGRect rect = currentWindow.frame;
    
    NSString * orientation = inAppMessage.content[@"orientation"];
    NSNumber * height = module[@"height"];
    CGFloat contentHeight = 0;
    CGFloat containerHeight = 0;
    if(height && [height respondsToSelector:@selector(floatValue)] && orientation && [orientation respondsToSelector:@selector(isEqualToString:)]) {
        contentHeight = [height floatValue];
        containerHeight = contentHeight;
        if (@available(iOS 11.0, *)) {
            if([[orientation lowercaseString] isEqual: @"bottom"]) {
                containerHeight += currentWindow.safeAreaInsets.bottom;
            } else {
                containerHeight += currentWindow.safeAreaInsets.top;
            }
        }
        
        if([[orientation lowercaseString] isEqual: @"bottom"]) {
            rect.origin.y = rect.size.height - containerHeight;;
        }
        
        rect.size.height = containerHeight;
    }
    
    self.inAppViewController = [[UIViewController alloc] init];
    self.inAppWindow = [[UIWindow alloc] initWithFrame:rect];
    self.inAppWindow.rootViewController = self.inAppViewController;
    
    NSMutableDictionary * message = [@{
                                       @"inAppMessageId": inAppMessage.inAppMessageId,
                                       @"rules": inAppMessage.rules,
                                       @"expirationDate": @([inAppMessage.expirationDate timeIntervalSince1970] * 1000),
                                       @"triggerDate": @([inAppMessage.triggerDate timeIntervalSince1970] * 1000),
                                       @"templateName": inAppMessage.templateName,
                                       @"numViews": @(inAppMessage.numViews),
                                       @"maxViews": @(inAppMessage.maxViews),
                                       @"content": inAppMessage.content
                                       } mutableCopy];
    
    if(inAppMessage.mailingId) {
        message[@"mailingId"] = inAppMessage.mailingId;
    }
    
    if(inAppMessage.attribution) {
        message[@"attribution"] = inAppMessage.attribution;
    }
    
    NSMutableDictionary * properties = [ @{ @"message": message } mutableCopy];
    properties[@"contentHeight"] = @(contentHeight);
    properties[@"containerHeight"] = @(containerHeight);
    
    rect.origin = CGPointZero;
    self.inAppView = [[RCTRootView alloc] initWithBridge:self.bridge moduleName:module[@"module"] initialProperties: properties];
    self.inAppViewController.view = self.inAppView;
    
    self.inAppView.frame = rect;
    self.inAppWindow.windowLevel = UIWindowLevelAlert;
    self.inAppWindow.hidden = false;
    self.inAppWindow.backgroundColor = UIColor.clearColor;
    self.inAppView.backgroundColor = UIColor.clearColor;
    
    return TRUE;
}

RCT_EXPORT_METHOD(clickInApp: (NSString*) inAppMessageById) {
    MCEInAppMessage * inAppMessage = [MCEInAppManager.sharedInstance inAppMessageById: inAppMessageById];
    
    NSDictionary * payload = @{@"mce": [NSMutableDictionary dictionary]};
    if(inAppMessage.attribution) {
        payload[@"mce"][@"attribution"] = inAppMessage.attribution;
    }
    if(inAppMessage.mailingId) {
        payload[@"mce"][@"mailingId"] = inAppMessage.mailingId;
    }
    [[MCEInAppManager sharedInstance] disable: inAppMessage];
    [[MCEActionRegistry sharedInstance] performAction: inAppMessage.content[@"action"] forPayload: payload source:InAppSource attributes: nil userText: nil];
}

RCT_EXPORT_METHOD(syncInAppMessages)
{
    [MCEInboxQueueManager.sharedInstance syncInbox];
}

@end
