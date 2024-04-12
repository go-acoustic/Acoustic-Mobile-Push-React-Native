/**********************************************************************************************
* Copyright (C) 2024 Acoustic, L.P. All rights reserved.
*
* NOTICE: This file contains material that is confidential and proprietary to
* Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
* industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
* Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
* prohibited.
**********************************************************************************************/

def modules = [:]
pipeline {
  agent {  
    label 'osx'  
  }

  environment {
    SONAR_HOME = "/Users/Shared/Developer/sonar-scanner-4.6.0.2311-macosx/bin"
    SONAR_BUILD_WRAPPER = "/Users/Shared/Developer/build-wrapper-macosx-x86/build-wrapper-macosx-x86"
    PATH="${PATH}:${GEM_HOME}/bin"
  }

  stages {
    stage('Setup Beta') {
      when { anyOf { branch 'feature/*'; branch 'develop' } }
      steps {
        echo "Set up settings..${env.GIT_BRANCH}"
        script {
          createBuild("${env.GIT_BRANCH}")
          if (genBuild) {
            checkoutRepo()
            // setupEmulator("RN_30")
          }
        }
      }
    }

    // Fix during release
    stage('Setup Release') {
      when { branch 'master' }
      steps {
        echo 'Set up settings..'
        script{
          createBuild("master")
          if (genBuild) {
            checkoutReleaseRepo()
          }
        }
      }
    }

    stage('Test') {
      when { anyOf { branch 'feature/*'; branch 'develop'; branch 'master' } }
      steps {
        echo 'Testing..'
        script {
          if (genBuild) {
            echo "Setup environment"
            runCMD("cd ${buildDir} && npm install -g react-native-cli mocha mocha-junit-reporter yarn eslint")
            echo "Run eslint"
            runCMD("cd ${buildDir} && npx eslint@8.57.0")
          }
        }
      }
    }

    // stage('Build Android - Sample App') { //react native cmd') {
    //   when { anyOf { branch 'feature/*'; branch 'develop'; branch 'master' } }
    //   steps {
    //     echo 'Building..'
    //     script{
    //       if (genBuild) {
    //         checkEmulatorReady()

    //         withCredentials([file(credentialsId: 'ca-google-services', variable: 'gs')]) {
    //             writeFile file: "${buildDir}/SampleApp/android/app/google-services.json", text: readFile(gs)
    //         }
    //         withCredentials([file(credentialsId: 'ca-MceConfig', variable: 'mcec')]) {
    //             writeFile file: "${buildDir}/SampleApp/ios/SampleApp/MceConfig.json", text: readFile(mcec)
    //             writeFile file: "${buildDir}/SampleApp/ios/SampleAppNotificationService/MceConfig.json", text: readFile(mcec)
    //         }

    //         echo "run using react native"
    //         runCMD("cd ${buildDir}/SampleApp && yarn install && detox build -c")
            
    //         // Remove file which should not be checked into repo
    //         runCMD("rm ${buildDir}/SampleApp/android/app/google-services.json")
    //         runCMD("rm ${buildDir}/SampleApp/ios/SampleApp/MceConfig.json")
    //         runCMD("rm ${buildDir}/SampleApp/ios/SampleAppNotificationService/MceConfig.json")
    //       }
    //     }
    //   }
    // }

    // stage('Build iOS - Sample App') { //react native cmd') {
    //   when { anyOf { branch 'feature/*'; branch 'develop'; branch 'master' } }
    //   steps {
    //     echo 'Building..'
    //     script{
    //       if (genBuild) {
    //         withCredentials([file(credentialsId: 'ca-google-services', variable: 'gs')]) {
    //             writeFile file: "${buildDir}/SampleApp/android/app/google-services.json", text: readFile(gs)
    //         }
    //         withCredentials([file(credentialsId: 'ca-MceConfig', variable: 'mcec')]) {
    //             writeFile file: "${buildDir}/SampleApp/ios/SampleApp/MceConfig.json", text: readFile(mcec)
    //             writeFile file: "${buildDir}/SampleApp/ios/SampleAppNotificationService/MceConfig.json", text: readFile(mcec)
    //         }

    //         echo "run using react native"
    //         runCMD("cd ${buildDir}/SampleApp && yarn install && detox build -c ios-15")
            
    //         // Remove file which should not be checked into repo
    //         runCMD("rm ${buildDir}/SampleApp/android/app/google-services.json")
    //         runCMD("rm ${buildDir}/SampleApp/ios/SampleApp/MceConfig.json")
    //         runCMD("rm ${buildDir}/SampleApp/ios/SampleAppNotificationService/MceConfig.json")
    //       }
    //     }
    //   }
    // }

    // stage('Build iOS - xcode') {
    //   when { anyOf { branch 'feature/*'; branch 'develop'; branch 'master' } }
    //   steps {
    //     echo 'Building..'
    //     script{
    //       runIosTests(true, false)
    //     }
    //   }
    // }
    // Issue starting simulator
    // stage('Build iOS - yarn ios') {
    //   when { anyOf { branch 'feature/*'; branch 'develop'; branch 'master' } }
    //   steps {
    //     echo 'Building..'
    //     script{
    //       echo "run using react native"
    //       runCMD("cd ${testAppDir} && yarn")
    //       runCMD("cd ${testAppDir} && yarn ios")
    //       killIosSim()
    //     }
    //   }
    // }
    // stage('Build Android - gradle') {
    //   when { anyOf { branch 'feature/*'; branch 'develop'; branch 'master' } }
    //   steps {
    //     echo 'Building..'
    //     // build errors need to review how to build
    //     // script{
    //     //     runAndroidTests(true, false)
    //     // }
    //   }
    // }
    // stage('Build Android - react native cmd') {
    //   when { anyOf { branch 'feature/*'; branch 'develop'; branch 'master' } }
    //   steps {
    //     echo 'Building..'
    //     script{
    //       checkEmulatorReady()
    //       echo "run using react native"
    //       runCMD("cd ${testAppDir} && react-native run-android")
    //     }
    //   }
    // }

    stage('Collect Reports') {
      when { anyOf { branch 'feature/*'; branch 'develop'; branch 'master' } }
      steps {
        echo 'Collect reports'
        script{
          if (genBuild) {
            reports()
          }
        }
      }
    }

    stage('Publish Beta') {
      when { branch 'develop'}
      steps {
        echo 'Publish Beta....'
        script{
          if (genBuild) {
              publishBeta()
          }
        }
      }
    }

    stage('Publish Release') {
      when { branch 'master' }
      steps {
        echo 'Publish Release....'
        script{
          if (genBuild) {
            publishRelease()
          }
        }
      }
    }

    stage('Slack Report - NonRelease') {
      when { anyOf { branch 'feature/*'; branch 'develop'; } }
      steps {
        echo 'Slack Report....'
        script{
          if (genBuild) {
            getSlackReport(false)
          }
        }
      }
    }

    // Fix during release
    // stage('Slack Report - Release') {
    //   when { anyOf { branch 'master' } }
    //   steps {
    //     echo 'Slack Report....'
    //     script{
    //       if (genBuild) {
    //         getSlackReport(true)
    //       }
    //     }
    //   }
    // }
  }
    // post {
    //     always {
    //         script{
    //             getSlackReport(false)
    //         }
    //     }
    //     // // Clean after build
    //     // success {
    //     //     cleanWs cleanWhenNotBuilt: false, cleanWhenFailure: false, cleanWhenUnstable: false, deleteDirs: true, disableDeferredWipeout: true, patterns: [[pattern: "**/Reports/**", type: 'EXCLUDE']]
    //     // }
    //     // aborted {
    //     //     cleanWs cleanWhenNotBuilt: false, cleanWhenFailure: false, cleanWhenUnstable: false, deleteDirs: true, disableDeferredWipeout: true, patterns: [[pattern: "**/Reports/**", type: 'EXCLUDE']]
    //     // }
    // }
}

