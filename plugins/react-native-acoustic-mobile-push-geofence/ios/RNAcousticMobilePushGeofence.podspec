
Pod::Spec.new do |s|
  s.name         = "RNAcousticMobilePushGeofence"
  s.version      = "3.8.0"
  s.summary      = "Acoustic Mobile Push Geofence Location Plugin"
  s.description  = <<-DESC
                  Acoustic Mobile Push Geofence Location Plugin
                   DESC
  s.homepage     = "https://acoustic.co/products/campaign/"
  s.license      = "Copyright (c) 2019. Acoustic, L.P. All rights reserved."
  s.author             = { "author" => "author@acoustic.co" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/RNAcousticMobilePushGeofence.git", :tag => "master" }
  s.source_files  = "RNAcousticMobilePushGeofence/**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React"
  #s.dependency "others"

end
