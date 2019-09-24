/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushLocation.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@interface MCELocationClient: NSObject
-(void)scheduleSync;
@end

typedef NSNotificationName MCENotificationName NS_STRING_ENUM;
extern MCENotificationName const DownloadedLocations;

@interface MCEConfig
@property(class, nonatomic, readonly) MCEConfig * sharedInstance NS_SWIFT_NAME(shared);
@property BOOL geofenceEnabled;
@end

@interface MCESdk : NSObject
@property(class, nonatomic, readonly) MCESdk * sharedInstance NS_SWIFT_NAME(shared);
@property (nonatomic) MCEConfig* config;
-(void)manualLocationInitialization;
@end

@interface RNAcousticMobilePushLocation()
@property BOOL listenersSetup;
@end

@implementation RNAcousticMobilePushLocation

+(void)initialize {
}

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}

- (NSArray<NSString *> *)supportedEvents {
    if(!self.listenersSetup) {
        self.listenersSetup = true;

        NSNotificationCenter * center = [NSNotificationCenter defaultCenter];
        
        [center addObserverForName: DownloadedLocations object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName: DownloadedLocations body:@{ }];
        }];
    }
    return @[ DownloadedLocations ];
}

- (NSDictionary *)constantsToExport {
    return @{ };
}

RCT_EXPORT_METHOD(locationStatus:(RCTResponseSenderBlock)callback) {
    MCEConfig * config = MCESdk.sharedInstance.config;
    if(config.geofenceEnabled) {
        switch(CLLocationManager.authorizationStatus) {
            case kCLAuthorizationStatusDenied:
                callback(@[@"denied"]);
                break;
            case kCLAuthorizationStatusNotDetermined:
                callback(@[@"delayed"]);
                break;
            case kCLAuthorizationStatusAuthorizedAlways:
                callback(@[@"always"]);
                break;
            case kCLAuthorizationStatusRestricted:
                callback(@[@"restricted"]);
                break;
            case kCLAuthorizationStatusAuthorizedWhenInUse:
                callback(@[@"enabled"]);
                break;
        }
    } else {
        callback(@[@"disabled"]);
    }
}

RCT_EXPORT_METHOD(enableLocation) {
    [MCESdk.sharedInstance manualLocationInitialization];
}

RCT_EXPORT_METHOD(syncLocations) {
    [[[MCELocationClient alloc] init] scheduleSync];
}

@end


