/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "RNAcousticMobilePushCalendar.h"

#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@protocol MCEActionProtocol <NSObject>
@optional
-(void)configureAlertTextField:(UITextField*)textField;
@end

@interface MCEActionRegistry : NSObject
@property(class, nonatomic, readonly) MCEActionRegistry * sharedInstance NS_SWIFT_NAME(shared);
-(BOOL)registerTarget:(NSObject <MCEActionProtocol> *)target withSelector:(SEL)selector forAction:(NSString*)type;
@end

@interface RNAcousticMobilePushCalendar()
@property NSString * calendarActionModule;
@end
@implementation RNAcousticMobilePushCalendar


RCT_EXPORT_METHOD(registerPlugin:(NSString*)module) {
    self.calendarActionModule = module;
    MCEActionRegistry * registry = [MCEActionRegistry sharedInstance];
    [registry registerTarget: self withSelector:@selector(performAction:) forAction: @"calendar"];
}

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

- (NSDictionary *)constantsToExport {
    return @{};
}

-(EKEvent*) generateEvent: (NSDictionary*)action store: (EKEventStore *)store {
    EKEvent * event = [EKEvent eventWithEventStore: store];
    event.calendar=store.defaultCalendarForNewEvents;
    
    NSISO8601DateFormatter * formatter = [[NSISO8601DateFormatter alloc] init];

    if(action[@"value"][@"title"]) {
        event.title=action[@"value"][@"title"];
    } else {
        NSLog(@"No title, could not add to calendar");
        return nil;
    }
    
    if(action[@"value"][@"timeZone"]) {
        event.timeZone=[NSTimeZone timeZoneWithAbbreviation: action[@"value"][@"timeZone"]];
    }
    
    if(action[@"value"][@"startDate"]) {
        event.startDate = [formatter dateFromString: action[@"value"][@"startDate"]];
    } else {
        NSLog(@"No startDate, could not add to calendar");
        return nil;
    }
    
    if(action[@"value"][@"endDate"]) {
        event.endDate = [formatter dateFromString: action[@"value"][@"endDate"]];
    } else {
        NSLog(@"No endDate, could not add to calendar");
        return nil;
    }
    
    if(action[@"value"][@"description"]) {
        event.notes=action[@"value"][@"description"];
    }
    
    return event;
}

-(void)interactivelyAddEvent: (EKEvent*)event store: (EKEventStore*)store {
    EKEventEditViewController *controller = [[EKEventEditViewController alloc] init];
    controller.event = event;
    controller.eventStore = store;
    controller.editViewDelegate = self;
    
    UIWindow * window = [[UIApplication sharedApplication] keyWindow];
    [window.rootViewController presentViewController:controller animated:TRUE completion:nil];
}

-(void) addEvent: (EKEvent*)event store: (EKEventStore*)store {
    NSError * saveError = nil;
    BOOL success = [store saveEvent: event span:EKSpanThisEvent commit:TRUE error:&saveError];
    if(saveError) {
        NSLog(@"Could not save to calendar %@", [saveError localizedDescription]);
    }
    
    if(!success) {
        NSLog(@"Could not save to calendar");
    }
}

-(void)performAction:(NSDictionary*)action {

    if(!self.calendarActionModule) {
        NSLog(@"Calendar Action Module is not registered, can not show calendar interface!");
        return;
    }

    EKEventStore *store = [[EKEventStore alloc] init];
    [store requestAccessToEntityType:EKEntityTypeEvent completion:^(BOOL granted, NSError *error) {
        if(error) {
            NSLog(@"Could not add to calendar %@", [error localizedDescription]);
            return;
        }
        if(!granted) {
            NSLog(@"Could not get access to EventKit, can't add to calendar");
            return;
        }
        
        EKEvent * event = [self generateEvent:action store:store];
        if(event) {
            if([action[@"value"][@"interactive"] boolValue]) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self interactivelyAddEvent: event store:store];
                });
            } else {
                [self addEvent:event store:store];
            }
        }
    }];
}

- (void)eventEditViewController:(EKEventEditViewController *)controller didCompleteWithAction:(EKEventEditViewAction)action {
    switch (action) {
        case  EKEventEditViewActionCanceled:
            NSLog(@"Event was not added to calendar");
            break;
        case EKEventEditViewActionSaved:
            NSLog(@"Event was added to calendar");
            break;
        case EKEventEditViewActionDeleted:
            NSLog(@"Event was deleted from calendar");
            break;
            
        default:
            break;
    }
    UIWindow * window = [[UIApplication sharedApplication] keyWindow];
    [window.rootViewController dismissViewControllerAnimated:YES completion:nil];
}

@end


