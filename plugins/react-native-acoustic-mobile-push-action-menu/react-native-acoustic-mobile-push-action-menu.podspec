require 'json'

package = JSON.parse(File.read('package.json'))
mobilePushConfig = JSON.parse(File.read('../../CampaignConfig.json'))
repository = package["repository"]["url"]
useRelease = mobilePushConfig["useRelease"]
dependencyName = useRelease ? 'AcousticMobilePush' : 'AcousticMobilePushDebug'
iOSVersion = mobilePushConfig["iOSVersion"]
dependencyVersion = iOSVersion.to_s.empty? ? "" : "#{iOSVersion}"

puts "*********react-native-acoustic-mobile-push-action-menu.podspec*********"
puts "mobilePushConfig:"
# puts JSON.pretty_generate(mobilePushConfig)
puts "repository:#{repository}"
puts "useRelease:#{useRelease}"
puts "dependencyName:#{dependencyName}"
puts "dependencyVersion:#{dependencyVersion}"
puts "mobilePushDependency:#{dependencyName}#{dependencyVersion}"
puts "***************************************************************"

Pod::Spec.new do |s|
  s.name           = package["name"]
  s.version        = package["version"]
  s.description    = package["description"]
  s.homepage       = package["homepage"]
  s.summary        = package["summary"]
  s.license        = package["license"]
  s.authors        = package["author"]
  s.platforms      = { :ios => "12.4" }
  
  s.source         = { :git => repository, :tag => s.version }
  s.preserve_paths = 'README.md', 'package.json', '*.js'
  s.source_files   = "ios/**/*.{h,m}"
  
  s.dependency       'React'
  s.xcconfig       = { 'HEADER_SEARCH_PATHS' => '../../../ios/Pods/** ' }
  s.dependency       dependencyName, dependencyVersion

end