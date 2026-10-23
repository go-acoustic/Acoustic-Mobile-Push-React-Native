/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
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

// React Native >= 0.76 (New Architecture / bridgeless): root views must be created through the host application's
// RCTRootViewFactory. The factory is reached through the application delegate (MCEAppDelegate proxies to the real
// delegate via `appDelegate`, which exposes `reactNativeFactory`).
@protocol RNAcousticMobilePushRootViewHost <NSObject>
@optional
- (id)appDelegate;
- (id)reactNativeFactory;
- (id)rootViewFactory;
- (UIView *)viewWithModuleName:(NSString *)moduleName initialProperties:(NSDictionary *)initialProperties;
@end

static UIView * RNAcousticMobilePushCreateRootView(NSString * moduleName, NSDictionary * properties) {
    id<RNAcousticMobilePushRootViewHost> delegate = (id<RNAcousticMobilePushRootViewHost>)UIApplication.sharedApplication.delegate;
    if ([delegate respondsToSelector:@selector(appDelegate)]) {
        id inner = [delegate appDelegate];
        if (inner) {
            delegate = inner;
        }
    }
    id<RNAcousticMobilePushRootViewHost> factory = nil;
    if ([delegate respondsToSelector:@selector(reactNativeFactory)]) {
        factory = [delegate reactNativeFactory];
    }
    id<RNAcousticMobilePushRootViewHost> rootViewFactory = nil;
    if ([factory respondsToSelector:@selector(rootViewFactory)]) {
        rootViewFactory = [factory rootViewFactory];
    } else if ([delegate respondsToSelector:@selector(rootViewFactory)]) {
        rootViewFactory = [delegate rootViewFactory];
    }
    if ([rootViewFactory respondsToSelector:@selector(viewWithModuleName:initialProperties:)]) {
        return [rootViewFactory viewWithModuleName:moduleName initialProperties:properties];
    }
    RCTLogError(@"RNAcousticMobilePush: no RCTRootViewFactory found on the application delegate. The AppDelegate must expose `reactNativeFactory` (RCTReactNativeFactory); RCTAppDelegate subclasses do this automatically. React Native 0.76 or newer is required.");
    return nil;
}

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

@interface MCEEventService
@property(class, nonatomic, readonly) MCEEventService * sharedInstance NS_SWIFT_NAME(shared);
-(void)recordViewForInboxMessage:(MCEInboxMessage * _Nonnull)inboxMessage attribution: (NSString * _Nullable)attribution mailingId: (NSNumber * _Nullable)mailingId;
@end

@interface RNAcousticMobilePushInbox()
@property BOOL listenersSetup;
@property NSString * inboxActionModule;
@property UIWindow * inboxWindow;
@property UIView * inboxView;
@property UIViewController * inboxViewController;
@end

// Overlay windows must be attached to the app's foreground window scene. A window created with -initWithFrame: belongs
// to no scene, so in UIScene-based apps (required when building with the iOS 27 SDK) it is never shown.
static UIWindowScene * RNAcousticMobilePushForegroundWindowScene(void) {
    UIWindowScene * inactiveScene = nil;
    for (UIScene * scene in UIApplication.sharedApplication.connectedScenes) {
        if (![scene isKindOfClass:UIWindowScene.class]) {
            continue;
        }
        if (scene.activationState == UISceneActivationStateForegroundActive) {
            return (UIWindowScene *)scene;
        }
        if (!inactiveScene && scene.activationState == UISceneActivationStateForegroundInactive) {
            inactiveScene = (UIWindowScene *)scene;
        }
    }
    return inactiveScene;
}

static UIWindow * RNAcousticMobilePushHostWindow(UIWindowScene * scene) {
    for (UIWindow * window in scene.windows) {
        if (window.isKeyWindow) {
            return window;
        }
    }
    return scene.windows.firstObject;
}

static UIWindow * RNAcousticMobilePushCreateOverlayWindow(UIWindowScene * scene, CGRect frame) {
    UIWindow * window = [[UIWindow alloc] initWithWindowScene:scene];
    window.frame = frame;
    return window;
}

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
        self.inboxWindow.hidden = true;
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
    UIWindowScene * windowScene = RNAcousticMobilePushForegroundWindowScene();
    UIWindow * currentWindow = RNAcousticMobilePushHostWindow(windowScene);
    if (!windowScene || !currentWindow) {
        NSLog(@"No foreground window scene, can not show inbox message %@", inboxMessage.inboxMessageId);
        return;
    }
    [self hideInbox];
    CGRect rect = currentWindow.frame;
    
    // Only the status bar is excluded here. The bottom safe-area inset is applied by the
    // SafeAreaView that wraps InboxAction (javascript/inbox-action.js); subtracting it here too
    // would leave a double gap above the home indicator.
    CGFloat statusHeight = windowScene.statusBarManager.statusBarFrame.size.height;
    rect.origin = CGPointMake(0, statusHeight);
    rect.size.height -= statusHeight;

    self.inboxViewController = [[UIViewController alloc] init];
    self.inboxWindow = RNAcousticMobilePushCreateOverlayWindow(windowScene, rect);
    self.inboxWindow.rootViewController = self.inboxViewController;

    NSDictionary * inboxMessageJson = [self inboxMessageToJson: inboxMessage];
    NSDictionary * properties = @{ @"message": inboxMessageJson };
    
    rect.origin = CGPointZero;
    self.inboxView = RNAcousticMobilePushCreateRootView(self.inboxActionModule, properties);
    if (!self.inboxView) {
        self.inboxWindow.hidden = true;
        self.inboxWindow = nil;
        self.inboxViewController = nil;
        return;
    }
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
        [[MCEEventService sharedInstance] recordViewForInboxMessage:inboxMessage attribution:inboxMessage.attribution mailingId:inboxMessage.mailingId];
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


