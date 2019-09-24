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
import {Text, View, Image, ScrollView, NativeEventEmitter} from 'react-native';
import {ListItem} from 'react-native-elements'
import {styles} from '../styles'
import {SubscribedComponent} from './subscribed-component';
import {RNAcousticMobilePush, RNAcousticMobilePushBeacon, RNAcousticMobilePushGeofence, RNAcousticMobilePushLocation, RNAcousticMobilePushInbox} from 'NativeModules';

export const RNAcousticMobilePushEmitter = new NativeEventEmitter(RNAcousticMobilePush);
export const RNAcousticMobilePushLocationEmitter = new NativeEventEmitter(RNAcousticMobilePushLocation);
export const RNAcousticMobilePushBeaconEmitter = new NativeEventEmitter(RNAcousticMobilePushBeacon);
export const RNAcousticMobilePushGeofenceEmitter = new NativeEventEmitter(RNAcousticMobilePushGeofence);
export const RNAcousticMobilePushInboxEmitter = new NativeEventEmitter(RNAcousticMobilePushInbox);

RNAcousticMobilePush.requestPushPermission();

export class HomeScreen extends SubscribedComponent {
	static navigationOptions = {
		title: 'Sample App',
	};
  
	constructor(props){
		super(props);
		this.state = {messages: '', unread: ''};
	}

	update() {
		var self = this;
		RNAcousticMobilePushInbox.inboxMessageCount(function(counts) {
			self.setState(counts);
		});
	}

	componentDidMount() {
		this.update();

		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('Registered', () => { 
			RNAcousticMobilePushInbox.syncInboxMessages();
		}));

		this.subscriptions.push( RNAcousticMobilePushInboxEmitter.addListener('InboxCountUpdate', () => { 
			this.update();
		}));
	}

	render() {
		const {navigate} = this.props.navigation;
		return (
			<ScrollView style={styles.scrollView}>
				<View style={{alignItems: 'center', padding: 10}}>
					<Image style={{marginTop: 20}} source={require('../images/logo.png')} />
					<Image style={{marginTop: 20}} source={require('../images/campaign.png')} />
					<Text style={{marginTop: 20, fontWeight: "bold"}}>Acoustic Mobile Push Sample App</Text>
					<Text>Native SDK v{RNAcousticMobilePush.sdkVersion}</Text>
					<Text style={{marginBottom: 20}}>React Native Plugin v{RNAcousticMobilePush.pluginVersion}</Text>
				</View>
				<ListItem style={styles.firstRow} title="Registration Details" chevron onPress={() => navigate('Registration')} />
				<ListItem style={styles.row} title="Inbox" subtitle={this.state.messages + " messages, " + this.state.unread + ' unread' } chevron onPress={() => navigate('Inbox')} />
				<ListItem style={styles.row} title="InApp" chevron onPress={() => navigate('InApp')} />
				<ListItem style={styles.row} title="Custom Actions" chevron onPress={() => navigate('CustomActions')} />
				<ListItem style={styles.row} title="Send Test Events" chevron onPress={() => navigate('SendTestEvents')} />
				<ListItem style={styles.row} title="Send User Attributes" chevron onPress={() => navigate('SendUserAttributes')} />
				<ListItem style={styles.row} title="Geofences" chevron onPress={() => navigate('Geofences')} />
				<ListItem style={styles.row} title="iBeacons" chevron onPress={() => navigate('iBeacons')} />
			</ScrollView>
		);
	}
}