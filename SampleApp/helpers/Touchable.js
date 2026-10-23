import { Platform, TouchableNativeFeedback, TouchableOpacity } from 'react-native';

import { ANDROID } from '../enums/os';

const Touchable = Platform.OS === ANDROID ? TouchableNativeFeedback : TouchableOpacity;

// TouchableNativeFeedback ignores its style and lays out its child, while TouchableOpacity is a view
// of its own. An unstyled TouchableOpacity around absolutely positioned content gets a zero-size frame,
// which hides that content from VoiceOver and UI tests, so on iOS the position moves to the touchable.
const touchableLayout = (style) => (Platform.OS === ANDROID
  ? { touchableStyle: undefined, contentStyle: style }
  : { touchableStyle: style, contentStyle: { flex: 1, flexDirection: 'row', alignItems: 'center' } });

export { Touchable, touchableLayout };
