module.exports = {
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/e2e/", "<rootDir>/__tests__/jest.setup.js"],
  preset: "@react-native/jest-preset",
  setupFiles: [
    "./node_modules/react-native-gesture-handler/jestSetup.js",
    "./__tests__/jest.setup.js"
  ],
  moduleNameMapper: {
    "^[@./a-zA-Z0-9$_-]+\\.(png|gif)$": "<rootDir>/node_modules/react-native/Libraries/Image/RelativeImageStub",
    "^image![a-zA-Z0-9$_-]+$": "GlobalImageStub"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|react-navigation)"
  ]
};
