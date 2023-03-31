/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

/*
Add API docs for:
    registerInbox(module)
    hideInbox()
Android Support
*/

import { AppRegistry, View, Animated, SafeAreaView, NativeModules } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

import { InboxMessageView } from './inbox-message-view';
import { Touchable } from '../../helpers/Touchable';

const { RNAcousticMobilePushInbox } = NativeModules;

export class InboxAction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      animation: new Animated.Value(0),
      inboxMessage: props.message,
    };

    RNAcousticMobilePushInbox.readInboxMessage(this.state.inboxMessage.inboxMessageId);
  }

  hide() {
    const { animation } = this.state;
    Animated.timing(animation, { toValue: 0, duration: 500, useNativeDriver: false }).start(() => { RNAcousticMobilePushInbox.hideInbox(); });
  }

  show() {
    const { animation } = this.state;
    Animated.timing(animation, { toValue: 1, duration: 500, useNativeDriver: false }).start();
  }

  componentDidMount() {
    this.show();
  }

  render() {
    const { animation, inboxMessage } = this.state;

    return (
      <Animated.View style={{ height: '100%', width: '100%', opacity: animation, backgroundColor: '#ffffff' }}>
        <SafeAreaView style={{ height: '100%', width: '100%' }}>
          <View style={{ width: '100%', height: '100%' }}>
            <View style={{ backgroundColor: '#dddddd' }}>
              <Touchable onPress={() => { this.hide(); }}>
                <Icon name="ios-close-circle" color="#000" size={24} style={{ alignSelf: 'flex-end', padding: 10 }} />
              </Touchable>
            </View>
            <InboxMessageView inboxMessage={inboxMessage} />
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }
}

AppRegistry.registerComponent('InboxAction', () => InboxAction);
RNAcousticMobilePushInbox.registerInboxComponent('InboxAction');
