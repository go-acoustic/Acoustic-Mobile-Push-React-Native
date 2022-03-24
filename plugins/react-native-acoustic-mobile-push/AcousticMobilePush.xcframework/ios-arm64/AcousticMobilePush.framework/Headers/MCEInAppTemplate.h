/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */


@class MCEInAppMessage;

/** The MCEInAppTemplate protocol specifies the required methods for templates to register with the MCEInAppTemplateRegistry. */
@protocol MCEInAppTemplate <NSObject>

/** The displayInAppMessage: method configures your view controller to display the specified message and present the message to the user. */
-(void) displayInAppMessage:(MCEInAppMessage*)message;

/** The registerTemplate method registers this template with the MCEInAppTemplateRegistry. */
+(void) registerTemplate;

@end

