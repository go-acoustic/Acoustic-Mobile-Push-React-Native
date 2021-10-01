import { Platform, TouchableNativeFeedback, TouchableOpacity } from 'react-native';

import { ANDROID } from '../enums/os';

const Touchable = Platform.OS === ANDROID ? TouchableNativeFeedback : TouchableOpacity;

export { Touchable };
