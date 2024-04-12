# SampleApp
Contains iOS / Android native applications that build the shared react views [`/screens`] & the sdk plugin(s)

## Build
- Please see React Native's Guide(s) on how to setup your environment: https://reactnative.dev/docs/environment-setup
- Once your environment is setup install the packages - including sdk plugins:
	* `cd SampleApp`
	* `yarn install`

### Run Android
* `brew install android-platform-tools`
* `npx react-native run-android`

### Run iOS
* `cd ios`
* `pod install`
* `cd ..`
* `npx react-native run-ios`

### Testing the Sample app
Tests are stored in the `SampleApp/e2e` directory. All test files of the form `*.spec.js` will be automatically picked up and run by the CI pipeline.

To run tests, first build the app using the desired configuration using `detox -c [config name] build`, then run the tests using `detox -c [config name] run`.

Available configurations are:
* ios 13-15
* android 21-34

Test results will be placed in `SampleApp/test-results.xml`.


---
# Notes
There are several know issues between npm install versus yarn install. Since yarn is a Facebook tool. It normally has fixes patched for installing dependancies. 