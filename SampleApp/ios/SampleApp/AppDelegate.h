/*
 * Copyright © 2019, 2026 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import <UIKit/UIKit.h>

@class RCTReactNativeFactory;

/**
 * React Native 0.87 application delegate built on RCTReactNativeFactory (New Architecture).
 *
 * The process is started by the Acoustic Campaign SDK's MCEAppDelegate (see main.m), which
 * instantiates this class (MceConfig.json `appDelegateClass`) and forwards UIApplicationDelegate
 * callbacks to it. `reactNativeFactory` must stay exposed: the in-app and inbox plugins use its
 * rootViewFactory to render their JS templates. `window` is set by SceneDelegate.
 */
@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong, readonly) RCTReactNativeFactory *reactNativeFactory;

@end
