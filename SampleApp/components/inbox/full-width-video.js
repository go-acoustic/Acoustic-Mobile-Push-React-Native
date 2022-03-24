/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import { View } from 'react-native';
import Video from 'react-native-video';
import React, { Component } from 'react';

import { Touchable } from '../../helpers/Touchable';

export default class FullWidthVideo extends Component {
  state = {
    containerWidth: 0,
    width: 1,
    height: 1,
    videoPaused: false,
  };

  componentWillUnmount() {
    this.setState({ videoPaused: true });
  }

  onLayout(event) {
    const containerWidth = event.nativeEvent.layout.width;
    this.setState({ containerWidth });
  }

  onLoad(response) {
    const { width, height } = response.naturalSize;
    this.setState({ width, height, videoPaused: true });
  }

  onPress() {
    this.setState((state) => ({ videoPaused: !state.videoPaused }));
  }

  render() {
    const { containerWidth, height, width, videoPaused } = this.state;
    const { source } = this.props;
    const heightScaled = height * (containerWidth / width);

    return (
      <View onLayout={this.onLayout.bind(this)}>
        <Touchable accessibilityRole="button" onPress={this.onPress.bind(this)}>
          <Video
            controls
            style={{
              width: containerWidth,
              height: heightScaled,
            }}
            resizeMode="cover"
            paused={videoPaused}
            onLoad={this.onLoad.bind(this)}
            source={source}
          />
        </Touchable>
      </View>
    );
  }
}
