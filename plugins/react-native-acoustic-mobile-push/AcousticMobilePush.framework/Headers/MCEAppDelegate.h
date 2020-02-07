/*
 * Copyright © 2016, 2019 Acoustic, L.P. All rights reserved.
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

/** The MCEAppDelegate class is used for the simple integration method. It replaces the application delegate in main.m and forwards application delegate callbacks to the class specified in MceConfig.json. This allows for simplified integration because you are not required to manually specify the integration points in the application delegate. */
@interface MCEAppDelegate : UIResponder <UIApplicationDelegate>

/** This is the instance of the developer's application delegate that forwards calls to the MCEAppDelegate instance. */
@property (readonly) id<UIApplicationDelegate> appDelegate;
@end