import groovy.transform.Field
import groovy.json.JsonOutput
import java.util.Optional
import hudson.tasks.test.AbstractTestResultAction
import hudson.model.Actionable
import hudson.tasks.junit.CaseResult
import hudson.model.Action
import hudson.model.AbstractBuild
import hudson.model.HealthReport
import hudson.model.HealthReportingAction
import hudson.model.Result
import hudson.model.Run
import hudson.plugins.cobertura.*
import hudson.plugins.cobertura.targets.CoverageMetric
import hudson.plugins.cobertura.targets.CoverageTarget
import hudson.plugins.cobertura.targets.CoverageResult
import hudson.util.DescribableList
import hudson.util.Graph
import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import groovy.util.slurpersupport.*
import java.text.SimpleDateFormat

// Global variables
@Field def name              = "ca-mce-react-native"

// Slack reporting
@Field def gitAuthor         = ""
@Field def lastCommitMessage = ""
@Field def testSummary       = "No tests found"
@Field def coverageSummary   = "No test coverage found"
@Field def lintSummary       = "Lint report is null"
@Field def total             = 0
@Field def failed            = 0
@Field def skipped           = 0

// Version stuff
@Field def currentVersion
@Field def srcBranch

// Commit stuff
@Field def commitDesciption = ""

// Directory paths
@Field def tempTestDir = "${name}Build"
@Field def testAppDir  = "Example/nativebase-v3-kitchensink"
@Field def buildDir    = "${tempTestDir}/ca-mce-react-native"
@Field def releaseDir  = "${tempTestDir}/ea_react_native_module_tealeaf"
@Field def buildIosDir = "${testAppDir}/ios/derived"

// Build information
@Field def genBuild  = true

// Test platform
@Field def defaultIphone  = "iPhone 15 Pro"
@Field def platformLatest = "16.0"
@Field def platform       = "iOS Simulator,name=${defaultIphone},OS=${platformLatest}"
@Field def platformName   = platform.replaceAll(/\s|,|=|\./, "_")
@Field def emulatorId     = ""

