/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#if TARGET_OS_WATCH

#if __has_feature(modules)
@import Foundation;
#else
#import <Foundation/Foundation.h>
#endif

#else

#if __has_feature(modules)
@import UIKit;
#else
#import <UIKit/UIKit.h>
#endif

#endif

/** This class extension is used to translate an html color representation to a UIColor. */
@interface UIColor (fromHex)

/** This method is used to translate an html color representation to a UIColor. */
+(UIColor*)colorWithHexString:(NSString*)hex;

/** This method can be used to toggle between two different colors depending on the current system theme. Remember that this only returns the curent value, if the style is changed by the user you will need to refresh the interface  and call this method again. */
+(instancetype) lightThemeColor: (UIColor *) light darkThemeColor: (UIColor *) dark;

@end
