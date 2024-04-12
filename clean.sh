#!/bin/bash

rm -R SampleApp/node_modules
mkdir SampleApp/node_modules
rm -R SampleApp/android/build
rm -R SampleApp/android/app/build
rm -R plugins/*/android/build
rm Documentation/html/*.html
rm SampleApp/ios/SampleApp/MceConfig.json
rm SampleApp/android/app/src/main/assets/MceConfig.json
rm SampleApp/android/local.properties