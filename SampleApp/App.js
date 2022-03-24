/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { HomeScreen } from './screens/Home/home-screen.component';
import { RegistrationScreen } from './screens/Registration/registration-screen.component';
import { InboxScreen } from './screens/Inbox/inbox-screen.component';
import { InAppScreen } from './screens/InApp/inapp-screen.component';
import { SendTestEventScreen } from './screens/SendTestEvent/send-test-event-screen.component';
import { SendUserAttributeScreen } from './screens/SendUserAttributes/send-user-attirbutes-screen.component';
import { CustomActionScreen } from './screens/CustomAction/custom-action-screen.component';
import { GeofenceScreen } from './screens/Geofence/geofence-screen.component';
import { iBeaconScreen } from './screens/iBeacon/ibeacon-screen.component';
import { InboxMessageScreen } from './screens/Inbox/Message/inbox-message-screen.component';

// InApp Actions/Templates modules must be imported in order to register with the system
import './components/in-app/in-app-banner';
import './components/in-app/in-app-media';
import './custom-actions/send-email-action';
import './components/inbox/default-inbox-template';
import './components/inbox/post-inbox-template';
import './components/inbox/inbox-action';

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
  InboxMessage: InboxMessageScreen,
});

const App = createAppContainer(MainNavigator);

export default App;
