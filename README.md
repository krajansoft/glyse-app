# GLYSE - Premium Blood Sugar Tracker

GLYSE to nowoczesna, profesjonalna aplikacja do monitorowania glikemii, zaprojektowana z myślą o użytkownikach ceniących estetykę, bezpieczeństwo i precyzję medyczną.

## 🚀 Główne Funkcje
- **Clinical Dashboard**: Wizualizacja TIR (Time in Range) i szacowane HbA1c.
- **Contextual IQ**: Logowanie posiłków i aktywności fizycznej w kontekście pomiarów.
- **Raporty PDF**: Profesjonalna dokumentacja medyczna gotowa do udostępnienia lekarzowi.
- **Security First**: Zabezpieczenie kodem PIN i pełna prywatność danych (local-only storage).
- **Dynamic Theme Engine**: Automatyczny tryb nocny i motywy premium.

## 📁 Dokumentacja
- [Dokumentacja Funkcjonalna](file:///c:/Users/adamk/.gemini/antigravity/scratch/blood-sugar-app/FUNCTIONAL_DOCUMENTATION.md) - Pełny opis funkcji i logiki aplikacji.
- [Specyfikacja Assetów](file:///c:/Users/adamk/.gemini/antigravity/scratch/blood-sugar-app/GLYSE.md) - Wytyczne dotyczące brandingu i ikon Android.
- [Changelog](file:///c:/Users/adamk/.gemini/antigravity/scratch/blood-sugar-app/CHANGELOG.md) - Historia zmian i wersji.

## 🛠️ Rozwój (Development)

1. **Instalacja zależności**:
   ```bash
   npm install
   ```

2. **Uruchomienie lokalne**:
   ```bash
   npx expo start
   ```

3. **Build APK (Android)**:
   ```bash
   eas build -p android --profile preview
   ```

## 🏗️ Technologia
Aplikacja zbudowana w oparciu o **React Native** oraz **Expo SDK**. Wykorzystuje lokalną bazę danych `AsyncStorage` dla maksymalnej prywatności użytkownika.

---
© 2026 Krajansoft / GLYSE Team
