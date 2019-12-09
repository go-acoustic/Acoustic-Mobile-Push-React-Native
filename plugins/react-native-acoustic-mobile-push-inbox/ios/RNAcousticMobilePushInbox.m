/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushInbox.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

typedef NSNotificationName MCENotificationName NS_STRING_ENUM;
extern MCENotificationName const InboxCountUpdate;
extern MCENotificationName const MCESyncDatabase;
extern NSString * const InboxSource;

@interface MCEActionRegistry : NSObject
@property(class, nonatomic, readonly) MCEActionRegistry * sharedInstance NS_SWIFT_NAME(shared);
-(BOOL)registerTarget:(NSObject <MCEActionProtocol> *)target withSelector:(SEL)selector forAction:(NSString*)type;
-(void)performAction:(NSDictionary*)action forPayload:(NSDictionary*)payload source: (NSString*) source attributes:(NSDictionary*)attributes userText: (NSString*)userText;
@end

@interface MCEInboxMessage : NSObject
@property NSString * inboxMessageId;
@property NSDictionary * content;
@property NSString * richContentId;
@property NSDate * expirationDate;
@property NSDate * sendDate;
@property NSString * templateName;
@property NSString * attribution;
@property NSString * mailingId;
@property BOOL isRead;
@property BOOL isDeleted;
@property (readonly) BOOL isExpired;
@end

typedef void (^MCEMessageCallback)(MCEInboxMessage *message, NSError* error);
@interface MCEInboxQueueManager : NSObject
@property(class, nonatomic, readonly) MCEInboxQueueManager * sharedInstance NS_SWIFT_NAME(shared);
-(void)syncInbox;
-(void)getInboxMessageId:(NSString*)inboxMessageId completion:(MCEMessageCallback)callback;
@end

@interface MCEInboxDatabase : NSObject
@property(class, nonatomic, readonly) MCEInboxDatabase * sharedInstance NS_SWIFT_NAME(shared);
-(NSMutableArray<MCEInboxMessage *> *)inboxMessagesAscending:(BOOL)ascending;
-(MCEInboxMessage*)inboxMessageWithInboxMessageId:(NSString*)inboxMessageId;
-(MCEInboxMessage*)inboxMessageWithRichContentId:(NSString*)richContentId;
-(void)clearExpiredMessages;
-(int) unreadMessageCount;
-(int) messageCount;
@end

@interface MCEConfig
@property(class, nonatomic, readonly) MCEConfig * sharedInstance NS_SWIFT_NAME(shared);
@end

@interface MCESdk : NSObject
@property(class, nonatomic, readonly) MCESdk * sharedInstance NS_SWIFT_NAME(shared);
@property (nonatomic) MCEConfig* config;
@end

@interface RNAcousticMobilePushInbox()
@property BOOL listenersSetup;
@property NSString * inboxActionModule;
@property UIWindow * inboxWindow;
@property RCTRootView * inboxView;
@property UIViewController * inboxViewController;
@end

@implementation RNAcousticMobilePushInbox

-(void)openInboxMessageAction: (NSDictionary*)action payload: (NSDictionary*)payload {
    if(!self.inboxActionModule) {
        NSLog(@"Inbox Action Module is not registered, can not show message interface!");
        return;
    }
    
    MCEInboxMessage * inboxMessage = [[MCEInboxDatabase sharedInstance] inboxMessageWithInboxMessageId: action[@"inboxMessageId"]];
    if(inboxMessage) {
        [self showInboxMessage: inboxMessage];
    } else {
        [MCEInboxQueueManager.sharedInstance getInboxMessageId:action[@"inboxMessageId"] completion:^(MCEInboxMessage *inboxMessage, NSError *error) {
            if(error) {
                NSLog(@"Could not get inbox message from database %@", error);
                return;
            }
            [self showInboxMessage: inboxMessage];
        } ];
    }
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(hideInbox) {
    if(![NSThread isMainThread]) {
        [self performSelectorOnMainThread:@selector(hideInbox) withObject:nil waitUntilDone:true];
        return;
    }

    if(self.inboxWindow) {
        [self.inboxWindow removeFromSuperview];
        self.inboxWindow = nil;
    }
    if(self.inboxView) {
        [self.inboxView removeFromSuperview];
        self.inboxView = nil;
    }
    self.inboxViewController = nil;
}

-(void)showInboxMessage: (MCEInboxMessage *) inboxMessage {
    if(![NSThread isMainThread]) {
        [self performSelectorOnMainThread:@selector(showInboxMessage:) withObject:inboxMessage waitUntilDone:true];
        return;
    }
    [self hideInbox];
    UIWindow * currentWindow = UIApplication.sharedApplication.keyWindow;
    CGRect rect = currentWindow.frame;
    
    CGFloat statusHeight = UIApplication.sharedApplication.statusBarFrame.size.height;
    rect.origin = CGPointMake(0, statusHeight);
    rect.size.height -= statusHeight;

    self.inboxViewController = [[UIViewController alloc] init];
    self.inboxWindow = [[UIWindow alloc] initWithFrame:rect];
    self.inboxWindow.rootViewController = self.inboxViewController;

    NSDictionary * inboxMessageJson = [self inboxMessageToJson: inboxMessage];
    NSDictionary * properties = @{ @"message": inboxMessageJson };
    
    rect.origin = CGPointZero;
    self.inboxView = [[RCTRootView alloc] initWithBridge:self.bridge moduleName:self.inboxActionModule initialProperties: properties];
    self.inboxViewController.view = self.inboxView;
    
    self.inboxView.frame = rect;
    self.inboxWindow.windowLevel = UIWindowLevelAlert;
    self.inboxWindow.hidden = false;
    self.inboxWindow.backgroundColor = UIColor.clearColor;
    self.inboxView.backgroundColor = UIColor.clearColor;
    
    return;
}

RCT_EXPORT_METHOD(registerInboxComponent:(NSString*)module) {
    self.inboxActionModule = module;
    
    [MCEActionRegistry.sharedInstance registerTarget: self withSelector:@selector(openInboxMessageAction:payload:) forAction:@"openInboxMessage"];
}

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
        
        [center addObserverForName:MCESyncDatabase object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName:@"SyncInbox" body:note.userInfo];
        }];

        [center addObserverForName:InboxCountUpdate object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName: InboxCountUpdate body:@{}];
        }];
        
    }
    return @[ @"SyncInbox", InboxCountUpdate ];
}

