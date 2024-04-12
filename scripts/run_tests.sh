CONFIG=$1

source scripts/setup_jenkins_env.sh

if [[ "$CONFIG" == "android"* ]]; then
  sh scripts/launch_android_emulator.sh $CONFIG
fi

cd SampleApp
detox test -c $CONFIG
exit=$?
sh ../scripts/kill_devices.sh
mkdir -p test-results
mv test-results.xml test-results/$CONFIG.xml
exit $exit
