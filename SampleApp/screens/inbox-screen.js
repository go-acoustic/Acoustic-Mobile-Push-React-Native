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
import {View, FlatList, TouchableOpacity, TouchableNativeFeedback, Platform, Text} from 'react-native';
import {SubscribedComponent} from './subscribed-component';
import {RNAcousticMobilePushInbox} from 'NativeModules';
import {RNAcousticMobilePushInboxEmitter} from './home-screen';
import InboxListItem from '../inbox/inbox-list-item';
import Icon from 'react-native-vector-icons/Ionicons';
const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

export class InboxScreen extends SubscribedComponent {
	static navigationOptions = ({ navigation }) => {
		return {
			title: "Inbox Messages",
			headerRight: (
				<Touchable onPress={ () => { RNAcousticMobilePushInbox.syncInboxMessages(); } }>
					<Icon name="ios-sync" color="#000" size={24} style={{paddingRight: 20}} />
				</Touchable>
			),
		};
	};	

	renderSeparator = () => {
		return (
			<View style={{height: 1, backgroundColor: "#CED0CE", marginLeft: "2%"}} />
		);
	};

	componentDidMount() {
		this.update();
		this.subscriptions.push( RNAcousticMobilePushInboxEmitter.addListener('SyncInbox', () => { 
            this.update();
        }));

	}

	update() {
		RNAcousticMobilePushInbox.listInboxMessages(false, (inboxMessages) => {
			this.setState({inboxMessages: inboxMessages});
		});
	}

	constructor(props) {
		super(props);
		this.state = {inboxMessages: []};
		RNAcousticMobilePushInbox.syncInboxMessages();
		this.update();
	}

	openMessage(item, index) {
		this.props.navigation.navigate('InboxMessage', {inboxMessage: item, index: index, inboxMessages: this.state.inboxMessages });
	}

	renderItem = ({item, index}) => (
		<TouchableOpacity accessibilityRole="button" onPress={() => {this.openMessage(item, index);}}>
			<InboxListItem inboxMessage={item} />
		</TouchableOpacity>
	);

	render() {
		if(this.state.inboxMessages.length) {
			return (
				<FlatList ItemSeparatorComponent={this.renderSeparator} data={this.state.inboxMessages} keyExtractor={ inboxMessage => inboxMessage.inboxMessageId } ListFooterComponent={this.renderSeparator} renderItem={this.renderItem} />
			);
		} else {
			return (<Text style={{ textAlign: "center", padding: 40, fontStyle: "italic"}}>The inbox has no messages</Text>)
		}
	}

}