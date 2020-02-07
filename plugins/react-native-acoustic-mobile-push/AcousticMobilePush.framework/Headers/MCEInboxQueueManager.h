/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */


@class MCEInboxMessage;
typedef void (^MCEMessageCallback)(MCEInboxMessage *message, NSError* error);

/** The MCEInboxQueueManager class queues and executes tasks serially to the inbox server. */
@interface MCEInboxQueueManager : NSObject

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCEInboxQueueManager * sharedInstance NS_SWIFT_NAME(shared);

/** The syncInbox method adds a sync task to the queue. First, it connects to the server to download inbox message updates. Next, it updates the local MCEInboxDatabase store. After the update is complete, it sends an NSNotification with the MCESyncDatabase name, and the MCEInboxTableViewController refreshes its contents. Note - only a single sync task is added to the queue at a time. Additional tasks are not added regardless if you make multiple calls while the task is queued or running. */
-(void)syncInbox;

/** This method will pull a speific message from the database if it's available, if not available it will retrieve the message from the server.
 @param inboxMessageId The string that uniquely identifies the message.
 @param callback Callback that is called with the message object or an error object.
 */
-(void)getInboxMessageId:(NSString*)inboxMessageId completion:(MCEMessageCallback)callback;

@end