// Sonarqube
@Field def sonarPropFile = "sonar-project.properties"
@Field def sonarProjName = "ca-mce-react-native"
@Field def isBetaBuild   = false

def createBuild(sourceBranch) {
  // Setup correct branch
  srcBranch  = sourceBranch

  def findText = ""
  if (sourceBranch == "main") {
    findText = "${name} Release"
  } else {
    findText = "Beta ${name} build"
  }
  
  def resullt = hasTextBasedOnLastCommit(findText)
  if (resullt == 0) {
    genBuild = false
    currentBuild.result = 'ABORTED'
  } else {
    genBuild = true
  }

  echo "genBuild text value: ${findText}"
  echo "To genBuild?  ${genBuild}"

  // platformLatest = runCMD("xcrun simctl list | grep -w \"\\-\\- iOS\" | tail -1 | sed -r 's/[--]+//g' | sed -r 's/[iOS ]+//g' ")
  platformLatest = runCMD("xcrun simctl list | grep -w \"\\-\\- iOS\" | tail -1 | sed -r 's/[--]+//g' | sed -r 's/[iOS ]+//g' ")
  platform = "iOS Simulator,name=iPhone 15 Plus,OS=${platformLatest}"
}

def runIosTests(isJustBuild, runSonarQube) {
  String xcodebuildCMD   = "arch -x86_64 xcrun"
  String workspacePath   = "${testAppDir}/ios/KitchenSinkappnativebase.xcworkspace"
  String sonarWrapperDir = "${testAppDir}/ios/build_wrapper_output_directory"
  
  echo 'Install xcpretty if not installed - gem install xcpretty'
  runCMD("#!/bin/bash;gem install xcpretty")
  podUpdate()

  echo "Clean build dir: ${buildIosDir}"
  cleanMkDir("${buildIosDir}")

  if (runSonarQube) {
    echo "Setup and run for SonarQube"
    xcodebuildCMD = "$SONAR_BUILD_WRAPPER --out-dir $sonarWrapperDir"
    buildIosDir   = "${testAppDir}/ios/sonarbuild/derived"
    cleanMkDir("${buildIosDir}")
  }
    
  if (isJustBuild) {
    echo "the scheme for building is: KitchenSinkappnativebase"
    runCMD("${xcodebuildCMD} xcodebuild -workspace ${workspacePath} -scheme KitchenSinkappnativebase -derivedDataPath ${buildIosDir} -configuration Debug -destination 'platform=${platform}' -UseModernBuildSystem=YES SUPPORTS_MACCATALYST=NO")
  } else {
      // Not enabled for now - no unit tests
      // echo "the scheme for unit testing is: $scheme"
      // runCMD("${xcodebuildCMD} xcodebuild -workspace ${workspacePath} -scheme ${schemeUnitTest} -derivedDataPath ${buildIosDir} -configuration ${configurationUnitTest} -destination 'platform=${platform}' -enableCodeCoverage YES test -UseModernBuildSystem=YES SUPPORTS_MACCATALYST=NO | xcpretty -t -r junit")

      // echo "Copy over unit tests"
      // cleanMkDir("${reportsDir}/junit")

      // runCMD("mv build/reports ${reportsDir}/junit")
      // runCMD("rm -rf build/reports")
      // runCMD("mv ${reportsDir}/junit/reports/junit.xml ${reportsDir}/junit/${platformName}.xml")
      // runCMD("rm -rf ${reportsDir}/junit/reports")

      // slather()
  }
}

def podUpdate() {
    echo "Fix and install cocopods dependancies for workspace"
    runCMD("cd ${testAppDir} && yarn")
    runCMD("cd ${testAppDir}/ios && pod update")
    // runCMD("cd ${testAppDir}/ios && pod install")
}
def killIosSim() {
    echo "Kill iOS Simulator"
    sh script: "sleep 10"
    runCMD("xcrun simctl shutdown \"iPhone 13\"")
}

def runAndroidTests(isJustBuild, runSonarQube) {
  // echo "Clean build dir: ${buildDir}"
  // runCMD("rm -rf ${buildDir}")
  // runCMD("mkdir ${buildDir}")

  // if (runSonarQube) {
  //     echo "Setup and run for SonarQube"
  //     xcodebuildCMD = "$SONAR_BUILD_WRAPPER --out-dir $sonarWrapperDir"
  //     buildDir = "${tempTestDir}/${name}/sonarbuild/derived"
  //     runCMD("rm -rf ${buildDir}")
  //     runCMD("mkdir -p ${buildDir}")
  // }

  echo "Run Gradle"
  String gradleLine = ""
  if (isJustBuild) {
    runCMD("/Users/Shared/Developer/gradle-6.7/bin/gradle -b \"${testAppDir}/android/build.gradle\" --stacktrace --continue --no-daemon --warning-mode all clean build -Dorg.gradle.jvmargs=-Xmx1536m -Duser.country=US -Duser.language=en")
  } else {
    // checkEmulatorReady()

    // // jacoco tests
    // runCMD("gradle -b \"${androidStudioProjectTestAppPath}/build.gradle\" --stacktrace --continue --no-daemon --warning-mode all jacocoTestReport -Dorg.gradle.jvmargs=-Xmx1536m -Duser.country=US -Duser.language=en")
    // reportsJacoco()

    // // checkstyle
    // runCMD("gradle -b \"${androidStudioProjectNamePath}/build.gradle\" --stacktrace --continue --no-daemon --warning-mode all checkstyle -Dorg.gradle.jvmargs=-Xmx1536m -Duser.country=US -Duser.language=en")
    // reportsCheckstyle()
  }
}

