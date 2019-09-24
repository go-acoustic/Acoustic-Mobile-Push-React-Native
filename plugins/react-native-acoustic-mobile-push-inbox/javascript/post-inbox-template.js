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
import InboxTemplateRegistry from './inbox-template-registry';
import {Text, View, Image, Button, ScrollView} from 'react-native';
import {RNAcousticMobilePushInbox} from 'NativeModules';
import React from 'react';
import FullWidthImage from './full-width-image';
import FullWidthVideo from './full-width-video';

const instance = undefined;
Object.freeze(instance);
export default instance;

function render(inboxMessage, full) {
    var contentVideo = (<View />);
    if(typeof(inboxMessage.content.contentVideo) != 'undefined') {
        contentVideo = (<FullWidthVideo source={{uri: inboxMessage.content.contentVideo}} />);
    }

    var contentImage = (<View />);
    if(typeof(inboxMessage.content.contentImage) != 'undefined') {
        contentImage = (<FullWidthImage source={{ uri: inboxMessage.content.contentImage }} />);
    }

    var contentText = (<View />);
    if(typeof(inboxMessage.content.contentText) != 'undefined') {
        contentText = (<Text style={{paddingTop:8}} numberOfLines={ full ? 0 : 2 }>{inboxMessage.content.contentText}</Text>);
    }

    var contentActions = (<View />);

    function action(action) {
        if(typeof(action) == "string") {
            action = JSON.parse(action);
        }
        return(<Button onPress={() => {
            RNAcousticMobilePushInbox.clickInboxAction(action, inboxMessage.inboxMessageId);
        }} key={i} title={action.name} />);
    }

    if(typeof(inboxMessage.content.actions) != "undefined")  {
        var actions = [];
        for(var i=0; i<inboxMessage.content.actions.length;i++) {
            actions.push(action(inboxMessage.content.actions[i]))
        }

        contentActions = (<View style={{paddingTop:8, flex:1, flexDirection:"row", justifyContent: 'space-evenly'}}>{actions}</View>);
    }

	return (
        <ScrollView>
            <View style={{padding: 16, flex: 1, flexDirection: "column", justifyContent: "flex-start" }}>
                <View style={{height: 50, flex:1, flexDirection:"row", paddingBottom:8}}>
                    <Image resizeMode="cover" style={{width: 50, height: 50}} source={{ uri: inboxMessage.content.headerImage }} />
                    <View style={{height: 50, flex:1, paddingLeft: 8, flexDirection:"column", justifyContent: 'space-evenly' }}>
                        <Text numberOfLines={1} style={{ fontWeight: inboxMessage.isRead ? "normal" : "bold"}}>{inboxMessage.content.header}</Text>
                        <Text numberOfLines={1}>{inboxMessage.content.subHeader}</Text>
                    </View>
                </View>
                {contentVideo}
                {contentImage}
                {contentText}
                {contentActions}
            </View>   
        </ScrollView>     
	);
}

InboxTemplateRegistry.registerMessageViewRenderer('post', function (inboxMessage) {
    return render(inboxMessage, true);
});

InboxTemplateRegistry.registerListItemRenderer('post', function (inboxMessage) {
    return render(inboxMessage, false);
});