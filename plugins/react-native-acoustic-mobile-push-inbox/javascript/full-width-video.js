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
import {View, Platform, TouchableNativeFeedback, TouchableOpacity} from 'react-native';
import Video from 'react-native-video';
import React, {Component} from 'react';
const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

export default class FullWidthVideo extends Component {
    constructor() {
        super();
        
        this.state = {
            containerWidth: 0,
            width: 1,
            height: 1,
            videoPaused: false
        };
    }

    onLayout(event) {
        const containerWidth = event.nativeEvent.layout.width;
        this.setState({containerWidth:containerWidth});
    }

    onLoad(response) {
        const { width, height } = response.naturalSize;
        this.setState({width: width, height: height, videoPaused: true});
    }

    onPress() {
        this.setState({ videoPaused: !this.state.videoPaused});
    }

    componentWillUnmount() {
        this.setState({ videoPaused: true });
    }

    render() {
        const heightScaled = this.state.height * (this.state.containerWidth / this.state.width);
        return (
            <View onLayout={this.onLayout.bind(this)}>
                <Touchable accessibilityRole="button" onPress={this.onPress.bind(this)}>
                    <Video 
                        controls={true}
                        style={{
                            width: this.state.containerWidth,
                            height: heightScaled
                        }}
                        resizeMode='cover'
                        paused={this.state.videoPaused}
                        onLoad={this.onLoad.bind(this)}
                        source={this.props.source} />
                </Touchable>
            </View>
        )
    }
}