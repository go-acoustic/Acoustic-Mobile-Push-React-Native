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
import {
  Text,
  ScrollView,
  NativeModules,
  TextInput,
} from 'react-native';

import { colors } from '../../styles';
import { Touchable } from '../../helpers/Touchable';
import { CUSTOM_PUSH_NOT_REGISTERED, CUSTOM_PUSH_NOT_YET_REGISTERED } from '../../enums/events';
import { RNAcousticMobilePushEmitter, RNAcousticMobilePushActionHandlerEmitter } from '../../helpers/eventEmitters';
import styles from './custom-action-screen.component.style.js';

const { RNAcousticMobilePushActionHandler } = NativeModules;

export class CustomActionScreen extends React.Component {
  static navigationOptions = {
    title: 'Custom Action',
  };

  state = {
    type: '',
    statusText: 'No status yet',
    statusColor: colors.none,
    registeredActions: [],
    subscriptions: [],
  }

  componentDidMount() {
    const notYetSubscription = RNAcousticMobilePushEmitter.addListener(CUSTOM_PUSH_NOT_YET_REGISTERED, (userInfo) => {
      this.setState({
        statusText: `Custom action received, but is not yet registered ${userInfo.type}`,
        statusColor: colors.warning,
      });
    });

    const notRegisteredSubscription = RNAcousticMobilePushEmitter.addListener(CUSTOM_PUSH_NOT_REGISTERED, (userInfo) => {
      this.setState({
        statusText: `Custom action received, but is not registered ${userInfo.type}`,
        statusColor: colors.error,
      });
    });

    this.setState({
      ...this.state,
      subscriptions: [notYetSubscription, notRegisteredSubscription],
    });
  }

  componentWillUnmount() {
    const { registeredActions, subscriptions } = this.state;

    for (const action of registeredActions) {
      RNAcousticMobilePushActionHandler.unregisterAction(action.type);
      action.listenerSubscription.remove();
    }

    subscriptions.forEach((subscription) => subscription.remove());
  }

  unregisterCustomAction = () => {
    const { registeredActions, type } = this.state;

    if (registeredActions.some(action => action.type === type)) {
      let actionIndex = registeredActions.findIndex(item => item.type === type);
      let deletedAction = registeredActions.splice(actionIndex, 1);
      this.setState({
        registeredActions,
        statusText: `Unregistering Custom Action: ${type}`,
        statusColor: colors.success,
      });

      deletedAction[0].listenerSubscription.remove();
      RNAcousticMobilePushActionHandler.unregisterAction(deletedAction.type);
    } else {
      this.setState({
        statusText: `Custom action type ${type} is not registered`,
        statusColor: colors.warning,
      });
    }
  }

  handleCustomAction = (details) => {
    this.setState({ statusText: `Received Custom Action: ${JSON.stringify(details)}`, statusColor: colors.success });
  };

  registerCustomAction = () => {
    const { registeredActions, type } = this.state;

    if (registeredActions.some(action => action.type === type)) {
      this.setState({
        statusText: `Custom action type ${type} is already registered`,
        statusColor: colors.warning,
      });
      return;
    }
    else {
      this.setState({ statusText: `Registering Custom Action: ${type}`, statusColor: colors.success });
    }

    RNAcousticMobilePushActionHandler.registerAction(type, this.handleCustomAction);
    const listenerSubscription = RNAcousticMobilePushActionHandlerEmitter.addListener(type, this.handleCustomAction);
    registeredActions.push({ type, listenerSubscription });
    this.setState({ registeredActions });
  }

  render() {
    const { type, statusColor, statusText } = this.state;

    return (
      <ScrollView style={{ minHeight: '100%', paddingLeft: 16, paddingRight: 16 }}>
        <Text style={styles.title}>Custom Action Type</Text>
        <TextInput
          placeholder="optional"
          style={styles.textInput}
          value={type}
          onChangeText={(text) => this.setState({ type: text })}
          keyboardType="default"
          autoCorrect={false}
          autoCompleteType="off"
          autoCapitalize="none"
          clearButtonMode="always"
        />

        <Text style={styles.title}>Register Custom Action</Text>
        <Touchable
          accessibilityRole="button"
          onPress={this.registerCustomAction}>
          <Text style={{ color: colors.blue }}>Register Custom Action with Type</Text>
        </Touchable>
        <Text style={styles.title}>Unregister Custom Action</Text>

        <Touchable
          accessibilityRole="button"
          onPress={this.unregisterCustomAction}>
          <Text style={{ color: colors.blue }}>Unregister Custom Action with Type</Text>
        </Touchable>

        <Text style={styles.title}>Status</Text>
        <Text style={{ color: statusColor }}>{statusText}</Text>

      </ScrollView>
    );
  }
}
