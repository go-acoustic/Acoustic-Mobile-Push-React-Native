/*
 * Copyright © 2026 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import <UIKit/UIKit.h>

/**
 * Scene delegate (Info.plist UIApplicationSceneManifest). Apps built with the iOS 27 SDK must adopt
 * the UIScene life cycle or iOS refuses to launch them. MCEAppDelegate (main.m) still owns the
 * UIApplicationDelegate callbacks for push; this class only owns the window React Native renders into.
 */
@interface SceneDelegate : UIResponder <UIWindowSceneDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
