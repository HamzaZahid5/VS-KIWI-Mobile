# Building Release APK for Testing

This guide explains how to create a release APK file that you can share with testers.

## 🚀 Method 1: EAS Build (Recommended - Cloud Build)

EAS Build is the easiest way to create a release APK. It builds your app in the cloud, so you don't need Android Studio or local build tools.

### Prerequisites
1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure EAS (if not already done):
```bash
cd Kiwi
eas build:configure
```

### Build APK for Testing

1. **Build Preview APK** (for internal testing):
```bash
cd Kiwi
eas build --platform android --profile preview
```

This will:
- Build an APK file (not App Bundle)
- Upload it to EAS servers
- Give you a download link
- Take about 15-20 minutes

2. **Download the APK**:
   - After build completes, you'll get a URL
   - Download the APK file
   - Share it with testers

### Build Production APK (if needed)

If you need a production build:
```bash
eas build --platform android --profile production
```

**Note**: Production profile builds an App Bundle (AAB) by default. To get APK from production, you can modify `eas.json` temporarily.

---

## 🔨 Method 2: Local Build (Build on Your Machine)

If you prefer to build locally or don't want to use EAS:

### Prerequisites
- Android Studio installed
- Android SDK configured
- Java JDK installed
- Environment variables set (ANDROID_HOME, JAVA_HOME)

### Build Steps

1. **Navigate to project**:
```bash
cd Kiwi
```

2. **Install dependencies**:
```bash
npm install
```

3. **Generate native Android project** (if needed):
```bash
npx expo prebuild --platform android
```

4. **Build APK using the script**:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

Or manually:
```bash
cd android
./gradlew clean
./gradlew :app:assembleRelease
```

5. **Find your APK**:
   - Location: `android/app/build/outputs/apk/release/app-release.apk`
   - The script will show you the exact path

---

## 📦 Sharing the APK

### Option 1: Direct File Share
- Upload APK to Google Drive, Dropbox, or similar
- Share download link with testers
- Testers download and install on their Android devices

### Option 2: Internal Testing (Google Play)
1. Create a Google Play Console account
2. Upload APK to Internal Testing track
3. Add testers' email addresses
4. Testers get download link from Play Store

### Option 3: Firebase App Distribution
1. Set up Firebase App Distribution
2. Upload APK to Firebase
3. Invite testers via email
4. They get download link

---

## ⚙️ Configuration for Testing

### Update Version (Important!)

Before building, update the version in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",  // Update this (e.g., "1.0.1")
    ...
  }
}
```

### Environment Variables

Make sure your `.env` file has the correct keys:
- `EXPO_PUBLIC_STRIPE_PUBLIC_KEY` - Your Stripe key
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - Your Google Maps key

These are bundled into the APK during build.

---

## 🔍 Testing Checklist

Before sharing the APK:

- [ ] Test login/logout flow
- [ ] Test booking creation
- [ ] Test payment flow (if applicable)
- [ ] Test navigation between screens
- [ ] Verify API connection works
- [ ] Check that all images/assets load
- [ ] Test on different Android versions if possible

---

## 📱 Installing the APK

Testers need to:

1. **Enable "Install from Unknown Sources"**:
   - Go to Settings → Security
   - Enable "Install unknown apps" or "Unknown sources"

2. **Download and Install**:
   - Download the APK file
   - Open the downloaded file
   - Tap "Install"
   - Wait for installation to complete

3. **Open the App**:
   - Find "Kiwi" in app drawer
   - Launch and test

---

## 🐛 Troubleshooting

### Build Fails
- Check that all dependencies are installed: `npm install`
- Verify Android SDK is properly configured
- Check `BUILD_CONFIGURATION.md` for known issues

### APK Won't Install
- Make sure "Unknown sources" is enabled
- Check Android version compatibility (minSdkVersion 24)
- Try uninstalling any previous version first

### App Crashes on Launch
- Check console logs: `adb logcat`
- Verify environment variables are set correctly
- Make sure API endpoints are accessible

---

## 📝 Quick Reference

**EAS Build (Easiest)**:
```bash
eas build --platform android --profile preview
```

**Local Build**:
```bash
./build-apk.sh
```

**APK Location (Local)**:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 💡 Tips

1. **Version Management**: Always increment version number before building
2. **Testing**: Test on a real device before sharing
3. **Size**: APK size is usually 20-50MB depending on assets
4. **Updates**: Each new build needs a new version number
5. **Distribution**: Use a service like Firebase App Distribution for easier management

---

For more details, see `BUILD_CONFIGURATION.md`

