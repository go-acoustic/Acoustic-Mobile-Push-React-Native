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
@import CoreLocation;
#else
#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#endif

/** The MCEArea class represents a geographic area. */
@interface MCEArea : NSObject

/** radius represents the size of the geographic area from the center to edge in meters */
@property double radius;

/** latitude represents the latitude at the center of the geographic area */
@property (readonly) double latitude;

/** longitude represents the longitude at the center of the geographic area */
@property (readonly) double longitude;

/** coordinate represents the center point of the geographic area */
@property (readonly) CLLocationCoordinate2D coordinate;

@end
