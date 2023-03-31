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
    
    WKWebViewConfiguration * configuration = [[WKWebViewConfiguration alloc] init];
    self.webView = [[WKWebView alloc] initWithFrame:CGRectZero configuration:configuration];
    self.webView.translatesAutoresizingMaskIntoConstraints = false;
    self.webView.UIDelegate = self;
    self.webView.navigationDelegate = self;
    [self.webView addObserver:self forKeyPath:@"estimatedProgress" options:NSKeyValueObservingOptionNew context:nil];
    [self.view addSubview: self.webView];
    
    NSDictionary * views = @{@"webView": self.webView, @"toolbar": self.toolbar, @"progressView": self.progressView};
    NSMutableArray * constraints = [NSMutableArray array];
    [constraints addObjectsFromArray: [NSLayoutConstraint constraintsWithVisualFormat:@"H:|-0-[webView]-0-|" options:0 metrics:nil views:views]];

    [constraints addObjectsFromArray: [NSLayoutConstraint constraintsWithVisualFormat:@"V:[progressView]-0-[webView]-0-|" options:0 metrics:nil views:views]];

    [NSLayoutConstraint activateConstraints: constraints];
}

- (void)viewWillAppear:(BOOL)animated {
    NSURLRequest * request = [NSURLRequest requestWithURL: self.url];
    [self.webView loadRequest:request];
    [super viewWillAppear:animated];
}

- (instancetype)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil url: (NSURL*)url {
    if(self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil]) {
        self.url = url;
    }
    return self;
}

-(IBAction)dismiss:(id)sender {
    [self dismissViewControllerAnimated:TRUE completion:nil];
}

-(void)presentLoadingError: (NSError*)error {
    UIAlertController * alert = [UIAlertController alertControllerWithTitle:@"Failed to load web content" message:error.localizedDescription preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction: [UIAlertAction actionWithTitle:@"Okay" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [alert dismissViewControllerAnimated:true completion:nil];
    }]];
    [self presentViewController:alert animated:true completion: nil];
}

#pragma mark WKNavigationDelegate methods

- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation {
    self.progressView.progress = 0;
    [self.progressView setHidden:false];
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    [self.progressView setHidden:true];
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    [self.progressView setHidden:true];
    [self presentLoadingError:error];
}

- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    [self.progressView setHidden:true];
    [self presentLoadingError:error];
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context {
    if([keyPath isEqual: @"estimatedProgress"]) {
        self.progressView.progress = self.webView.estimatedProgress;
    }
}

@end
