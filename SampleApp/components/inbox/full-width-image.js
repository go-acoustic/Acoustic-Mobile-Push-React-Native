/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import { View, Image } from 'react-native';
import React, { Component } from 'react';

export default class FullWidthImage extends Component {
  state = {
    width: 0,
    height: 0,
  };

  onLayout(event) {
    const { ratio, source } = this.props;
    const containerWidth = event.nativeEvent.layout.width;

    if (ratio) {
      this.setState({
        width: containerWidth,
        height: containerWidth * ratio,
      });
    } else if (typeof source === 'number') {
      const assetSource = Image.resolveAssetSource(source);

      this.setState({
        width: containerWidth,
        height: containerWidth * assetSource.height / assetSource.width,
      });
    } else if (typeof source === 'object') {
      Image.getSize(source.uri, (width, height) => {
        this.setState({
          width: containerWidth,
          height: containerWidth * height / width,
        });
      });
    }
  }

  render() {
    const { source } = this.props;
    const { height, width } = this.state;

    return (
      <View onLayout={this.onLayout.bind(this)}>
        <Image
          source={source}
          style={{
            width,
            height,
          }}
        />
      </View>
    );
  }
}
