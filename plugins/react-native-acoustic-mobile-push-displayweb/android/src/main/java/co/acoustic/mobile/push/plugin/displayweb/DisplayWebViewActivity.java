/*
 * Copyright © 2011, 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

package co.acoustic.mobile.push.plugin.displayweb;

import android.app.Activity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebView;
import android.webkit.WebViewClient;


/**
 * This is the display url activity. It contains a web view and 3 buttons: back, forward and done, which closes the activity.
 */
public class DisplayWebViewActivity extends Activity {

    private WebView webView;
    private int actionBackId;
    private int actionForwardId;
    private int actionDoneId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        actionBackId = getResources().getIdentifier("action_back", "id", getPackageName());
        actionForwardId = getResources().getIdentifier("action_forward", "id", getPackageName());
        actionDoneId = getResources().getIdentifier("action_done", "id", getPackageName());

        super.onCreate(savedInstanceState);
        setTheme(android.R.style.Theme_Holo);
        int layoutId = getResources().getIdentifier("activity_action_webview", "layout", getPackageName());
        setContentView(layoutId);
        setTitle(""); // clear the title
        String url = getIntent().getStringExtra("url");
        int webViewId = getResources().getIdentifier("webView", "id", getPackageName());
        webView = (WebView) findViewById(webViewId);
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl(url);
    }

    /**
     * This method inflates the menu
     * @param menu The menu
     * @return
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        int menuId = getResources().getIdentifier("menu_action_webview", "menu", getPackageName());
        getMenuInflater().inflate(menuId, menu);
        return true;
    }

    /**
     * This method handles a menu selection (back, forward or done).
     * @param item The selected menu item (back, forward or done).
     * @return
     */
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {

        int id = item.getItemId();

        if (id == actionBackId) {
            webView.goBack();
            return true;
        } else if (id == actionForwardId) {
            webView.goForward();
            return true;
        } else if (id == actionDoneId) {
            finish();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
