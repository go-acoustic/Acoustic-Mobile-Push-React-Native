package co.acoustic.mobile.push.sample;

import android.app.Application;

import com.facebook.react.ReactApplication;

import co.acoustic.mobile.push.BuildConfig;
import co.acoustic.mobile.push.plugin.inapp.RNAcousticMobilePushInAppPackage;
import co.acoustic.mobile.push.plugin.inbox.RNAcousticMobilePushInboxPackage;
import co.acoustic.mobile.push.plugin.beacon.RNAcousticMobilePushBeaconPackage;
import co.acoustic.mobile.push.plugin.geofence.RNAcousticMobilePushGeofencePackage;
import co.acoustic.mobile.push.plugin.location.RNAcousticMobilePushLocationPackage;
import co.acoustic.mobile.push.plugin.calendar.RNAcousticMobilePushCalendarPackage;
import co.acoustic.mobile.push.plugin.snooze.RNAcousticMobilePushSnoozePackage;
import co.acoustic.mobile.push.plugin.displayweb.RNAcousticMobilePushDisplayWebPackage;
import co.acoustic.mobile.push.RNAcousticMobilePushPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.chirag.RNMail.RNMail;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
              new RNAcousticMobilePushPackage(),
            new RNAcousticMobilePushInAppPackage(),
            new RNAcousticMobilePushInboxPackage(),
            new RNAcousticMobilePushBeaconPackage(),
            new RNAcousticMobilePushGeofencePackage(),
            new RNAcousticMobilePushLocationPackage(),
            new RNAcousticMobilePushCalendarPackage(),
            new RNAcousticMobilePushSnoozePackage(),
            new RNAcousticMobilePushDisplayWebPackage(),
          new RNCWebViewPackage(),
          new ReactVideoPackage(),
          new VectorIconsPackage(),
          new RNScreensPackage(),
          new RNMail(),
          new RNGestureHandlerPackage(),
          new MapsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