def setupEmulator(deviceId) {
  emulatorId = deviceId

  runCMD("adb start-server")
  // launch emulator
  String cmmmd = "${ANDROID_HOME}/emulator/emulator -avd ${deviceId} -engine auto -wipe-data -no-cache -memory 3072 -no-snapshot-save -no-window&sleep 60s"
  runCMD(cmmmd)
}

def shutdownEmulator() {
  sh script: 'adb -s emulator-5554 emu kill'
}

def checkEmulatorReady() {
  sh script: "adb start-server"

  if (!sh(script: "adb devices", returnStdout: true).contains("emulator")) {
    setupEmulator emulatorId
  }

  def counter = 0
  while (!sh(script: "adb shell getprop sys.boot_completed", returnStdout: true).trim().equals("1")) {
    if (counter >= 60) {
      echo "The emulator has not started, exiting"
      return
    }
    sh script: "sleep 5"
    counter += 5
  }

  counter = 0
  while (!sh(script: "sh AndroidAutoSrc/GroovyUtils/psgrep.sh testapp", returnStdout: true).trim().isEmpty()) {
    if (counter == 0) {
      echo "Waiting for previous tests to finish..."
    }

    sh script: "sleep 5"
    counter += 5
  }

  echo "No tests running, emulator ready"
}

def reports() {
  // if (!globalVariablesSetup) {
  //     currentBuild.result = 'ABORTED'
  //     getSlackReport(false)
  //     return
  // }

  // publish reports
  // lint
  // https://pub.dev/packages/flutter_analyze_reporter/install
  // TODO fix and create lint reports
  // recordIssues enabledForFailure: true, tool: pmdParser(pattern: "${tempTestSrcDir}/${name}/Reports/lint/oclint_result.xml"), skipPublishingChecks: true

  // coverage
  // https://codewithandrea.com/articles/flutter-test-coverage/
  // TODO fix and create coverage reports
  // cobertura coberturaReportFile: "${tempTestSrcDir}/${name}/Reports/cobertura/*.xml", enableNewApi: true//, lineCoverageTargets: '70, 70, 70'
  // publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: "${tempTestSrcDir}/${name}/Reports/codecoverage/", reportFiles: "${tempTestSrcDir}/${name}/Reports/codecoverage/*/index.html", reportName: 'Code Coverage HTML', reportTitles: ''])

  // junit
  // junit allowEmptyResults: true, testResults: "${junitDir}/xml/*.xml", skipPublishingChecks: true
  // archiveArtifacts artifacts: "${junitDir}/xml/*.xml"

  // sonarqube
  runSonarQube()
}

def runSonarQube() {
  echo "Start - Run SonarQube scans and push reports"
  // echo "Convert junit to unit sonarqube file"
  // cleanMkDir("${reportsDir}/sonarqube_unit")
  // TODO Fix
  // runCMD("ruby ${autoSrcDir}/scripts/RubyUtils/junitToSonar.rb ${junitDir}/xml/${platformName}.xml ${reportsDir}/sonarqube_unit/sonarUnitTests.xml ${nameUnitTest}")

  // https://codewithandrea.com/articles/flutter-test-coverage/
  // echo "Convert coverage to sonarqube file"
  // runCMD("ruby ${autoSrcDir}/scripts/RubyUtils/coverageToSonar.rb ${reportsDir}/sonarqube_coverage/sonarqube-generic-coverage.xml")

  echo "Run SonarQube scans and push reports"
  getLibVersion()
  // temp fix due to change to M1 mac
  // runCMD("sonar-scanner -Dproject.settings=\"${tempTestSrcDir}/${name}/sonar-project.properties\" -Dsonar.projectVersion=${currentVersion} -Dsonar.projectBaseDir=\"${tempTestSrcDir}/${name}\" -Dsonar.cfamily.build-wrapper-output=\"${tempTestSrcDir}/${name}/build_wrapper_output_directory\"")
  runCMD("sonar-scanner -Dsonar.verbose=true -Dproject.settings=\"${buildDir}/${sonarPropFile}\" -Dsonar.projectVersion=${currentVersion} -Dsonar.projectBaseDir=\"${buildDir}\"")
  echo "End - Run SonarQube scans and push reports"
}

