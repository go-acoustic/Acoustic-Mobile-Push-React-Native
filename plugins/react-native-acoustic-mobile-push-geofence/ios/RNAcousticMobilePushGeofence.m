/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushGeofence.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

typedef NSNotificationName MCENotificationName NS_STRING_ENUM;
extern MCENotificationName const RefreshActiveGeofences;
extern MCENotificationName const EnteredGeofence;
extern MCENotificationName const ExitedGeofence;

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
@property BOOL geofenceEnabled;
@end

@interface MCESdk : NSObject
@property(class, nonatomic, readonly) MCESdk * sharedInstance NS_SWIFT_NAME(shared);
@property (nonatomic) MCEConfig* config;
@end

@interface RNAcousticMobilePushGeofence()
@property BOOL listenersSetup;
@end

@implementation RNAcousticMobilePushGeofence

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
        
        [center addObserverForName: RefreshActiveGeofences object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName: RefreshActiveGeofences body:@{ }];
        }];
        
        [center addObserverForName: EnteredGeofence object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName: EnteredGeofence body:@{ @"id": [note.userInfo[@"region"] identifier] }];
        }];
        
        [center addObserverForName: ExitedGeofence object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName: ExitedGeofence body:@{ @"id": [note.userInfo[@"region"] identifier] }];
        }];
    }
    return @[RefreshActiveGeofences, EnteredGeofence, ExitedGeofence];
}

- (NSDictionary *)constantsToExport {
    return @{ };
}

RCT_REMAP_METHOD(geofencesNearCoordinate, lattitude:(double) latitude longitude: (double) longitude radius:(int)radius geofencesNearCoordinateWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableSet * monitoredRegionIds = [NSMutableSet set];
    CLLocationManager * locationManager = [[CLLocationManager alloc] init];
    for (CLRegion * region in locationManager.monitoredRegions) {
        [monitoredRegionIds addObject:region.identifier];
    }
    
    NSSet * geofences = [MCELocationDatabase.sharedInstance geofencesNearCoordinate:CLLocationCoordinate2DMake(latitude, longitude) radius:radius];
    NSMutableArray * geofence_return = [NSMutableArray array];
    for (MCEGeofence * geofence in geofences) {
        BOOL active = [monitoredRegionIds containsObject: geofence.locationId];
        [geofence_return addObject: @{@"latitude": @(geofence.latitude), @"longitude": @(geofence.longitude), @"radius": @(geofence.radius), @"id": geofence.locationId, @"active": @(active) } ];
    }
    resolve( geofence_return );
}

@end
