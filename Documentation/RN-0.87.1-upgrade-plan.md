# React Native 0.87.1 support plan

Target: Acoustic Campaign (Mobile Push) React Native SDK builds, installs and passes regression on React Native 0.87.1 (New Architecture only), on both iOS and Android.

Baseline (develop, plugin 3.9.58): SampleApp on RN 0.73.6, React 18.2.0, Legacy Architecture, Flipper, Gradle 8.0.1, iOS Podfile platform 15.1.

## 1. What changes between 0.73.6 and 0.87.1 that affects this SDK

Sources: [RN 0.87 release post](https://reactnative.dev/blog/2026/08/11/react-native-0.87), [v0.87.1 release notes](https://github.com/facebook/react-native/releases/tag/v0.87.1), [Upgrade Helper diff 0.73.6..0.87.1](https://react-native-community.github.io/upgrade-helper/?from=0.73.6&to=0.87.1), and the `react-native@0.87.1` / `@react-native/gradle-plugin@0.87.1` npm tarballs (inspected locally).

| Area | 0.87.1 fact | Impact on this repo |
|---|---|---|
| Architecture | New Architecture only. `newArchEnabled=false` is rejected by the Gradle plugin since 0.82; `RCTReactNativeFactory` hard-codes `newArchEnabled:YES bridgelessEnabled:YES`. | All 14 plugins are legacy `RCTBridgeModule` / `ReactContextBaseJavaModule` modules. They keep working through the interop layer (`RCTInteropTurboModule`, `JavaInteropTurboModule`), which is still on by default (`RCT_REMOVE_LEGACY_MODULE_INTEROP` defaults to off). |
| iOS `RCTRootView` | `-[RCTRootView initWithBridge:moduleName:initialProperties:]` is a no-op stub in 0.87.1 (returns an empty view). Root views must come from `RCTRootViewFactory viewWithModuleName:initialProperties:`. | **Blocker.** `react-native-acoustic-mobile-push-inapp` and `-inbox` render the JS templates (`InAppBanner`, `InAppImage`, `InAppVideo`, `InboxAction`) natively via `RCTRootView initWithBridge:self.bridge`. In-app and inbox-action overlays would render blank. |
| Android `ReactNativeHost` | `ReactApplication.reactNativeHost` throws `RuntimeException("You should not use ReactNativeHost directly in the New Architecture")` unless the host app overrides it. Surfaces are created with `ReactHost.createSurface(context, moduleName, props)`. | **Blocker.** Same two plugins call `getReactNativeHost().getReactInstanceManager()` + `ReactRootView.startReactApplication`. Crash at runtime on 0.87. |
| iOS AppDelegate | Template is Swift `@main` + `RCTReactNativeFactory`. `RCTAppDelegate` still exists but is marked deprecated. | The SDK integration replaces `main.m` to launch `MCEAppDelegate`, which proxies to the class named in `MceConfig.json` (`appDelegateClass`). A Swift `@main` app has no `main.m`, so `postinstall.js` must detect Swift templates and print manual steps (add `main.swift`, drop `@main`). SampleApp keeps an Obj-C `AppDelegate` and `main.m`, so it only needs the delegate rewritten on `RCTReactNativeFactory`. |
| Android Gradle | Gradle 9.4.1, AGP 9 (RNGP 0.87.1 pins AGP 9.2.1), Kotlin 2.2.0, `compileSdk`/`buildTools` 37, `targetSdk` 36, `minSdk` 24, NDK 27.1.12297006. Library modules need `namespace`; manifest `package=` is rejected. Jetifier removed. Autolinking moves to the `com.facebook.react.settings` plugin (no `native_modules.gradle`). | All 11 Android plugins declare `package=` in `AndroidManifest.xml` and no `namespace`. `compileOnly('com.facebook.react:react-native:+')` still works (RNGP substitutes it with `react-android`). `minSdkVersion` 21 must become 24 in the sample. |
| Toolchain | Node >= 22.13.0; Xcode 16.1+ in practice (CocoaPods 1.16); JDK 17+ for AGP 9. | Jenkins uses `nvm use 14` and `openjdk@11` (`scripts/setup_jenkins_env.sh`): CI must move to Node 22 and JDK 17/21. |
| Testing | Jest preset is `@react-native/jest-preset`. Detox 19 does not support RN 0.87; Detox 20 drops the Mocha runner. | `e2e/` runner config (`.mocharc.json`, `init.js`) must move to Jest. |
| JS API removals | `InteractionManager`, `StatusBar` `backgroundColor`/`translucent`, `Modal` `animated`, boolean `keyboardShouldPersistTaps`, deep imports from `react-native/Libraries/*`. | SampleApp source does not use any of these (grep). `__tests__/jest.setup.js` deep-imports two `react-native/Libraries/*` mocks and needs updating. |
| React 19 | React 19.2.3 is a peer. String refs, legacy context, `propTypes` on function components removed. | SampleApp is class-component based with `prop-types`; `react-navigation` 4 / `react-navigation-stack` 2 / `react-native-elements` 3 are unmaintained and must be smoke-tested on React 19. Fallback: migrate `App.js` (one stack navigator, 13 screens) to `@react-navigation/native-stack` 7. |

## 2. Work breakdown

### Phase A. Plugins (publishable change, independent of the sample app)

1. **iOS in-app / inbox root views.** Add a root-view resolver used by `RNAcousticMobilePushInApp.m` and `RNAcousticMobilePushInbox.m`:
   - resolve the real app delegate (`MCEAppDelegate.appDelegate` when the SDK proxy is installed, otherwise `UIApplication.sharedApplication.delegate`),
   - read its `reactNativeFactory.rootViewFactory` (RCTAppDelegate subclasses and factory-based delegates both expose it),
   - create the view with `viewWithModuleName:initialProperties:`,
   - log an error and skip the overlay when no factory is exposed (RN < 0.76 hosts are no longer supported).
   Change the `inAppView` / `inboxView` property types to `UIView *`.
2. **Android in-app / inbox surfaces.** In `RNAcousticMobilePushInAppModule.java` and `RNPushNotificationInboxCustomAction.java` use `((ReactApplication) app).getReactHost().createSurface(activity, module, props)`, `start()` it and add `getView()`; call `stop()` when the overlay is dismissed. No `ReactNativeHost` fallback: RN 0.76+ is the floor (`peerDependencies.react-native >= 0.76.0`).
3. **Android library Gradle.** Add `namespace` to every plugin `build.gradle`, drop `package=` from manifests, use `compileSdk`/`minSdk`/`targetSdk` DSL (AGP 9), keep `compileOnly('com.facebook.react:react-native:+')`.
4. **iOS podspecs.** Depend on `React-Core` (and `React-RCTAppDelegate` for the two plugins that need the factory headers if the selector-based resolver is replaced by typed calls). Keep `s.platforms` 15.1.
5. **postinstall.js.** Detect `AppDelegate.swift` without `main.m`; print the Swift integration steps instead of silently skipping. Recommend Node 22 in the version banner. Replace `android.enableJetifier` handling if present.
6. **Metadata.** Plugin `package.json` devDependency `react-native` 0.72.6 -> 0.87.1, add `engines.node >= 22.13.0`; update README compatibility matrix and `Documentation/`.

### Phase B. SampleApp upgrade to the 0.87.1 template

1. `package.json`: `react` 19.2.3, `react-native` 0.87.1, `@react-native/*` 0.87.1, `@react-native-community/cli*` 20.2.0, `jest-preset`, `react-test-renderer` 19.2.3; drop `metro-react-native-babel-preset`, `react-native-codegen`, `react-native-web`, `react-dom`, Flipper; bump third-party natives (`react-native-screens` 4, `safe-area-context` 5, `gesture-handler` 2.33, `webview` 14, `video` 6, `maps` 1.29, `vector-icons` 10, `datetimepicker` 9, `modal-datetime-picker` 18, `geolocation` 3.4); Detox 20.
2. `babel.config.js` -> `@react-native/babel-preset`; `jest.config.js` and the `jest` block -> `@react-native/jest-preset`; fix the two deep-import mocks in `__tests__/jest.setup.js`.
3. iOS: Podfile from the template (keep `platform :ios, '15.1'`, drop Flipper), `AppDelegate.h/.mm` on `RCTReactNativeFactory` + `RCTDefaultReactNativeFactoryDelegate` with `RCTAppDependencyProvider`, keep `main.m` (SDK `MCEAppDelegate`), remove the stale `AppDelegate.m`, deployment target 15.1 in `project.pbxproj`, add `PrivacyInfo.xcprivacy`.
4. Android: `build.gradle` versions above, `apply plugin: "com.facebook.react.rootproject"`, Gradle wrapper 9.4.1, `settings.gradle` with `com.facebook.react.settings` autolinking, `app/build.gradle` from the template (`autolinkLibrariesWithApp()`, keep `google-services` 4.5.0 and `vector-icons/fonts.gradle`), `gradle.properties` (`newArchEnabled=true`, `android.builtInKotlin=false`, `android.newDsl=false`, `edgeToEdgeEnabled=true`, no Jetifier), `MainApplication.kt` / `MainActivity.kt` from the template, remove the manual `react-native-video` project include.
5. Detox: `.detoxrc.js` with the Jest runner, `e2e/jest.config.js`, drop `.mocharc.json`/`init.js`; refresh device list (iPhone 17 / iOS 26.4, API 34-36 AVDs).
6. CI: `scripts/setup_jenkins_env.sh` Node 22 + JDK 17; Jenkinsfile eslint step stays.

### Phase C. Verification (adapted from the Connect `release-verification` skill)

The Connect skill asserts "on the wire" against a local collector sink. Campaign has no local sink, so the equivalents are: the SDK's own log output (`loglevel: verbose`, `logfile: true`) plus the Campaign backend state (registration, user attributes, events) and the Confluence checklist below.

Evidence layout (kept locally, gitignored, not committed): `verification/rn-0.87.1/<platform>/{build.log,install.log,launch.log,screenshots/,notes.md}` and one `results-<platform>.md` with an Environment block (repo commit, RN version, resolved native SDK version with date, simulator/emulator identity).

| # | Check | How | Verdict rule |
|---|---|---|---|
| 1 | `npm install` on Node 22 with all 14 local plugins overlaid | `npm install`, then rsync `plugins/*` into `node_modules` (same as Jenkins) | PASS if postinstall patches `main.m`, `Info.plist`, `AndroidManifest.xml` and exits 0 |
| 2 | `pod install` resolves React 0.87.1 and `AcousticMobilePushDebug` >= 3.10.6 (3.10.6+ requires iOS 15.1, the deployment target; 3.10.8 resolved on 2026-10-08; 3.10.9, the first release with iOS 27 support, on 2026-10-15) | `Podfile.lock` | PASS if both versions present |
| 3 | iOS Debug build for simulator | `xcodebuild -workspace ... -sdk iphonesimulator` | PASS on `BUILD SUCCEEDED` |
| 4 | Android debug build | `./gradlew :app:assembleDebug` | PASS on `BUILD SUCCESSFUL` |
| 5 | App launches, registers (`Registered` event, userId/channelId on Registration screen) | simulator / emulator, Metro | PASS if ids appear; INCONCLUSIVE if APNs/FCM unavailable on simulator |
| 6 | In-app banner/image/video templates render (native overlay via root-view factory) | SampleApp "In-App" screen test buttons | PASS if the JS template is visible, not a blank overlay |
| 7 | Inbox list + inbox-action overlay render | SampleApp "Inbox" screen | PASS if list renders and action overlay shows the JS component |
| 8 | Events / attributes queue and `EventSuccess` / `UpdateUserAttributesSuccess` callbacks fire | "Send Test Event", "Send User Attributes" screens | PASS if success events arrive (needs network to `mobile-sdk-lib-us-0`) |
| 9 | Jest unit tests | `npm test` | PASS if green |
| 10 | Full Confluence regression (push, certified push, UB verification in Grafana Loki, geofence, iBeacon, calendar, carousel, display web, phone home) | manual, QA, physical devices | Tracked on a new child page under [React Native Regression Testing](https://acoustic-jiraconf.atlassian.net/wiki/spaces/EAS/pages/64025854126/React+Native+Regression+Testing), using the 3.9.18 page as the template |

Rows 1-9 are what this branch verifies locally; row 10 needs devices, push certificates and Grafana Loki access.

## 3. Risks and open questions

1. **Unmaintained JS deps on React 19** (`react-navigation` 4, `react-native-elements` 3). If they fail at runtime, migrate the sample to `@react-navigation/native` 7 + `native-stack` and replace `react-native-elements` with plain RN components. Estimated 1 day.
2. **Swift-template customers.** The `main.m` swap does not apply to RN >= 0.77 Swift templates. Document: remove `@main`, add `main.swift` calling `UIApplicationMain(..., NSStringFromClass(MCEAppDelegate.self))`, set `appDelegateClass` to `<Product>.AppDelegate`, and mark `reactNativeFactory` `@objc`. Consider a follow-up that removes the `main.m` requirement (SDK-side delegate swizzling or an explicit `RNAcousticMobilePush.setup(application)` call).
3. **Interop layer deprecation.** Legacy module interop is still on by default in 0.87 but flagged for removal. Converting the 14 modules to TurboModules (codegen specs) is the long-term fix; not required for 0.87.
4. **Android `minSdk` 24.** The sample must move from 21 to 24; the native Android SDK 3.10.14 should be checked for its own `minSdk`.
5. **CI toolchain.** Jenkins agents need Node 22, JDK 17, Xcode 16.1+/26, Gradle 9 cache.
6. **Beta publishing.** The plugins now require RN 0.76+ (New Architecture); apps on 0.73 must stay on plugin 3.9.58. The plugins move to the 3.10 line (repo version 3.10.0; Jenkins publishes the first beta as 3.10.1), marked accordingly in `latestChanges`.

## 4. Status (2026-10-08)

Done on branch `feature/rn-0.87.1-upgrade` (uncommitted):

- Phase A: items 1-3, 5 and 6 implemented (iOS root-view resolver, Android `ReactHost` surfaces, Gradle namespaces/AGP 9 DSL, podspecs on `React-Core`, Swift-template detection in `postinstall.js`, `engines.node`). Item 4 (typed `React-RCTAppDelegate` dependency) was not needed: the resolver is selector-based.
- Phase B: items 1-5 implemented. Extra changes forced by 0.87: `react-navigation` 4 replaced by `@react-navigation/native` 7 + `native-stack` (v4 uses the removed `InteractionManager`), `react-native-mail` replaced by a `mailto:` `Linking` call, `@react-native-community/masked-view` excluded from autolinking (`jcenter()`), Ionicons names updated for `react-native-vector-icons` 10, ESLint parser moved to `@babel/eslint-parser`. Item 6 done: `scripts/setup_jenkins_env.sh` selects Node 22 and JDK 17/21. `Jenkinsfile.release` was removed: no Jenkins job used it (releases run from `Jenkinsfile`) and its `mac` agent label no longer exists.
- Phase C (row numbers as in the table above): rows 1, 5 and 9 PASS on both platforms, rows 2-3 PASS on iOS and row 4 on Android; row 6 PASS for the banner and image templates on both platforms (video not exercised); row 7 INCONCLUSIVE (no inbox messages for the fresh registrations); row 8 PARTIAL on iOS (user attribute accepted and relayed; custom event uploaded but not seen as a UB in Loki), not run on Android; row 10 not run on devices. Simulator push handling (`xcrun simctl push`) and backend registration/UBs in Grafana Loki were checked. Details and evidence were collected locally (`verification/` is gitignored) and summarised in the PR.

Decision taken 2026-10-08: the RN < 0.76 fallbacks were removed; the plugins require RN 0.76+.

Open items before release: Jenkins agents must have Node 22 and JDK 17+ installed (the scripts now select them), device regression per `Documentation/RN-0.87.1-device-verification.md`, and Swift-template customer documentation.
