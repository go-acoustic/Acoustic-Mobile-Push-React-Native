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
import {Animated} from 'react-native';
import {RNAcousticMobilePushInApp} from 'NativeModules';

export class InAppTemplate extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			containerHeight: props.containerHeight,
			contentHeight: props.contentHeight,
			message: props.message,
		};
		this.state.animation = new Animated.Value(this.hiddenAnimationValue());
	}

	hiddenAnimationValue() {
		// Override this and provide the value for a hidden notification.
	}

	shownAnimationValue() {
		// Override this if zero isn't appropriate for your template.
		return 0;
	}

	activate() {
		this.hide();
		RNAcousticMobilePushInApp.clickInApp(this.state.message.inAppMessageId);
	}

	convertColor(color, defaultValue) {
		if(typeof(color) == "undefined") {
			return defaultValue;
		}

		if(typeof(color.length) != "undefined") {
			if(color[0] != '#') {
				color = '#' + color;
			}
			return color;
		} else if(typeof(color.red) != "undefined" && typeof(color.green) != "undefined" && typeof(color.blue) != "undefined") {
			return "rgb(" + (color.red * 255) + "," + (color.green * 255) + "," +(color.blue * 255) + ")";
		}
		return defaultValue;
	}

	hide() {
		clearTimeout(this.timer);
		Animated.timing(this.state.animation, {toValue: this.hiddenAnimationValue(), duration: this.animationLength()}).start((finished) => { RNAcousticMobilePushInApp.hideInApp(); });
	}

	show() {
		clearTimeout(this.timer);
		Animated.timing(this.state.animation, {toValue: this.shownAnimationValue(), duration: this.animationLength()}).start();
		if(this.duration()) {
			this.timer = setTimeout(() => this.hide(), this.duration());
		}
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
	}


	componentDidMount() {
		this.show();
	}

	content() {
		return this.state.message.content;
	}


	animationLength() {
		let animationLength = this.content().animationLength;
		if(typeof(animationLength) == "undefined") {
			return 500;
		}
		return animationLength * 1000;
	}

	duration() {
		let duration = this.content().duration;
		if(typeof(duration) == "undefined") {
			return 5000;
		}
		return duration * 1000;
	}
}