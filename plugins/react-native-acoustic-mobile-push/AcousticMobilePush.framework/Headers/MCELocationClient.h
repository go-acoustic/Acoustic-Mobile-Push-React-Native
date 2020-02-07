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
@import UIKit;
#else
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#endif

#import "MCEClient.h"

/**
 The MCELocationClient syncronizes geofences and iBeacons to montior with the server.
 */
@interface MCELocationClient : MCEClient  <NSURLSessionDelegate, NSURLSessionDownloadDelegate>

/** Fetch completion handler to be executed after sync. */
@property (nonatomic, copy) void (^fetchCompletionHandler)(UIBackgroundFetchResult);

/**
 This method handles the background download of the location updates from the server.
 
 @param identifier is passed from the application delegate callback.
 @param completionHandler is passed from the application delegate callback.
 */
-(BOOL)handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)(void))completionHandler;

/** This method schedules a sync to the server. */
-(void)scheduleSync;

@end
