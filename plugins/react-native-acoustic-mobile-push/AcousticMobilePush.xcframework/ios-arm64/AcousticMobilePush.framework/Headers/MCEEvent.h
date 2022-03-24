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

/** The MCEEvent class represents events to be sent to the server via the MCEEventService class. */
@interface MCEEvent : NSObject

/** The type property is used to set the type value of the event. */
@property NSString *type;

/** The name property is used to set the name value of the event. */
@property NSString *name;

/** The timestamp property is used to set the timestamp value of the event. */
@property NSDate *timestamp;

/** The attributes property is used to set the attributes value of the event. */
@property NSDictionary *attributes;

/** The attribution property is used to set the attribution value of the event. */
@property NSString *attribution;

/** The mailingId property is used to set the mailingId value of the event. The value should be either an NSNumber or an NSString that holds a number. Other values will be rejected. */
@property id mailingId;

/** When the event was sent to the server */
@property NSDate * sent;

/** The toDictionary method is used to return the contents of the MCEEvent object as a dictionary. */
- (NSDictionary*)toDictionary;

/** The fromDictionary: method is used to set the attributes of the event via a dictionary. */
- (void) fromDictionary:(NSDictionary*) dictionary;

/** This method initializes an event with a name and a type.
 
 @param name defines the name value of the event.
 @param type defines the type value of the event.
 */
-(instancetype)initWithName: (NSString*)name type:(NSString*)type;

/** This method initializes an event with a name, type and timestamp.
 
 @param name defines the name value of the event.
 @param type defines the type value of the event.
 @param timestamp defines the timestamp value of the event.
 */
-(instancetype)initWithName: (NSString*)name type:(NSString*)type timestamp:(NSDate*)timestamp;

/** This method initializes an event with a name, type, timestamp and attributes.
 
 @param name defines the name value of the event.
 @param type defines the type value of the event.
 @param timestamp defines the timestamp value of the event.
 @param attributes defines the attributes value of the event.
 */
-(instancetype)initWithName: (NSString*)name type:(NSString*)type timestamp:(NSDate*)timestamp attributes:(NSDictionary*)attributes;

/** This method initializes an event with a name, type, timestamp, attributes and attribution.
 
 @param name defines the name value of the event.
 @param type defines the type value of the event.
 @param timestamp defines the timestamp value of the event.
 @param attributes defines the attributes value of the event.
 @param attribution defines the attribution value of the event.
 */
-(instancetype)initWithName: (NSString*)name type:(NSString*)type timestamp:(NSDate*)timestamp attributes:(NSDictionary*)attributes attribution: (NSString*)attribution;

/** This method initializes an event with a name, type, timestamp, attributes, attribution and mailingId.
 
 @param name defines the name value of the event.
 @param type defines the type value of the event.
 @param timestamp defines the timestamp value of the event.
 @param attributes defines the attributes value of the event.
 @param attribution defines the attribution value of the event.
 @param mailingId defines the mailingId value of the event.
 */
-(instancetype)initWithName: (NSString*)name type:(NSString*)type timestamp:(NSDate*)timestamp attributes:(NSDictionary*)attributes attribution: (NSString*)attribution mailingId: (id)mailingId;

@end

