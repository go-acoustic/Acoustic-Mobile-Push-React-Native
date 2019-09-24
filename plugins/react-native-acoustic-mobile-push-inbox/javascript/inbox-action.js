/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
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

'use strict';
import {AppRegistry, View, Animated, SafeAreaView, Platform, TouchableNativeFeedback, TouchableOpacity} from 'react-native';
import {RNAcousticMobilePushInbox} from 'NativeModules';
import React from 'react';
import {InboxMessageView} from './inbox-message-view';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

export class InboxAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            inboxMessage: props.message
		}
        this.state.animation = new Animated.Value(0);
		RNAcousticMobilePushInbox.readInboxMessage(this.state.inboxMessage.inboxMessageId);
	}

	hide() {
		Animated.timing(this.state.animation, {toValue: 0, duration: 500}).start((finished) => { RNAcousticMobilePushInbox.hideInbox(); });
	}

	show() {
		Animated.timing(this.state.animation, {toValue: 1, duration: 500}).start();
	}

	componentDidMount() {
		this.show();
	}

	render() {
		return (
			<Animated.View style={{ height: '100%', width: '100%', opacity: this.state.animation, backgroundColor: "#ffffff" }}>
				<SafeAreaView style={{height: "100%", width: "100%"}}>
					<View style={{width: '100%', height: '100%'}}>
                        <View style={{backgroundColor: "#dddddd"}}>
                            <Touchable onPress={()=>{this.hide();}}>
                                <Icon name="ios-close-circle" color="#000" size={24} style={{alignSelf: "flex-end", padding: 10}} />
                            </Touchable>
                        </View>
    	        		<InboxMessageView inboxMessage={this.state.inboxMessage} />
                    </View>
                </SafeAreaView>
            </Animated.View>
		);
	}
}

AppRegistry.registerComponent("InboxAction", () => InboxAction);
RNAcousticMobilePushInbox.registerInboxComponent("InboxAction");