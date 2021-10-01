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
import {
  Text,
  ScrollView,
  StyleSheet,
  NativeModules,
  Platform,
  TextInput,
} from 'react-native';

import { colors } from '../styles';
import { SubscribedComponent } from './subscribed-component';
import { Touchable } from '../components/Touchable';
import { ANDROID } from '../enums/os';
import { CUSTOM_PUSH_NOT_REGISTERED, CUSTOM_PUSH_NOT_YET_REGISTERED } from '../enums/events';
import { RNAcousticMobilePushEmitter, RNAcousticMobilePushActionHandlerEmitter } from '../helpers/eventEmitters';

const { RNAcousticMobilePushActionHandler } = NativeModules;

const pageStyles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  textInput: {
    paddingLeft: 8,
    textAlign: 'left',
    height: Platform.OS === ANDROID ? 40 : 30,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
  },
  title: {
    paddingTop: 16,
    paddingBottom: 8,
    fontWeight: 'bold',
  },
  rowTitle: {
    width: 90,
    paddingRight: 16,
  },
  scrollView: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
});

export class CustomActionScreen extends SubscribedComponent {
  static navigationOptions = {
    title: 'Custom Action',
  };

  state = {
    type: '',
    statusText: 'No status yet',
    statusColor: colors.none,
    registeredActions: new Set(),
  }

  componentDidMount() {
    RNAcousticMobilePushEmitter.addListener(CUSTOM_PUSH_NOT_YET_REGISTERED, (userInfo) => {
      this.setState({
        statusText: `Custom action received, but is not yet registered ${userInfo.type}`,
        statusColor: colors.warning,
      });
    });

    RNAcousticMobilePushEmitter.addListener(CUSTOM_PUSH_NOT_REGISTERED, (userInfo) => {
      this.setState({
        statusText: `Custom action received, but is not registered ${userInfo.type}`,
        statusColor: colors.error,
      });
    });
  }

  componentWillUnmount() {
    const { registeredActions } = this.state;
    super.componentWillUnmount();
    RNAcousticMobilePushEmitter.removeListener(CUSTOM_PUSH_NOT_REGISTERED);
    RNAcousticMobilePushEmitter.removeListener(CUSTOM_PUSH_NOT_YET_REGISTERED);

    for (const type of registeredActions) {
      RNAcousticMobilePushActionHandler.unregisterAction(type);
      RNAcousticMobilePushActionHandlerEmitter.removeListener(type);
    }
  }

  unregisterCustomAction = () => {
    const { registeredActions, type } = this.state;

    if (registeredActions.has(type)) {
      registeredActions.delete(type);
      this.setState({
        registeredActions,
        statusText: `Unregistering Custom Action: ${type}`,
        statusColor: colors.success,
      });

      RNAcousticMobilePushActionHandler.unregisterAction(type);
      RNAcousticMobilePushActionHandlerEmitter.removeListener(type);
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

    if (registeredActions.has(type)) {
      this.setState({
        statusText: `Custom action type ${type} is already registered`,
        statusColor: colors.warning,
      });
    } else {
      this.setState({ statusText: `Registering Custom Action: ${type}`, statusColor: colors.success });
    }
    registeredActions.add(type);
    this.setState({ registeredActions });

    RNAcousticMobilePushActionHandler.registerAction(type, this.handleCustomAction);
    RNAcousticMobilePushActionHandlerEmitter.addListener(type, this.handleCustomAction);
  }

  render() {
    const { type, statusColor, statusText } = this.state;

    return (
      <ScrollView style={{ minHeight: '100%', paddingLeft: 16, paddingRight: 16 }}>
        <Text style={pageStyles.title}>Custom Action Type</Text>
        <TextInput
          placeholder="optional"
          style={pageStyles.textInput}
          value={type}
          onChangeText={(text) => this.setState({ type: text })}
          keyboardType="default"
          autoCorrect={false}
          autoCompleteType="off"
          autoCapitalize="none"
          clearButtonMode="always"
        />

        <Text style={pageStyles.title}>Register Custom Action</Text>
        <Touchable
          accessibilityRole="button"
          onPress={this.registerCustomAction}>
          <Text style={{ color: colors.blue }}>Register Custom Action with Type</Text>
        </Touchable>
        <Text style={pageStyles.title}>Unregister Custom Action</Text>

        <Touchable
          accessibilityRole="button"
          onPress={this.unregisterCustomAction}>
          <Text style={{ color: colors.blue }}>Unregister Custom Action with Type</Text>
        </Touchable>

        <Text style={pageStyles.title}>Status</Text>
        <Text style={{ color: statusColor }}>{statusText}</Text>

      </ScrollView>
    );
  }
}
