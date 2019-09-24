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

const customEventOptions = {
	custom: {index: 0, text: "Send Custom Event", types: ["custom"]}, 
	simulate: {index: 1, text: "Simulate SDK Event"}
};

const simulateEventOptions = [
	{text: "app", types: ['application'], names: ["sessionStarted", "sessionEnded", "uiPushEnabled", "uiPushDisabled"]}, 
	{text: "action", types: ["simpleNotificationSource","inboxSource","inAppSource"], names: ["urlClicked", "appOpened", "phoneNumberClicked", "inboxMessageOpened"]}, 
	{text: "inbox", types: ["inbox"], names: ["messageOpened"]},
	{text: "geofence", types: ["geofence"], names: ["disabled", "enabled", "enter", "exit"]},
	{text: "ibeacon", types: ["ibeacon"], names: ["disabled", "enabled", "enter", "exit"]},
];

const attributeTypeOptions = {
	date: {index: 0, text: "date"}, 
	string: {index: 1, text: "string"}, 
	boolean: {index: 2, text: "boolean" } ,
	number: {index: 3, text: "number" } ,
};

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

export class SendTestEventScreen extends SubscribedComponent {
	static navigationOptions = {
		title: 'Send Events',
	};

	constructor() {
		super();
		this.state = {
			customEventSelectedIndex: 0,
			simulateEventSelectedIndex: 0,
			eventTypeSelectedIndex: 0,
			eventAttributeTypeSelectedIndex: 0,
			eventNameSelectedIndex: 0,
			eventNameText: "",
			attributeName: "",
			attribution: "",
			mailingId: "",
			statusText: "No status yet",
			statusColor: colors.none,
			attributeBooleanValue: true,
			attributeDateValue: new Date(),
			attributeDatePicker: false,
			attributeValue: "",
		};
	}

	eventsToString(userInfo) {
		var events = [];
		for(let index in userInfo.events) {
			let event = userInfo.events[index];
			events.push("name: " + event.name + ", type: " + event.type);
		}
		return events.join(', ');
	}

	componentDidMount() {
		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('EventSuccess', (userInfo) => { 
			this.setState({statusColor: colors.success, statusText: "Sent events: " + this.eventsToString(userInfo) });
		}));