// "Update library build version number and example app package.json"
def getLibVersion() {
  def packageFile = "${buildDir}/plugins/react-native-acoustic-mobile-push-beta/package.json"

  echo "Get version from:${packageFile}"
  // Get file to update and save
  def fileContent = readFile "${packageFile}"
  Map jsonContent = (Map) new JsonSlurper().parseText(fileContent)
  currentVersion = jsonContent.version
  echo "Current version ${currentVersion}"
}

// "Update library build version number and example app package.json"
def updateLibVersion(packageFile, packageName) {
  updateLibVersionHelper(packageFile, packageName)
}

// "Update library build version number and example app package.json"
def updateLibVersionHelper(packageFile, packageNames) {
  echo "Get version from:${packageFile}"
  // Get file to update and save
  def fileContent = readFile "${packageFile}"
  Map jsonContent = (Map) new JsonSlurper().parseText(fileContent)
  currentVersion = jsonContent.version
  echo "Current version ${currentVersion}"

  def libVersionArray = currentVersion.split("\\.")
  def major = libVersionArray[0] 
  def minor = libVersionArray[1]
  int patch = libVersionArray[2].toInteger()
  patch = patch + 1
  currentVersion = "${major}.${minor}.${patch}"
  echo "Updated to library version ${currentVersion}"

  jsonContent.put("version", currentVersion)
  if(packageNames != null && !packageNames.isEmpty()) {
    for(packageName in packageNames){
      echo "Update packageName:${packageName}"
      echo "Before ${jsonContent.peerDependencies[packageName]}"
      jsonContent.peerDependencies[packageName] = currentVersion
      echo "After ${jsonContent.peerDependencies[packageName]}"
    }
  }

  //convert maps/arrays to json formatted string
  def json = JsonOutput.toJson(jsonContent)
  json = JsonOutput.prettyPrint(json)
  writeFile(file:"${packageFile}", text: json)

  // Updated file
  def updatedFileContent = readFile "${packageFile}"
  echo "Updated file"
  echo "${updatedFileContent}"

  // // Update example app package.json
  // def examplePackageFile = "${buildDir}/Example/nativebase-v3-kitchensink-beta/package.json"
  // def exampleFileContent = readFile "${examplePackageFile}"
  // Map exampleJsonContent = (Map) new JsonSlurper().parseText(exampleFileContent)
  // exampleJsonContent.dependencies.put("react-native-acoustic-ea-tealeaf-beta", currentVersion)
  // def exampleJson = JsonOutput.toJson(exampleJsonContent)
  // exampleJson = JsonOutput.prettyPrint(exampleJson)
  // writeFile(file:"${examplePackageFile}", text: exampleJson)
  // def updatedExamplePackageFile = readFile "${examplePackageFile}"
  // echo "Updated file"
  // echo "${updatedExamplePackageFile}"
}

def runCMD(commnd) {
  echo "${commnd}"
  OUUUTTPT = sh (
    script: "#!/bin/bash -l\n ${commnd}",
    returnStdout: true
  ).trim()
  echo "${OUUUTTPT}"
  return OUUUTTPT
}

def cleanMkDir(cmDir) {
  removeDir(cmDir)
  runCMD("mkdir -p ${cmDir}")
}

def removeDir(cmDir) {
  def exists = fileExists "${cmDir}"
  if (exists) {
    runCMD("rm -rf ${cmDir}")
  }
}

// "Checkout repo and also switch to beta branch"
def checkoutRepo() {
  // Setup temp directory for repos for publishing
  echo "Create test push location: ${tempTestDir}"
  cleanMkDir("${tempTestDir}")
  runCMD("cd ${tempTestDir} && git clone git@github.com:aipoweredmarketer/ca-mce-react-native.git -b ${srcBranch}")
}

def checkoutReleaseRepo() {
  // Setup temp directory for repos for publishing
  echo "Create test push location: ${tempTestDir}"
  cleanMkDir("${tempTestDir}")
  runCMD("cd ${tempTestDir} && git clone git@github.com:aipoweredmarketer/ea_react_native_module_tealeaf_beta.git -b master")
  runCMD("cd ${tempTestDir} && git clone git@github.com:go-acoustic/ea_react_native_module_tealeaf.git -b master")
}

def gitPush(path, commitMsg, tagMsg, branch, commitMsg2) {
  echo "Git Push for: ${path}"
  runCMD('''cd \"''' + path + '''\" && git add . -A''')
  runCMD('''cd \"''' + path + '''\" && git commit -a -m \"''' + commitMsg + '''\" -m \"''' + commitMsg2 + '''\"''')

  // Tag repos
  echo "Tag repos"
  runCMD('''cd \"''' + path + '''\" && git tag -f \"''' + tagMsg + '''\" -m \"''' + commitMsg2 + '''\"''')

  // Pull from git
  echo "Pull from git"
  runCMD('''cd \"''' + path + '''\" && git pull --rebase origin \"''' + branch + '''\"''')

  // Push to git
  echo "Push to git"
  runCMD('''cd \"''' + path + '''\" && git push -f --tags''')
  runCMD('''cd \"''' + path + '''\" && git push -f --set-upstream origin \"''' + branch + '''\"''')
}

