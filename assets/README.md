# Assets Folder

This folder should contain the following assets for your app:

## Required Assets (Optional for development)

- `icon.png` - App icon (1024x1024px recommended)
- `splash.png` - Splash screen image (1242x2436px recommended)
- `adaptive-icon.png` - Android adaptive icon (1024x1024px)
- `favicon.png` - Web favicon (48x48px)

## Adding Assets

1. Create or add your assets to this folder
2. Update `app.json` to reference them:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      }
    }
  }
}
```

## Note

The app will work without these assets during development. They are only required when building for production.

