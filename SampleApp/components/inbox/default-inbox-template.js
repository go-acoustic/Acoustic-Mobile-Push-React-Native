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
import { ListItem } from 'react-native-elements';
import { Text, View, NativeModules } from 'react-native';
import { WebView } from 'react-native-webview';
import InboxTemplateRegistry from './inbox-template-registry';

const { RNAcousticMobilePushInbox } = NativeModules;

const instance = undefined;
Object.freeze(instance);
export default instance;

InboxTemplateRegistry.registerMessageViewRenderer('default', (inboxMessage) => {
  const html = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1 maximum-scale=1">${inboxMessage.content.messageDetails.richContent}`;

  return (
    <View style={{ flex: 1, alignItems: 'stretch' }}>
      <View style={{ padding: 8, borderBottomColor: '#dbdbdb', borderBottomWidth: 1 }}>
        <Text style={{ color: inboxMessage.isExpired ? '#aaaaaa' : '#000000' }} numberOfLines={1}>{inboxMessage.content.messagePreview.subject}</Text>
        {inboxMessage.isExpired
          ? (
            <Text numberOfLines={1} style={{ color: 'red' }}>
              Expired:
              {new Date(inboxMessage.expirationDate).toLocaleString()}
            </Text>
          )
          : (<Text numberOfLines={1} style={{ color: '#327BF7' }}>{new Date(inboxMessage.sendDate).toLocaleString()}</Text>)}
      </View>
      <WebView onShouldStartLoadWithRequest={(nav) => {
        if (nav.url.startsWith('actionid:')) {
          const identifier = nav.url.slice(9);
          const action = inboxMessage.content.actions[identifier];
          RNAcousticMobilePushInbox.clickInboxAction(action, inboxMessage.inboxMessageId);
          return false;
        }
        return true;
      }}
        startInLoadingState
        style={{ padding: 0, width: '100%', height: '100%' }}
        originWhitelist={['*']}
        source={{ html }}
      />

    </View>
  );
});

InboxTemplateRegistry.registerListItemRenderer('default', (inboxMessage) => {
  return (
    <View style={{ padding: 16, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ height: 50, flex: 1, flexDirection: 'column', justifyContent: 'space-evenly' }}>
        <Text numberOfLines={1} style={{ fontWeight: inboxMessage.isRead ? 'normal' : 'bold', color: inboxMessage.isExpired ? '#aaaaaa' : '#000000' }}>{inboxMessage.content.messagePreview.subject}</Text>
        <Text numberOfLines={1} style={{ color: inboxMessage.isExpired ? '#aaaaaa' : '#000000' }}>{inboxMessage.content.messagePreview.previewContent}</Text>
      </View>
      {inboxMessage.isExpired
        ? (
          <Text style={{ color: 'red' }}>
            Expired:
            {new Date(inboxMessage.expirationDate).toLocaleDateString()}
          </Text>
        )
        : (<Text style={{ color: '#327BF7' }}>{new Date(inboxMessage.sendDate).toLocaleDateString()}</Text>)}
    </View>
  );
});
