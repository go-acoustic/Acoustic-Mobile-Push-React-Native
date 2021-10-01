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
import {
  View, Platform, NativeModules, PermissionsAndroid,
} from 'react-native';
import { ListItem } from 'react-native-elements';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '../styles';
import { SubscribedComponent } from './subscribed-component';
import { RNAcousticMobilePushLocationEmitter, RNAcousticMobilePushGeofenceEmitter } from '../helpers/eventEmitters';
import { ALWAYS, DELAYED, DENIED, DISABLED, ENABLED, RESTRICTED, UNKNOWN } from '../enums/status';
import { Touchable } from '../components/Touchable';
import { IOS } from '../enums/os';
import { DOWNLOADED_LOCATIONS, REFRESH_ACTIVE_GEOFENCES } from '../enums/events';

const { RNAcousticMobilePushLocation, RNAcousticMobilePushGeofence } = NativeModules;
const OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

export class GeofenceScreen extends SubscribedComponent {
  static navigationOptions = {
    title: 'Geofences',
    headerRight: () => (
      <Touchable onPress={() => RNAcousticMobilePushLocation.syncLocations()}>
        <Icon name="ios-sync" color="#000" size={24} style={{ paddingRight: 20 }} />
      </Touchable>
    ),
  };

  state = {
    status: UNKNOWN,
    statusColor: colors.none,
    geofences: [],
  };

  region = { latitude: 0, longitude: 0 };

  componentDidMount() {
    if (Platform.OS === IOS) {
      // Required for iOS, crashes Android
      Geolocation.requestAuthorization();
      this.checkStatus();
    } else {
      this.requestLocationPermission();
    }
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watchPositionId);
  }

  async requestLocationPermission() {
    try {

      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: "Permission Required",
          message: "This app requires your permission to access your general location to detect geofences.",
          buttonPositive: "Grant Permission",
          buttonNegative: "Cancel"
        }
      );

      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permission Required",
          message: "This app requires your permission to access your location in more detail to detect geofences more accurately.",
          buttonPositive: "Grant Permission",
          buttonNegative: "Cancel"
        }
      );

      if (Platform.Version >= 29) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: "Permission Required",
            message: "This app requires your permission to access your location in the background to detect geofences when you are not actively using the app.",
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

  onRegionChange = (region) => {
    this.region = region;
    this.updateGeofences();
  }

  updateGeofences = () => {
    const { latitude, longitude } = this.region;

    RNAcousticMobilePushGeofence.geofencesNearCoordinate(latitude, longitude, 1000)
      .then((geofences) => {
        this.setState({ geofences });
      }).catch(() => {
        this.setState({ userId: 'unregistered', channelId: 'unregistered', registration: 'Click to Start' });
      });
  }

  checkStatus() {
    RNAcousticMobilePushLocation.locationStatus((status) => {
      if (status !== DENIED) {
        Geolocation.getCurrentPosition((position) => {
          this.mapview.fitToCoordinates([position.coords]);
        }, () => { }, OPTIONS);

        this.subscriptions.push(RNAcousticMobilePushGeofenceEmitter.addListener(REFRESH_ACTIVE_GEOFENCES, () => {
          this.updateGeofences();
        }));
        this.subscriptions.push(RNAcousticMobilePushLocationEmitter.addListener(DOWNLOADED_LOCATIONS, () => {
          this.updateGeofences();
        }));
        this.watchPositionId = Geolocation.watchPosition((position) => {
          const region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.onRegionChange(region);
        }, () => { }, OPTIONS);
      }

      if (status === DENIED) {
        this.setState({ status: 'Denied', statusColor: colors.error });
      } else if (status === DELAYED) {
        this.setState({ status: 'Delayed (Touch to enable)', statusColor: colors.none });
      } else if (status === ALWAYS) {
        this.setState({ status: 'Enabled', statusColor: colors.success });
      } else if (status === RESTRICTED) {
        this.setState({ status: 'Restricted', statusColor: colors.error });
      } else if (status === ENABLED) {
        this.setState({ status: 'Enabled (When in use)', statusColor: colors.warning });
      } else if (status === DISABLED) {
        this.setState({ status: 'Disabled', statusColor: colors.error });
      }
    });
  }

  setMapRef = (el) => {
    this.mapview = el;
  }

  render() {
    const { geofences, status, statusColor } = this.state;

    return (
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <ListItem
          title="Status"
          rightTitle={status}
          rightTitleStyle={{ color: statusColor }}
          onPress={() => {
            // eslint-disable-next-line no-shadow
            RNAcousticMobilePushLocation.locationStatus((status) => {
              if (status === DELAYED) {
                RNAcousticMobilePushLocation.enableLocation();
              }
            });
          }}
        />
        <MapView
          ref={this.setMapRef}
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, top: 44,
          }}
          onRegionChangeComplete={this.onRegionChange}
          followUserLocation
          showsUserLocation>
          {geofences.map((circle) => (
            <MapView.Circle
              key={circle.id}
              center={{ latitude: circle.latitude, longitude: circle.longitude }}
              radius={circle.radius}
              fillColor={circle.active ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 122, 255, 0.1)'}
              strokeColor={circle.active ? 'rgba(255, 0, 0, 1.0)' : 'rgba(0, 122, 255, 1.0)'}
              zIndex={2}
              strokeWidth={1}
              lineDashPattern={[2, 2]}
            />
          ))}
        </MapView>
      </View>
    );
  }
}
