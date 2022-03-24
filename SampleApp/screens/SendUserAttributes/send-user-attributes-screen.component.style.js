import { StyleSheet, Platform } from "react-native";
import { ANDROID } from '../../enums/os';

export default StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: Platform.OS === ANDROID ? 50 : 40,
  },
  textInput: {
    textAlign: 'right',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    height: Platform.OS === ANDROID ? 40 : 30,
  },
  title: {
    paddingTop: 16,
    paddingBottom: 0,
    fontWeight: 'bold',
  },
  rowTitle: {
    width: 90,
    paddingRight: 16,
  },
  scrollView: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
  },
});