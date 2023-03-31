import { NativeEventEmitter, NativeModules } from 'react-native';

const {
  RNAcousticMobilePush,
  RNAcousticMobilePushActionHandler,
  RNAcousticMobilePushLocation,
  RNAcousticMobilePushBeacon,
  RNAcousticMobilePushGeofence,
  RNAcousticMobilePushInbox,
  RNAcousticMobilePushSnooze,
  RNAcousticMobilePushImageCarousel,
} = NativeModules;

export const RNAcousticMobilePushEmitter = new NativeEventEmitter(RNAcousticMobilePush);
export const RNAcousticMobilePushLocationEmitter = new NativeEventEmitter(RNAcousticMobilePushLocation);
export const RNAcousticMobilePushBeaconEmitter = new NativeEventEmitter(RNAcousticMobilePushBeacon);
export const RNAcousticMobilePushGeofenceEmitter = new NativeEventEmitter(RNAcousticMobilePushGeofence);
export const RNAcousticMobilePushInboxEmitter = new NativeEventEmitter(RNAcousticMobilePushInbox);
export const RNAcousticMobilePushActionHandlerEmitter = new NativeEventEmitter(RNAcousticMobilePushActionHandler);
export const RNAcousticMobilePushImageCarouselEmitter = new NativeEventEmitter(RNAcousticMobilePushImageCarousel);
