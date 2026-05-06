# Changelog - GLYSE App

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
