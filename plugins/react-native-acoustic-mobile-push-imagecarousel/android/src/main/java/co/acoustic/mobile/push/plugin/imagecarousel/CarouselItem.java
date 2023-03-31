/*
 * Copyright © 2022, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */
 
package co.acoustic.mobile.push.plugin.imagecarousel;

import co.acoustic.mobile.push.sdk.api.notification.Action;

public class CarouselItem {

    private String imageUrl;
    private Action action;

    public CarouselItem(String imageUrl, Action action) {
        this.imageUrl = imageUrl;
        this.action = action;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Action getAction() {
        return action;
    }
}
