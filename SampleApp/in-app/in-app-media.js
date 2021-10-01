/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import { AppRegistry, Animated, SafeAreaView, Image, NativeModules, View, Text } from 'react-native';
import React from 'react';
import Video from 'react-native-video';

import { InAppTemplate } from './in-app-template';
import { Touchable } from '../components/Touchable';

const { RNAcousticMobilePushInApp } = NativeModules;

export class InAppMedia extends InAppTemplate {
  hiddenAnimationValue() {
    return 0;
  }

  shownAnimationValue() {
    return 1;
  }

  expand() {
    clearTimeout(this.timer);

    this.setState((state) => ({
      expanded: !state.expanded,
      interacted: true,
    }));
  }

  onEnd = () => {
    const { interacted } = this.state;

    if (!interacted) {
      this.hide();
    }
  }

  render() {
    let content;
    const { animation, expanded, message: { templateName } } = this.state;
    const maxHeight = expanded ? '100%' : 40;
    const blurRadius = expanded ? 10 : 0;
    const contentStyle = { width: '100%', height: '100%' };

    if (templateName === 'image') {
      contentStyle.resizeMode = 'contain';
      content = (
        <Image loadingIndicatorSource={require('./images/loading.gif')}
          source={{ uri: this.content().image }}
          blurRadius={blurRadius}
          style={contentStyle}
        />
      );
    } else {
      content = (
        <Video onEnd={this.onEnd}
          resizeMode="contain"
          style={contentStyle}
          source={{ uri: this.content().video }}
        />
      );
    }

    return (
      <Animated.View style={{ height: '100%', width: '100%', opacity: animation, backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <SafeAreaView style={{ height: '100%', width: '100%' }}>
          <View style={{ width: '100%', height: '100%' }}>
            <View style={{ position: 'absolute', right: 10, top: 10, width: 24, height: 24 }}>
              <Touchable onPressIn={() => { this.hide(); }}>
                <Image style={{ width: '100%', height: '100%' }} source={require('./images/cancel.png')} />
              </Touchable>
            </View>

            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 40, top: 40 }}>
              <Touchable onPressIn={() => { this.activate(); }}>
                { content }
              </Touchable>
            </View>

            <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, maxHeight }}>
              <Touchable onPressIn={() => { this.expand(); }}>
                <View style={{ height: '100%', width: '100%' }}>
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', paddingLeft: 10, paddingRight: 10 }}>{this.content().title}</Text>
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

if (typeof (RNAcousticMobilePushInApp) !== 'undefined') {
  AppRegistry.registerComponent('InAppImage', () => InAppMedia);
  RNAcousticMobilePushInApp.registerInApp('image', 'InAppImage', 0);

  AppRegistry.registerComponent('InAppVideo', () => InAppMedia);
  RNAcousticMobilePushInApp.registerInApp('video', 'InAppVideo', 0);
} else {
  console.error('Could not register InAppImage and InAppVideo Templates!');
}
