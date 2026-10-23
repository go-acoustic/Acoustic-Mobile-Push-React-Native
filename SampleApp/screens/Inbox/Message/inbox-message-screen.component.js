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
import { View, NativeModules } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { InboxMessageView } from '../../../components/inbox/inbox-message-view';
import { Touchable } from '../../../helpers/Touchable';

const { RNAcousticMobilePushInbox } = NativeModules;

export class InboxMessageScreen extends React.Component {
  constructor(props) {
    super(props);

    const params = props.route.params || {};
    const inboxMessage = params.inboxMessage || {};
    this.state = {
      index: params.index || 0,
      inboxMessages: params.inboxMessages || [],
      inboxMessage,
    };

    RNAcousticMobilePushInbox.readInboxMessage(inboxMessage.inboxMessageId);
  }

  componentDidMount() {
    const { navigation } = this.props;
    const { index, inboxMessages } = this.state;

    const { length } = inboxMessages;

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Touchable onPress={this.previous}>
            <Icon name="arrow-up" color={index === 0 ? '#ccc' : '#000'} size={24} style={{ paddingRight: 20 }} />
          </Touchable>
          <Touchable onPress={this.next}>
            <Icon name="arrow-down"
              color={length - 1 === index ? '#ccc' : '#000'}
              size={24}
              style={{ paddingRight: 20 }}
            />
          </Touchable>
          <Touchable onPress={this.trash} testID="campaign_inbox_message_delete">
            <Icon name="trash" color="#000" size={24} />
          </Touchable>
        </View>
      ),
    });
  }

  previous = () => {
    const { navigation } = this.props;
    const { index: currentIndex, inboxMessages } = this.state;

    if (currentIndex === 0) {
      return;
    }

    navigation.goBack();
    const newIndex = currentIndex - 1;
    const inboxMessage = inboxMessages[currentIndex];
    navigation.push('InboxMessage', { inboxMessage, index: newIndex, inboxMessages });
  }

  next = () => {
    const { navigation } = this.props;
    const { index: currentIndex, inboxMessages } = this.state;

    if (inboxMessages.length - 1 === currentIndex) {
      return;
    }

    navigation.goBack();
    const index = currentIndex + 1;
    const inboxMessage = inboxMessages[index];
    navigation.push('InboxMessage', { inboxMessage, index, inboxMessages });
  }

  trash = () => {
    const { navigation } = this.props;
    const { inboxMessage } = this.state;

    navigation.goBack();
    RNAcousticMobilePushInbox.deleteInboxMessage(inboxMessage.inboxMessageId);
  }

  render() {
    const { inboxMessage } = this.state;

    return (
      <InboxMessageView inboxMessage={inboxMessage} />
    );
  }
}
