import { NativeModules } from 'react-native';

const mocks = {
  RNAcousticMobilePushInbox: {
    inboxMessageCount: () => {},
    registerInboxComponent: () => {},
  },
  RNAcousticMobilePushInApp: {
    registerInApp: () => {},
  },
  RNAcousticMobilePushActionHandler: {
    registerAction: () => {},
  },
  RNAcousticMobilePushActionHandlerEmitter: {
    addListener: () => {},
  },
  RNAcousticMobilePush: {
    requestPushPermission: () => {},
    sdkVersion: '',
  },
};

Object.assign(NativeModules, mocks);

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter.js');
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

jest.useFakeTimers();
