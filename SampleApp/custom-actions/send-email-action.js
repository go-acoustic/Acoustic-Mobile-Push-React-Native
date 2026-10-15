/*
 * Copyright © 2019, 2026 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import { Alert, Linking, NativeModules } from 'react-native';

import { RNAcousticMobilePushActionHandlerEmitter } from '../helpers/eventEmitters';
import { SEND_EMAIL } from '../enums/events';

const { RNAcousticMobilePushActionHandler } = NativeModules;

// Opens the platform mail composer through a mailto: URL (react-native-mail is unmaintained and
// does not build with AGP 9 / React Native 0.87).
export default function sendEmailAction(details) {
  const { recipient, subject, body } = details.action.value;
  const query = [
    subject ? `subject=${encodeURIComponent(subject)}` : null,
    body ? `body=${encodeURIComponent(body)}` : null,
  ].filter(Boolean).join('&');
  // RFC 6068: the addr-spec keeps its "@"; everything else that is not URL-safe is percent-encoded.
  const to = encodeURIComponent(recipient || '').replace(/%40/g, '@');
  const url = `mailto:${to}${query ? `?${query}` : ''}`;

  Linking.openURL(url).catch(() => {
    Alert.alert('Error', `Could not send mail. Please send a mail to ${recipient}`, [{ text: 'OK' }], { cancelable: false });
  });
}

// The registerAction call tells the SDK that you intend to handle actions of this type.
// In addition the function passed will be called for any missed actions received while your code was not running.
// TODO: RNAcousticMobilePushActionHandler.registerAction(SEND_EMAIL, sendEmailAction);

// The listener call allows this function to be called when actions arrive
// TODO: RNAcousticMobilePushActionHandlerEmitter.addListener(SEND_EMAIL, sendEmailAction);
