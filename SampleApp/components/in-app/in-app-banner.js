/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import { AppRegistry, Animated, Image, View, NativeModules, Text } from 'react-native';
import React from 'react';
import { InAppTemplate } from './in-app-template';
import { Touchable } from '../../helpers/Touchable';
import { styles, padding, imageSize } from './in-app-banner.style.js';

const { RNAcousticMobilePushInApp } = NativeModules;


const validImages = {
  note: require('./images/note.png'),
  comment: require('./images/comment.png'),
  notification: require('./images/notification.png'),
  offer: require('./images/offer.png'),
  store: require('./images/store.png'),
};

export default class InAppBanner extends InAppTemplate {

  hiddenAnimationValue() {
    const { containerHeight } = this.state;

    if (typeof this.content().orientation !== 'undefined' && this.content().orientation.toLowerCase() === 'top') {
      return -1 * containerHeight;
    }

    return containerHeight;
  }

  foreground() {
    return this.convertColor(this.content().foreground, '#000000');
  }

  color() {
    return this.convertColor(this.content().color, '#cccccc');
  }

  background() {
    const backgroundStyle = { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 };
    if (this.content().mainImage) {
      return (<Image style={backgroundStyle} source={{ uri: this.content().mainImage }} />);
    }
    backgroundStyle.backgroundColor = this.color();
    return (<View style={backgroundStyle} />);
  }

  text() {
    const { containerHeight, contentHeight } = this.state;
    const textStyle = Object.assign({}, styles.textStyle);
    textStyle.color = this.foreground();

    const textContainerStyle = Object.assign({}, styles.textContainerStyle);
    textContainerStyle.height = contentHeight;
    if (typeof this.content().orientation !== 'undefined' && this.content().orientation.toLowerCase() === 'top') {
      textContainerStyle.top = containerHeight - contentHeight;
    } else {
      textContainerStyle.top = 0;
    }

    return (
      <Touchable onPressIn={() => { this.activate(); }}>
        <View style={textContainerStyle}>
          <Text style={textStyle}>{this.content().text}</Text>
        </View>
      </Touchable>
    );
  }

  icon() {
    const imageStyle = Object.assign({ tintColor: this.foreground() }, styles.imageStyle);
    const icon = validImages[this.content().icon]
      ? (<Image style={imageStyle} source={validImages[this.content().icon]} />)
      : (<View style={{ width: imageSize, height: imageSize }} />);
    const leftImageContainerStyle = Object.assign({ left: 0 }, this.imageContainerStyle());
    return (
      <Touchable onPressIn={() => { this.activate(); }}>
        <View style={leftImageContainerStyle}>
          {icon}
        </View>
      </Touchable>
    );
  }

  imageContainerStyle() {
    const { containerHeight, contentHeight } = this.state;
    const imageContainerStyle = Object.assign({}, styles.imageContainerStyle);
    imageContainerStyle.height = contentHeight;

    if (typeof this.content().orientation !== 'undefined' && this.content().orientation.toLowerCase() === 'top') {
      imageContainerStyle.top = containerHeight - contentHeight;
    } else {
      imageContainerStyle.top = 0;
    }

    return imageContainerStyle;
  }

  closeButton() {
    const rightImageContainerStyle = Object.assign({ right: 0 }, this.imageContainerStyle());
    const imageStyle = Object.assign({ tintColor: this.foreground() }, styles.imageStyle);

    return (
      <Touchable onPressIn={() => { this.hide(); }}>
        <View style={rightImageContainerStyle}>
          <Image style={imageStyle} source={require('./images/cancel.png')} />
        </View>
      </Touchable>
    );
  }

  render() {
    const { animation, containerHeight } = this.state;
    const containerStyle = Object.assign({}, styles.containerStyle);
    containerStyle.height = containerHeight;
    containerStyle.top = animation;

    const messageStyle = { height: containerHeight };

    return (
      <Animated.View style={containerStyle}>
        <View style={messageStyle}>
          {this.background()}
          {this.icon()}
          {this.text()}
          {this.text()}
          {this.closeButton()}
        </View>
      </Animated.View>
    );
  }
}

if (typeof (RNAcousticMobilePushInApp) !== 'undefined') {
  AppRegistry.registerComponent('InAppBanner', () => InAppBanner);
  RNAcousticMobilePushInApp.registerInApp('default', 'InAppBanner', 44);
} else {
  console.error('Could not register InAppBanner Template!');
}
