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
@import Foundation;
#else
#import <Foundation/Foundation.h>
#endif

/** The MCEConstants header contains several important SDK integration constants */

/** The MCESdkVersion constant contains the current release number */
extern NSString * const MCESdkVersion;

typedef NSNotificationName MCENotificationName NS_STRING_ENUM;

/** The MCERegisteredNotification message is sent via NSNotificationCenter when the SDK registers with the Acoustic servers */
extern MCENotificationName const MCERegisteredNotification;

/** The MCERegistrationChangedNotification message is sent via NSNotificationCenter when the userId or channelId change durring the phone home process */
extern MCENotificationName const MCERegistrationChangedNotification;

/** The MCEEventSuccess message is sent via NSNotificationCenter when events are successfully sent to the server */
extern MCENotificationName const MCEEventSuccess;

/** The MCEEventSuccess message is sent via NSNotificationCenter when events fail to send to the server. No action is required by the developer, the system will automatically retry with back-off. */
extern MCENotificationName const MCEEventFailure;

/** The SetUserAttributesError message is sent via NSNotificationCenter when Set User Attributes fails to send to the server. No action is required by the developer, the system will automatically retry with back-off. */
extern MCENotificationName const SetUserAttributesError;

/** The SetUserAttributesSuccess message is sent via NSNotificationCenter when Set User Attributes is successfully sent to the server */
extern MCENotificationName const SetUserAttributesSuccess;

/** The UpdateUserAttributesError message is sent via NSNotificationCenter when Update User Attributes fails to send to the server. No action is required by the developer, the system will automatically retry with back-off. */
extern MCENotificationName const UpdateUserAttributesError;

/** The UpdateUserAttributesSuccess message is sent via NSNotificationCenter when Update User Attributes is successfully sent to the server */
extern MCENotificationName const UpdateUserAttributesSuccess;

/** The DeleteUserAttributesError message is sent via NSNotificationCenter when Delete User Attributes fails to send to the server. No action is required by the developer, the system will automatically retry with back-off. */
extern MCENotificationName const DeleteUserAttributesError;

/** The DeleteUserAttributesSuccess message is sent via NSNotificationCenter when Delete User Attributes is successfully sent to the server */
extern MCENotificationName const DeleteUserAttributesSuccess;

/** The SetChannelAttributesError message is sent via NSNotificationCenter when Set Channel Attributes fails to send to the server. No action is required by the developer, the system will automatically retry with back-off. */
extern MCENotificationName const SetChannelAttributesError;

/** The SetChannelAttributesSuccess message is sent via NSNotificationCenter when Set Channel Attributes is successfully sent to the server */
extern MCENotificationName const SetChannelAttributesSuccess;

/** The UpdateChannelAttributesError message is sent via NSNotificationCenter when Update Channel Attributes fails to send to the server. No action is required by the developer, the system will automatically retry with back-off. */
extern MCENotificationName const UpdateChannelAttributesError;

/** The UpdateChannelAttributesSuccess message is sent via NSNotificationCenter when Update Channel Attributes is successfully sent to the server */
extern MCENotificationName const UpdateChannelAttributesSuccess;

/** The DeleteChannelAttributesError message is sent via NSNotificationCenter when Delete Channel Attributes fails to send to the server. No action is required by the developer, the system will automatically retry with back-off. */
extern MCENotificationName const DeleteChannelAttributesError;

/** The DeleteChannelAttributesSuccess message is sent via NSNotificationCenter when Delete Channel Attributes is successfully sent to the server */
extern MCENotificationName const DeleteChannelAttributesSuccess;

/** The Event type reported for simple notification actions */
extern NSString * const SimpleNotificationSource;

/** The Event type reported for inbox notification actions */
extern NSString * const InboxSource;

/** The Event type reported for inbox notification actions */
extern NSString * const InAppSource;

/** The LocationDatabaseReady message is sent when the location database is ready to be used. */
extern MCENotificationName const LocationDatabaseReady;

extern MCENotificationName const LocationDatabaseUpdated;

/* The EnteredGeofence message is sent when a geofence has been breached */
extern MCENotificationName const EnteredGeofence;

/* The EnteredGeofence message is sent when a geofence has been left */
extern MCENotificationName const ExitedGeofence;

/** The EnteredBeacon message is sent when a beacon region has been breached */
extern MCENotificationName const EnteredBeacon;

/** The ExitedBeacon message is sent when a beacon region has been left */
extern MCENotificationName const ExitedBeacon;

/** The DownloadedLocations message is sent when locations updates are downloaded from the server. */
extern MCENotificationName const DownloadedLocations;

/** The ResetReferenceLocation message is sent when the reference location has changed. */
extern MCENotificationName const ResetReferenceLocation;

/** The RefreshActiveGeofences message is sent when the active geofences have changed. */
extern MCENotificationName const RefreshActiveGeofences;

/** The InboxCountUpdate is sent when the number of inbox messages changes or the unread count of messages changes. */
extern MCENotificationName const InboxCountUpdate;

/** Called when the Inbox Database has been changed */
extern MCENotificationName const MCESyncDatabase;

/** Called when a custom action is opened by a user but is not registered in the application */
extern MCENotificationName const MCECustomPushNotRegistered;

/** Called when a custom action is opened by a user but is not registered in the application, but was previously registered in the application */
extern MCENotificationName const MCECustomPushNotYetRegistered;
