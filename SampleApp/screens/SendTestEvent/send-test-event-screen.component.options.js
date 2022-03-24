export const customEventOptions = {
  custom: { index: 0, text: 'Send Custom Event', types: ['custom'] },
  simulate: { index: 1, text: 'Simulate SDK Event' },
};

export const simulateEventOptions = [
  { text: 'app', types: ['application'], names: ['sessionStarted', 'sessionEnded', 'uiPushEnabled', 'uiPushDisabled'] },
  {
    text: 'action',
    types: ['simpleNotificationSource', 'inboxSource', 'inAppSource'],
    names: ['urlClicked', 'appOpened', 'phoneNumberClicked', 'inboxMessageOpened'],
  },
  { text: 'inbox', types: ['inbox'], names: ['messageOpened'] },
  { text: 'geofence', types: ['geofence'], names: ['disabled', 'enabled', 'enter', 'exit'] },
  { text: 'ibeacon', types: ['ibeacon'], names: ['disabled', 'enabled', 'enter', 'exit'] },
];

export const attributeTypeOptions = {
  date: { index: 0, text: 'date' },
  string: { index: 1, text: 'string' },
  boolean: { index: 2, text: 'boolean' },
  number: { index: 3, text: 'number' },
};