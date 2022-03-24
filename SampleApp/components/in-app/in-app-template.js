/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import React from 'react';
import { Animated, NativeModules } from 'react-native';

const { RNAcousticMobilePushInApp } = NativeModules;

export class InAppTemplate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      containerHeight: props.containerHeight,
      contentHeight: props.contentHeight,
      message: props.message,
    };
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidMount() {
    const animation = new Animated.Value(this.hiddenAnimationValue());

    this.setState({ animation }, () => {
      this.show();
    });
  }

  hiddenAnimationValue() {
    // Override this and provide the value for a hidden notification.
  }

  shownAnimationValue() {
    // Override this if zero isn't appropriate for your template.
    return 0;
  }

  activate() {
    const { message: { inAppMessageId } } = this.state;

    this.hide();
    RNAcousticMobilePushInApp.clickInApp(inAppMessageId);
  }

  convertColor(color, defaultValue) {
    if (typeof (color) === 'undefined') {
      return defaultValue;
    }

    if (typeof (color.length) !== 'undefined') {
      return color[0] !== '#' ? `#${color}` : color;
    }

    if (typeof (color.red) !== 'undefined' && typeof (color.green) !== 'undefined' && typeof (color.blue) !== 'undefined') {
      return `rgb(${color.red * 255},${color.green * 255},${color.blue * 255})`;
    }

    return defaultValue;
  }

  hide() {
    const { animation } = this.state;
    clearTimeout(this.timer);
    Animated.timing(animation, {
      toValue: this.hiddenAnimationValue(),
      duration: this.animationLength(),
      useNativeDriver: false,
    }).start(() => { RNAcousticMobilePushInApp.hideInApp(); });
  }

  show() {
    const { animation } = this.state;
    clearTimeout(this.timer);
    Animated.timing(animation, {
      toValue: this.shownAnimationValue(),
      duration: this.animationLength(),
      useNativeDriver: false,
    }).start();

    if (this.duration()) {
      this.timer = setTimeout(() => this.hide(), this.duration());
    }
  }

  content() {
    const { message: { content } } = this.state;

    return content;
  }

  animationLength() {
    const { animationLength } = this.content();

    if (typeof (animationLength) === 'undefined') {
      return 500;
    }
    return animationLength * 1000;
  }

  duration() {
    const { duration } = this.content();

    if (typeof (duration) === 'undefined') {
      return 5000;
    }
    return duration * 1000;
  }
}
