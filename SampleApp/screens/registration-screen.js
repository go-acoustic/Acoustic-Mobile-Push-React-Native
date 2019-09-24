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
import {Text, ScrollView, NativeEventEmitter} from 'react-native';
import {ListItem} from 'react-native-elements'
import {styles} from '../styles'
import {SubscribedComponent} from './subscribed-component';
import {RNAcousticMobilePush} from 'NativeModules';

const RNAcousticMobilePushEmitter = new NativeEventEmitter(RNAcousticMobilePush);

export class RegistrationScreen extends SubscribedComponent {
	static navigationOptions = {
		title: 'Registration',
	};

	async update() {
		var self = this;
		RNAcousticMobilePush.registrationDetails().then((registrationDetails) => {
			if(typeof(registrationDetails.userId) != 'undefined' && registrationDetails.userId != null && typeof(registrationDetails.channelId) != 'undefined' && registrationDetails.channelId) {
				self.setState({registration: "Finished", userId: registrationDetails.userId, channelId: registrationDetails.channelId});
			} else {
				self.setState({userId: 'unregistered', channelId: 'unregistered', registration: "Click to Start"});
			}
		}).catch((error) => {
			self.setState({userId: "unregistered", channelId: "unregistered", registration: "Click to Start"});
		});
	}
  
	constructor(props){
		super(props);
		this.state = {appKey: RNAcousticMobilePush.appKey, userId: 'unregistered', channelId: 'unregistered', registration: 'unknown'};
	}

	componentDidMount() {
		this.update();
		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('Registered', () => { 
			this.update();
		}));
		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('RegistrationChanged', () => {
			this.update();
		}));
	}

	render() {
		return (
			<ScrollView style={styles.scrollView}>
				<Text style={styles.tableHeader}>Credentials</Text>
				<ListItem style={styles.firstRow} title="User Id" rightTitle={this.state.userId} />
				<ListItem style={styles.row} title="Channel Id" rightTitle={this.state.channelId} />
				<ListItem style={styles.row} title="App Key" rightTitle={this.state.appKey} />
				<ListItem button style={styles.row} title="Registration" rightTitle={this.state.registration} onPress={ ()=>{ 
					RNAcousticMobilePush.manualInitialization();
					this.setState({'registration': "Registering"});
				 }} />
				<Text style={styles.tableFooter}>User ID and Channel ID are known only after registration. The registration process could take several minutes. If you have have issues with registering a device, make sure you have the correct certificate and appKey.</Text>
			</ScrollView>
		);
	}
}
