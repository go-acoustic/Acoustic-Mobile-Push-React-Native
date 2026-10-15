module.exports = {
  dependencies: {
    // Optional peer of react-navigation-stack 2.x (header mask only). Its Android build.gradle still
    // uses jcenter(), which Gradle 9 removed, so keep it out of autolinking.
    '@react-native-community/masked-view': {
      platforms: { android: null, ios: null },
    },
  },
};
