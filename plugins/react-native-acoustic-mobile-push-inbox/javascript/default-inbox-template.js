/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */
 
'use strict';
import React from 'react';
import InboxTemplateRegistry from './inbox-template-registry';
import {ListItem} from 'react-native-elements'
import {Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {RNAcousticMobilePushInbox} from 'NativeModules';

const instance = undefined;
Object.freeze(instance);
export default instance;

InboxTemplateRegistry.registerMessageViewRenderer('default', function (inboxMessage) {
    var html = '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1 maximum-scale=1">' + inboxMessage.content.messageDetails.richContent;

	return (
        <View style={{flex: 1, alignItems: 'stretch' }}>
            <View style={{padding: 8, borderBottomColor: "#dbdbdb", borderBottomWidth: 1}}>
                <Text style={{ color: inboxMessage.isExpired ? '#aaaaaa' : "#000000"}} numberOfLines={1}>{inboxMessage.content.messagePreview.subject}</Text>
                { inboxMessage.isExpired ? 
                    (<Text numberOfLines={1} style={{color: 'red'}}>Expired: {new Date( inboxMessage.expirationDate ).toLocaleString()}</Text>) :
                    (<Text numberOfLines={1} style={{color: '#327BF7'}}>{new Date( inboxMessage.sendDate ).toLocaleString()}</Text>)
                }
                </View>
            <WebView onShouldStartLoadWithRequest={ (nav) => {
                if(nav.url.startsWith("actionid:")) {
                    var identifier = nav.url.slice(9);
                    var action = inboxMessage.content.actions[identifier];
                    RNAcousticMobilePushInbox.clickInboxAction(action, inboxMessage.inboxMessageId);
                    return false;
                }
                return true;
            } } startInLoadingState={true} style={{padding:0, width: '100%', height: '100%'}} originWhitelist={['*']} source={{html: html}} />
            
        </View>
    );
});

InboxTemplateRegistry.registerListItemRenderer('default', function (inboxMessage) {
	return (
		<ListItem 
			chevron
			title={inboxMessage.content.messagePreview.subject}  
			titleStyle={{fontWeight: inboxMessage.isRead ? "normal" : "bold", color: inboxMessage.isExpired ? '#aaaaaa' : "#000000"}}
			titleProps={{numberOfLines: 1}}
			subtitle={inboxMessage.content.messagePreview.previewContent}
			subtitleStyle={{ color: inboxMessage.isExpired ? '#aaaaaa' : "#000000"}}
			subtitleProps={{numberOfLines: 1}}
			rightElement={
				inboxMessage.isExpired ?
				(<Text style={{color: 'red'}}>Expired: {new Date( inboxMessage.expirationDate ).toLocaleDateString()}</Text>) :
				(<Text style={{color: '#327BF7'}}>{new Date( inboxMessage.sendDate ).toLocaleDateString()}</Text>)
			}
		/>
	);
});