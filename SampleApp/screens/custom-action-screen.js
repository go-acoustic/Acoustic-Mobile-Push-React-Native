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
import {Text, ScrollView, NativeEventEmitter, StyleSheet, TouchableNativeFeedback, Platform, TextInput, TouchableOpacity} from 'react-native';
import {colors} from '../styles'
import {SubscribedComponent} from './subscribed-component';
import {RNAcousticMobilePush, RNAcousticMobilePushActionHandler} from 'NativeModules';

const RNAcousticMobilePushEmitter = new NativeEventEmitter(RNAcousticMobilePush);
const RNAcousticMobilePushActionHandlerEmitter = new NativeEventEmitter(RNAcousticMobilePushActionHandler);

const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

const pageStyles = StyleSheet.create({
	row: {
		flex: 1, 
		flexDirection:"row", 
		alignItems: "center",
		height: 40
	}, 
	textInput: {
		paddingLeft: 8,
		textAlign: "left",
		height: Platform.OS === 'android' ? 40 : 30,
		flexGrow: 1, 
		borderWidth: 1, 
		borderColor: "#cccccc", 
		borderRadius: 5 
	}, 
	title: {
		paddingTop: 16, 
		paddingBottom: 8, 
		fontWeight: "bold"
	},
	rowTitle: {
		width: 90,
		paddingRight: 16
	},
	scrollView: {
		paddingTop: 8, 
		paddingBottom: 8, 
		paddingLeft: 16,
		paddingRight: 16, 
	}
});

export class CustomActionScreen extends SubscribedComponent {
	static navigationOptions = {
		title: 'Custom Action',
	};

	constructor(props){
		super(props);
		this.state = {
			type: '',
			statusText: 'No status yet',
			statusColor: colors.none,
			registeredActions: new Set()
		};
	}

	unregisterCustomAction() {
		if(this.state.registeredActions.has(this.state.type)) {
			const registeredActions = this.state.registeredActions;
			registeredActions.delete(this.state.type);
			this.setState({registeredActions: registeredActions, statusText: 'Unregistering Custom Action: ' + this.state.type, statusColor: colors.success});
			
			RNAcousticMobilePushActionHandler.unregisterAction(this.state.type);
			RNAcousticMobilePushActionHandlerEmitter.removeListener(this.state.type);
		} else {
			this.setState({statusText: "Custom action type " + this.state.type + ' is not registered', statusColor: colors.warning});				
		}
	}

	componentWillMount() {
		super.componentWillMount();
		const self = this;
		RNAcousticMobilePushEmitter.addListener('CustomPushNotYetRegistered', function (userInfo) {
			self.setState({statusText: "Custom action received, but is not yet registered " + userInfo.type, statusColor: colors.warning});
		});

		RNAcousticMobilePushEmitter.addListener('CustomPushNotRegistered', function (userInfo) {
			self.setState({statusText: "Custom action received, but is not registered " + userInfo.type, statusColor: colors.error});
		});
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		RNAcousticMobilePushEmitter.removeListener('CustomPushNotYetRegistered');
		RNAcousticMobilePushEmitter.removeListener('CustomPushNotRegistered');
		const registeredActions = this.state.registeredActions.values();
		for(const type in registeredActions) {
			RNAcousticMobilePushActionHandler.unregisterAction(type);
			RNAcousticMobilePushActionHandlerEmitter.removeListener(type);
		}
	}

	registerCustomAction() {
		const registeredActions = this.state.registeredActions;
		const self = this;
		if(registeredActions.has(this.state.type)) {
			self.setState({statusText: "Custom action type " + this.state.type + " is already registered", statusColor: colors.warning});
		} else {
			self.setState({statusText: 'Registering Custom Action: ' + this.state.type, statusColor: colors.success});
		}
		registeredActions.add(this.state.type);
		self.setState({registeredActions: registeredActions});

		function handleCustomAction(details) {
			self.setState({statusText: "Received Custom Action: " + JSON.stringify(details), statusColor: colors.success});
		}

		RNAcousticMobilePushActionHandler.registerAction(this.state.type, handleCustomAction);
		RNAcousticMobilePushActionHandlerEmitter.addListener(this.state.type, handleCustomAction);
	}

	render() {
		const self = this;
		return (
			<ScrollView style={{minHeight:'100%', paddingLeft: 16, paddingRight: 16}}>
				<Text style={pageStyles.title}>Custom Action Type</Text>
				<TextInput placeholder="optional" style={pageStyles.textInput} value={self.state.type} onChangeText={(text) =>    
					self.setState({type: text})
				} keyboardType="default" autoCorrect={false} autoCompleteType={"off"} autoCapitalize="none" clearButtonMode="always" />

				<Text style={pageStyles.title}>Register Custom Action</Text>
				<Touchable accessibilityRole="button" onPress={ () => { self.registerCustomAction() } }>
					<Text style={{color: colors.blue}}>Register Custom Action with Type</Text>
				</Touchable>
				<Text style={pageStyles.title}>Unregister Custom Action</Text>

				<Touchable accessibilityRole="button" onPress={ () => { self.unregisterCustomAction() } }>
					<Text style={{color: colors.blue}}>Unregister Custom Action with Type</Text>
				</Touchable>

				<Text style={pageStyles.title}>Status</Text>
				<Text style={{color: self.state.statusColor}}>{self.state.statusText}</Text>

			</ScrollView>
		);
	}
}