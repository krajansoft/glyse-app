# Changelog - GLYSE App

## [0.5.0] - 2026-05-08
### Added
- **EAS Build Configuration**: Added `eas.json` for professional Android APK builds.
- **Native Sharing**: Integrated `expo-sharing` for direct PDF distribution on Android/iOS.
- **Safe Area Integration**: Proper handling of system navigation bars and status bars across all devices.

### Fixed
- **Android Stability**: Resolved issues with data persistence between sessions on physical devices.
- **PDF Layout**: Fixed layout issues when generating reports with large datasets.

## [0.4.0] - 2026-05-06
### Added
- **Dynamic Theme Engine**: Global theme system with support for Light, Dark, and Auto modes.
- **Auto-Night Mode**: Automated theme switching (Dark after 22:00, Light after 06:00) to improve night-time usability.
- **Theme Override**: Manual toggle button in the Dashboard header for quick theme switching.
- **Theme Persistence**: Automatic saving and restoring of user theme preferences.

### Changed
- **Themed Screens**: All application screens (Add Entry, History, Reports, Settings, Login) updated with responsive theme variables.
- **Dark Mode Aesthetics**: Premium dark palette using deep navy and slate for clinical precision.

## [0.3.0] - 2026-05-06
### Added
- **Professional Clinical Reports**: Upgraded PDF generation engine with professional medical styling.
- **Reporting Insights**: PDF reports now include "Contextual IQ" (Meal Content and Activity levels).
- **Clinical Layout**: Added sections for Patient ID, Doctor's Notes, and enhanced data grid.

### Changed
- **Premium Branding in PDF**: Integrated the new premium logo into the clinical documents.
- **Preview Modal**: Enhanced the reports preview screen to match the new clinical data structure.

## [0.2.0] - 2026-05-06
### Added
- **Contextual IQ**: New optional section in `AddEntryScreen` to record meal content and activity levels.
- **PIN Hint System**: "Forgot PIN?" button in `LoginScreen` that appears after failed attempts.
- **Activity Badges**: Visual indicators for activity levels in `HistoryScreen`.
- **Meal Insights**: Display of meal content in history items.

### Changed
- **Premium Branding**: Upgraded `GlyseLogo` with modern SVG geometry and triple-gradient effects.
- **Storage Schema**: Updated `addEntry` in `storage.js` to support new contextual data fields.
- **History UI**: Improved layout of history items to accommodate contextual information.

### Fixed
- **Authentication UX**: More intuitive flow for users who forget their PIN.

## [0.1.0] - 2026-05-06
### Added
- Initial project structure for GLYSE (React Native/Expo).
- Core screens: Dashboard, Add Entry, History, Login, Reports, Settings.
- Medical utility calculations for HbA1c and TIR.
- Local storage using AsyncStorage.
