# Kiwi Rentals - React Native Expo App

A modern React Native application built with Expo for Kiwi Rentals, featuring booking management, user profiles, and a beautiful UI.

## 🚀 Features

- **Navigation**: React Navigation with Stack Navigator
- **State Management**: Redux Toolkit with redux-persist for local storage
- **Theming**: Consistent theme system matching Kiwi Rentals web app
- **Screens**: Home, Booking, Profile, and Settings screens
- **Utilities**: Helper functions for dates, validation, API calls, and storage

## 📁 Project Structure

```
Kiwi/
├── App.js                 # Main app entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── babel.config.js       # Babel configuration
├── src/
│   ├── assets/          # Images, icons, fonts
│   ├── components/       # Reusable UI components
│   ├── helpers/         # Helper functions
│   │   ├── dateHelper.js
│   │   └── validationHelper.js
│   ├── navigation/      # Navigation configuration
│   │   └── AppNavigator.js
│   ├── redux/           # Redux store and slices
│   │   ├── store.js
│   │   └── bookingSlice.js
│   ├── screens/         # Screen components
│   │   ├── HomeScreen.js
│   │   ├── BookingScreen.js
│   │   ├── ProfileScreen.js
│   │   └── SettingsScreen.js
│   ├── theme.js         # Theme configuration
│   └── utils/           # Utility functions
│       ├── api.js
│       ├── constants.js
│       └── storage.js
└── README.md
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Expo development server:**
   ```bash
   npm start
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

4. **Run on Android:**
   ```bash
   npm run android
   ```

## 📱 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

## 🎨 Theme

The app uses a consistent theme system defined in `src/theme.js` with:
- **Colors**: Primary orange (#FF6B35), secondary teal (#4ECDC4), and supporting colors
- **Typography**: Font sizes and weights for consistent text styling
- **Spacing**: Standard spacing values for layout
- **Shadows**: Predefined shadow styles for elevation

## 🔄 State Management

Redux Toolkit is configured with:
- **Store**: Centralized state management
- **Booking Slice**: Manages booking data with actions for add, update, delete
- **Redux Persist**: Automatically saves and restores state from AsyncStorage

## 🧭 Navigation

React Navigation Stack Navigator is set up with:
- Home Screen (initial route)
- Booking Screen
- Profile Screen
- Settings Screen

All screens are accessible via navigation props.

## 📚 Key Features

### Screens

1. **HomeScreen**: Welcome screen with quick stats and navigation cards
2. **BookingScreen**: View and manage bookings with add/delete functionality
3. **ProfileScreen**: User profile information and account details
4. **SettingsScreen**: App preferences and settings

### Helpers

- **dateHelper.js**: Date formatting, relative time, date calculations
- **validationHelper.js**: Email, phone, and form validation functions

### Utils

- **api.js**: HTTP request functions (GET, POST, PUT, DELETE)
- **constants.js**: App-wide constants and configuration
- **storage.js**: AsyncStorage wrapper functions

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```
EXPO_PUBLIC_API_URL=https://api.kiwi-rentals.com
```

### Redux Persist

The Redux store is configured to persist booking data to AsyncStorage. The persisted state is automatically rehydrated when the app starts.

## 📦 Dependencies

### Core
- `expo`: Expo SDK
- `react`: React library
- `react-native`: React Native framework

### Navigation
- `@react-navigation/native`: Core navigation library
- `@react-navigation/stack`: Stack navigator
- `react-native-screens`: Native screen components
- `react-native-safe-area-context`: Safe area handling
- `react-native-gesture-handler`: Gesture handling
- `react-native-reanimated`: Animations

### State Management
- `@reduxjs/toolkit`: Redux Toolkit
- `react-redux`: React bindings for Redux
- `redux-persist`: State persistence
- `@react-native-async-storage/async-storage`: Local storage

## 🚧 Development

### Adding New Screens

1. Create a new screen component in `src/screens/`
2. Import and add it to `src/navigation/AppNavigator.js`
3. Add navigation from other screens as needed

### Adding New Redux Slices

1. Create a new slice file in `src/redux/`
2. Import and add the reducer to `src/redux/store.js`
3. Use the slice in your components with `useSelector` and `useDispatch`

### Styling

Use the theme from `src/theme.js` for consistent styling:

```javascript
import { colors, fontSizes, spacing } from '../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSizes.h1,
    color: colors.textDark,
  },
});
```

## 📝 Notes

- The app is configured to work on both iOS and Android
- Redux state persists across app restarts
- All screens use functional components with React hooks
- Code is modular and well-commented for maintainability

## 🤝 Contributing

This is a starter template. Feel free to extend it with additional features and improvements.

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using React Native and Expo