- (NSDictionary *)constantsToExport {
    return @{ };
}

#pragma mark Inbox

RCT_EXPORT_METHOD(inboxMessageCount:(RCTResponseSenderBlock)callback) {
    int unreadCount = [[MCEInboxDatabase sharedInstance] unreadMessageCount];
    int messageCount = [[MCEInboxDatabase sharedInstance] messageCount];
    callback(@[ @{@"messages": @(messageCount), @"unread": @(unreadCount)} ]);
}

RCT_EXPORT_METHOD(deleteInboxMessage: (NSString*)inboxMessageId) {
    MCEInboxMessage * inboxMessage = [[MCEInboxDatabase sharedInstance] inboxMessageWithInboxMessageId:inboxMessageId];
    if(inboxMessage) {
        inboxMessage.isDeleted=TRUE;
        [self sendEventWithName:@"SyncInbox" body:@{}];
    }
}

RCT_EXPORT_METHOD(readInboxMessage: (NSString*)inboxMessageId) {
    MCEInboxMessage * inboxMessage = [[MCEInboxDatabase sharedInstance] inboxMessageWithInboxMessageId:inboxMessageId];
    if(inboxMessage) {
        inboxMessage.isRead=TRUE;
    }
}

RCT_EXPORT_METHOD(syncInboxMessages)
{
    [MCEInboxQueueManager.sharedInstance syncInbox];
}

-(NSDictionary*)inboxMessageToJson:(MCEInboxMessage*)inboxMessage {
  NSMutableDictionary * dictionary = [@{
    @"content": inboxMessage.content,
    @"expirationDate": @([inboxMessage.expirationDate timeIntervalSince1970] * 1000),
    @"sendDate": @([inboxMessage.sendDate timeIntervalSince1970] * 1000),
    @"templateName": inboxMessage.templateName,
    @"isRead": @(inboxMessage.isRead),
    @"isDeleted": @(inboxMessage.isDeleted),
    @"isExpired": @(inboxMessage.isExpired)
  } mutableCopy];
  if(inboxMessage.inboxMessageId) {
    dictionary[@"inboxMessageId"] = inboxMessage.inboxMessageId;
  }
  if(inboxMessage.richContentId) {
    dictionary[@"richContentId"] = inboxMessage.richContentId;
  }
  if(inboxMessage.attribution) {
    dictionary[@"attribution"] = inboxMessage.attribution;
  }
  if(inboxMessage.mailingId) {
    dictionary[@"mailingId"] = inboxMessage.mailingId;
  }
  
  return dictionary;
}

RCT_EXPORT_METHOD(listInboxMessages: (BOOL) direction callback:(RCTResponseSenderBlock)callback)
{
    NSArray * inboxMessages = [MCEInboxDatabase.sharedInstance inboxMessagesAscending:direction];
    NSMutableArray * jsonInboxMessages = [NSMutableArray array];
    for (MCEInboxMessage * inboxMessage in inboxMessages) {
        [jsonInboxMessages addObject: [self inboxMessageToJson:inboxMessage]];
    }
    callback(@[jsonInboxMessages]);
}

RCT_EXPORT_METHOD(clickInboxAction: (NSDictionary*) action inboxMessageId: (NSString*)inboxMessageId) {
    MCEInboxMessage *inboxMessage = [[MCEInboxDatabase sharedInstance] inboxMessageWithInboxMessageId:inboxMessageId];
    
    NSDictionary * payload = @{@"mce": [NSMutableDictionary dictionary]};
    if(inboxMessage.attribution) {
        payload[@"mce"][@"attribution"] = inboxMessage.attribution;
    }
    if(inboxMessage.mailingId) {
        payload[@"mce"][@"mailingId"] = inboxMessage.mailingId;
    }
    
    NSMutableDictionary * attributes = [NSMutableDictionary dictionary];
    if(inboxMessage.richContentId) {
        attributes[@"richContentId"] = inboxMessage.richContentId;
    }
    if(inboxMessage.inboxMessageId) {
        attributes[@"inboxMessageId"] = inboxMessage.inboxMessageId;
    }
    
    [MCEActionRegistry.sharedInstance performAction:action forPayload:payload source:InboxSource attributes:attributes userText:nil];
}

@end


