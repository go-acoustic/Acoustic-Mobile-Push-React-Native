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
import {Text, View, StyleSheet, TouchableNativeFeedback, TouchableOpacity, Platform, Switch} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {colors} from '../styles'
import SegmentedControlTab from "react-native-segmented-control-tab";
import {TextInput} from 'react-native-gesture-handler';
import {RNAcousticMobilePush} from 'NativeModules';
import {RNAcousticMobilePushEmitter} from './home-screen';
import {SubscribedComponent} from './subscribed-component';

const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

const pageStyles = StyleSheet.create({
	row: {
		flex: 1, 
		flexDirection:"row", 
		alignItems: "center",
		height: Platform.OS === 'android' ? 50 : 40
	}, 
	textInput: {
		textAlign: "right",
		flexGrow: 1, 
		borderWidth: 1, 
		borderColor: "#cccccc", 
		borderRadius: 5,
		height: Platform.OS === 'android' ? 40 : 30
	}, 
	title: {
		paddingTop: 16, 
		paddingBottom: 0, 
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

const attributeOperations = {
	update: {index: 0, text: "Update"},
	delete: {index: 1, text: "Delete"},
};

const typeOptions = {
	date: {index: 0, text: "date"}, 
	string: {index: 1, text: "string"}, 
	boolean: {index: 2, text: "boolean" } ,
	number: {index: 3, text: "number" } ,
};


export class SendUserAttributeScreen extends SubscribedComponent {
	static navigationOptions = {
		title: 'Send User Attributes',
	};

	constructor() {
		super();
		this.state = {
			name: "",
			value: "",
			datePicker: false,
			booleanValue: true,
			statusText: "No status yet",
			statusColor: colors.none,
			operationSelectedIndex: 0,
			typeSelectedIndex: 0,
			dateValue: new Date(),
			safeArea: {
				left:0,
				right:0,
				bottom:0,
				top:0,
			},
		};

		const self = this;
		RNAcousticMobilePush.safeAreaInsets(function (safeArea) {
			self.setState({safeArea: safeArea});
		});
	}

	attributesToString(userInfo) {
		var attributes = [];
		const keys = Object.getOwnPropertyNames(userInfo.attributes);
		for(let index in keys) {
			let key = keys[index];
			let value = userInfo.attributes[key];
			attributes.push(key + '=' + value);
		}
		return attributes.join(', ');
	}

	componentDidMount() {
		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('UpdateUserAttributesSuccess', (userInfo) => { 
			this.setState({statusColor: colors.success, statusText: "Sent attributes: " + this.attributesToString(userInfo) });
		}));

		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('UpdateUserAttributesError', (userInfo) => { 
			this.setState({statusColor: colors.error, statusText: "Couldn't send attributes: " + this.attributesToString(userInfo) + ", because: " + userInfo.error});
		}));

		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('DeleteUserAttributesSuccess', (userInfo) => { 
			this.setState({statusColor: colors.success, statusText: "Deleted attributes: " + userInfo.keys.join(', ') });
		}));


		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('DeleteUserAttributesError', (userInfo) => { 
			this.setState({statusColor: colors.error, statusText: "Couldn't delete attributes: " + userInfo.keys.join(', ') + ", because: " + userInfo.error});
		}));
	}

	extractOptionsText(options) {
		var optionsText = [];
		const sortedOptions = Object.getOwnPropertyNames(options).sort( function (a,b) { 
			return options[a].index > options[b].index;
		} );
		for(var i in sortedOptions) {
			const index = sortedOptions[i];
			optionsText.push(options[index].text);
		}
		return optionsText
	}

	attributeType() {
		const typeOptionsText = this.extractOptionsText(typeOptions);
		if(this.state.typeSelectedIndex > typeOptions.length) {
			this.setState({typeSelectedIndex: 0});
		}

		return (
			<View style={{flexGrow: 1, paddingBottom: 10}}>
				<SegmentedControlTab values={typeOptionsText} selectedIndex={this.state.typeSelectedIndex} onTabPress={ index => {
					this.setState({typeSelectedIndex: index});
				}} />
			</View>
		);
	}

	operation() {
		const operationsText = this.extractOptionsText(attributeOperations);
		if(this.state.operationSelectedIndex > attributeOperations.length) {
			this.setState({operationSelectedIndex: 0});
		}

		return (
			<View style={{flexGrow: 1}}>
				<SegmentedControlTab values={operationsText} selectedIndex={this.state.operationSelectedIndex} onTabPress={ index => {
					this.setState({operationSelectedIndex: index});
				}} />
			</View>
		);
	}

	attributeValue() {
		var keyboardType = "default";
		if(this.state.typeSelectedIndex == typeOptions.boolean.index) {
			return (
				<View style={{flex:1, flexDirection: "row", alignItems:"center", justifyContent:"center"}}>
					<Text style={{paddingRight: 8}}>False</Text>
					<Switch value={this.state.booleanValue} onValueChange={(value) =>    
						this.setState({booleanValue: value})
					} />
					<Text style={{paddingLeft: 8}}>True</Text>
				</View>
			);
		} else if(this.state.typeSelectedIndex == typeOptions.date.index) {
			return (
				<View>
					<Touchable accessibilityRole="button" onPress={ () => {
							this.setState({ datePicker: true });
					} }>
						<Text style={{color: colors.blue}}>{this.state.dateValue.toISOString()}</Text>
					</Touchable>
					<DateTimePicker
							mode="datetime"
							date={this.state.dateValue}
							isVisible={this.state.datePicker}
							onConfirm={(date) => 
								this.setState({ datePicker: false, dateValue: date })
							}
							onCancel={() => 
								this.setState({ datePicker: false }) 
							}
						/>
				</View>
			);
		} else if(this.state.typeSelectedIndex == typeOptions.number.index) {
			keyboardType = "decimal-pad";
			if(isNaN(parseFloat(this.state.value))) {
				this.state.value="";
			}
		}
		return (
			<TextInput style={pageStyles.textInput} value={this.state.value} onChangeText={(text) =>    
				this.setState({value: text})
			} keyboardType={keyboardType} autoCorrect={false} autoCompleteType={"off"} autoCapitalize="none" clearButtonMode="always" />
		);
	}

	attributeName() {
		return (
			<TextInput placeholder="optional" style={pageStyles.textInput} value={this.state.name} onChangeText={(text) =>    
				this.setState({name: text})
			} keyboardType="default" autoCorrect={false} autoCompleteType={"off"} autoCapitalize="none" clearButtonMode="always" />
		);
	}

	queueAttribute() {
		const name = this.state.name;
		if(this.state.operationSelectedIndex == attributeOperations.update.index) {
			var attributes = {};
			if(this.state.typeSelectedIndex == typeOptions.boolean.index) {
				attributes[name] = this.state.booleanValue;
			} else if(this.state.typeSelectedIndex == typeOptions.date.index) {
				attributes[name] = this.state.dateValue;
			} else if(this.state.typeSelectedIndex == typeOptions.number.index) {
				const value = parseFloat(this.state.value);
				if(!isNaN(value)) {
					attributes[name] = value;
				}
			} else if(this.state.typeSelectedIndex == typeOptions.string.index) {
				attributes[name] = this.state.value;
			}

			RNAcousticMobilePush.updateUserAttributes(attributes);
			this.setState({statusColor: colors.queued, statusText: "Queued Update " + name + "=" + attributes[name]});
		} else if(this.state.operationSelectedIndex == attributeOperations.delete.index) {
			RNAcousticMobilePush.deleteUserAttributes([name]);
			this.setState({statusColor: colors.queued, statusText: "Queued Delete " + name});
		}
	}

	sendAttribute() {
		return (
			<Touchable accessibilityRole="button" onPress={ () => this.queueAttribute() }>
				<Text style={{color: colors.blue, paddingTop: 16}}>Send Attribute</Text>
			</Touchable>
		);
	}

	status() {
		return (
			<Text style={{color: this.state.statusColor}}>{this.state.statusText}</Text>
		);
	}

	render() {
		return (
			<View style={{position: 'absolute', left:this.state.safeArea.left, right:this.state.safeArea.right, top:0, bottom: this.state.safeArea.bottom }}>
				<KeyboardAwareScrollView contentContainerStyle={pageStyles.scrollView} resetScrollToCoords={{ x: 0, y: 0 }} >
					<Text style={pageStyles.title}>Key Name</Text>
					{ this.attributeName() }
					<Text style={pageStyles.title}>Value</Text>
					{ this.attributeType() }
					{ this.attributeValue() }
					<Text style={pageStyles.title}>Operation</Text>
					{ this.operation() }

					{ this.sendAttribute() }
					<Text style={pageStyles.title}>Status</Text>
					{ this.status() }


				</KeyboardAwareScrollView>
				<Text style={{padding: 10, position: 'absolute', bottom: 0, left: 0, right: 0}}>Note: The key name and value type above must match a column in your WCA database in order to propagate.</Text>

			</View>
		);
	}
}