		this.subscriptions.push( RNAcousticMobilePushEmitter.addListener('EventFailure', (userInfo) => { 
			this.setState({statusColor: colors.error, statusText: "Couldn't send events: " + this.eventsToString(userInfo) + ", because: " + userInfo.error});
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

	eventName() {
		if(this.state.customEventSelectedIndex == customEventOptions.custom.index) {
			return <TextInput placeholder="required" style={pageStyles.textInput} value={this.state.eventNameText} onChangeText={(text) =>    
				this.setState({eventNameText: text})
			} keyboardType="default" autoCorrect={false} autoCompleteType={"off"} autoCapitalize="none" clearButtonMode="always" />;
		} else if(this.state.customEventSelectedIndex == customEventOptions.simulate.index) {
			var eventNameOptions = simulateEventOptions[this.state.simulateEventSelectedIndex].names
			if(this.state.eventNameSelectedIndex > eventNameOptions.length) {
				this.setState({eventNameSelectedIndex: 0});
			}
			return (
				<View style={{flexGrow: 1 }}>
					<SegmentedControlTab values={eventNameOptions} selectedIndex={this.state.eventNameSelectedIndex} onTabPress={index =>
						this.setState({eventNameSelectedIndex: index})
					} />
				</View>
			);
		}
	}

	eventType() {
		var eventTypeOptions;
		if(this.state.customEventSelectedIndex == customEventOptions.simulate.index) {
			eventTypeOptions = simulateEventOptions[this.state.simulateEventSelectedIndex].types
		} else if(this.state.customEventSelectedIndex == customEventOptions.custom.index) {
			eventTypeOptions = customEventOptions.custom.types;
		}    
	
		if(this.state.eventTypeSelectedIndex > eventTypeOptions.length) {
			this.setState({eventTypeSelectedIndex: 0});
		}
		return (
			<View style={{flexGrow: 1 }}>
				<SegmentedControlTab values={eventTypeOptions} selectedIndex={this.state.eventTypeSelectedIndex} onTabPress={ index => {
					this.setState({eventTypeSelectedIndex: index});
				}} />
			</View>
		);
	}

	attributeType() {
		const attributeTypeOptionsText = this.extractOptionsText(attributeTypeOptions);
		if(this.state.eventAttributeTypeSelectedIndex > attributeTypeOptions.length) {
			this.setState({eventAttributeTypeSelectedIndex: 0});
		}

		return (
			<View style={{flexGrow: 1}}>
				<SegmentedControlTab values={attributeTypeOptionsText} selectedIndex={this.state.eventAttributeTypeSelectedIndex} onTabPress={ index => {
					this.setState({eventAttributeTypeSelectedIndex: index});
				}} />
			</View>
		);
	}

	attributeValue() {
		var keyboardType = "default";
		if(this.state.eventAttributeTypeSelectedIndex == attributeTypeOptions.boolean.index) {
			return (
				<View style={{flex:1, flexDirection: "row", alignItems:"center", justifyContent:"center"}}>
					<Text style={{paddingRight: 8}}>False</Text>
					<Switch value={this.state.attributeBooleanValue} onValueChange={(value) =>    
						this.setState({attributeBooleanValue: value})
					} />
					<Text style={{paddingLeft: 8}}>True</Text>
				</View>
			);
		} else if(this.state.eventAttributeTypeSelectedIndex == attributeTypeOptions.date.index) {
			return (
				<View>
					<Touchable accessibilityRole="button" onPress={ () => {
							this.setState({ attributeDatePicker: true });
					} }>
						<Text style={{color: colors.blue}}>{this.state.attributeDateValue.toISOString()}</Text>
					</Touchable>
					<DateTimePicker
							mode="datetime"
							date={this.state.attributeDateValue}
							isVisible={this.state.attributeDatePicker}
							onConfirm={(date) => 
								this.setState({ attributeDatePicker: false, attributeDateValue: date })
							}
							onCancel={() => 
								this.setState({ attributeDatePicker: false }) 
							}
						/>
				</View>
			);
		} else if(this.state.eventAttributeTypeSelectedIndex == attributeTypeOptions.number.index) {
			keyboardType = "decimal-pad";
			if(isNaN(parseFloat(this.state.attributeValue))) {
				this.state.attributeValue="";
			}
		}
		return (
			<TextInput style={pageStyles.textInput} value={this.state.attributeValue} onChangeText={(text) =>    
				this.setState({attributeValue: text})
			} keyboardType={keyboardType} autoCorrect={false} autoCompleteType={"off"} autoCapitalize="none" clearButtonMode="always" />
		);
	}

	attributeName() {
		return (
			<TextInput placeholder="optional" style={pageStyles.textInput} value={this.state.attributeName} onChangeText={(text) =>    
				this.setState({attributeName: text})
			} keyboardType="default" autoCorrect={false} autoCompleteType={"off"} autoCapitalize="none" clearButtonMode="always" />
		);
	}

	mailingId() {
		return (
			<TextInput placeholder="optional" style={pageStyles.textInput} value={this.state.mailingId} onChangeText={(text) =>    
				this.setState({mailingId: text})
			} keyboardType="default" autoCorrect={false} autoCompleteType={"off"} autoCapitalize="none" clearButtonMode="always" />
		);
	}

	attribution() {
		return (
			<TextInput placeholder="optional" style={pageStyles.textInput} value={this.state.attribution} onChangeText={(text) =>    
				this.setState({attribution: text})
			} keyboardType="default" autoCorrect={false} autoCompleteType={"off"} autoCapitalize="none" clearButtonMode="always" />
		);
	}

	queueEvent() {
		var event = {};
		if(this.state.customEventSelectedIndex == customEventOptions.simulate.index) {
			event.type = simulateEventOptions[this.state.simulateEventSelectedIndex].types[this.state.eventTypeSelectedIndex];
			event.name = simulateEventOptions[this.state.simulateEventSelectedIndex].names[this.state.eventNameSelectedIndex];
		} else if(this.state.customEventSelectedIndex == customEventOptions.custom.index) {
			event.type = customEventOptions.custom.types[this.state.eventNameSelectedIndex];
			event.name = this.state.eventNameText;
		}    

		if(this.state.attribution.length) {
			event.attribution = this.state.attribution;
		}

		if(this.state.mailingId.length) {
			event.mailingId = this.state.mailingId;
		}

		var name = this.state.attributeName;
		if(name.length > 0) {
			var attributes = {};
			if(this.state.eventAttributeTypeSelectedIndex == attributeTypeOptions.boolean.index) {
				attributes[name] = this.state.attributeBooleanValue;
			} else if(this.state.eventAttributeTypeSelectedIndex == attributeTypeOptions.string.index) {
				var value = this.state.attributeValue;
				if(value.length > 0) {
					attributes[name] = value;
				}
			} else if(this.state.eventAttributeTypeSelectedIndex == attributeTypeOptions.date.index) {
				attributes[name] = this.state.attributeDateValue;
			} else if(this.state.eventAttributeTypeSelectedIndex == attributeTypeOptions.number.index) {
				var value = parseFloat(this.state.attributeValue);
				if(!isNaN(value)) {
					attributes[name] = value;
				}
			}

			if(Object.getOwnPropertyNames(attributes).length) {
					event.attributes = attributes;
			}
		}

		RNAcousticMobilePush.addEvent(event, true);
		this.setState({statusColor: colors.queued, statusText: "Queued Event with name: " + event.name + ", type: " + event.type});
	}

	sendEvent() {
		return (
			<Touchable accessibilityRole="button" onPress={ () => this.queueEvent() }>
				<Text style={{color: colors.blue, paddingTop: 16}}>Send Event</Text>
			</Touchable>
		);
	}

	simulateEvent() {
		const simulateEventOptionsText = simulateEventOptions.map((item) => item.text);
		if(this.state.simulateEventSelectedIndex > simulateEventOptions.length) {
			this.setState({simulateEventSelectedIndex: 0});
		}

		const simulateEventEnabled = this.state.customEventSelectedIndex == customEventOptions.simulate.index;
		return (
			<SegmentedControlTab enabled={simulateEventEnabled} values={simulateEventOptionsText} selectedIndex={this.state.simulateEventSelectedIndex} onTabPress={ index => {
				this.setState({simulateEventSelectedIndex: index});
			}} />
		);
	}

	customEvent() {
		const customEventOptionsText = this.extractOptionsText(customEventOptions);
		if(this.state.customEventSelectedIndex > customEventOptions.length) {
			this.setState({customEventSelectedIndex: 0});
		}

		return (
			<SegmentedControlTab values={customEventOptionsText} selectedIndex={this.state.customEventSelectedIndex} onTabPress={ index => {
				this.setState({customEventSelectedIndex: index});
			}} />
		);
	}

	status() {
		return (
			<Text style={{color: this.state.statusColor}}>{this.state.statusText}</Text>
		);
	}

	render() {
		return (
			<KeyboardAwareScrollView contentContainerStyle={pageStyles.scrollView} resetScrollToCoords={{ x: 0, y: 0 }} >
				<View style={{paddingTop: 8, paddingBottom: 8}}>
					{ this.customEvent() }
				</View>
				<View style={{paddingTop: 8, paddingBottom: 8}}>
					{ this.simulateEvent() }
				</View>

				<Text style={pageStyles.title}>Event Details</Text>
				<View style={pageStyles.row}>
					<Text style={pageStyles.rowTitle}>Type</Text>
					{ this.eventType() }
				</View>
				<View style={pageStyles.row}>
					<Text style={pageStyles.rowTitle}>Name</Text>
					{ this.eventName() }
				</View>
				<View style={pageStyles.row}>
					<Text style={pageStyles.rowTitle}>Attribution</Text>
					{ this.attribution() }
				</View>
				<View style={pageStyles.row}>
					<Text style={pageStyles.rowTitle}>Mailing Id</Text>
					{ this.mailingId() }
				</View>

				<Text style={pageStyles.title}>Event Attribute</Text>
				<View style={pageStyles.row}>
					<Text style={pageStyles.rowTitle}>Name</Text>
					{ this.attributeName() }
				</View>
				<View style={pageStyles.row}>
					<Text style={pageStyles.rowTitle}>Value</Text>
					{ this.attributeType() }
				</View>
				<View style={pageStyles.row}>
					<View style={pageStyles.rowTitle} />
					{ this.attributeValue() }
				</View>
				{ this.sendEvent() }
				<Text style={pageStyles.title}>Status</Text>
				{ this.status() }
			</KeyboardAwareScrollView>
		);
	}
}


