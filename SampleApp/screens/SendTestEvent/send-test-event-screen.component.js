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
import { EVENT_FAILURE, EVENT_SUCCESS } from '../../enums/events';
import styles from './send-test-event-screen.component.style';
import { customEventOptions, simulateEventOptions, attributeTypeOptions } from './send-test-event-screen.component.options';

const { RNAcousticMobilePush } = NativeModules;

export class SendTestEventScreen extends React.Component {
  static navigationOptions = {
    title: 'Send Events',
  };

  constructor() {
    super();
    this.state = {
      customEventSelectedIndex: 0,
      simulateEventSelectedIndex: 0,
      eventTypeSelectedIndex: 0,
      eventAttributeTypeSelectedIndex: 0,
      eventNameSelectedIndex: 0,
      eventNameText: '',
      attributeName: '',
      attribution: '',
      mailingId: '',
      statusText: 'No status yet',
      statusColor: colors.none,
      attributeBooleanValue: true,
      attributeDateValue: new Date(),
      attributeDatePicker: false,
      attributeValue: '',
      subscriptions: [],
    };
  }

  eventsToString(userInfo) {
    const events = [];

    for (const index in userInfo.events) {
      if (Object.prototype.hasOwnProperty.call(userInfo.events, index)) {
        const event = userInfo.events[index];
        events.push(`name: ${event.name}, type: ${event.type}`);
      }
    }

    return events.join(', ');
  }

