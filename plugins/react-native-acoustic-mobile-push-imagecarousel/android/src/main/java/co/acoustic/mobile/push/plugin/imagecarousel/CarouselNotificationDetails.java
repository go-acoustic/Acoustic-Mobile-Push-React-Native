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
import co.acoustic.mobile.push.sdk.api.notification.Expandable;
import co.acoustic.mobile.push.sdk.api.notification.MceNotificationPayload;
import co.acoustic.mobile.push.sdk.api.notification.NotificationDetails;
import co.acoustic.mobile.push.sdk.util.property.Property;

import java.util.Arrays;
import java.util.List;

public class CarouselNotificationDetails implements NotificationDetails {

    @Property
    private String subject;
    @Property
    private String message;
    @Property
    private String notificationUUID;
    @Property
    private int carouselIndex;
    @Property
    private String payload;
    @Property
    private String group;
    @Property
    private String attribution;
    @Property
    private String mailingId;
    @Property
    private boolean sensitive;
    @Property
    private boolean highPriority;
    @Property
    private boolean soundEnabled;
    @Property
    private Integer soundResourceId;
    @Property
    private boolean vibrateEnabled;
    @Property
    private long[] vibratePattern;
    @Property
    private boolean lightsEnabled;
    @Property
    private int[] lights;
    @Property
    private int number;

    private MceNotificationPayload mceNotificationPayload;

    public CarouselNotificationDetails() {
    }

    public CarouselNotificationDetails(NotificationDetails notificationDetails, String notificationUUID, int carouselIndex) {
        this.subject = notificationDetails.getSubject();
        this.message = notificationDetails.getMessage();
        this.notificationUUID = notificationUUID;
        this.carouselIndex = carouselIndex;
        this.payload = notificationDetails.getPayload();
        this.group = notificationDetails.getMceNotificationPayload().getGroup();
        this.attribution = notificationDetails.getMceNotificationPayload().getAttribution();
        this.mailingId = notificationDetails.getMceNotificationPayload().getMailingId();
        this.sensitive = notificationDetails.isSensitive();
        this.highPriority = notificationDetails.isHighPriority();
        this.soundEnabled = notificationDetails.isSoundEnabled();
        this.soundResourceId = notificationDetails.getSoundResourceId();
        this.vibrateEnabled = notificationDetails.isVibrateEnabled();
        this.vibratePattern = notificationDetails.getVibratePattern();
        this.lightsEnabled = notificationDetails.isLightsEnabled();
        this.lights = notificationDetails.getLights();
        this.number = notificationDetails.getNumber();
        this.mceNotificationPayload = notificationDetails.getMceNotificationPayload();
    }

    public String getSubject() {
        return subject;
    }

    public String getMessage() {
        return message;
    }

    public String getNotificationUUID() {
        return notificationUUID;
    }

    public int getCarouselIndex() {
        return carouselIndex;
    }

    public String getPayload() {
        return payload;
    }

    public String getGroup() {
        return group;
    }

    public String getAttribution() {
        return attribution;
    }

    @Override
    public String getType() {
        return null;
    }


    @Override
    public Action getAction() {
        return null;
    }

    @Override
    public String getIconUrl() {
        return null;
    }

    @Override
    public Expandable getExpandable() {
        return null;
    }

    @Override
    public MceNotificationPayload getMceNotificationPayload() {
        if(mceNotificationPayload == null) {
            mceNotificationPayload = new MceNotificationPayload() {
                @Override
                public String getAttribution() {
                    return attribution;
                }

                @Override
                public String getMailingId() {
                    return mailingId;
                }

                @Override
                public String getGroup() {
                    return group;
                }

                @Override
                public List<AlertActionEntry> getAlertActionEntries() {
                    return null;
                }
            };
        }
        return mceNotificationPayload;
    }

    @Override
    public boolean isSensitive() {
        return sensitive;
    }

    @Override
    public boolean isHighPriority() {
        return highPriority;
    }

    @Override
    public boolean isSoundEnabled() {
        return soundEnabled;
    }

    @Override
    public Integer getSoundResourceId() {
        return soundResourceId;
    }

    @Override
    public boolean isVibrateEnabled() {
        return vibrateEnabled;
    }

    @Override
    public long[] getVibratePattern() {
        return vibratePattern;
    }

    @Override
    public boolean isLightsEnabled() {
        return lightsEnabled;
    }

    @Override
    public int[] getLights() {
        return lights;
    }

    @Override
    public int getNumber() {
        return number;
    }

    public void setCarouselIndex(int carouselIndex) {
        this.carouselIndex = carouselIndex;
    }

    @Override
    public String toString() {
        return "CarouselNotificationDetails{" +
                "subject='" + subject + '\'' +
                ", message='" + message + '\'' +
                ", notificationUUID='" + notificationUUID + '\'' +
                ", carouselIndex=" + carouselIndex +
                ", payload='" + payload + '\'' +
                ", group='" + group + '\'' +
                ", attribution='" + attribution + '\'' +
                ", mailingId='" + mailingId + '\'' +
                ", sensitive=" + sensitive +
                ", highPriority=" + highPriority +
                ", soundEnabled=" + soundEnabled +
                ", soundResourceId=" + soundResourceId +
                ", vibrateEnabled=" + vibrateEnabled +
                ", vibratePattern=" + Arrays.toString(vibratePattern) +
                ", lightsEnabled=" + lightsEnabled +
                ", lights=" + Arrays.toString(lights) +
                ", number=" + number +
                '}';
    }
}
