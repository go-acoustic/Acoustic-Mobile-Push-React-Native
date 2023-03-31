/*
 * Copyright © 2022, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushImageCarousel.h"

@protocol MCEActionProtocol <NSObject>
@optional
-(void)configureAlertTextField:(UITextField*)textField;
@end

@interface MCEActionRegistry : NSObject
@property(class, nonatomic, readonly) MCEActionRegistry * sharedInstance NS_SWIFT_NAME(shared);
-(BOOL)registerTarget:(NSObject <MCEActionProtocol> *)target withSelector:(SEL)selector forAction:(NSString*)type;
@end

@interface RNAcousticMobilePushImageCarousel()
@property BOOL listenersSetup;
@property NSString * imageCarouselActionModule;
@end

@implementation RNAcousticMobilePushImageCarousel
RCT_EXPORT_MODULE()

-(void)performAction:(NSDictionary*)action withPayload:(NSDictionary*)payload {

    if(!self.imageCarouselActionModule) {
        NSLog(@"Image Carousel Action Module is not registered, can not show Image Carousel interface!");
        return;
    }

    NSNumber * selectedNumber = action[@"value"];
    if(!selectedNumber) {
        NSString * message = [NSString stringWithFormat: @"User Clicked Image or Notification"];
        UIAlertController * alertController = [UIAlertController alertControllerWithTitle:@"Carousel Plugin" message: message preferredStyle: UIAlertControllerStyleAlert];
        [alertController addAction: [UIAlertAction actionWithTitle:@"Okay" style:UIAlertActionStyleDefault handler:nil]];
        UIWindow * window = [[UIApplication sharedApplication] keyWindow];
        [window.rootViewController presentViewController:alertController animated:TRUE completion:nil];
        return;
    }
    int selected = [selectedNumber intValue];
    NSDictionary * carousel = payload[@"carousel"];
    if(!carousel || ![carousel isKindOfClass: NSDictionary.class]) {
        NSLog(@"Can't find carousel dictionary.");
        return;
    }

    NSArray * items = carousel[@"items"];
    if(!items || ![items isKindOfClass: NSArray.class]) {
        NSLog(@"Can't find items array.");
        return;
    }
    NSDictionary * item = items[selected];
    if(!item || ![item isKindOfClass:NSDictionary.class]) {
        NSLog(@"Can't find item dictionary.");
        return;
    }
    
    NSString * message = [NSString stringWithFormat: @"User Choose %@", item[@"text"]];
    UIAlertController * alertController = [UIAlertController alertControllerWithTitle:@"Carousel Plugin" message: message preferredStyle: UIAlertControllerStyleAlert];
    [alertController addAction: [UIAlertAction actionWithTitle:@"Okay" style:UIAlertActionStyleDefault handler:nil]];
    UIWindow * window = [[UIApplication sharedApplication] keyWindow];
    [window.rootViewController presentViewController:alertController animated:TRUE completion:nil];
}

RCT_EXPORT_METHOD(registerPlugin:(NSString*)module) {
    self.imageCarouselActionModule = module;
    MCEActionRegistry * registry = [MCEActionRegistry sharedInstance];
    [registry registerTarget: self withSelector:@selector(performAction:withPayload:) forAction: @"carousel"];
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

        [center addObserverForName:@"CarouselClickEvent" object:nil queue:NSOperationQueue.mainQueue usingBlock:^(NSNotification * _Nonnull note) {
            if(!self.bridge) {
                return;
            }
            [self sendEventWithName:@"CarouselClickEvent" body:@{}];
        }];
    }
    return @[ @"CarouselClickEvent" ];
}

- (NSDictionary *)constantsToExport {
    return @{};
}

@end
