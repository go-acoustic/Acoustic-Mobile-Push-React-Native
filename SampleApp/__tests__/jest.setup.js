import { NativeModules } from 'react-native';

const noop = () => {};
const emitter = { addListener: () => ({ remove: noop }), removeListeners: noop, removeAllListeners: noop };
const plugin = { registerPlugin: noop };

// Native modules exposed by the Acoustic Campaign plugins, as used by the SampleApp screens.
const mocks = {
  RNMobilePush: {
    ...emitter,
    addEvent: noop,
    deleteUserAttributes: noop,
    registrationDetails: () => Promise.resolve({}),
    requestPushPermission: noop,
    safeAreaInsets: () => Promise.resolve({ top: 0, bottom: 0, left: 0, right: 0 }),
    setIcon: noop,
    updateUserAttributes: noop,
    sdkVersion: '',
    pluginVersion: '',
    appKey: '',
  },
  RNAcousticMobilePushActionHandler: { ...emitter, registerAction: noop, unregisterAction: noop },
  RNAcousticMobilePushActionMenu: plugin,
  RNAcousticMobilePushBeacon: { ...emitter, beaconRegions: () => Promise.resolve([]) },
  RNAcousticMobilePushCalendar: plugin,
  RNAcousticMobilePushDisplayWeb: plugin,
  RNAcousticMobilePushGeofence: { ...emitter, geofencesNearCoordinate: () => Promise.resolve([]) },
  RNAcousticMobilePushImageCarousel: { ...emitter, ...plugin },
  RNAcousticMobilePushInApp: {
    ...emitter,
    clickInApp: noop,
    createInApp: noop,
    executeInApp: noop,
    hideInApp: noop,
    registerInApp: noop,
    syncInAppMessages: noop,
  },
  RNAcousticMobilePushInbox: {
    ...emitter,
    clickInboxAction: noop,
    deleteInboxMessage: noop,
    hideInbox: noop,
    inboxMessageCount: noop,
    listInboxMessages: noop,
    readInboxMessage: noop,
    registerInboxComponent: noop,
    syncInboxMessages: noop,
  },
  RNAcousticMobilePushLocation: {
    ...emitter,
    enableLocation: noop,
    locationStatus: () => Promise.resolve('enabled'),
    syncLocations: noop,
  },
  RNAcousticMobilePushSnooze: plugin,
  RNAcousticMobilePushTextInput: plugin,
  RNAcousticMobilePushWallet: plugin,
};
mocks.RNAcousticMobilePush = mocks.RNMobilePush;

Object.assign(NativeModules, mocks);

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.useFakeTimers();

// react-native-maps 1.2x resolves its TurboModule at import time; stub it for unit tests.
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = (props) => React.createElement(View, props, props.children);
  return { __esModule: true, default: MockMapView, Marker: MockMapView, Circle: MockMapView, PROVIDER_GOOGLE: 'google' };
});

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockWebView = (props) => React.createElement(View, props);
  return { __esModule: true, default: MockWebView, WebView: MockWebView };
});
