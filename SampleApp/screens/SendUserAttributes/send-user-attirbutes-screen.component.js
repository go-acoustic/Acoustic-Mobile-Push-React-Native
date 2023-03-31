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
  View,
  NativeModules,
  Switch,
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { TextInput } from 'react-native-gesture-handler';

import { colors } from '../../styles';
import { RNAcousticMobilePushEmitter } from '../../helpers/eventEmitters';
import { Touchable } from '../../helpers/Touchable';

import {
  DELETE_USER_ATTRIBUTES_ERROR,
  DELETE_USER_ATTRIBUTES_SUCCESS,
  UPDATE_USER_ATTRIBUTES_ERROR,
  UPDATE_USER_ATTRIBUTES_SUCCESS,
} from '../../enums/events';

import styles from './send-user-attributes-screen.component.style';
import { attributeOperations, typeOptions } from './send-user-attributes-screen.component.options';

const { RNAcousticMobilePush } = NativeModules;

export class SendUserAttributeScreen extends React.Component {
  static navigationOptions = {
    title: 'Send User Attributes',
  };

  constructor() {
    super();
    this.state = {
      name: '',
      value: '',
      datePicker: false,
      booleanValue: true,
      statusText: 'No status yet',
      statusColor: colors.none,
      operationSelectedIndex: 0,
      typeSelectedIndex: 0,
      dateValue: new Date(),
      safeArea: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      },
      subscriptions: [],
    };

