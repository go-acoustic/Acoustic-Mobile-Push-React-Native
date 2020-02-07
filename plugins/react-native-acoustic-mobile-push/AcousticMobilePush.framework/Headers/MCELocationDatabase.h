/*
 * Copyright © 2016, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */


#if __has_feature(modules)
@import Foundation;
@import CoreLocation;
#else
#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#endif


/** MCELocationDatabase manages the database that holds the synced locations from the server. */
@interface MCELocationDatabase : NSObject

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCELocationDatabase * sharedInstance NS_SWIFT_NAME(shared);

/** This method returns the nearby sycned geofences from the server. */
-(NSMutableSet*)geofencesNearCoordinate: (CLLocationCoordinate2D)coordinate radius: (double)radius;

#if !TARGET_OS_UIKITFORMAC
/** This method returns the beacon regions synced from the server. */
-(NSMutableSet*)beaconRegions;
#endif

@end
