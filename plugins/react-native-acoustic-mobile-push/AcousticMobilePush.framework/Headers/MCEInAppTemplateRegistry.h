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

#import "MCEInAppTemplate.h"

/** The MCEInAppTemplateRegistry class is used to tie inApp template names to display handlers. */
@interface MCEInAppTemplateRegistry : NSObject

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCEInAppTemplateRegistry * sharedInstance NS_SWIFT_NAME(shared);

/** The registerTemplate:handler: method records a specific object to handle templates of the specified name.
 
 @param templateName An identifier that this template can handle.
 @param handler The template that provides the display objects. Must implement the MCEInAppTemplate protocol.
 @return Returns TRUE if the template was able to register and FALSE otherwise.
 */
-(BOOL) registerTemplate:(NSString*)templateName hander:(NSObject<MCEInAppTemplate>*)handler;


/** The handlerForTemplate: method returns the registered handler for the specified template name.
 
 @param templateName An identifier tying a template name to an object that handles it.
 @return Returns the template handler object.
 */
-(id<MCEInAppTemplate>) handlerForTemplate:(NSString*)templateName;
@end
