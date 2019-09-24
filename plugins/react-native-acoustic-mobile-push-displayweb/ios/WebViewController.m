/*
 * Copyright © 2014, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

#import "WebViewController.h"

@interface WebViewController ()
@property NSURL * url;
@end

@implementation WebViewController

-(void)loadView {
    [super loadView];
    
    UIToolbar * toolbar = [[UIToolbar alloc] initWithFrame: CGRectZero];
    toolbar.translatesAutoresizingMaskIntoConstraints = false;
    
    UIBarButtonItem * spacer = [[UIBarButtonItem alloc] initWithBarButtonSystemItem: UIBarButtonSystemItemFlexibleSpace target: nil action: nil];
    UIBarButtonItem * dismiss = [[UIBarButtonItem alloc] initWithBarButtonSystemItem: UIBarButtonSystemItemDone target: self action: @selector(dismiss:)];
    toolbar.items = @[spacer, dismiss];
    [self.view addSubview: toolbar];
    
    UIWebView * webView = [[UIWebView alloc] initWithFrame:CGRectZero];
    webView.translatesAutoresizingMaskIntoConstraints = false;
    [webView loadRequest: [NSURLRequest requestWithURL: self.url]];
    webView.delegate=self;
    
    [self.view addSubview: webView];
    self.view.backgroundColor = [UIColor whiteColor];
    
    NSDictionary * views = @{ @"webView": webView, @"toolbar": toolbar };
    
    [self.view addConstraints: [NSLayoutConstraint constraintsWithVisualFormat:@"H:|-0-[webView]-0-|" options:0 metrics: nil views: views]];
    [self.view addConstraints: [NSLayoutConstraint constraintsWithVisualFormat:@"H:|-0-[toolbar]-0-|" options:0 metrics: nil views: views]];
    [self.view addConstraints: [NSLayoutConstraint constraintsWithVisualFormat:@"V:|-[toolbar]-[webView]-0-|" options:0 metrics: nil views: views]];
}

-(instancetype)initWithURL:(NSURL*)url {
    if(self=[super init]) {
        self.url = url;
    }
    return self;
}

-(IBAction)dismiss:(id)sender
{
    [self dismissViewControllerAnimated:TRUE completion:nil];
}

@end
