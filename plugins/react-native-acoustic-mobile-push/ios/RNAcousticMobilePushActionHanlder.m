/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePush.h"
#import "RNAcousticMobilePushActionHandler.h"

@implementation RNAcousticMobilePushActionHandler

+ (NSMutableSet *)registeredActions {
    static id registeredActions = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        registeredActions = [NSMutableSet set];
    });
    return registeredActions;
}

+ (NSMutableDictionary *)queuedActions {
    static id queuedActions = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        queuedActions = [NSMutableDictionary dictionary];
    });
    return queuedActions;
}

// MCEActionProtocol
-(void)handleAction:(NSDictionary*)action withPayload: (NSDictionary*)payload {
    if(![NSThread isMainThread]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self handleAction:action withPayload:payload];
        });
        return;
    }
    
    NSString * type = action[@"type"];
    NSDictionary * body = @{ @"action": action, @"payload": payload };
    if([RNAcousticMobilePushActionHandler.registeredActions containsObject: type]) {
        [self sendEventWithName:type body: body];
    } else {
        NSMutableArray * array = RNAcousticMobilePushActionHandler.queuedActions[type];
        if(!array) {
            array = [NSMutableArray array];
            RNAcousticMobilePushActionHandler.queuedActions[type] = array;
        }
        [array addObject: body];
    }
}

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(unregisterAction, name: (NSString*)name) {
    [MCEActionRegistry.sharedInstance unregisterAction:name];
}

RCT_REMAP_METHOD(registerAction, name:(NSString*)name callback: (RCTResponseSenderBlock)callback) {
    [MCEActionRegistry.sharedInstance registerTarget:self withSelector:@selector(handleAction:withPayload:) forAction:name];
    if(![RNAcousticMobilePushActionHandler.registeredActions containsObject:name]) {
        NSMutableArray * array = RNAcousticMobilePushActionHandler.queuedActions[name];
        if(array) {
            dispatch_async(dispatch_get_main_queue(), ^{
                for(NSDictionary * body in array) {
                    callback(@[body]);
                }
            });
        }
    }
    [RNAcousticMobilePushActionHandler.registeredActions addObject:name];
}

- (NSArray<NSString *> *)supportedEvents {
    return [RNAcousticMobilePushActionHandler.registeredActions allObjects];
}

@end
