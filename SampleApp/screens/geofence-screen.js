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
import {View, Platform, TouchableNativeFeedback, TouchableOpacity, PermissionsAndroid} from 'react-native';
import {ListItem} from 'react-native-elements'
import {colors} from '../styles'
import MapView from 'react-native-maps';
import {SubscribedComponent} from './subscribed-component';
import {RNAcousticMobilePushLocation, RNAcousticMobilePushGeofence} from 'NativeModules';
import {RNAcousticMobilePushLocationEmitter, RNAcousticMobilePushGeofenceEmitter} from './home-screen';
const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
import Icon from 'react-native-vector-icons/Ionicons';

export class GeofenceScreen extends SubscribedComponent {
	static navigationOptions = ({ navigation }) => {
		return {
			title: "Geofences",
			headerRight: (
				<Touchable onPress={ () => { RNAcousticMobilePushLocation.syncLocations(); } }>
					<Icon name="ios-sync" color="#000" size={24} style={{paddingRight: 20}} />
				</Touchable>
			),
		};
	};	
	
	requestLocationPermission() {
		const self = this;
		try {
			PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {'title': 'Sample App', 'message': 'Sample App access to your location '}).then(function (granted) {
				self.checkStatus();
			})
		} catch (err) {
			console.warn(err)
		}
	}

	constructor() {
		super();
				
		this.region = {latitude: 0, longitude: 0};

		this.state = {
			status: "unknown",
			statusColor: colors.none,
			geofences: [],
		}
	}

	onRegionChange(region) {
		this.region = region;
		this.updateGeofences();
	}

	updateGeofences() {
		RNAcousticMobilePushGeofence.geofencesNearCoordinate(this.region.latitude, this.region.longitude, 1000).then((geofences) => { 
			this.setState({geofences: geofences});
		}).catch((error) => {
            self.setState({userId: "unregistered", channelId: "unregistered", registration: "Click to Start"});
        });
	}

	async componentDidMount() {
		super.componentWillMount();
	
		if(Platform.OS === 'ios') {
			// Required for iOS, crashes Android
			window.navigator.geolocation.requestAuthorization();
			this.checkStatus();			
		} else {
			this.requestLocationPermission();
		}
	}

	checkStatus() {
		const self = this;
		RNAcousticMobilePushLocation.locationStatus((status)=>{
			if(status != "denied") {
				navigator.geolocation.getCurrentPosition(function (position) {
					self.mapview.fitToCoordinates([position.coords]);
				});
		
				this.subscriptions.push( RNAcousticMobilePushGeofenceEmitter.addListener('RefreshActiveGeofences', () => { self.updateGeofences() }));
				this.subscriptions.push( RNAcousticMobilePushLocationEmitter.addListener('DownloadedLocations', () => { self.updateGeofences() }));
				this.watchPositionId = navigator.geolocation.watchPosition((position) => {
					let region = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					}
					self.onRegionChange(region);
				});
			}
			
			if(status == "denied") {
				self.setState({status: "Denied", statusColor: colors.error});
			} else if(status == "delayed") {
				self.setState({status: "Delayed (Touch to enable)", statusColor: colors.none});
			} else if(status == "always") {
				self.setState({status: "Enabled", statusColor: colors.success});
			} else if(status == "restricted") {
				self.setState({status: "Restricted", statusColor: colors.error});
			} else if(status == "enabled") {
				self.setState({status: "Enabled (When in use)", statusColor: colors.warning});
			} else if(status == "disabled") {
				self.setState({status: "Disabled", statusColor: colors.error});
			}
		});
	}

	componentWillUnmount() {
		navigator.geolocation.clearWatch(this.watchPositionId);
	}

	render() {
		const self = this;
		return (
			<View style={{position: 'absolute', left:0, right:0, top:0, bottom:0}}>
				<ListItem title="Status" rightTitle={this.state.status} rightTitleStyle={{color: this.state.statusColor }} onPress={ () => {
					RNAcousticMobilePushLocation.locationStatus((status)=>{
						if(status=="delayed") {
							RNAcousticMobilePushLocation.enableLocation();
						}
					});
				}} />
				<MapView ref={component => this.mapview = component} style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 44 }} onRegionChangeComplete={ (region) => { self.onRegionChange(region) } } followUserLocation={true} showsUserLocation={true}>
				{ 
					self.state.geofences.map( (circle) => {
						return (
							<MapView.Circle key={circle.id} center={{latitude:circle.latitude, longitude: circle.longitude}} radius={circle.radius} fillColor={circle.active ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 122, 255, 0.1)"} strokeColor={circle.active ? "rgba(255, 0, 0, 1.0)" : "rgba(0, 122, 255, 1.0)"} zIndex={2} strokeWidth={1} lineDashPattern={[2,2]} />
						);
					})
				}
				</MapView>
			</View>
		);
	}
}