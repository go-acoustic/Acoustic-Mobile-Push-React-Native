/*
 * Copyright © 2017, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */


#if __has_feature(modules)
@import Foundation;
#else
#import <Foundation/Foundation.h>
#endif

@class MCEDatabase;

#import "MCEArea.h"

/**
 MCEGeofence represents a circular geographic region that is synced from the server
 */
@interface MCEGeofence : MCEArea

/**
 locationId represents the unique key for this iBeacon on the server.
 */
@property NSString * locationId;

/**
 isCustom is true if the geofence is defined by behavior and false otherwise.
 */
@property BOOL isCustom;

/**
 region provides a core location circular region for the geofence.
 */
@property (readonly) CLCircularRegion * region;

@end
