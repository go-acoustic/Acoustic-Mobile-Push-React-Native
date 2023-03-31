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
  static navigationOptions = ({ navigation }) => {
    const previous = navigation.getParam('previous');
    const next = navigation.getParam('next');
    const trash = navigation.getParam('trash');
    const index = navigation.getParam('index');
    const { length } = navigation.getParam('inboxMessages');

    return {
      headerRight: () => (
        <View style={{ flex: 1, flexDirection: 'row', paddingTop: 14 }}>
          <Touchable onPress={previous}>
            <Icon name="ios-arrow-up" color={index === 0 ? '#ccc' : '#000'} size={24} style={{ paddingRight: 20 }} />
          </Touchable>
          <Touchable onPress={next}>
            <Icon name="ios-arrow-down"
              color={length - 1 === index ? '#ccc' : '#000'}
              size={24}
              style={{ paddingRight: 20 }}
            />
          </Touchable>
          <Touchable onPress={trash}>
            <Icon name="ios-trash" color="#000" size={24} style={{ paddingRight: 20 }} />
          </Touchable>
        </View>
      ),
    };
  };

  constructor(props) {
    super(props);

    const inboxMessage = props.navigation.getParam('inboxMessage', {});
    this.state = {
      index: props.navigation.getParam('index', 0),
      inboxMessages: props.navigation.getParam('inboxMessages', []),
      inboxMessage,
    };

    RNAcousticMobilePushInbox.readInboxMessage(inboxMessage.inboxMessageId);
  }

  componentDidMount() {
    const { navigation } = this.props;
    const { index, inboxMessages } = this.state;

    navigation.setParams({
      index,
      inboxMessages,
      previous: this.previous,
      next: this.next,
      trash: this.trash,
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
    navigation.push('InboxMessage', { inboxMessage, newIndex, inboxMessages });
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
