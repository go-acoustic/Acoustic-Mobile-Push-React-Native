#!/bin/bash

# Note, this uses the grip python module to format markdown into html
# Also note, if you run out of API requests, create a file named  ~/.grip/settings.py with user/pass as specified in https://github.com/joeyespo/grip

declare -a StringArray=("index" "react-native-acoustic-mobile-push" "react-native-acoustic-mobile-push-location" "react-native-acoustic-mobile-push-calendar" "react-native-acoustic-mobile-push-geofence" "react-native-acoustic-mobile-push-inbox" "react-native-acoustic-mobile-push-snooze" "react-native-acoustic-mobile-push-beacon" "react-native-acoustic-mobile-push-displayweb" "react-native-acoustic-mobile-push-inapp")

# Iterate the string array using for loop
for val in ${StringArray[@]}; do
    echo $val
    grip markdown/${val}.md --export html/${val}.html
    sed -i '' "s?</head>?<link rel='stylesheet' type='text/css' href='style.css'></head>?" html/${val}.html
done
