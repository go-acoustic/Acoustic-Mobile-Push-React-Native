/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "MCETemplate.h"

/** The MCETemplateRegistry class is used to specify the template names for which a template class can provide previews and full screen displays. */

@interface MCETemplateRegistry : NSObject

/** This method returns the singleton object of this class. */
@property(class, nonatomic, readonly) MCETemplateRegistry * sharedInstance NS_SWIFT_NAME(shared);

/** The registerTemplate:handler: method records a specific object to handle templates of the specified name.
 
 @param templateName An identifier that this template can handle.
 @param handler The template that provides the preview cells and full page display objects. Must implement the MCETemplate protocol.
 @return Returns TRUE if the template can register and FALSE otherwise.
*/
-(BOOL) registerTemplate:(NSString*)templateName hander:(NSObject<MCETemplate>*)handler;

/** The viewControllerForTemplate: method returns a view controller for the specified template name. This queries the registered template object for the view controller to display the full screen content.
 
 @param templateName An identifier tying a template name to an object that handles it.
 */
-(id<MCETemplateDisplay>) viewControllerForTemplate: (NSString*)templateName;


/** The handlerForTemplate: method returns the registered handler for the specified template name.

 @param templateName An identifier tying a template name to an object that handles it.
 @return Returns the template handler object.
 */
-(id<MCETemplate>) handlerForTemplate: (NSString*)templateName;

@end
