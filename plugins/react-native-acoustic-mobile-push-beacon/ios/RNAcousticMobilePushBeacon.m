/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushBeacon.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

typedef NSNotificationName MCENotificationName NS_STRING_ENUM;
extern MCENotificationName const EnteredBeacon;
extern MCENotificationName const ExitedBeacon;

@interface MCELocationDatabase : NSObject
@property(class, nonatomic, readonly) MCELocationDatabase * sharedInstance NS_SWIFT_NAME(shared);
-(NSMutableSet*)geofencesNearCoordinate: (CLLocationCoordinate2D)coordinate radius: (double)radius;
-(NSMutableSet*)beaconRegions;
@end

@interface MCEArea : NSObject
@property double radius;
@property (readonly) double latitude;
@property (readonly) double longitude;
@property (readonly) CLLocationCoordinate2D coordinate;
@end

@interface MCEGeofence : MCEArea
@property NSString * locationId;
@property BOOL isCustom;
@property (readonly) CLCircularRegion * region;
@end

@interface MCEConfig
@property(class, nonatomic, readonly) MCEConfig * sharedInstance NS_SWIFT_NAME(shared);
@property BOOL beaconEnabled;
@property NSUUID * beaconUUID;
@end

@interface MCESdk : NSObject
@property(class, nonatomic, readonly) MCESdk * sharedInstance NS_SWIFT_NAME(shared);
@property (nonatomic) MCEConfig* config;
@end

@interface RNAcousticMobilePushBeacon()
@property BOOL listenersSetup;
@end

@implementation RNAcousticMobilePushBeacon

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
        
        [center addObserverForName: EnteredBeacon object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName: EnteredBeacon body:@{ @"id": note.userInfo[@"locationId"], @"major": note.userInfo[@"major"],  @"major": note.userInfo[@"minor"] }];
        }];
        
        [center addObserverForName: ExitedBeacon object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName: ExitedBeacon body:@{ @"id": note.userInfo[@"locationId"], @"major": note.userInfo[@"major"],  @"major": note.userInfo[@"minor"] }];
        }];
    }
    return @[ EnteredBeacon, ExitedBeacon ];
}

- (NSDictionary *)constantsToExport {
    MCEConfig * config = MCESdk.sharedInstance.config;
    return @{ @"uuid": config.beaconUUID ? [config.beaconUUID UUIDString] : [NSNull null] };
}

RCT_REMAP_METHOD(beaconRegions, beaconRegionsWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableArray * beaconRegions = [NSMutableArray array];
    NSSet * regions = [[MCELocationDatabase sharedInstance] beaconRegions];
    for (CLBeaconRegion * region in regions) {
        [beaconRegions addObject: @{@"major": region.major, @"id": region.identifier}];
    }
    resolve(beaconRegions);
}

@end
