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
import {View, TouchableNativeFeedback, TouchableOpacity, Platform} from 'react-native';
import {RNAcousticMobilePushInbox} from 'NativeModules';
import {InboxMessageView} from '../inbox/inbox-message-view';
import Icon from 'react-native-vector-icons/Ionicons';
const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

export class InboxMessageScreen extends React.Component {
	static navigationOptions = ({ navigation }) => {
		const previous = navigation.getParam('previous');
		const next = navigation.getParam('next');
		const trash = navigation.getParam('trash');
		const index = navigation.getParam('index');
		const length = navigation.getParam('inboxMessages').length;
		return {
			headerRight: (
				<View style={{flex:1, flexDirection: "row"}}>
					<Touchable onPress={previous}>
						<Icon name="ios-arrow-up" color={ index==0 ? "#ccc" : "#000" } size={24} style={{paddingRight: 20}} />
					</Touchable>
					<Touchable onPress={next}>
						<Icon name="ios-arrow-down" color={ length-1==index ? "#ccc" : "#000" } size={24} style={{paddingRight: 20}} />
					</Touchable>
					<Touchable onPress={trash}>
						<Icon name="ios-trash" color="#000" size={24} style={{paddingRight: 20}} />
					</Touchable>
				</View>
			),
		};
	};

	componentDidMount() {
		this.props.navigation.setParams({ 
			index: this.state.index, 
			inboxMessages: this.state.inboxMessages, 
			previous: this.previous, 
			next: this.next, 
			trash: this.trash 
		});
	}

	previous = () => {
		if(index==0) {
			return;
		}
		this.props.navigation.goBack();
		const index = this.state.index - 1;
		const inboxMessage = this.state.inboxMessages[index];
		this.props.navigation.push('InboxMessage', {inboxMessage: inboxMessage, index: index, inboxMessages: this.state.inboxMessages });
	}

	next = () => {
		if(length-1==index) {
			return;
		}
		this.props.navigation.goBack();
		const index = this.state.index + 1;
		const inboxMessage = this.state.inboxMessages[index];
		this.props.navigation.push('InboxMessage', {inboxMessage: inboxMessage, index: index, inboxMessages: this.state.inboxMessages });
	}

	trash = () => {
		this.props.navigation.goBack();
		RNAcousticMobilePushInbox.deleteInboxMessage(this.state.inboxMessage.inboxMessageId);
	}

	constructor(props) {
		super(props);
		this.state = {
			index: props.navigation.getParam('index', 0),
			inboxMessages: props.navigation.getParam('inboxMessages', []),
			inboxMessage: props.navigation.getParam('inboxMessage', {})
		}
		RNAcousticMobilePushInbox.readInboxMessage(this.state.inboxMessage.inboxMessageId);
	}

	render() {
		return (
			<InboxMessageView inboxMessage={this.state.inboxMessage} />
		);
	}
}