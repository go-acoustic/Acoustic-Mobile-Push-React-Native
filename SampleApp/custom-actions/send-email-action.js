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
import Mailer from 'react-native-mail';
import {Alert, NativeEventEmitter} from 'react-native';
import {RNAcousticMobilePushActionHandler} from 'NativeModules';

const RNAcousticMobilePushActionHandlerEmitter = new NativeEventEmitter(RNAcousticMobilePushActionHandler);

export default function sendEmailAction(details) {
	Mailer.mail({
		subject: details.action.value.subject,
		recipients: [details.action.value.recipient],
		body: details.action.value.body,
		isHTML: true
	}, (error, event) => {
			if(error) {
					Alert.alert('Error', 'Could not send mail. Please send a mail to ' + details.action.value.recipient, [ {text: 'OK'} ], {cancelable: false});
			}
	});
}

// The registerAction call tells the SDK that you intend to handle actions of this type. In addition the function passed will be called for any missed actions received while your code was not running. 
RNAcousticMobilePushActionHandler.registerAction('sendEmail', sendEmailAction);

// The listener call allows this function to be called when actions arrive
RNAcousticMobilePushActionHandlerEmitter.addListener('sendEmail', sendEmailAction);