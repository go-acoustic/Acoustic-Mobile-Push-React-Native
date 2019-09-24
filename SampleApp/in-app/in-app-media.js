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
import {AppRegistry, Animated, SafeAreaView, Image, Dimensions, View, TouchableNativeFeedback, Platform, TouchableOpacity, Text, StyleSheet} from 'react-native';
import React from 'react';
import {RNAcousticMobilePushInApp} from 'NativeModules';
import {InAppTemplate} from './in-app-template';
import Video, {FilterType} from 'react-native-video';

const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

export class InAppMedia extends InAppTemplate {
	constructor(props) {
		super(props);
		this.state.expanded = false;
		this.state.interacted = false;
	}

	hiddenAnimationValue() {
		return 0;
	}

	shownAnimationValue() {
		return 1;
	}

	expand() {
		clearTimeout(this.timer);
		let expanded = !this.state.expanded;
		this.setState({expanded: expanded, interacted: true});
	}

	onEnd() {
		if(!this.state.interacted) {
			this.hide();
		}
	}

	render() {
		let maxHeight = this.state.expanded ? "100%" : 40;
		let blurRadius = this.state.expanded ? 10 : 0;

		let content;
		let contentStyle = { width: '100%', height: '100%' };
		if(this.state.message.templateName == "image") {
			contentStyle.resizeMode = 'contain';
			content = (<Image loadingIndicatorSource={ require('./images/loading.gif') } source={{ uri: this.content().image }} blurRadius={blurRadius} style={contentStyle} />);
		} else {
			content = (<Video onEnd={ () => { this.onEnd() }} style={contentStyle} source={{uri: this.content().video }} />);
		}

		return (
			<Animated.View style={{ height: '100%', width: '100%', opacity: this.state.animation, backgroundColor: "rgba(0,0,0,0.7)" }}>
				<SafeAreaView style={{height: "100%", width: "100%"}}>
					<View style={{width: '100%', height: '100%'}}>
						<View style={{ position: 'absolute', right: 10, top: 10, width: 24, height: 24 }}>
							<Touchable onPressIn={() => { this.hide(); }}>
								<Image style={{ width: '100%', height: '100%' }} source={ require('./images/cancel.png') } /> 
							</Touchable>
						</View>

						<View style={{ position: 'absolute', left: 0, right: 0, bottom: 40, top: 40  }}>
							<Touchable onPressIn={() => { this.activate(); }}>
								{ content }
							</Touchable>
						</View>


						<View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, maxHeight: maxHeight }}>
							<Touchable onPressIn={() => {  this.expand() }}>
								<View style={{ height: '100%', width: '100%' }}>
									<Text style={{ color: '#ffffff', fontWeight: "bold", paddingLeft: 10, paddingRight: 10 }}>{this.content().title}</Text>
									<View style={{ width: '100%', borderBottomColor: '#ffffff', borderBottomWidth: 1 }} />
									<Text style={{ color: '#ffffff', paddingLeft: 10, paddingRight: 10 }}>{this.content().text}</Text>
								</View>
							</Touchable>
						</View>
					</View>
				</SafeAreaView>
			</Animated.View>
		);
	}
}

if(typeof(RNAcousticMobilePushInApp) != "undefined") {
	AppRegistry.registerComponent("InAppImage", () => InAppMedia);
	RNAcousticMobilePushInApp.registerInApp("image", "InAppImage", 0);

	AppRegistry.registerComponent("InAppVideo", () => InAppMedia);
	RNAcousticMobilePushInApp.registerInApp("video", "InAppVideo", 0);	
} else {
	console.error("Could not register InAppImage and InAppVideo Templates!");
}