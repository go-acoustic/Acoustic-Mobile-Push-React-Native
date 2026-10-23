# RN 0.87.1 device verification guide

Step-by-step instructions for the regression rows that need a device: push notifications, certified push, universal behaviour (UB) verification in Grafana Loki, geofence and iBeacon.

The Campaign regression itself (the rows with their device and server pass criteria, the org-API sender, the Loki sweep and the known gotchas) is shared by every Campaign SDK platform and lives in the [`campaign-sdk-regression`](https://github.com/aipoweredmarketer/engineering-plugins/tree/main/functional/verification/skills/campaign-sdk-regression) skill (engineering-plugins, `functional/verification`; `claude plugin install engineering-verification@acoustic-engineering`). This repo describes the SampleApp to it in `.claude/campaign-regression.yaml` (variants `rn-ios`, `rn-android`). This guide keeps what is specific to the React Native SampleApp: build, logging, identity, the RN-only rows, geofence and iBeacon. Written against the SampleApp on branch `feature/rn-0.87.1-upgrade` (plugins 3.9.58 + New Architecture fixes, native SDK 3.10.9 iOS / 3.11.1 Android).

Reference material in Confluence (EAS space): [React Native Regression Testing](https://acoustic-jiraconf.atlassian.net/wiki/spaces/EAS/pages/64025854126/React+Native+Regression+Testing) (parent page; the 3.9.18 child page is the result template), [Android Regression Testing Documentation](https://acoustic-jiraconf.atlassian.net/wiki/spaces/EAS/pages/64026444519/Android+Regression+Testing+Documentation) (geofence, beacon, certified push, phone home procedures), [Campaign Dashboard](https://acoustic-jiraconf.atlassian.net/wiki/spaces/EAS/pages/64025296959/Campaign+Dashboard) (apps, templates, drafts, sites, programs), [Mobile Push Event Inventory](https://acoustic-jiraconf.atlassian.net/wiki/spaces/IFA/pages/65729560578/Mobile+Push+Event+Inventory) (UB type numbers).

Record results on a new child page of the regression parent page, copied from the "RN SDK 3.9.18 - Apr, 2024" page, with Native SDK version, RN plugin version, **React Native 0.87.1**, and one column per OS version tested.

## 0. Prerequisites

| Item | iOS | Android |
|---|---|---|
| Device | Physical iPhone (iOS 15.1+), Developer Mode on, for real pushes. A simulator build signed with `aps-environment` registers, but APNs answered `BadDeviceToken` when the push server sent to an iOS 27 simulator token (2026-10-09); on a simulator inject payloads with `xcrun simctl push` instead. | Physical device recommended (API 24+). The API 36 emulator registers and receives FCM push if it has Google Play services and a signed-in Google account. |
| Signing | Apple Developer team with a push-capable provisioning profile for bundle id `com.acoustic.SampleV1` (or change the bundle id and register a new app in Campaign). Push Notifications capability on both the `SampleApp` and `SampleAppNotificationService` targets. | `SampleApp/android/app/google-services.json` for package `co.acoustic.mobile.push.sample` (gitignored; the file in `~/Downloads/google-services.json` contains this package). |
| Campaign | App key `apEHsIkt27` (iOS, app type Dev) and `gc8guexFos` (Android) on `https://mobile-sdk-lib-us-0.brilliantcollector.com`, as in `SampleApp/CampaignConfig.json`. The app group must contain both apps; the contact source is the push database (Campaign > Data > Databases > push db). | same |
| Tools | Xcode 16.1+ (27.0 used), CocoaPods 1.16, Node 22. Console.app or `idevicesyslog` for device logs. | Android Studio / `adb`, JDK 17+, Node 22. `adb logcat` for logs. |
| Location tooling | Xcode > Debug > Simulate Location (device attached) or a GPX file; a second iPhone with a beacon app (for example "Beacon Simulator") or a Mac running [MactsAsBeacon](https://github.com/timd/MactsAsBeacon). | A GPS mocking app ("Fake GPS") set as mock location provider in Developer options; a second phone with "Beacon Simulator". |
| Logs backend | Grafana Loki (OpenSearch/Kibana was decommissioned in June 2026; the "Kabana logs" column on older regression pages now means Loki): `grafana-prod-ue1`, data source `Loki-MCE`. Services, LogQL and event codes: the shared skill's `references/environment.md`. | same |

### 0.1 Build and install

```bash
# from the repo root, on the branch
cd SampleApp
nvm use 22
npm install
# overlay the local plugins exactly as Jenkins does
for d in ../plugins/*/; do n=$(basename "$d"); rsync -a --delete --exclude node_modules --exclude '*.tgz' \
  --exclude CampaignConfig.json --exclude 'postinstall/*/MceConfig.json' "$d" "node_modules/$n/"; done
```

iOS:

```bash
cd ios && pod install && cd ..
open ios/SampleApp.xcworkspace   # set your team on SampleApp + SampleAppNotificationService, then Run on the device
npx react-native start           # Metro, for Debug builds
```

Android:

```bash
adb devices                                   # confirm one target; use -s <serial> everywhere on a shared machine
adb -s <serial> reverse tcp:8081 tcp:8081
npx react-native run-android --deviceId <serial>
```

### 0.2 Turn on verbose SDK logging

`SampleApp/CampaignConfig.json` already has `loglevel: "verbose"` for both platforms and `logfile: true` on iOS. Keep them for the regression run; `npm install` copies the values into `ios/SampleApp/MceConfig.json` and the Android assets.

- iOS: Console.app, filter `subsystem:com.acoustic` or process `SampleApp`, or `idevicesyslog | grep "Acoustic:MCE"`.
- Android: `adb -s <serial> logcat | grep -E "ACOUSTIC.MCE|RNAcoustic"`.

### 0.3 Capture registration identity

1. Launch the app, accept the notification permission prompt (Android 13+ shows it on first launch; iOS shows it when the Home screen calls `requestPushPermission`).
2. Open **Registration Details**. Wait until `userId` and `channelId` are shown (Android emulator took under 10 s; iOS needs the APNs token first).
3. Record both values per device. Every later check (Loki, certified push script, phone home) keys on them.
4. In Campaign > Data > Databases > push db > Search, find the row for that `userId`: the device is registered and opted in.

## 1. Push notifications, certified push and UBs: run the shared skill

Run the rows of the shared skill's `references/rows.yaml` in its guided mode. Per platform:

| | iOS | Android |
|---|---|---|
| Collection folder (`request_platform`) | `iOS` | `Android` |
| App key (`--app-key` of `regression-send.py`) | `apEHsIkt27` | `gc8guexFos` |
| Inbox / in-app sync | silent `inbox-sync` push (`regression-send.py --inbox-sync`) on a device; the **Inbox** screen's sync button otherwise | the **Inbox** screen's sync button (the SDK has no inbox-sync push) |

Requests go straight to the org API (`regression-send.py`, no Postman or Campaign UI needed); the org id, org API key and where they are kept are in the shared `references/environment.md`. The Campaign UI route (Message drafts > app group > Send now) still works for a manual check; the app group must hold both app keys.

Server verdicts: the shared `scripts/loki-sweep.py --user-id <userId> --since <start>` (or its LogQL through the Grafana MCP server), with the expected events of each row from `rows.yaml`.

RN specifics while running the rows:

- On the New Architecture the plugin `registerPlugin` calls run at JS start-up (visible as `RNAcousticMobilePushActionMenu: registerPlugin` in the iOS log). If a custom action does nothing, check that line exists before suspecting Campaign.
- RN-only rows, not in `rows.yaml`: the **textInput** custom action (text input reply) and the **wallet** action on iOS through the RN plugin; expect a 94 with the action type.
- The SampleApp's Send Test Events screen shows `EventSuccess` when the batch was accepted; events flush every `metricTimeInterval` (3 min on Android).
- `uiPushEnabled` (103) was not relayed again after a reinstall that recovered the same userId from the keychain (2026-10-08). Use a fresh simulator or erase the device when 89/103 must be seen again.
- 90 uninstalled is n/a with the Dev app type.

## 2. Geofence

Campaign setup (one time): Campaign > Mobile > Device location awareness > Add new site (name, latitude, longitude) > Edit > Geofence (radius 1000 m, dwell 1 min for testing, events Enter/Dwell/Exit). Campaign > Automation > Programs: activate the three regression programs (Enter / Dwell / Exit) that send a published Simple message, or create them as described in the Campaign Dashboard page. Wait 5 min after activation.

Sample config: `CampaignConfig.json` keeps the `location.geofence` key, which turns geofence support on; `react-native-acoustic-mobile-push-location` and `-geofence` are `true` in the plugins block.

1. Prepare three locations: A inside the geofence, B inside but a few hundred metres from A, C just outside, D a few hundred kilometres away.
2. Launch the app, open **Geofences**, grant location permission "Always" (iOS asks twice; Android asks for precise then background location). The screen shows a map with the synced geofences; the header sync button forces `syncLocations`.
3. Set the mocked location to A.
   - iOS: Xcode > Debug > Simulate Location with a custom GPX, or a GPX file in the scheme.
   - Android: Fake GPS set as mock provider, start at A.
4. Expected within ~1 min: `EnteredGeofence` event in the app (the Geofence screen lists events), the Enter program's push arrives, log shows the DLA call (`grep -E "bril.+dla"`).
5. Move to B and wait past the dwell time: Dwell push arrives. iOS only reports enter and exit when simulated; mark Dwell n/a on iOS if it does not fire.
6. Move to C: `ExitedGeofence` event and the Exit push.
7. If nothing fires, move to D, wait, then back to A; or kill and relaunch the app (the location feature restarts on launch).

Pass criteria: receiving the Enter, Dwell and Exit pushes covers the three test cases each (event sent, event hydrated, push received).

## 3. iBeacon

Campaign setup: on the same site, Edit > Beacon with UUID, major 1, minor 1, dwell 1 min, events Enter/Dwell/Exit. Activate the three beacon regression programs (deactivate the geofence ones if the active-program limit is reached).

Sample config: set `location.ibeacon.UUID` in `SampleApp/CampaignConfig.json` to the same UUID (it currently reads `SET YOUR IBEACON UUID HERE`; the SDK logs `iBeacon support enabled, but no UUID specified` and disables beacons otherwise), then re-run `npm install` so `MceConfig.json` is regenerated, and reinstall.

1. On the broadcaster (second phone with Beacon Simulator, or MactsAsBeacon on the Mac) start an iBeacon with that UUID, major 1, minor 1.
2. On the test device, confirm Bluetooth is on and that a beacon scanner app sees the broadcast.
3. Mock the device location inside the site (as in section 2) so the beacon region is synced to the device.
4. Launch the app, open **iBeacons**, grant location "Always" and Bluetooth permission. The screen lists the beacon regions returned by `beaconRegions`.
5. Expected within ~1 min of entering range: `EnteredBeacon` event listed and the Enter push.
6. Keep the beacon on past the dwell time: Dwell push.
7. Stop the broadcaster: after about a minute `ExitedBeacon` and the Exit push.
8. Beacons are flaky: if Enter never fires, uninstall, reinstall and test beacons first after granting permissions (noted on the Android regression page).

Pass criteria: Enter, Dwell and Exit pushes received (each covers event sent, hydrated and push delivered).

## 4. Evidence to attach to the result page

- Screenshot of Registration Details per device (userId / channelId).
- Screenshot of each received push and of the executed action.
- The shared skill's Loki sweep output (or Grafana screenshots) for UB 89, 91, 92, 94 (per action), 103/104, and the certified pushes (`174` with `pushState`), plus the query used.
- Geofence / iBeacon screens showing the event list, plus the three pushes per feature.
- Device log excerpt per platform for the certified push (`pushState`) and the DLA sync.
- Environment block: RN 0.87.1, plugin 3.9.58, native SDK iOS 3.10.9 / Android 3.11.1, OS versions, devices, date.
