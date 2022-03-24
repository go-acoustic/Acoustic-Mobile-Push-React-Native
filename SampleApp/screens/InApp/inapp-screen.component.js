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
import { Text, ScrollView, NativeModules } from 'react-native';
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

import { styles } from '../../styles';
import { Touchable } from '../../helpers/Touchable';

const { RNAcousticMobilePushInApp } = NativeModules;

export class InAppScreen extends React.Component {
  static navigationOptions = {
    title: 'InApp Messages',
    headerRight: () => (
      <Touchable onPress={() => {
        RNAcousticMobilePushInApp.syncInAppMessages();
      }}>
        <Icon name="ios-sync" color="#000" size={24} style={{ paddingRight: 20 }} />
      </Touchable>
    ),
  };

  constructor(props) {
    super(props);
    RNAcousticMobilePushInApp.syncInAppMessages();
  }

  createTopBanner = () => {
    const content = this.bannerTemplateBase();
    RNAcousticMobilePushInApp.createInApp(content, 'default', ['all', 'topBanner'], 4, '123', '123ABC');
  }

  createBottomBanner = () => {
    const content = this.bannerTemplateBase();
    RNAcousticMobilePushInApp.createInApp(content, 'default', ['all', 'bottomBanner'], 4, '123', '123ABC');
  }

  createImageTemplate = () => {
    const content = this.mediaTemplateBase();
    content.image = 'https://picsum.photos/600/600';
    content.duration = 5;
    RNAcousticMobilePushInApp.createInApp(content, 'image', ['all', 'image'], 4, '123', '123ABC');
  }

  createVideoTemplate = () => {
    const content = this.mediaTemplateBase();
    content.duration = 0;
    content.video = 'http://techslides.com/demos/sample-videos/small.mp4';
    RNAcousticMobilePushInApp.createInApp(content, 'video', ['all', 'video'], 4, '123', '123ABC');
  }

  bannerTemplateBase() {
    return {
      foreground: '#FFF2E5',
      color: { // or "#FF7F00"
        red: 1.0,
        green: 0.5,
        blue: 0.0,
      },
      text: 'Welcome to React Native!',
      icon: 'note',
      duration: 5,
      animationLength: 0.5,

      // to show the random background image instead of background color
      // mainImage: "https://picsum.photos/400/200",

      action: {
        type: 'url',
        value: 'https://acoustic.co',
      },
    };
  }

  mediaTemplateBase() {
    return {
      animationLength: 0.5,
      action: {
        type: 'url',
        value: 'https://acoustic.co',
      },
      title: 'Welcome to React Native!',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque rhoncus, eros sed imperdiet finibus, purus nibh placerat leo, non fringilla massa tortor in tellus. Donec aliquet pharetra dui ac tincidunt. Ut eu mi at ligula varius suscipit. Vivamus quis quam nec urna sollicitudin egestas eu at elit. Nulla interdum non ligula in lobortis. Praesent lobortis justo at cursus molestie. Aliquam lectus velit, elementum non laoreet vitae, blandit tempus metus. Nam ultricies arcu vel lorem cursus aliquam. Nunc eget tincidunt ligula, quis suscipit libero. Integer velit nisi, lobortis at malesuada at, dictum vel nisi. Ut vulputate nunc mauris, nec porta nisi dignissim ac. Sed ut ante sapien. Quisque tempus felis id maximus congue. Aliquam quam eros, congue at augue et, varius scelerisque leo. Vivamus sed hendrerit erat. Mauris quis lacus sapien. Nullam elit quam, porttitor non nisl et, posuere volutpat enim. Praesent euismod at lorem et vulputate. Maecenas fermentum odio non arcu iaculis egestas. Praesent et augue quis neque elementum tincidunt. ',
    };
  }

  render() {
    return (
      <ScrollView style={styles.scrollView}>
        <Text style={styles.tableHeader}>Execute InApp</Text>
        <ListItem style={styles.firstRow} onPress={() => RNAcousticMobilePushInApp.executeInApp(['bottomBanner'])}>
          <ListItem.Content>
            <ListItem.Title>Bottom Banner Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row} onPress={() => RNAcousticMobilePushInApp.executeInApp(['topBanner'])}>
          <ListItem.Content>
            <ListItem.Title>Top Banner Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row} onPress={() => RNAcousticMobilePushInApp.executeInApp(['image'])}>
          <ListItem.Content>
            <ListItem.Title>Image Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row} onPress={() => RNAcousticMobilePushInApp.executeInApp(['video'])}>
          <ListItem.Content>
            <ListItem.Title>Video Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row} onPress={() => RNAcousticMobilePushInApp.executeInApp(['all'])}>
          <ListItem.Content>
            <ListItem.Title>Next Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <Text style={styles.tableHeader}>Add Canned InApp</Text>
        <ListItem style={styles.firstRow} onPress={this.createBottomBanner}>
          <ListItem.Content>
            <ListItem.Title>Bottom Banner Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row} onPress={this.createTopBanner}>
          <ListItem.Content>
            <ListItem.Title>Top Banner Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row} onPress={this.createImageTemplate}>
          <ListItem.Content>
            <ListItem.Title>Image Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row} onPress={this.createVideoTemplate}>
          <ListItem.Content>
            <ListItem.Title>Video Template</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </ScrollView>
    );
  }
}
