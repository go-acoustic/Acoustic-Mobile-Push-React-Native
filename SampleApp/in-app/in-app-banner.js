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
import {AppRegistry, Animated, Image, View, TouchableNativeFeedback, Platform, TouchableOpacity, Text, StyleSheet} from 'react-native';
import React from 'react';
import {RNAcousticMobilePushInApp} from 'NativeModules';
import {InAppTemplate} from './in-app-template';

const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

const imageSize = 24;
const padding = 8;

const styles = StyleSheet.create({
	imageStyle: {
		width: imageSize, 
		height: imageSize, 		
	},

	imageContainerStyle: {
		position: 'absolute', 
		width: imageSize + padding * 2, 
		paddingRight: padding, 
		paddingLeft: padding, 
		alignItems: 'center', 
		flex: 1, 
		flexDirection: 'row'
	},

	textContainerStyle: { 
		position: 'absolute', 
		left: padding*2 + imageSize, 
		right: padding*2 + imageSize, 
		alignItems: 'center', 
		padding: padding, 
		
		flex: 1, 
		flexDirection: 'row'
	},

	textStyle: {
		paddingLeft: padding, 
		paddingRight: padding, 
		textAlign: 'center', 
		flexGrow: 1
	},

	containerStyle: {
		position: "absolute",
		left: 0,
		right: 0,
	}
});

const validImages = {
	note: require('./images/note.png'),
	comment: require('./images/comment.png'),
	notification: require('./images/notification.png'),
	offer: require('./images/offer.png'),
	store: require('./images/store.png'),
};

export default class InAppBanner extends InAppTemplate {
	hiddenAnimationValue() {
		if(typeof this.content().orientation != "undefined" && this.content().orientation.toLowerCase() == "top") {
			return -1 * this.state.containerHeight;
		} else {
			return this.state.containerHeight;
		}
	}

	foreground() {
		return this.convertColor(this.content().foreground, "#000000");
	}

	color() {
		return this.convertColor(this.content().color, "#cccccc");
	}

	render() {
		var containerStyle = Object.assign({}, styles.containerStyle);
		containerStyle.height = this.state.containerHeight;
		containerStyle.top = this.state.animation;

		let messageStyle = {height: this.state.containerHeight};

		return (
			<Animated.View style={ containerStyle }>
				<View style={ messageStyle }>
					{ this.background() }
					{ this.icon() }
					{ this.text() }
					{ this.text() }
					{ this.closeButton() }
				</View>
			</Animated.View>
		);
	}

	background() {
		let backgroundStyle = {position: 'absolute', left: 0, right: 0, bottom: 0, top:0};
		if(this.content().mainImage) {
			return (<Image style={backgroundStyle} source={{uri: this.content().mainImage}} />)
		} else {
			backgroundStyle.backgroundColor = this.color();
			return (<View style={backgroundStyle} />);
		}
	}
	
	text() {
		var textStyle = Object.assign({}, styles.textStyle);
		textStyle.color = this.foreground();

		var textContainerStyle = Object.assign({}, styles.textContainerStyle);
		textContainerStyle.height = this.state.contentHeight;
		if(typeof this.content().orientation != "undefined" &&  this.content().orientation.toLowerCase() == "top") {
			textContainerStyle.top = this.state.containerHeight - this.state.contentHeight;
		} else {
			textContainerStyle.top = 0;
		}

		return (
			<Touchable onPressIn={() => { 
				this.activate(); 
			}}>
				<View style={ textContainerStyle }>
					<Text style={ textStyle }>{ this.content().text }</Text>
				</View>
			</Touchable>
		);
	}

	icon() {
		let imageStyle = Object.assign({tintColor: this.foreground()}, styles.imageStyle);
		var icon = validImages[this.content().icon] ? (<Image style={imageStyle} source={ validImages[this.content().icon] } />) : (<View style={{width: imageSize, height: imageSize}} />);
		let leftImageContainerStyle = Object.assign({left:0}, this.imageContainerStyle());
		return (
			<Touchable onPressIn={() => {
				this.activate();
				}}>
				<View style={ leftImageContainerStyle }>
					{ icon }
				</View>
			</Touchable>
		);
	}

	imageContainerStyle() {
		var imageContainerStyle = Object.assign({}, styles.imageContainerStyle);
		imageContainerStyle.height = this.state.contentHeight;

		if(typeof this.content().orientation != "undefined" &&  this.content().orientation.toLowerCase() == "top") {
			imageContainerStyle.top = this.state.containerHeight - this.state.contentHeight;
		} else {
			imageContainerStyle.top = 0;
		}

		return imageContainerStyle;
	}

	closeButton() {
		let rightImageContainerStyle = Object.assign({right:0}, this.imageContainerStyle() );
		let imageStyle = Object.assign({tintColor: this.foreground()}, styles.imageStyle);

		return (
			<Touchable onPressIn={() => {
				this.hide();
				}}>
				<View style={ rightImageContainerStyle }>
					<Image style={ imageStyle } source={require('./images/cancel.png')} />
				</View>
			</Touchable>
		);
	}
}

if(typeof(RNAcousticMobilePushInApp) != "undefined") {
	AppRegistry.registerComponent("InAppBanner", () => InAppBanner);
	RNAcousticMobilePushInApp.registerInApp("default", "InAppBanner", 44);
} else {
	console.error("Could not register InAppBanner Template!");
}