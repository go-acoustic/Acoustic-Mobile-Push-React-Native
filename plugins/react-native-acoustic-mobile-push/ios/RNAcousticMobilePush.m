/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

// This module provides the basic functionality of the SDK, events, attributes, registration and "event" feedback back to the javascript layer.

#import "RNAcousticMobilePush.h"
#import "RNAcousticMobilePushActionHandler.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@interface RNAcousticMobilePush()
@property bool listenersSetup;
@property NSDateFormatter * dateFormatter;
@end

@implementation RNAcousticMobilePush

#pragma mark SDK

RCT_EXPORT_MODULE();

-(instancetype)init
{
    if(self = [super init]) {
        self.dateFormatter = [[NSDateFormatter alloc] init];
        self.dateFormatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'";
        self.dateFormatter.timeZone = [NSTimeZone timeZoneForSecondsFromGMT:0];
        self.dateFormatter.locale = [[NSLocale alloc] initWithLocaleIdentifier:@"en_US_POSIX"];

#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
        NSDictionary * channelAttributes = @{@"sdk": @"react-native", @"react-native": [[MCESdk sharedInstance] sdkVersion] };
        [MCEAttributesQueueManager.sharedInstance updateChannelAttributes: channelAttributes];
#pragma GCC diagnostic pop
    }
    return self;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}

-(void)addSafeObserverFor: (NSString*)name usingBlock: (void (^)(NSNotification* _Nonnull, RNAcousticMobilePush*)) block {
    [NSNotificationCenter.defaultCenter addObserverForName:name object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
        if(!self.bridge) {
            return;
        }
        block(note, self);
    }];
}

- (NSArray<NSString *> *)supportedEvents {
    if(!self.listenersSetup) {
        self.listenersSetup = true;
        
        [self addSafeObserverFor: MCECustomPushNotYetRegistered usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"CustomPushNotYetRegistered" body:note.userInfo];
        }];

        [self addSafeObserverFor: MCECustomPushNotRegistered usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"CustomPushNotRegistered" body:note.userInfo];
        }];

        [self addSafeObserverFor: MCERegisteredNotification usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"Registered" body:@{ }];
        }];

        [self addSafeObserverFor: MCERegistrationChangedNotification usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"RegistrationChanged" body:@{ }];
        }];

        [self addSafeObserverFor: MCEEventSuccess usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"EventSuccess" body: [sdk translateEventNotification: note] ];
        }];

        [self addSafeObserverFor: MCEEventFailure usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"EventFailure" body: [sdk translateEventNotification: note]];
        }];

        [self addSafeObserverFor: UpdateUserAttributesSuccess usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"UpdateUserAttributesSuccess" body: [sdk translateAttributeNotification: note]];
        }];

        [self addSafeObserverFor: UpdateUserAttributesError usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"UpdateUserAttributesError" body: [sdk translateAttributeNotification: note]];
        }];

        [self addSafeObserverFor: DeleteUserAttributesSuccess usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"DeleteUserAttributesSuccess" body:@{ @"keys": note.userInfo[@"keys"] }];
        }];

        [self addSafeObserverFor: DeleteUserAttributesError usingBlock: ^(NSNotification* _Nonnull note, RNAcousticMobilePush * sdk) {
            [sdk sendEventWithName:@"DeleteUserAttributesError" body:@{ @"keys": note.userInfo[@"keys"], @"error": [note.userInfo[@"error"] localizedDescription] }];
        }];
    }
    
    return @[@"EventSuccess", @"EventFailure", @"Registered", @"RegistrationChanged", @"UpdateUserAttributesSuccess", @"UpdateUserAttributesError", @"DeleteUserAttributesError", @"DeleteUserAttributesSuccess",  @"CustomPushNotYetRegistered", @"CustomPushNotRegistered"];
}

- (NSDictionary *)constantsToExport {
    MCEConfig * config = MCESdk.sharedInstance.config;
    return @{@"pluginVersion": @"3.8.0", @"sdkVersion": MCESdk.sharedInstance.sdkVersion, @"appKey": config.appKey ? config.appKey : [NSNull null]};
}

#pragma mark SDK - Events

-(NSDictionary*) translateEventNotification: (NSNotification*)note {
    NSMutableDictionary * json = [NSMutableDictionary dictionary];
    
    NSMutableArray * events = [NSMutableArray array];
    for (MCEEvent * event in note.userInfo[@"events"]) {
        NSMutableDictionary * eventJson = [[event toDictionary] mutableCopy];
        NSMutableDictionary * attributes = [eventJson[@"attributes"] mutableCopy];
        if(attributes) {
            for(NSString * key in [attributes allKeys]) {
                NSDate * value = attributes[key];
                if(value && [value respondsToSelector:@selector(isEqualToDate:)]) {
                    NSString * stringValue = [self.dateFormatter stringFromDate:value];
                    if(stringValue) {
                        attributes[key] = stringValue;
                    }
                }
            }
            eventJson[@"attributes"] = attributes;
        }
        [events addObject: eventJson];
    }
    json[@"events"] = events;
    
    NSError * error = note.userInfo[@"error"];
    if(error && [error respondsToSelector:@selector(localizedDescription)]) {
        json[@"error"] = [error localizedDescription];
    }
    
    return json;
}

RCT_EXPORT_METHOD(sendEvents) {
    [[MCEEventService sharedInstance] sendEvents];
}

