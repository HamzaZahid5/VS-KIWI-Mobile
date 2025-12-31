# Stripe Payment Setup Guide

## Quick Setup

To use the same Stripe keys as your web app, follow these steps:

### Step 1: Get Your Stripe Public Key

1. Open your web app's `.env` file (in the root directory)
2. Find the `VITE_STRIPE_PUBLIC_KEY` value
3. Copy that value

### Step 2: Set Up Mobile App Environment

1. Create a `.env` file in the `Kiwi` directory (if it doesn't exist)
2. Add the following line with your Stripe public key:

```env
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...your_key_here
```

**Important:** Use the EXACT same value as `VITE_STRIPE_PUBLIC_KEY` from your web app's `.env` file.

### Step 3: Rebuild the App

Since we added native modules, you need to rebuild:

```bash
# For iOS
npx expo run:ios

# For Android  
npx expo run:android
```

Or use EAS Build for production builds.

## Example

If your web app's `.env` has:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_51AbC123...
```

Then your mobile app's `.env` should have:
```env
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51AbC123...
```

**Note:** The value is exactly the same, just the variable name changes from `VITE_STRIPE_PUBLIC_KEY` to `EXPO_PUBLIC_STRIPE_PUBLIC_KEY`.

## Verification

After setting up, you can verify the key is loaded by checking the console logs when the payment screen loads. You should see:
- "StripeCheckout - Stripe Public Key: Set"
- The key type (TEST or LIVE)

## Troubleshooting

If you see "Payment is not configured" error:
1. Make sure `.env` file exists in the `Kiwi` directory
2. Make sure the variable name is exactly `EXPO_PUBLIC_STRIPE_PUBLIC_KEY`
3. Make sure you've rebuilt the app after adding the environment variable
4. Restart the Expo development server

