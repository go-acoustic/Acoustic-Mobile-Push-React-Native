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
import {PixelRatio, StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
	row: {
		borderBottomColor: '#cacaec',
		borderBottomWidth: 1 / PixelRatio.get(),
		backgroundColor: '#ffffff'
	},
	firstRow: {
		borderBottomColor: '#cacaec',
		borderBottomWidth: 1 / PixelRatio.get(),
		borderTopColor: '#cacaec',
		borderTopWidth: 1 / PixelRatio.get(),
		backgroundColor: '#ffffff'
	},
	scrollView: {
		backgroundColor: '#efeff4', 
		minHeight:'100%'
	},
	tableHeader: {
		paddingBottom: 5, 
		paddingLeft: 10, 
		paddingTop: 30, 
		textTransform: "uppercase", 
		fontSize: 12, 
		color: '#737377'
	},
	tableFooter: {
		paddingLeft: 10, 
		paddingTop: 5, 
		fontSize: 12, 
		color: '#737377'
	},
});

export const colors = {
	queued: "#DAA520", 
	warning: "#DAA520", 
	success: '#228B22', 
	error: '#B22222', 
	none: '#808080', 
	blue: "#3478F7"
};