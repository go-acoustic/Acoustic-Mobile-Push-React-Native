/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import React from 'react';
import { Text, View, Image, ScrollView, NativeModules } from 'react-native';
import { ListItem } from 'react-native-elements';
import { styles } from '../styles';
import { SubscribedComponent } from './subscribed-component';
import { RNAcousticMobilePushEmitter, RNAcousticMobilePushInboxEmitter } from '../helpers/eventEmitters';
import { INBOX_COUNT_UPDATE, REGISTERED } from '../enums/events';

const {
  RNAcousticMobilePush,
  RNAcousticMobilePushInbox,
} = NativeModules;

export class HomeScreen extends SubscribedComponent {
  static navigationOptions = {
    title: 'Sample App',
  };

  state = { messages: '', unread: '' };

  update() {
    RNAcousticMobilePushInbox.inboxMessageCount((counts) => {
      this.setState(counts);
    });
  }

  componentDidMount() {
    RNAcousticMobilePush.requestPushPermission();

    this.update();

    this.subscriptions.push(RNAcousticMobilePushEmitter.addListener(REGISTERED, () => {
      RNAcousticMobilePushInbox.syncInboxMessages();
    }));

    this.subscriptions.push(RNAcousticMobilePushInboxEmitter.addListener(INBOX_COUNT_UPDATE, () => {
      this.update();
    }));
  }

  render() {
    const { messages, unread } = this.state;
    const { navigation: { navigate } } = this.props;

    return (
      <ScrollView style={styles.scrollView}>
        <View style={{ alignItems: 'center', padding: 10 }}>
          <Image style={{ marginTop: 20 }} source={require('../images/logo.png')} />
          <Image style={{ marginTop: 20 }} source={require('../images/campaign.png')} />
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Acoustic Mobile Push Sample App</Text>
          <Text>
            Native SDK v
            {RNAcousticMobilePush.sdkVersion}
          </Text>
          <Text style={{ marginBottom: 20 }}>
            React Native Plugin v
            {RNAcousticMobilePush.pluginVersion}
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
        {/* <ListItem style={styles.firstRow}
          title="Registration Details"
          chevron
          onPress={() => navigate('Registration')}
        />
        <ListItem style={styles.row}
          title="Inbox"
          subtitle={`${messages} messages, ${unread} unread`}
          chevron
          onPress={() => navigate('Inbox')}
        />
        <ListItem style={styles.row} title="InApp" chevron onPress={() => navigate('InApp')} />
        <ListItem style={styles.row} title="Custom Actions" chevron onPress={() => navigate('CustomActions')} />
        <ListItem style={styles.row} title="Send Test Events" chevron onPress={() => navigate('SendTestEvents')} />
        <ListItem style={styles.row}
          title="Send User Attributes"
          chevron
          onPress={() => navigate('SendUserAttributes')}
        />
        <ListItem style={styles.row} title="Geofences" chevron onPress={() => navigate('Geofences')} />
        <ListItem style={styles.row} title="iBeacons" chevron onPress={() => navigate('iBeacons')} /> */}
      </ScrollView>
    );
  }
}
