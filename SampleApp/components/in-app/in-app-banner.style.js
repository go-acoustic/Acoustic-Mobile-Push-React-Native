import { StyleSheet } from "react-native";

export const imageSize = 24;
export const padding = 8;

export const styles = StyleSheet.create({
  imageStyle: {
    width: imageSize,
    height: imageSize,
  },

  imageContainerStyle: {
    position: 'absolute',
    width: imageSize + padding * 2,
    paddingRight: padding,
    paddingLeft: padding,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },

  textContainerStyle: {
    position: 'absolute',
    left: padding * 2 + imageSize,
    right: padding * 2 + imageSize,
    alignItems: 'center',
    padding,

    flex: 1,
    flexDirection: 'row',
  },

  textStyle: {
    paddingLeft: padding,
    paddingRight: padding,
    textAlign: 'center',
    flexGrow: 1,
  },

  containerStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});