// "Update files for beta"
def updateDescription() {
  def commitDesciptionTitle = "Beta ${name} Change Notes:"
  commitDesciption = readFile "latestChanges"
  commitDesciption = "${commitDesciptionTitle} \n" << commitDesciption
  commitDesciption = commitDesciption.replaceAll("\"", "\'")
}

def publishBeta() {
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-beta/package.json", null)
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-action-menu-beta/package.json", ["react-native-acoustic-mobile-push-beta","react-native-acoustic-mobile-push-action-menu-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-calendar-beta/package.json", ["react-native-acoustic-mobile-push-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-displayweb-beta/package.json", ["react-native-acoustic-mobile-push-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-imagecarousel-beta/package.json", ["react-native-acoustic-mobile-push-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-inapp-beta/package.json", ["react-native-acoustic-mobile-push-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-inbox-beta/package.json", ["react-native-acoustic-mobile-push-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-ios-notification-service-beta/package.json", null)
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-location-beta/package.json", ["react-native-acoustic-mobile-push-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-snooze-beta/package.json", ["react-native-acoustic-mobile-push-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-textinput-beta/package.json", ["react-native-acoustic-mobile-push-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-wallet-beta/package.json", ["react-native-acoustic-mobile-push-beta"])

  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-beacon-beta/package.json", ["react-native-acoustic-mobile-push-beta","react-native-acoustic-mobile-push-location-beta"])
  updateLibVersion("${buildDir}/plugins/react-native-acoustic-mobile-push-geofence-beta/package.json", ["react-native-acoustic-mobile-push-beta","react-native-acoustic-mobile-push-location-beta"])
  
  withCredentials([string(credentialsId: 'NPMJS_TOKEN', variable: 'NPMJS_TOKEN')]) {
    sh 'echo "//registry.npmjs.org/:_authToken=${NPMJS_TOKEN}" >> ~/.npmrc'
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-action-menu-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-calendar-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-displayweb-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-imagecarousel-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-inapp-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-inbox-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-ios-notification-service-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-location-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-snooze-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-textinput-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-wallet-beta\" && npm publish''')

    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-beacon-beta\" && npm publish''')
    runCMD('''cd \"''' + buildDir + '''/plugins/react-native-acoustic-mobile-push-geofence-beta\" && npm publish''')

  }

  updateDescription()
  def commitMsg = "Beta ${name} build: ${currentVersion}"
  echo "push with:"
  echo commitMsg
  echo currentVersion
  echo commitDesciption

  // push repos
  gitPush("${buildDir}", commitMsg, currentVersion, srcBranch, commitDesciption)
}

def publishRelease() {
  getLibVersion()

  echo "Clean up directory in public repo"
  runCMD("cd ${releaseDir} && git rm -f -r .")

  echo "Copy over changes from beta to public repo"
  echo "rsync -av --exclude='.git' ${buildDir}/. ${releaseDir}"
  runCMD("rsync -av --exclude='.git' ${buildDir}/. ${releaseDir}")

  runCMD('''cd \"''' + releaseDir + '''\" && git add . -A''')

  sleep 30

  // echo "Search and replace text to fix with public name at ea_react_native_module_tealeaf"
  // runCMD("cd ${releaseDir} && git grep -l 'https:\\/\\/github.com\\/aipoweredmarketer\\/ea_react_native_module_tealeaf_beta' | xargs sed -i '' -e 's/https:\\/\\/github.com\\/aipoweredmarketer\\/ea_react_native_module_tealeaf_beta/https:\\/\\/github.com\\/go-acoustic\\/ea_react_native_module_tealeaf/g'")
  // runCMD("cd ${releaseDir} && git grep -l 'ea_react_native_module_tealeaf_beta' | xargs sed -i '' -e 's/ea_react_native_module_tealeaf_beta/ea_react_native_module_tealeaf/g'")
  // runCMD("cd ${releaseDir} && git grep -l 'tealeaf-beta' | xargs sed -i '' -e 's/tealeaf-beta/tealeaf/g'")
  // runCMD("cd ${releaseDir} && git grep -l 'BETA: ' | xargs sed -i '' -e 's/BETA: //g'")
  // runCMD("cd ${releaseDir} && git grep -l 'react-native-acoustic-ea-tealeaf-beta.podspec' | xargs sed -i '' -e 's/react-native-acoustic-ea-tealeaf-beta.podspec/react-native-acoustic-ea-tealeaf.podspec/g'")
  // runCMD("cd ${releaseDir} && git grep -l 'https://raw.githubusercontent.com/go-acoustic/Android_Maven/beta' | xargs sed -i '' -e 's/https:\\/\\/raw.githubusercontent.com\\/go-acoustic\\/Android_Maven\\/beta/https:\\/\\/raw.githubusercontent.com\\/go-acoustic\\/Android_Maven\\/master/g'")
  // runCMD("cd ${releaseDir} && git grep -l 'IBMTealeafReactNativeDebug' | xargs sed -i '' -e 's/IBMTealeafReactNativeDebug/TealeafReactNativeDebug/g'")
  // runCMD("mv ${releaseDir}/react-native-acoustic-ea-tealeaf-beta.podspec  ${releaseDir}/react-native-acoustic-ea-tealeaf.podspec")

  // Update package-lock.json
  def examplePackageFile = "${releaseDir}/package-lock.json"
  def exampleFileContent = readFile "${examplePackageFile}"
  Map exampleJsonContent = (Map) new JsonSlurper().parseText(exampleFileContent)
  exampleJsonContent.put("version", currentVersion)
  key = ''
  exampleJsonContent.packages."$key".put("version", currentVersion)
  def exampleJson = JsonOutput.toJson(exampleJsonContent)
  exampleJson = JsonOutput.prettyPrint(exampleJson)
  writeFile(file:"${examplePackageFile}", text: exampleJson)
  
  withCredentials([string(credentialsId: 'NPMJS_TOKEN', variable: 'NPMJS_TOKEN')]) {
      sh 'echo "//registry.npmjs.org/:_authToken=${NPMJS_TOKEN}" >> ~/.npmrc'
      runCMD('''cd \"''' + releaseDir + '''\" && npm publish''')
  }

  updateDescription()
  def commitMsg = "Release ${name} build: ${currentVersion}"
  echo "push with:"
  echo commitMsg
  echo currentVersion
  echo commitDesciption

  // push repos
  // gitPush("${buildDir}", commitMsg, currentVersion, srcBranch, commitDesciption) - there are no changes.
  gitPush("${releaseDir}", commitMsg, currentVersion, "master", commitDesciption)
}

