/*
 * Copyright © 2026 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "SceneDelegate.h"

#import "AppDelegate.h"

#import <React/RCTLinkingManager.h>
#import <React/RCTReactNativeFactory.h>

// The application delegate is MCEAppDelegate, which forwards to AppDelegate (MceConfig.json `appDelegateClass`).
@interface NSObject (MCEAppDelegateForwarding)
- (id)appDelegate;
@end

@implementation SceneDelegate

- (AppDelegate *)reactAppDelegate
{
  id delegate = UIApplication.sharedApplication.delegate;
  if ([delegate isKindOfClass:[AppDelegate class]]) {
    return delegate;
  }
  if ([delegate respondsToSelector:@selector(appDelegate)]) {
    id inner = [delegate appDelegate];
    if ([inner isKindOfClass:[AppDelegate class]]) {
      return inner;
    }
  }
  return nil;
}

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  AppDelegate *appDelegate = [self reactAppDelegate];
  self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  appDelegate.window = self.window;
  [appDelegate.reactNativeFactory startReactNativeWithModuleName:@"SampleApp" inWindow:self.window];

  // URLs that cold-launch the app arrive here instead of application:openURL:options:.
  [self scene:scene openURLContexts:connectionOptions.URLContexts];
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
  for (UIOpenURLContext *context in URLContexts) {
    [RCTLinkingManager application:UIApplication.sharedApplication openURL:context.URL options:@{}];
  }
}

@end
