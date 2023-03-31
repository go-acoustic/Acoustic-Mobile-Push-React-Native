/*
 * Copyright © 2019, 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import React from 'react';
import { Text, Platform, ScrollView, NativeModules, PermissionsAndroid } from 'react-native';
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

import { styles, colors } from '../../styles';
import { RNAcousticMobilePushLocationEmitter, RNAcousticMobilePushBeaconEmitter } from '../../helpers/eventEmitters';
import { Touchable } from '../../helpers/Touchable';
import { ALWAYS, DELAYED, DENIED, DISABLED, ENABLED, RESTRICTED, UNKNOWN } from '../../enums/status';
import { DOWNLOADED_LOCATIONS, ENTERED_BEACON, EXITED_BEACON } from '../../enums/events';
import { IOS } from '../../enums/os';

const { RNAcousticMobilePushBeacon, RNAcousticMobilePushLocation } = NativeModules;

export class iBeaconScreen extends React.Component {
  static navigationOptions = {
    title: 'Beacons',
    headerRight: () => (
      <Touchable onPress={() => {
        RNAcousticMobilePushLocation.syncLocations();
      }}>
        <Icon name="ios-sync" color="#000" size={24} style={{ paddingRight: 20 }} />
      </Touchable>
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      status: UNKNOWN,
      statusColor: colors.none,
      statusDetail: {},
      regions: [],
      subscriptions: [],
    };
  }

  componentDidMount() {
    if (Platform.OS === IOS) {
      this.checkStatus();
    } else {
      this.requestLocationPermissions();
    }

    this.setState({
      subscriptions: [
        RNAcousticMobilePushLocationEmitter.addListener(DOWNLOADED_LOCATIONS, () => {
          RNAcousticMobilePushBeacon.beaconRegions().then((regions) => {
            this.setState({ regions });
          });
        }),
        RNAcousticMobilePushBeaconEmitter.addListener(ENTERED_BEACON, (detail) => {
          const statusDetail = {};
          statusDetail[detail.id] = `Entered Minor${detail.minor}`;
          this.setState({ statusDetail });
        }),
        RNAcousticMobilePushBeaconEmitter.addListener(EXITED_BEACON, (detail) => {
          const statusDetail = {};
          statusDetail[detail.id] = `Exited Minor${detail.minor}`;
          this.setState({ statusDetail });
        })
      ]
    });

    RNAcousticMobilePushBeacon.beaconRegions().then((regions) => {
      this.setState({ regions });
    });
  }

  async requestLocationPermissions() {
    try {

      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: "Permission Required",
          message: "This app requires your permission to access your general location to detect iBeacons.",
          buttonPositive: "Grant Permission",
          buttonNegative: "Cancel"
        }
      );

      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permission Required",
          message: "This app requires your permission to access your location in more detail to detect iBeacons more accurately.",
          buttonPositive: "Grant Permission",
          buttonNegative: "Cancel"
        }
      );

      if (Platform.Version >= 31) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: "Permission Required",
            message: "This app requires your permission to access your bluetooth scanner to detect iBeacons.",
            buttonPositive: "Grant Permission",
            buttonNegative: "Cancel"
          }
        )
      }

      if (Platform.Version >= 29 && fineLocationGranted) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: "Permission Required",
            message: "This app requires your permission to access your location in the background to detect iBeacons when you are not actively using the app.",
            buttonPositive: "Grant Permission",
            buttonNegative: "Cancel"
          }
        );
      }

      this.checkStatus();

    } catch (err) {
      console.warn(err);
    }
  }

  componentWillUnmount() {
    const { subscriptions } = this.state;

    subscriptions.forEach((subscription) => subscription.remove());
  }

  checkStatus() {
    RNAcousticMobilePushLocation.locationStatus((status) => {
      if (status === DENIED) {
        this.setState({ status: 'Denied', statusColor: colors.error });
      }
      else if (status === DELAYED) {
        this.setState({ status: 'Delayed (Touch to enable)', statusColor: colors.none });
      }
      else if (status === ALWAYS) {
        this.setState({ status: 'Enabled', statusColor: colors.success });
      }
      else if (status === RESTRICTED) {
        this.setState({ status: 'Restricted', statusColor: colors.error });
      }
      else if (status === ENABLED) {
        this.setState({ status: 'Enabled (When in use)', statusColor: colors.warning });
      }
      else if (status === DISABLED) {
        this.setState({ status: 'Disabled', statusColor: colors.error });
      }
    });
  }

  render() {
    const { regions, status, statusColor, statusDetail } = this.state;

    return (
      <ScrollView style={styles.scrollView}>
        <Text style={styles.tableHeader}>iBeacon Feature</Text>
        <ListItem style={styles.firstRow}>
          <ListItem.Content>
            <ListItem.Title>UUID</ListItem.Title>
            <ListItem.Subtitle>{RNAcousticMobilePushBeacon.uuid}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem style={styles.row}>
          <ListItem.Content>
            <ListItem.Title>Status</ListItem.Title>
            <ListItem.Subtitle style={{ color: statusColor }}>{status}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <Text style={styles.tableHeader}>iBeacon Major Regions</Text>
        {regions.map((region, i) => {
          return (
            <ListItem key={`${region.id} - ${i}`}>
              <ListItem.Content>
                <ListItem.Title>{`${region.major}`}</ListItem.Title>
                {statusDetail && <ListItem.Subtitle>{statusDetail[region.id]}</ListItem.Subtitle>}
              </ListItem.Content>
            </ListItem>
          );
        })}
      </ScrollView>
    );
  }
}
