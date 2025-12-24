# Quick Start Guide

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

## Project Overview

### Key Files
- `App.js` - Main entry point with Redux Provider
- `src/navigation/AppNavigator.js` - Navigation configuration
- `src/redux/store.js` - Redux store setup
- `src/theme.js` - Theme configuration

### Navigation Flow
- **Home** → Booking, Profile, Settings
- **Booking** → Add/Delete bookings
- **Profile** → View account info
- **Settings** → App preferences

### Redux State
- Booking data is persisted automatically
- Use `useSelector` to read state
- Use `useDispatch` to dispatch actions

## Next Steps

1. Add your API endpoints in `src/utils/constants.js`
2. Customize theme colors in `src/theme.js`
3. Add more screens in `src/screens/`
4. Create reusable components in `src/components/`
5. Add images/icons to `src/assets/`

## Troubleshooting

- If you see "Unable to resolve module" errors, run `npm install` again
- Clear cache: `expo start -c`
- Reset Metro bundler: `npm start -- --reset-cache`