RCT_EXPORT_METHOD(addEvent:(NSDictionary *)eventDictionary immediate: (BOOL)immediate) {
    NSMutableDictionary * mutableEventDictionary = [eventDictionary mutableCopy];
    mutableEventDictionary[@"attributes"] = [self translateAttributes: mutableEventDictionary[@"attributes"]];
    
    MCEEvent * event = [[MCEEvent alloc] init];
    [event fromDictionary: mutableEventDictionary];
    [[MCEEventService sharedInstance] addEvent:event immediate:immediate];
}

#pragma mark SDK - Attributes

-(NSDictionary*) translateAttributeNotification: (NSNotification*)note {
    NSMutableDictionary * json = [NSMutableDictionary dictionary];
    
    NSDictionary * attributes = note.userInfo[@"attributes"];
    if(attributes) {
        NSMutableDictionary * mutableAttributes = [attributes mutableCopy];
        for(NSString * key in [attributes allKeys]) {
            NSDate * value = attributes[key];
            if(value && [value respondsToSelector:@selector(isEqualToDate:)]) {
                NSString * stringValue = [self.dateFormatter stringFromDate:value];
                if(stringValue) {
                    mutableAttributes[key] = stringValue;
                }
            }
        
            
        }
        json[@"attributes"] = mutableAttributes;
    }
    
    NSError * error = note.userInfo[@"error"];
    if(error && [error respondsToSelector:@selector(localizedDescription)]) {
        json[@"error"] = [error localizedDescription];
    }
    
    return json;
}

-(NSDictionary*)translateAttributes: (NSDictionary*)attributes {
    if(attributes) {
        NSMutableDictionary * mutableAttributes = [attributes mutableCopy];
        for (NSString * key in [attributes allKeys]) {
            NSString * value = attributes[key];
            if([value respondsToSelector:@selector(isEqualToString:)]) {
                NSDate * date = [self.dateFormatter dateFromString:value];
                if(date) {
                    mutableAttributes[key] = date;
                }
            }
        }
        return mutableAttributes;
    }
    return attributes;
}

RCT_EXPORT_METHOD(updateUserAttributes:(NSDictionary *)attributes) {
    attributes = [self translateAttributes: attributes];
    [MCEAttributesQueueManager.sharedInstance updateUserAttributes: attributes];
}

RCT_EXPORT_METHOD(deleteUserAttributes:(NSArray *)keys) {
    [MCEAttributesQueueManager.sharedInstance deleteUserAttributes: keys];
}

#pragma mark SDK - Registration

RCT_REMAP_METHOD(registrationDetails, registrationDetailsWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    if(MCERegistrationDetails.sharedInstance.mceRegistered)
    {
        resolve( @{ @"userId": MCERegistrationDetails.sharedInstance.userId, @"channelId": MCERegistrationDetails.sharedInstance.channelId} );
    }
    else
    {
        NSError * error = [NSError errorWithDomain:@"AcousticMobilePush" code:100 userInfo:@{}];
        reject(@"not_registered", @"Not yet registered", error);
    }
}

RCT_EXPORT_METHOD(manualInitialization) {
    if(!MCERegistrationDetails.sharedInstance.mceRegistered) {
        [MCESdk.sharedInstance manualInitialization];
    }
}

RCT_EXPORT_METHOD(requestPushPermission) {
    if([UNUserNotificationCenter class]) {
        [UIApplication.sharedApplication registerForRemoteNotifications];
        
        // iOS 10+ Push Message Registration
        UNUserNotificationCenter * center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = MCENotificationDelegate.sharedInstance;
        NSUInteger options = 0;
#ifdef __IPHONE_12_0
        if(@available(iOS 12.0, *)) {
            options = UNAuthorizationOptionAlert|UNAuthorizationOptionSound|UNAuthorizationOptionBadge|UNAuthorizationOptionCarPlay|UNAuthorizationOptionProvidesAppNotificationSettings;
        }
        else
#endif
        {
            options = UNAuthorizationOptionAlert|UNAuthorizationOptionSound|UNAuthorizationOptionBadge|UNAuthorizationOptionCarPlay;
        }
        [center requestAuthorizationWithOptions: options completionHandler:^(BOOL granted, NSError * _Nullable error) {
            //[center setNotificationCategories: nil];
        }];
    } else if ([UIApplication.sharedApplication respondsToSelector:@selector(registerUserNotificationSettings:)]) {
        // iOS 8+ Push Message Registration
        UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeBadge|UIUserNotificationTypeSound|UIUserNotificationTypeAlert categories: nil];
        [UIApplication.sharedApplication registerUserNotificationSettings:settings];
        [UIApplication.sharedApplication registerForRemoteNotifications];
    } else {
        // iOS < 8 Push Message Registration
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
        UIRemoteNotificationType myTypes = UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeAlert | UIRemoteNotificationTypeSound;
        [UIApplication.sharedApplication registerForRemoteNotificationTypes:myTypes];
#pragma GCC diagnostic pop
    }
}

RCT_EXPORT_METHOD(safeAreaInsets:(RCTResponseSenderBlock)callback) {
    if (@available(iOS 11.0, *)) {
        UIEdgeInsets insets = UIApplication.sharedApplication.keyWindow.safeAreaInsets;
        NSNumber * topInset = insets.top > 20 ? @(insets.top) : @20;
        callback(@[@{@"top": topInset, @"bottom": @(insets.bottom), @"left": @(insets.left), @"right": @(insets.right)}]);
    } else {
        callback(@[@{@"top": @0, @"bottom": @0, @"left": @0, @"right": @0}]);
    }
}

@end
