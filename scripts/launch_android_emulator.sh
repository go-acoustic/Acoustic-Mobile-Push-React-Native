#!/bin/bash

AVD=$1

emulator -avd $AVD &
until adb shell true; do sleep 1; done # Wait for the android device to boot up before continuing
sleep 10 # Wait a few more seconds before continuing
