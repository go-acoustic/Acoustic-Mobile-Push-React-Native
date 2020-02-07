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
import {Text, ScrollView, TouchableNativeFeedback, TouchableOpacity, Platform} from 'react-native';
import {ListItem} from 'react-native-elements'
import {styles, colors} from '../styles'
import {SubscribedComponent} from './subscribed-component';
import {RNAcousticMobilePushBeacon, RNAcousticMobilePushLocation} from 'NativeModules';
import {RNAcousticMobilePushLocationEmitter, RNAcousticMobilePushBeaconEmitter} from './home-screen';
const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
import Icon from 'react-native-vector-icons/Ionicons';

export class iBeaconScreen extends SubscribedComponent {
	static navigationOptions = ({ navigation }) => {
		return {
			title: "Beacons",
			headerRight: (
				<Touchable onPress={ () => { RNAcousticMobilePushLocation.syncLocations(); } }>
					<Icon name="ios-sync" color="#000" size={24} style={{paddingRight: 20}} />
				</Touchable>
			),
		};
	};		

    constructor(props) {
        super(props);
		this.state = {	
			status: "unknown",
			statusColor: colors.none,
			statusDetail: {},
			regions: []
		};
	}

	componentWillMount() {
		super.componentWillMount();

		this.checkStatus();			

		this.subscriptions.push( RNAcousticMobilePushLocationEmitter.addListener('DownloadedLocations', (error, events) => {
			RNAcousticMobilePushBeacon.beaconRegions().then((regions) => { 
			this.setState({regions: regions});
			});
		}));

		this.subscriptions.push( RNAcousticMobilePushBeaconEmitter.addListener('EnteredBeacon', (detail) => {
			var statusDetail = {}
			statusDetail[detail.id] = 'Entered Minor' + detail.minor;
			this.setState({statusDetail: statusDetail});
		}));

		this.subscriptions.push( RNAcousticMobilePushBeaconEmitter.addListener('ExitedBeacon', (detail) => {
			var statusDetail = {}
			statusDetail[detail.id] = 'Exited Minor' + detail.minor;
			this.setState({status: statusDetail});
		}));

		RNAcousticMobilePushBeacon.beaconRegions().then((regions) => { 
			this.setState({regions: regions});
		});
	}

	checkStatus() {
		const self = this;
		RNAcousticMobilePushLocation.locationStatus((status)=>{
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

	render() {
		return (
			<ScrollView style={styles.scrollView}>
				<Text style={styles.tableHeader}>iBeacon Feature</Text>
				<ListItem title="UUID" style={styles.firstRow} subtitle={RNAcousticMobilePushBeacon.uuid} />
				<ListItem title="Status" style={styles.row} subtitleStyle={{color: this.state.statusColor }} subtitle={this.state.status} />

				<Text style={styles.tableHeader}>iBeacon Major Regions</Text>
					{ this.state.regions.map((region) => {
						if(this.state.statusDetail[region.id]) {
							return (
								<ListItem key={region.id} title={region.major + ""} rightTitle={this.state.statusDetail[region.id]} />
							);
						} else {
							return (
								<ListItem key={region.id} title={region.major + ""} />
							);
						}
					}) }
			</ScrollView>
		);
	}
}