def populateSlackMessageGlobalVariables() {
  getLastCommitMessage()
  getGitAuthor()
  getLibVersion()
}

def getGitAuthor() {
  def commit = sh(returnStdout: true, script: 'git rev-parse HEAD')
  gitAuthor = sh(returnStdout: true, script: "git --no-pager show -s --format='%an' ${commit}").trim()
}

def getLastCommitMessage() {
  lastCommitMessage = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
}

def hasTextBasedOnLastCommit(findText) {
  def resullt
  
  script {
    resullt = sh (script:'''git log -1 | grep -c \"''' + findText + '''\"
          ''', returnStatus: true)
  }
  return resullt
}

def getSlackReport(isRelease) {
  populateSlackMessageGlobalVariables()

  def releaseTitle = ""
  if (isRelease) {
    releaseTitle = "********************Release********************\n"
  }

  echo "currentBuild.result:${currentBuild.result}"

  def buildColor  = "good"
  def jobName     = "${env.JOB_NAME}"
  def buildStatus = "Success"

  if (currentBuild.result != null) {
    buildStatus = currentBuild.result
    if (buildStatus == "FAILURE") {
        failed = 9999
    }
  }

  // Strip the branch name out of the job name (ex: "Job Name/branch1" -> "Job Name")
  // echo "job name::;${jobName}"
  jobName = jobName.getAt(0..(jobName.lastIndexOf('/') - 1))

  if (failed > 0) {
    buildStatus = "Failed"
    buildColor  = "danger"
    def failedTestsString = "No current tests now"//getFailedTests()

    notifySlack([
      [
        title: "${jobName}, build #${env.BUILD_NUMBER}",
        title_link: "${env.BUILD_URL}",
        color: "${buildColor}",
        author_name: "${gitAuthor}",
        text: "${releaseTitle}${buildStatus}",
        fields: [
          [
            title: "Repo",
            value: "${name}",
            short: true
          ],
          [
            title: "Branch",
            value: "${env.GIT_BRANCH}",
            short: true
          ],
          [
            title: "Beta build",
            value: "https://www.npmjs.com/package/react-native-acoustic-mobile-push-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-action-menu-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-beacon-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-calendar-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-displayweb-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-geofence-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-imagecarousel-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-inapp-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-inbox-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-ios-notification-service-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-location-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-snooze-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-textinput-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-wallet-beta",
            short: false
          ],
          [
            title: "Version",
            value: "${currentVersion}",
            short: false
          ],
          [
            title: "Test Results",
            value: "${testSummary}",
            short: true
          ],
          [
            title: "Code Coverage Results",
            value: "${coverageSummary}",
            short: true
          ],
          [
            title: "Lint Results",
            value: "${lintSummary}",
            short: true
          ],
          [
            title: "SonarQube Results",
            value: "https://sonarqube.acoustic.co/dashboard?id=${sonarProjName}&branch=${env.GIT_BRANCH}",
            short: false
          ],
          [
            title: "Last Commit",
            value: "${lastCommitMessage}",
            short: false
          ]
        ]
      ],
      [
        title: "Failed Tests",
        color: "${buildColor}",
        text: "${failedTestsString}",
        "mrkdwn_in": ["text"],
      ]
    ], buildColor)          
  } else {
    notifySlack([
      [
        title: "${jobName}, build #${env.BUILD_NUMBER}",
        title_link: "${env.BUILD_URL}",
        color: "${buildColor}",
        author_name: "${gitAuthor}",
        text: "${releaseTitle}${buildStatus}",
        fields: [
          [
            title: "Repo",
            value: "${name}",
            short: true
          ],
          [
            title: "Branch",
            value: "${env.GIT_BRANCH}",
            short: true
          ],
          [
            title: "Beta build",
            value: "https://www.npmjs.com/package/react-native-acoustic-mobile-push-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-action-menu-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-beacon-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-calendar-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-displayweb-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-geofence-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-imagecarousel-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-inapp-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-inbox-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-ios-notification-service-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-location-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-snooze-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-textinput-beta\nhttps://www.npmjs.com/package/react-native-acoustic-mobile-push-wallet-beta",
            short: false
          ],
          [
            title: "Version",
            value: "${currentVersion}",
            short: false
          ],
          [
            title: "Test Results",
            value: "${testSummary}",
            short: true
          ],
          [
            title: "Code Coverage Results",
            value: "${coverageSummary}",
            short: true
          ],
          [
            title: "Lint Results",
            value: "${lintSummary}",
            short: true
          ],
          [
            title: "SonarQube Results",
            value: "https://sonarqube.acoustic.co/dashboard?id=${sonarProjName}&branch=${env.GIT_BRANCH}",
            short: false
          ],
          [
            title: "Last Commit",
            value: "${lastCommitMessage}",
            short: false
          ]
        ]
      ]
    ], buildColor)
  }
}

