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
@import UIKit;
#else
#import <UIKit/UIKit.h>
#endif

@class MCEInboxMessage;

/** The MCEWebViewActionDelegate class provides a UIWebViewDelegate that can respond to actionid: scheme actions tied to the MCEActionRegistry. */
@interface MCEWebViewActionDelegate : NSObject <UIWebViewDelegate>

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCEWebViewActionDelegate * sharedInstance NS_SWIFT_NAME(shared);

/** The actions that should be responded to. In the format of actionid -> { action dictionary }. */
@property NSDictionary * actions;

/** Source to be reported in event reporting. */
@property NSString * eventSource;

/** Additional attributes to be included in event reporting. */
@property NSDictionary * eventAttributes;

/** Payload of message to be included in event reporting. */
@property NSDictionary * eventPayload;

/** Convenience method for setting properties for inbox messages */
-(void)configureForSource:(NSString*)source inboxMessage:(MCEInboxMessage*)inboxMessage actions:(NSDictionary*)actions;

/** Convenience method for setting properties */
-(void)configureForSource:(NSString*)source attributes:(NSDictionary*)attributes attribution: (NSString*)attribution actions:(NSDictionary*)actions;

/** Convenience method for setting properties */
-(void)configureForSource:(NSString*)source attributes:(NSDictionary*)attributes attribution: (NSString*)attribution mailingId: (NSString*)mailingId actions:(NSDictionary*)actions;

@end