  componentDidMount() {
    this.setState({
      subscriptions: [
        RNAcousticMobilePushEmitter.addListener(EVENT_SUCCESS, (userInfo) => {
          this.setState({ statusColor: colors.success, statusText: `Sent events: ${this.eventsToString(userInfo)}` });
        }),
        RNAcousticMobilePushEmitter.addListener(EVENT_FAILURE, (userInfo) => {
          this.setState({
            statusColor: colors.error,
            statusText: `Couldn't send events: ${this.eventsToString(userInfo)}, because: ${userInfo.error}`,
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

  eventName() {
    const { customEventSelectedIndex, eventNameText, eventNameSelectedIndex, simulateEventSelectedIndex } = this.state;

    if (customEventSelectedIndex === customEventOptions.custom.index) {
      return (
        <TextInput placeholder="required"
          style={styles.textInput}
          value={eventNameText}
          onChangeText={(text) => this.setState({ eventNameText: text })}
          keyboardType="default"
          autoCorrect={false}
          autoCompleteType="off"
          autoCapitalize="none"
          clearButtonMode="always"
        />
      );
    }

    if (customEventSelectedIndex === customEventOptions.simulate.index) {
      const eventNameOptions = simulateEventOptions[simulateEventSelectedIndex].names;
      if (eventNameSelectedIndex > eventNameOptions.length) {
        this.setState({ eventNameSelectedIndex: 0 });
      }

      return (
        <View style={{ flexGrow: 1 }}>
          <SegmentedControlTab values={eventNameOptions}
            selectedIndex={eventNameSelectedIndex}
            onTabPress={(index) => this.setState({ eventNameSelectedIndex: index })}
          />
        </View>
      );
    }

    return null;
  }

  eventType() {
    let eventTypeOptions;
    const { customEventSelectedIndex, eventTypeSelectedIndex, simulateEventSelectedIndex } = this.state;

    if (customEventSelectedIndex === customEventOptions.simulate.index) {
      eventTypeOptions = simulateEventOptions[simulateEventSelectedIndex].types;
    } else if (customEventSelectedIndex === customEventOptions.custom.index) {
      eventTypeOptions = customEventOptions.custom.types;
    }

    if (eventTypeSelectedIndex > eventTypeOptions.length) {
      this.setState({ eventTypeSelectedIndex: 0 });
    }
    return (
      <View style={{ flexGrow: 1 }}>
        <SegmentedControlTab values={eventTypeOptions}
          selectedIndex={eventTypeSelectedIndex}
          onTabPress={(index) => {
            this.setState({ eventTypeSelectedIndex: index });
          }}
        />
      </View>
    );
  }

  attributeType() {
    const { eventAttributeTypeSelectedIndex } = this.state;
    const attributeTypeOptionsText = this.extractOptionsText(attributeTypeOptions);

    if (eventAttributeTypeSelectedIndex > attributeTypeOptions.length) {
      this.setState({ eventAttributeTypeSelectedIndex: 0 });
    }

    return (
      <View style={{ flexGrow: 1 }}>
        <SegmentedControlTab values={attributeTypeOptionsText}
          selectedIndex={eventAttributeTypeSelectedIndex}
          onTabPress={(index) => {
            this.setState({ eventAttributeTypeSelectedIndex: index });
          }}
        />
      </View>
    );
  }

  attributeValue() {
    let keyboardType = 'default';
    const { attributeBooleanValue, attributeDateValue, attributeDatePicker, attributeValue, eventAttributeTypeSelectedIndex } = this.state;

    if (eventAttributeTypeSelectedIndex === attributeTypeOptions.boolean.index) {
      return (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ paddingRight: 8 }}>False</Text>
          <Switch value={attributeBooleanValue}
            onValueChange={(value) => this.setState({ attributeBooleanValue: value })}
          />
          <Text style={{ paddingLeft: 8 }}>True</Text>
        </View>
      );
    }

    if (eventAttributeTypeSelectedIndex === attributeTypeOptions.date.index) {
      return (
        <View>
          <Touchable accessibilityRole="button"
            onPress={() => {
              this.setState({ attributeDatePicker: true });
            }}>
            <Text style={{ color: colors.blue }}>{attributeDateValue.toISOString()}</Text>
          </Touchable>
          <DateTimePicker
            mode="datetime"
            date={attributeDateValue}
            isVisible={attributeDatePicker}
            onConfirm={(date) => this.setState({ attributeDatePicker: false, attributeDateValue: date })}
            onCancel={() => this.setState({ attributeDatePicker: false })}
          />
        </View>
      );
    }

    let value = attributeValue;
    if (eventAttributeTypeSelectedIndex === attributeTypeOptions.number.index) {
      keyboardType = 'decimal-pad';
      if (Number.isNaN(parseFloat(attributeValue))) {
        value = '';
      }
    }

    return (
      <TextInput style={styles.textInput}
        value={value}
        onChangeText={(text) => this.setState({ attributeValue: text })}
        keyboardType={keyboardType}
        autoCorrect={false}
        autoCompleteType="off"
        autoCapitalize="none"
        clearButtonMode="always"
      />
    );
  }

  attributeName() {
    const { attributeName } = this.state;

    return (
      <TextInput placeholder="optional"
        style={styles.textInput}
        value={attributeName}
        onChangeText={(text) => this.setState({ attributeName: text })}
        keyboardType="default"
        autoCorrect={false}
        autoCompleteType="off"
        autoCapitalize="none"
        clearButtonMode="always"
      />
    );
  }

  mailingId() {
    const { mailingId } = this.state;

    return (
      <TextInput placeholder="optional"
        style={styles.textInput}
        value={mailingId}
        onChangeText={(text) => this.setState({ mailingId: text })}
        keyboardType="default"
        autoCorrect={false}
        autoCompleteType="off"
        autoCapitalize="none"
        clearButtonMode="always"
      />
    );
  }

  attribution() {
    const { attribution } = this.state;

    return (
      <TextInput placeholder="optional"
        style={styles.textInput}
        value={attribution}
        onChangeText={(text) => this.setState({ attribution: text })}
        keyboardType="default"
        autoCorrect={false}
        autoCompleteType="off"
        autoCapitalize="none"
        clearButtonMode="always"
      />
    );
  }

  queueEvent() {
    const {
      attribution,
      attributeBooleanValue,
      attributeDateValue,
      customEventSelectedIndex,
      eventAttributeTypeSelectedIndex,
      eventNameText,
      eventNameSelectedIndex,
      eventTypeSelectedIndex,
      mailingId,
      simulateEventSelectedIndex,
    } = this.state;
    const event = {};

    if (customEventSelectedIndex === customEventOptions.simulate.index) {
      event.type = simulateEventOptions[simulateEventSelectedIndex].types[eventTypeSelectedIndex];
      event.name = simulateEventOptions[simulateEventSelectedIndex].names[eventNameSelectedIndex];
    } else if (customEventSelectedIndex === customEventOptions.custom.index) {
      event.type = customEventOptions.custom.types[eventNameSelectedIndex];
      event.name = eventNameText;
    }

    if (attribution.length) {
      event.attribution = attribution;
    }

    if (mailingId.length) {
      event.mailingId = mailingId;
    }

    const { attributeName: name } = this.state;

    if (name.length > 0) {
      const { attributeValue: value } = this.state;
      const attributes = {};

      if (eventAttributeTypeSelectedIndex === attributeTypeOptions.boolean.index) {
        attributes[name] = attributeBooleanValue;
      } else if (eventAttributeTypeSelectedIndex === attributeTypeOptions.string.index) {
        if (value.length > 0) {
          attributes[name] = value;
        }
      } else if (eventAttributeTypeSelectedIndex === attributeTypeOptions.date.index) {
        attributes[name] = attributeDateValue;
      } else if (eventAttributeTypeSelectedIndex === attributeTypeOptions.number.index) {
        const parsedValue = parseFloat(value);

        if (!Number.isNaN(parsedValue)) {
          attributes[name] = parsedValue;
        }
      }

      if (Object.getOwnPropertyNames(attributes).length) {
        event.attributes = attributes;
      }
    }

    RNAcousticMobilePush.addEvent(event, true);
    this.setState({
      statusColor: colors.queued,
      statusText: `Queued Event with name: ${event.name}, type: ${event.type}`,
    });
  }

  sendEvent() {
    return (
      <Touchable accessibilityRole="button" onPress={() => this.queueEvent()}>
        <Text style={{ color: colors.blue, paddingTop: 16 }}>Send Event</Text>
      </Touchable>
    );
  }

  simulateEvent() {
    const { customEventSelectedIndex, simulateEventSelectedIndex } = this.state;
    const simulateEventOptionsText = simulateEventOptions.map((item) => item.text);
    if (simulateEventSelectedIndex > simulateEventOptions.length) {
      this.setState({ simulateEventSelectedIndex: 0 });
    }

    const simulateEventEnabled = customEventSelectedIndex === customEventOptions.simulate.index;
    return (
      <SegmentedControlTab enabled={simulateEventEnabled}
        values={simulateEventOptionsText}
        selectedIndex={simulateEventSelectedIndex}
        onTabPress={(index) => {
          this.setState({ simulateEventSelectedIndex: index });
        }}
      />
    );
  }

  customEvent() {
    const { customEventSelectedIndex } = this.state;
    const customEventOptionsText = this.extractOptionsText(customEventOptions);
    if (customEventSelectedIndex > customEventOptions.length) {
      this.setState({ customEventSelectedIndex: 0 });
    }

    return (
      <SegmentedControlTab values={customEventOptionsText}
        selectedIndex={customEventSelectedIndex}
        onTabPress={(index) => {
          this.setState({ customEventSelectedIndex: index });
        }}
      />
    );
  }

  status() {
    const { statusColor, statusText } = this.state;

    return (
      <Text style={{ color: statusColor }}>{statusText}</Text>
    );
  }

  render() {
    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollView} resetScrollToCoords={{ x: 0, y: 0 }}>
        <View style={{ paddingTop: 8, paddingBottom: 8 }}>
          {this.customEvent()}
        </View>
        <View style={{ paddingTop: 8, paddingBottom: 8 }}>
          {this.simulateEvent()}
        </View>

        <Text style={styles.title}>Event Details</Text>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Type</Text>
          {this.eventType()}
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Name</Text>
          {this.eventName()}
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Attribution</Text>
          {this.attribution()}
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Mailing Id</Text>
          {this.mailingId()}
        </View>

        <Text style={styles.title}>Event Attribute</Text>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Name</Text>
          {this.attributeName()}
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Value</Text>
          {this.attributeType()}
        </View>
        <View style={styles.row}>
          <View style={styles.rowTitle} />
          {this.attributeValue()}
        </View>
        {this.sendEvent()}
        <Text style={styles.title}>Status</Text>
        {this.status()}
      </KeyboardAwareScrollView>
    );
  }
}
