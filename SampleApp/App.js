/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import React from 'react';
import { NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import { Touchable } from './helpers/Touchable';

const { RNAcousticMobilePushInbox, RNAcousticMobilePushInApp, RNAcousticMobilePushLocation } = NativeModules;

// Header "sync" button shared by the Inbox, In-App, Geofence and Beacon screens.
const syncButton = (onPress, testID) => () => (
  <Touchable onPress={onPress} testID={testID}>
    <Icon name="sync" color="#000" size={24} />
  </Touchable>
);
const inboxSyncButton = syncButton(() => RNAcousticMobilePushInbox.syncInboxMessages(), 'campaign_inbox_sync');
const inAppSyncButton = syncButton(() => RNAcousticMobilePushInApp.syncInAppMessages(), 'campaign_inapp_sync');
const geofencesSyncButton = syncButton(() => RNAcousticMobilePushLocation.syncLocations(), 'campaign_geofences_sync');
const ibeaconsSyncButton = syncButton(() => RNAcousticMobilePushLocation.syncLocations(), 'campaign_ibeacons_sync');

// InApp Actions/Templates modules must be imported in order to register with the system
import './components/in-app/in-app-banner';
import './components/in-app/in-app-media';
import './custom-actions/send-email-action';
import './components/inbox/default-inbox-template';
import './components/inbox/post-inbox-template';
import './components/inbox/inbox-action';

const Stack = createNativeStackNavigator();

// gesture-handler 2.x components (TextInput on the event screens) need this root view
const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Sample App' }} />
        <Stack.Screen name="Registration" component={RegistrationScreen} options={{ title: 'Registration' }} />
        <Stack.Screen name="Inbox" component={InboxScreen} options={{ title: 'Inbox Messages', headerRight: inboxSyncButton }} />
        <Stack.Screen name="InApp" component={InAppScreen} options={{ title: 'InApp Messages', headerRight: inAppSyncButton }} />
        <Stack.Screen name="CustomActions" component={CustomActionScreen} options={{ title: 'Custom Action' }} />
        <Stack.Screen name="SendTestEvents" component={SendTestEventScreen} options={{ title: 'Send Events' }} />
        <Stack.Screen name="SendUserAttributes" component={SendUserAttributeScreen} options={{ title: 'Send User Attributes' }} />
        <Stack.Screen name="Geofences" component={GeofenceScreen} options={{ title: 'Geofences', headerRight: geofencesSyncButton }} />
        <Stack.Screen name="iBeacons" component={iBeaconScreen} options={{ title: 'Beacons', headerRight: ibeaconsSyncButton }} />
        <Stack.Screen name="InboxMessage" component={InboxMessageScreen} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  </GestureHandlerRootView>
);

export default App;