def notifySlack(attachments, buildColor) {    
  slackSend attachments: attachments, color: buildColor, channel: '#sdk-github'
  slackSend attachments: attachments, color: buildColor, channel: '#sdk-ci-react-native-bender'
}

return this



// old pipeline file
//   options
//   {
//     disableConcurrentBuilds()
//   }

//   stages
//   {
//     stage('Validate code quality')
//     {
//       steps
//       {
//         runSonarQube()
//       }
//     }

//     stage('Verify environment configuration')
//     {
//       steps
//       {
//         sh """
//           source scripts/setup_jenkins_env.sh
//           npm install -g react-native-cli mocha mocha-junit-reporter yarn detox eslint
//           cp ~/Secrets/google-services.json SampleApp/android/app
//           cp ~/Secrets/iOSMceConfig.json SampleApp/ios/SampleApp/MceConfig.json
//           cp ~/Secrets/iOSMceConfig.json SampleApp/ios/SampleAppNotificationService/MceConfig.json
//         """
//       }
//     }

//     stage('Run linter')
//     {
//       steps
//       {
//         sh """
//           source scripts/setup_jenkins_env.sh
//           eslint
//         """
//       }
//     }

//     stage('Verify sample app Android build')
//     {
//       steps
//       {
//         sh """
//           source scripts/setup_jenkins_env.sh
//           sh scripts/launch_android_emulator.sh android-31
//           cd SampleApp
//           yarn install
//           detox build -c android-31
//           sh ../scripts/kill_devices.sh
//         """
//       }
//     }

//     // stage('Android 12 / API 31')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh android-31
//     //     """
//     //   }
//     // }

//     // stage('Android 11 / API 30')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh android-30
//     //     """
//     //   }
//     // }

//     // stage('Android 10 / API 29')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh android-29
//     //     """
//     //   }
//     // }

//     // stage('Android 9 / API 28')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh android-28
//     //     """
//     //   }
//     // }

//     // stage('Android 8.1 / API 27')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh android-27
//     //     """
//     //   }
//     // }

//     // stage('Android 7.1.1 / API 25')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh android-25
//     //     """
//     //   }
//     // }

//     stage('Verify sample app iOS build')
//     {
//       steps
//       {
//         sh """
//           source scripts/setup_jenkins_env.sh
//           cd SampleApp
//           yarn install
//           detox build -c ios-15
//           sh ../scripts/kill_devices.sh
//         """
//       }
//     }

//     // stage('iOS 15')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh ios-15
//     //     """
//     //   }
//     // }

//     // stage('iOS 14')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh ios-14
//     //     """
//     //   }
//     // }

//     // stage('iOS 13')
//     // {
//     //   steps
//     //   {
//     //     sh """
//     //       sh scripts/run_tests.sh ios-13
//     //     """
//     //   }
//     // }

//     /*stage('Check QualityGate results')
//     {
//       steps
//       {
//         checkQualityGate()
//       }
//     }*/
//   }

//   post
//   {
//     always
//     {
//       // sh """
//       //   if [ ! -d "SampleApp/test-results" ]; then
//       //     mkdir -p SampleApp/test-results && touch SampleApp/test-results/blank.xml
//       //   fi
//       // """

//       // junit 'SampleApp/test-results/*.xml'
//       notifyBuildStatus()
//     }
//   }
// }


