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
import { Text, ScrollView, NativeModules } from 'react-native';
import { ListItem } from 'react-native-elements';

import { styles } from '../../styles';
import { REGISTERED, REGISTRATION_CHANGED } from '../../enums/events';
import { RNAcousticMobilePushEmitter } from '../../helpers/eventEmitters';

const { RNAcousticMobilePush } = NativeModules;

console.log("NativeModules", RNAcousticMobilePush.appKey)

export class RegistrationScreen extends React.Component {
  static navigationOptions = {
    title: 'Registration',
  };

  constructor(props) {
    super(props);
    this.state = {
      appKey: RNAcousticMobilePush.appKey,
      userId: 'unregistered',
      channelId: 'unregistered',
      registration: 'unknown',
    };
  }

  componentDidMount() {
    this.update();

    this.setState({
      subscriptions: [
        RNAcousticMobilePushEmitter.addListener(REGISTERED, () => {
          this.update();
        }),
        RNAcousticMobilePushEmitter.addListener(REGISTRATION_CHANGED, () => {
          this.update();
        })
      ]
    });
  }

  componentWillUnmount() {
    const { subscriptions } = this.state;

    subscriptions.forEach((subscription) => subscription.remove());
  }

  update() {
    RNAcousticMobilePush.registrationDetails().then((registrationDetails) => {
      console.log("registrationDetails", JSON.stringify(registrationDetails))
      if (typeof (registrationDetails.userId) !== 'undefined'
        && registrationDetails.userId != null
        && typeof (registrationDetails.channelId) !== 'undefined'
        && registrationDetails.channelId) {
        this.setState({
          channelId: registrationDetails.channelId,
          registration: 'Finished',
          userId: registrationDetails.userId,
        });
      } else {
        this.setState({ userId: 'unregistered', channelId: 'unregistered', registration: 'Click to Start' });
      }
    }).catch(() => {
      this.setState({ userId: 'unregistered', channelId: 'unregistered', registration: 'Click to Start' });
    });
  }

  render() {
    const { appKey, channelId, userId } = this.state;

    return (
      <ScrollView style={styles.scrollView}>
        <Text style={styles.tableHeader}>Credentials</Text>
        <ListItem bottomDivider style={styles.firstRow} >
          <ListItem.Content>
            <ListItem.Title>User Id</ListItem.Title>
            <ListItem.Subtitle>{userId}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem bottomDivider style={styles.row}>
          <ListItem.Content>
            <ListItem.Title>Channel Id</ListItem.Title>
            <ListItem.Subtitle>{channelId}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row}>
          <ListItem.Content>
            <ListItem.Title>App Key</ListItem.Title>
            <ListItem.Subtitle>{appKey}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <Text style={styles.tableFooter}>
          User ID and Channel ID are known only after registration. The registration
          process could take several minutes. If you have have issues with registering a device, make sure you have the
          correct certificate and appKey.
        </Text>
      </ScrollView>
    );
  }
}
