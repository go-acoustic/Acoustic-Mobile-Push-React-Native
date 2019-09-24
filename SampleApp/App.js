/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

'use strict';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import {Platform, NativeEventEmitter} from 'react-native';
import {HomeScreen} from './screens/home-screen';
import {RegistrationScreen} from './screens/registration-screen';
import {InboxScreen} from './screens/inbox-screen';
import {InAppScreen} from './screens/inapp-screen';
import {SendTestEventScreen} from './screens/send-test-event-screen';
import {SendUserAttributeScreen} from './screens/send-user-attirbutes-screen';
import {CustomActionScreen} from './screens/custom-action-screen';
import {GeofenceScreen} from './screens/geofence-screen';
import {iBeaconScreen} from './screens/ibeacon-screen';
import {InboxMessageScreen} from './screens/inbox-message-screen';


// InApp Templates modules must be imported before used
import {InAppBanner} from './in-app/in-app-banner';
import {inAppMedia} from './in-app/in-app-media';

// Custom action modules must be imported in order to register with the system
import {SendEmailAction} from './custom-actions/send-email-action';

// Inbox Templates modules must be imported before used
import {DefaultInbox} from './inbox/default-inbox-template';
import {PostInbox} from './inbox/post-inbox-template';
import {InboxAction} from './inbox/inbox-action';

const MainNavigator = createStackNavigator({
	Home: HomeScreen,
	Registration: RegistrationScreen,
	Inbox: InboxScreen,
	InApp: InAppScreen,
	CustomActions: CustomActionScreen,
	SendTestEvents: SendTestEventScreen,
	SendUserAttributes: SendUserAttributeScreen,
	Geofences: GeofenceScreen,
	iBeacons: iBeaconScreen,
	InboxMessage: InboxMessageScreen
});

const App = createAppContainer(MainNavigator);

export default App;