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
import { Text, View, Image, ScrollView, NativeModules, Platform, Alert } from 'react-native';
import { ListItem } from 'react-native-elements';
import { styles } from '../../styles';
import { RNAcousticMobilePushEmitter, RNAcousticMobilePushInboxEmitter, RNAcousticMobilePushImageCarouselEmitter, RNAcousticMobilePushBeaconEmitter } from '../../helpers/eventEmitters';
import { INBOX_COUNT_UPDATE, REGISTERED, CAROUSEL_CLICK_EVENT, ENTERED_BEACON, EXITED_BEACON } from '../../enums/events';

const {
  RNAcousticMobilePush,
  RNAcousticMobilePushInbox,
  RNAcousticMobilePushSnooze,
  RNAcousticMobilePushDisplayWeb,
  RNAcousticMobilePushCalendar,
  RNAcousticMobilePushActionMenu,
  RNAcousticMobilePushWallet,
  RNAcousticMobilePushImageCarousel,
} = NativeModules;

export class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Sample App',
  };

  state = { messages: '', unread: '', subscriptions: [] };

  update() {
    RNAcousticMobilePushInbox.inboxMessageCount((counts) => {
      this.setState(counts);
    });
  }

  componentDidMount() {
    RNAcousticMobilePush.requestPushPermission();

    if (Platform.OS == 'ios') {
      RNAcousticMobilePushSnooze.registerPlugin("SnoozeAction");
      RNAcousticMobilePushDisplayWeb.registerPlugin("DisplayWebAction");
      RNAcousticMobilePushCalendar.registerPlugin("CalendarAction");
      RNAcousticMobilePushActionMenu.registerPlugin("ActionMenuAction");
      RNAcousticMobilePushWallet.registerPlugin("WalletAction");
      RNAcousticMobilePushImageCarousel.registerPlugin("CarouselAction");
    }

    // Test setIcon, only needed for Android
    if (Platform.OS === 'android') {
      RNAcousticMobilePush.setIcon('ic_stat_note')
        .then(() => console.log('Notification icon set successfully'))
        .catch((error) => console.error('Failed to set notification icon:', error));
    }

    this.update();

    this.setState({
      subscriptions: [
        RNAcousticMobilePushEmitter.addListener(REGISTERED, () => {
          RNAcousticMobilePushInbox.syncInboxMessages();
        }),
        RNAcousticMobilePushInboxEmitter.addListener(INBOX_COUNT_UPDATE, () => {
          this.update();
        }),
        RNAcousticMobilePushImageCarouselEmitter.addListener(CAROUSEL_CLICK_EVENT, (e) => {
          Alert.alert(
            e.dialogTitle,
            e.dialogMsg,
            [
              { text: "Okay", onPress: () => {} }
            ]
          );
        }),
        RNAcousticMobilePushBeaconEmitter.addListener(ENTERED_BEACON, (detail) => { /*NO-OP*/ }),
        RNAcousticMobilePushBeaconEmitter.addListener(EXITED_BEACON, (detail) => { /*NO-OP*/ })
      ]
    });
  }

  componentWillUnmount() {
    const { subscriptions } = this.state;

    subscriptions.forEach((subscription) => subscription.remove());
  }

  render() {
    const { messages, unread } = this.state;
    const { navigation: { navigate } } = this.props;

    return (
      <ScrollView style={styles.scrollView}>
        <View style={{ alignItems: 'center', padding: 10 }}>
          <Image style={{ marginTop: 20 }} source={require('../../images/logo.png')} />
          <Image style={{ marginTop: 20 }} source={require('../../images/campaign.png')} />
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Acoustic Mobile Push Sample App</Text>
          <Text>
            Native SDK v
            {RNAcousticMobilePush.sdkVersion}
          </Text>
          <Text style={{ marginBottom: 20 }}>
            React Native Plugin v3.9.35
            {/* Update version here instead of {RNAcousticMobilePush.pluginVersion} */}
          </Text>
        </View>
        <ListItem bottomDivider onPress={() => navigate('Registration')}>
          <ListItem.Content>
            <ListItem.Title>Registration Details</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => navigate('Inbox')}>
          <ListItem.Content>
            <ListItem.Title>Inbox</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => navigate('InApp')}>
          <ListItem.Content>
            <ListItem.Title>InApp</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => navigate('CustomActions')}>
          <ListItem.Content>
            <ListItem.Title>Custom Actions</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => navigate('SendTestEvents')}>
          <ListItem.Content>
            <ListItem.Title>Send Test Events</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => navigate('SendUserAttributes')}>
          <ListItem.Content>
            <ListItem.Title>Send User Attributes</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider onPress={() => navigate('Geofences')}>
          <ListItem.Content>
            <ListItem.Title>Geofences</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <ListItem bottomDivider
          onPress={() => navigate('iBeacons')}>
          <ListItem.Content>
            <ListItem.Title>iBeacons</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </ScrollView>
    );
  }
}