    RNAcousticMobilePush.safeAreaInsets((safeArea) => {
      this.setState({ safeArea });
    });
  }

  attributesToString(userInfo) {
    const attributes = [];
    const keys = Object.getOwnPropertyNames(userInfo.attributes);

    for (const index in keys) {
      if (Object.prototype.hasOwnProperty.call(keys, index)) {
        const key = keys[index];
        const value = userInfo.attributes[key];
        attributes.push(`${key}=${value}`);
      }
    }

    return attributes.join(', ');
  }

  componentDidMount() {

    this.setState({
      subscriptions: [
        RNAcousticMobilePushEmitter.addListener(UPDATE_USER_ATTRIBUTES_SUCCESS, (userInfo) => {
          this.setState({
            statusColor: colors.success, statusText: `Sent attributes: ${this.attributesToString(userInfo)}`,
          });
        }),
        RNAcousticMobilePushEmitter.addListener(UPDATE_USER_ATTRIBUTES_ERROR, (userInfo) => {
          this.setState({
            statusColor: colors.error,
            statusText: `Couldn't send attributes: ${this.attributesToString(userInfo)}, because: ${userInfo.error}`,
          });
        }),
        RNAcousticMobilePushEmitter.addListener(DELETE_USER_ATTRIBUTES_SUCCESS, (userInfo) => {
          this.setState({ statusColor: colors.success, statusText: `Deleted attributes: ${userInfo.keys.join(', ')}` });
        }),
        RNAcousticMobilePushEmitter.addListener(DELETE_USER_ATTRIBUTES_ERROR, (userInfo) => {
          this.setState({
            statusColor: colors.error,
            statusText: `Couldn't delete attributes: ${userInfo.keys.join(', ')}, because: ${userInfo.error}`,
          });
        })
      ]
    });
  }

  componentWillUnmount() {
    const { subscriptions } = this.state;

    subscriptions.forEach((subscription) => subscription.remove());
  }

  extractOptionsText(options) {
    const optionsText = [];
    const sortedOptions = Object.getOwnPropertyNames(options).sort((a, b) => options[a].index > options[b].index);

    for (const i in sortedOptions) {
      if (Object.prototype.hasOwnProperty.call(sortedOptions, i)) {
        const index = sortedOptions[i];
        optionsText.push(options[index].text);
      }
    }

    return optionsText;
  }

  attributeType() {
    const typeOptionsText = this.extractOptionsText(typeOptions);
    const { typeSelectedIndex } = this.state;

    if (typeSelectedIndex > typeOptions.length) {
      this.setState({ typeSelectedIndex: 0 });
    }

    return (
      <View style={{ flexGrow: 1, paddingBottom: 10 }}>
        <SegmentedControlTab
          values={typeOptionsText}
          selectedIndex={typeSelectedIndex}
          onTabPress={(index) => {
            this.setState({ typeSelectedIndex: index });
          }}
        />
      </View>
    );
  }

  operation() {
    const { operationSelectedIndex } = this.state;
    const operationsText = this.extractOptionsText(attributeOperations);

    if (operationSelectedIndex > attributeOperations.length) {
      this.setState({ operationSelectedIndex: 0 });
    }

    return (
      <View style={{ flexGrow: 1 }}>
        <SegmentedControlTab
          values={operationsText}
          selectedIndex={operationSelectedIndex}
          onTabPress={(index) => {
            this.setState({ operationSelectedIndex: index });
          }}
        />
      </View>
    );
  }

  attributeValue() {
    let keyboardType = 'default';
    const { booleanValue, datePicker, dateValue, typeSelectedIndex, value } = this.state;

    if (typeSelectedIndex === typeOptions.boolean.index) {
      return (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ paddingRight: 8 }}>False</Text>
          <Switch
            value={booleanValue}
            onValueChange={(val) => this.setState({ booleanValue: val })}
          />
          <Text style={{ paddingLeft: 8 }}>True</Text>
        </View>
      );
    }

    if (typeSelectedIndex === typeOptions.date.index) {
      return (
        <View>
          <Touchable
            accessibilityRole="button"
            onPress={() => {
              this.setState({ datePicker: true });
            }}>
            <Text style={{ color: colors.blue }}>{this.convertDateToAcousticDate(dateValue)}</Text>
          </Touchable>
          <DateTimePicker
            mode="date"
            date={dateValue}
            isVisible={datePicker}
            onConfirm={(date) => this.setState({ datePicker: false, dateValue: date })}
            onCancel={() => this.setState({ datePicker: false })}
          />
        </View>
      );
    }

    if (typeSelectedIndex === typeOptions.number.index) {
      keyboardType = 'decimal-pad';

      if (Number.isNaN(parseFloat(value))) {
        this.state.value = '';
      }
    }

    return (
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={(text) => this.setState({ value: text })}
        keyboardType={keyboardType}
        autoCorrect={false}
        autoCompleteType="off"
        autoCapitalize="none"
        clearButtonMode="always"
      />
    );
  }

  attributeName() {
    const { name } = this.state;

    return (
      <TextInput
        placeholder="optional"
        style={styles.textInput}
        value={name}
        onChangeText={(text) => this.setState({ name: text })}
        keyboardType="default"
        autoCorrect={false}
        autoCompleteType="off"
        autoCapitalize="none"
        clearButtonMode="always"
      />
    );
  }

  queueAttribute() {
    const { booleanValue, dateValue, name, operationSelectedIndex, typeSelectedIndex, value } = this.state;

    if (operationSelectedIndex === attributeOperations.update.index) {
      const attributes = {};
      if (typeSelectedIndex === typeOptions.boolean.index) {
        attributes[name] = booleanValue;
      } else if (typeSelectedIndex === typeOptions.date.index) {
        attributes[name] = this.convertDateToAcousticDate(dateValue);
        console.log(attributes);
      } else if (typeSelectedIndex === typeOptions.number.index) {
        const parsedValue = parseFloat(value);
        if (!Number.isNaN(parsedValue)) {
          attributes[name] = parsedValue;
        }
      } else if (typeSelectedIndex === typeOptions.string.index) {
        attributes[name] = value;
      }

      RNAcousticMobilePush.updateUserAttributes(attributes);
      this.setState({ statusColor: colors.queued, statusText: `Queued Update ${name}=${attributes[name]}` });
    } else if (operationSelectedIndex === attributeOperations.delete.index) {
      RNAcousticMobilePush.deleteUserAttributes([name]);
      this.setState({ statusColor: colors.queued, statusText: `Queued Delete ${name}` });
    }
  }

  convertDateToAcousticDate(date) {
    var raw = (!isNaN(Date.parse(date))) ? new Date(date) : new Date();
    console.log("RAW", raw, raw.getFullYear(), raw.getMonth(), raw.getDate());
    return (raw.getFullYear()
      + "-" + ((raw.getMonth() + 1) < 10 ? ("0" + (raw.getMonth() + 1)) : raw.getMonth())
      + "-" + ((raw.getDate() < 10) ? ("0" + raw.getDate()) : raw.getDate()));
  }

  sendAttribute() {
    return (
      <Touchable accessibilityRole="button" onPress={() => this.queueAttribute()}>
        <Text style={{ color: colors.blue, paddingTop: 16 }}>Send Attribute</Text>
      </Touchable>
    );
  }

  status() {
    const { statusColor, statusText } = this.state;

    return (
      <Text style={{ color: statusColor }}>{statusText}</Text>
    );
  }

  render() {
    const { safeArea: { bottom, left, right } } = this.state;

    return (
      <View style={{
        position: 'absolute',
        left,
        right,
        top: 0,
        bottom,
      }}>
        <KeyboardAwareScrollView contentContainerStyle={styles.scrollView} resetScrollToCoords={{ x: 0, y: 0 }}>
          <Text style={styles.title}>Key Name</Text>
          {this.attributeName()}
          <Text style={styles.title}>Value</Text>
          {this.attributeType()}
          {this.attributeValue()}
          <Text style={styles.title}>Operation</Text>
          {this.operation()}

          {this.sendAttribute()}
          <Text style={styles.title}>Status</Text>
          {this.status()}
        </KeyboardAwareScrollView>
        <Text style={{ padding: 10, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          Note: The key name and value
          type above must match a column in your WCA database in order to propagate.
        </Text>
      </View>
    );
  }
}
