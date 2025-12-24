# Build Configuration Summary

This document summarizes all the fixes applied to ensure Android and iOS builds work without errors.

## ✅ Fixed Issues

### 1. Android minSdkVersion Compatibility
- **Issue**: `react-native-text-input-mask` requires minSdkVersion 24, but project was set to 21
- **Fix**: Updated `android/build.gradle` to use minSdkVersion 24
- **Location**: `android/build.gradle` line 6

### 2. Android SDK Versions
- **Issue**: Using older SDK versions (33) which may cause future compatibility issues
- **Fix**: Updated to compileSdkVersion 34 and targetSdkVersion 34
- **Location**: `android/build.gradle` lines 7-8

### 3. react-native-svg Build Error
- **Issue**: react-native-svg tries to access non-existent `libs.versions.toml` file
- **Fix**: Created postinstall script that automatically patches the build.gradle file
- **Location**: `scripts/fix-react-native-svg.js` (runs automatically after npm install)

### 4. Android Gradle Plugin Warning
- **Issue**: AGP 8.0 warning about automatic component creation
- **Fix**: Added `android.disableAutomaticComponentCreation=true` to gradle.properties
- **Location**: `android/gradle.properties` line 59

### 5. Invalid app.json Configuration
- **Issue**: app.json contained Android config that conflicts with native folders
- **Fix**: Removed invalid Android config properties (compileSdkVersion, targetSdkVersion, buildToolsVersion, versionCode)
- **Location**: `app.json`

### 6. EAS Build Configuration
- **Issue**: Missing iOS configuration and invalid node version
- **Fix**: Added iOS build config and removed invalid node version
- **Location**: `eas.json`

## 📋 Current Configuration

### Android
- **minSdkVersion**: 24 (required by react-native-text-input-mask)
- **compileSdkVersion**: 34
- **targetSdkVersion**: 34
- **buildToolsVersion**: 33.0.0
- **Gradle**: 8.0.1
- **AGP**: 7.4.2

### iOS
- **Deployment Target**: 13.0 (from Podfile)
- **JS Engine**: Hermes
- **Podfile**: Configured correctly

### Dependencies
- All dependencies are compatible with Expo SDK 49
- react-native-svg: 13.9.0 (pinned version)
- All other dependencies verified compatible

## 🔧 Build Scripts

### Postinstall Script
- **File**: `scripts/fix-react-native-svg.js`
- **Purpose**: Automatically fixes react-native-svg build.gradle if needed
- **Runs**: Automatically after `npm install` (via postinstall hook)

### EAS Build Profiles
- **Preview**: APK format for internal distribution
- **Production**: App Bundle format with auto-increment
- **Both**: Include iOS configuration

## 🚀 Building

### Android
```bash
# EAS Build
eas build --platform android --profile preview

# Local build (after fixes)
cd android && ./gradlew :app:assembleRelease
```

### iOS
```bash
# EAS Build
eas build --platform ios --profile preview

# Local build
cd ios && pod install && xcodebuild
```

## ✅ Verification Checklist

- [x] minSdkVersion updated to 24
- [x] compileSdkVersion updated to 34
- [x] targetSdkVersion updated to 34
- [x] react-native-svg fix script in place
- [x] gradle.properties configured correctly
- [x] app.json cleaned up
- [x] eas.json configured for both platforms
- [x] All dependencies compatible
- [x] Postinstall script working

## 📝 Notes

- The postinstall script is non-blocking - it won't fail builds if the fix isn't needed
- All SDK versions are now future-proof and compatible with Google Play requirements
- iOS configuration is ready for App Store submission
- Both platforms are configured for EAS Build

