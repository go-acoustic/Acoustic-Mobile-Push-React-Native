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
import { View, FlatList, TouchableOpacity, NativeModules, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { RNAcousticMobilePushInboxEmitter } from '../../helpers/eventEmitters';
import InboxListItem from '../../components/inbox/inbox-list-item';
import { Touchable } from '../../helpers/Touchable';
import { SYNC_INBOX } from '../../enums/events';

const { RNAcousticMobilePushInbox } = NativeModules;

export class InboxScreen extends React.Component {

  static navigationOptions = {
    title: 'Inbox Messages',
    headerRight: () => (
      <Touchable onPress={() => {
        RNAcousticMobilePushInbox.syncInboxMessages();
      }}>
        <Icon name="sync" color="#000" size={24} style={{ paddingRight: 20 }} />
      </Touchable>
    ),
  };

  constructor(props) {
    super(props);
    this.state = { inboxMessages: [], subscriptions: [] };
    RNAcousticMobilePushInbox.syncInboxMessages();
    this.update();
  }

  componentDidMount() {
    this.update();
    this.setState({
      subscriptions: [
        RNAcousticMobilePushInboxEmitter.addListener(SYNC_INBOX, () => {
          this.update();
        }),
        this.props.navigation.addListener(
          'willFocus',
          () => {
            this.update();
          }
        ),
      ]
    })
  }

  componentWillUnmount() {
    const { subscriptions } = this.state;

    subscriptions.forEach((subscription) => subscription.remove());
  }

  update() {
    RNAcousticMobilePushInbox.listInboxMessages(false, (inboxMessages) => {
      this.setState({ inboxMessages });
    });
  }

  openMessage(item, index) {
    const { navigation } = this.props;
    const { inboxMessages } = this.state;

    navigation.navigate('InboxMessage', {
      inboxMessage: item,
      index,
      inboxMessages,
    });
  }

  renderSeparator = () => (
    <View style={{ height: 1, backgroundColor: '#CED0CE', marginLeft: '2%' }} />
  );

  renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => { this.openMessage(item, index); }}>
        <InboxListItem inboxMessage={item} />
      </TouchableOpacity>
    );
  };

  render() {
    const { inboxMessages } = this.state;

    if (inboxMessages.length) {
      return (
        <FlatList
          ItemSeparatorComponent={this.renderSeparator}
          data={inboxMessages}
          keyExtractor={(inboxMessage) => inboxMessage.inboxMessageId}
          ListFooterComponent={this.renderSeparator}
          renderItem={this.renderItem}
        />
      );
    }
    return (
      <Text style={{ textAlign: 'center', padding: 40, fontStyle: 'italic' }}>The inbox has no messages</Text>
    );
  }
}
