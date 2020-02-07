/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
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

/** The MCECallbackDatabaseManager class is used to queue callbacks in the Cordova plugin until the JavaScript callback methods are registered with the SDK. */

@interface MCECallbackDatabaseManager : NSObject

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCECallbackDatabaseManager * sharedInstance NS_SWIFT_NAME(shared);

/** The insertCallback:dictionary: method inserts a callback into the database.
 
 @param callback A name of a callback, later used to retrieve the callback
 @param dictionary A dictionary describing the callback, must be composed of only simple types so NSJSONSerialization can serialize it
 */
- (void) insertCallback:(NSString *) callback dictionary: (NSDictionary*)dictionary;

/** The deleteCallbacksById: method removes the specified callback ids from the database.
 
 @param callbackIds a list of ids returned by selectCallbacks:withBlock: to be removed from the database
 */
- (void) deleteCallbacksById:(NSArray*)callbackIds;

/** The selectCallbacks:withBlock: method returns the original callback dictionaries and a list of associated IDs.
 
 @param callback A name of the callback, used when calling insertCallback:dictionary:
 @param block a code block to execute when callbacks are retrieved from the database
 */

/*
 @param dictionaries an array of dictionaries that were inserted into the databases
 @param ids an array of ids that can be used to clear these callbacks with deleteCallbacksById:
 */
- (void) selectCallbacks: (NSString *) callback withBlock :(void (^)(NSArray * dictionaries, NSArray * ids))block;

@end
