#!/usr/bin/env node
/**
 * Fix react-native-svg build.gradle to handle missing libs.versions.toml file
 * This script runs after npm install to patch the build file
 */

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-svg',
  'android',
  'build.gradle'
);

if (!fs.existsSync(buildGradlePath)) {
  console.log('⚠️  react-native-svg build.gradle not found, skipping fix');
  // Don't fail the build if the file doesn't exist
  process.exit(0);
}

let content = fs.readFileSync(buildGradlePath, 'utf8');

// Check if fix is already applied
if (content.includes('libsVersionsFile.exists()')) {
  console.log('✅ react-native-svg fix already applied');
  process.exit(0);
}

// Apply the fix - handle different versions of react-native-svg
let fixed = false;

// Pattern 1: Version with getFrescoVersion function (older versions)
const pattern1 = /file\("\$reactNativeRootDir\/gradle\/libs\.versions\.toml"\)\.withInputStream \{ stream ->/;
if (pattern1.test(content)) {
  content = content.replace(pattern1, `def libsVersionsFile = file("$reactNativeRootDir/gradle/libs.versions.toml")
    if (libsVersionsFile.exists()) {
        libsVersionsFile.withInputStream { stream ->`);
  
  // Add closing brace for the if statement
  const closingPattern = /(\s+stream\.eachLine \{[\s\S]*?\n\s+\})\s*\n\s*\}\s*\n\s*if \(!frescoVersion\)/;
  if (closingPattern.test(content)) {
    content = content.replace(closingPattern, '$1\n    }\n    if (!frescoVersion)');
  }
  fixed = true;
}

// Pattern 2: Direct file access without function (some versions)
const pattern2 = /file\("\$reactNativeRootDir\/gradle\/libs\.versions\.toml"\)/;
if (pattern2.test(content) && !content.includes('libsVersionsFile.exists()')) {
  content = content.replace(
    /file\("\$reactNativeRootDir\/gradle\/libs\.versions\.toml"\)/g,
    '(file("$reactNativeRootDir/gradle/libs.versions.toml").exists() ? file("$reactNativeRootDir/gradle/libs.versions.toml") : null)'
  );
  fixed = true;
}

if (fixed) {
  fs.writeFileSync(buildGradlePath, content, 'utf8');
  console.log('✅ Fixed react-native-svg build.gradle');
} else if (content.includes('libsVersionsFile.exists()')) {
  console.log('✅ react-native-svg fix already applied');
} else {
  console.log('⚠️  Could not find pattern to fix in react-native-svg build.gradle');
  console.log('⚠️  The file may not need fixing or uses a different structure');
  // Don't exit with error, just warn - some versions may not need this fix
}

