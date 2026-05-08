# Dokumentacja Funkcjonalna Systemu GLYSE

## 1. Przegląd Systemu
GLYSE to zaawansowana aplikacja mobilna (Android/iOS/Web) przeznaczona dla osób z cukrzycą do monitorowania poziomu glukozy we krwi. Aplikacja kładzie nacisk na estetykę "Premium", bezpieczeństwo danych klinicznych oraz głęboką analizę kontekstową pomiarów (Contextual IQ).

## 2. Moduły Funkcjonalne

### 2.1. Bezpieczeństwo i Dostęp (Security)
- **Logowanie kodem PIN**: Zabezpieczenie dostępu do danych medycznych.
- **System Podpowiedzi (PIN Hint)**: Mechanizm odzyskiwania dostępu po 3 nieudanych próbach logowania.
- **Wylogowanie**: Możliwość ręcznego zakończenia sesji w celu ochrony prywatności.

### 2.2. Panel Główny (Dashboard)
- **Szacowane HbA1c**: Automatyczne wyliczanie hemoglobiny glikowanej na podstawie średniej z pomiarów.
- **Time in Range (TIR)**: Analiza procentowa czasu, jaki użytkownik spędza w docelowym zakresie glikemii (W normie, Wysokie, Niskie).
- **Interaktywne Wykresy**: Wizualizacja trendów glikemii za pomocą wykresów liniowych i kołowych (TIR).
- **Filtrowanie Danych**: Możliwość szybkiego przełączania widoku statystyk (np. tylko pomiary "Na czczo" lub "Przed snem").

### 2.3. Dodawanie Pomiarów (Contextual IQ)
- **Szybki wpis**: Intuicyjny interfejs do wprowadzania poziomu cukru (mg/dL).
- **Sugerowana pora**: Inteligentne podpowiadanie pory pomiaru na podstawie aktualnej godziny.
- **Analiza Kontekstowa (Optional)**:
    - **Meal Content**: Rejestrowanie składu posiłku (np. ilość węglowodanów, rodzaj jedzenia).
    - **Activity Level**: Określanie intensywności wysiłku fizycznego (Niska, Średnia, Wysoka).
    - **Notatki**: Dodatkowe uwagi dotyczące samopoczucia lub stresu.

### 2.4. Historia i Zarządzanie Danymi
- **Dzienniczek Pomiarów**: Czytelna lista wszystkich wpisów z podziałem na daty.
- **Odznaki Statusu**: Wizualne wyróżnienie wyników (Hipo/Hiper) za pomocą kolorów i etykiet.
- **Zarządzanie wpisami**: Możliwość usuwania błędnych pomiarów i przeglądania szczegółów Contextual IQ.

### 2.5. Raportowanie Kliniczne (PDF)
- **Generowanie dokumentacji PDF**: Tworzenie profesjonalnych raportów medycznych gotowych do wysłania lekarzowi.
- **Okresy raportowania**: Możliwość generowania raportów z ostatnich 30, 120 dni lub pełnej historii.
- **Struktura raportu**: Zawiera dane pacjenta, statystyki HbA1c/TIR oraz pełną tabelę pomiarów z kontekstem posiłków.
- **Natywne Udostępnianie**: Bezpośrednie przesyłanie pliku przez e-mail, WhatsApp lub systemowe okno udostępniania Android/iOS.

### 2.6. Ustawienia i Personalizacja
- **Motywy (Theme Engine)**:
    - **Jasny**: Wysoki kontrast, czysta biel.
    - **Ciemny (Clinical Dark)**: Głęboki granat i antracyt dla oszczędności wzroku w nocy.
    - **Automatyczny**: Przełączanie motywu na podstawie godziny (Tryb nocny po 22:00).
- **Cele Glikemiczne**: Definiowanie własnych zakresów normy (Min/Max), które wpływają na statystyki TIR.
- **Dane Pacjenta**: Możliwość personalizacji nagłówków raportów (Imię, Nazwisko, Rok urodzenia).

## 3. Architektura Techniczna
- **Framework**: React Native (Expo SDK).
- **Storage**: AsyncStorage (szyfrowanie lokalne na poziomie urządzenia).
- **Navigation**: React Navigation (Bottom Tab Navigator).
- **UI System**: Autorski system komponentów oparty na Vanilla CSS-in-JS.
- **PDF Engine**: Expo Print & Sharing.

## 4. Design System (Branding)
- **Logo**: Modernistyczny sygnet "g" z wkomponowaną linią trendu.
- **Paleta barw**:
    - `Deep Navy (#003355)` - Autorytet i bezpieczeństwo.
    - `Electric Blue (#005A9C)` - Akcja i technologia.
    - `Mint Green (#34D399)` - Zdrowie i harmonia.
    - `Coral Red (#FF4B4B)` - Ostrzeżenia (Hipoglikemia).

---
*Dokumentacja aktualna dla wersji 0.5.0 (Maj 2026)*
