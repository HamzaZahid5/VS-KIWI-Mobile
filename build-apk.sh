#!/bin/bash
# Script to build Android APK for Kiwi Rentals

set -e

echo "🔨 Building Android APK..."

cd "$(dirname "$0")"

# Fix react-native-svg issue
echo "📝 Fixing react-native-svg build issue..."
NODE_MODULES_SVG_BUILD="node_modules/react-native-svg/android/build.gradle"
if [ -f "$NODE_MODULES_SVG_BUILD" ]; then
    # Backup original
    cp "$NODE_MODULES_SVG_BUILD" "$NODE_MODULES_SVG_BUILD.bak"
    
    # Apply fix if not already applied
    if ! grep -q "libsVersionsFile.exists()" "$NODE_MODULES_SVG_BUILD"; then
        sed -i '' 's/file("$reactNativeRootDir\/gradle\/libs.versions.toml")/def libsVersionsFile = file("$reactNativeRootDir\/gradle\/libs.versions.toml")\
    if (libsVersionsFile.exists()) {\
        libsVersionsFile/g' "$NODE_MODULES_SVG_BUILD"
        sed -i '' '/libsVersionsFile.withInputStream/a\
    }' "$NODE_MODULES_SVG_BUILD"
    fi
fi

# Clean build
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean --no-daemon

# Build APK
echo "🔨 Building release APK (this may take 5-10 minutes)..."
./gradlew :app:assembleRelease --no-daemon

# Find APK
APK_PATH=$(find app/build/outputs/apk/release -name "*.apk" -type f | head -1)

if [ -n "$APK_PATH" ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo "📦 APK Location: $APK_PATH"
    echo ""
    echo "To install on your device:"
    echo "  adb install $APK_PATH"
    echo ""
    echo "Or copy the APK to your device and install it manually."
else
    echo "❌ APK not found. Build may have failed."
    exit 1
fi

