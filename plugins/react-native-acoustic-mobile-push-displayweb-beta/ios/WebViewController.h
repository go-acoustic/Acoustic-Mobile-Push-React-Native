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
@import UIKit;
@import WebKit;
#else
#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>
#endif

@interface WebViewController : UIViewController <WKUIDelegate, WKNavigationDelegate>
@property (weak, nonatomic) IBOutlet UIProgressView *progressView;
@property (nonatomic) WKWebView *webView;
@property (weak, nonatomic) IBOutlet UIToolbar *toolbar;

- (instancetype)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil url: (NSURL*)url;
@end
