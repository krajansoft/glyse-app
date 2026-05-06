# **GLYSE \- Dokumentacja Techniczna Assetów Android**

Niniejszy dokument zawiera kompletną specyfikację techniczną niezbędną do wdrożenia brandingu aplikacji GLYSE w środowisku Android Studio oraz w konsoli Google Play.

## **1\. Ikony Adaptacyjne (Adaptive Icons)**

Od wersji Androida 8.0 (API 26\) wymagane jest stosowanie ikon adaptacyjnych składających się z dwóch oddzielnych warstw. Zapewnia to spójny wygląd ikon na różnych urządzeniach (system sam decyduje czy będą to koła, kwadraty czy "squircles").

| Warstwa | Format | Wymiary | Opis / Wytyczne |
| :---- | :---- | :---- | :---- |
| Foreground (Zewnętrzna) | XML / przezroczysty PNG | 108x108 dp | Główne logo (sygnet "g" z linią wykresu). **Bezpieczna strefa (Safe Zone)**, która nigdy nie zostanie obcięta przez system, to centralne 66x66 dp. |
| Background (Tło) | XML / jednolity kolor | 108x108 dp | Tło ikony. Rekomendowane: czysta biel (\#FFFFFF) lub charakterystyczny dla marki Deep Blue (\#003355). |

## **2\. Kod Wektorowy (Vector Drawable) dla Android Studio**

Poniższy kod XML należy zapisać jako plik ic\_glyse\_logo.xml w folderze res/drawable/ w projekcie Android. Użycie wektorów zamiast PNG wewnątrz UI aplikacji zapobiega pikselizacji i zmniejsza wagę pliku APK.

\<vector xmlns:android="http://schemas.android.com/apk/res/android"  
    android:width="24dp"  
    android:height="24dp"  
    android:viewportWidth="24.0"  
    android:viewportHeight="24.0"\>  
    \<\!-- Sygnet i linia falista \--\>  
    \<path  
        android:fillColor="\#005A9C"  
        android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10c5.52,0 10,-4.48 10,-10S17.52,2 12,2zM12,18c-3.31,0 \-6,-2.69 \-6,-6s2.69,-6 6,-6 6,2.69 6,6 \-2.69,6 \-6,6z"/\>  
    \<\!-- Miętowa kropka statusu \--\>  
    \<path  
        android:fillColor="\#34D399"  
        android:pathData="M12,10.5c-0.83,0 \-1.5,0.67 \-1.5,1.5s0.67,1.5 1.5,1.5 1.5,-0.67 1.5,-1.5 \-0.67,-1.5 \-1.5,-1.5z"/\>  
\</vector\>

## **3\. Zestawienie Mipmap (Piksele Rastrowe)**

Pomimo wdrożenia ikon adaptacyjnych, konieczne jest zachowanie klasycznych formatów PNG w folderach mipmap jako tzw. fallback dla starszych urządzeń (API \< 26\) oraz do wyświetlania w niektórych ekranach ustawień systemowych.

| Katalog w systemie plików (res/) | Gęstość Ekranu (DPI) | Zalecane Wymiary w pikselach |
| :---- | :---- | :---- |
| mipmap-mdpi | Medium (\~160dpi) | 48 x 48 px |
| mipmap-hdpi | High (\~240dpi) | 72 x 72 px |
| mipmap-xhdpi | Extra-High (\~320dpi) | 96 x 96 px |
| mipmap-xxhdpi | Extra-Extra-High (\~480dpi) | 144 x 144 px |
| mipmap-xxxhdpi | Extra-Extra-Extra-High (\~640dpi) | 192 x 192 px |

## **4\. Wymagania Google Play Store**

Sklep Google Play wymaga osobnych materiałów graficznych, które są wykorzystywane w procesie pozycjonowania (ASO) oraz wyświetlania na karcie aplikacji. Nie należy wykorzystywać tu małych plików przeznaczonych do wnętrza aplikacji.

* **High-res Icon (Ikona główna):** Wymiary **512 x 512 pikseli**, format 32-bit PNG (z kanałem alpha). Ikona *nie powinna* mieć wygenerowanych zaokrąglonych rogów – należy dostarczyć kwadrat, na który Google automatycznie nałoży maskę. Maksymalny rozmiar pliku to 1024 KB.  
* **Feature Graphic (Grafika promocyjna):** Wymiary **1024 x 500 pikseli**, format JPEG lub 24-bit PNG. Jest to baner otwierający kartę aplikacji (szczególnie widoczny u użytkowników bez autoodtwarzania wideo). Powinien zawierać logotyp GLYSE, minimalistyczny zarys UI na telefonie oraz główne hasło wartości (np. "Twoja codzienna równowaga").

## **5\. Zdefiniowana Paleta Kolorów (Zastosowanie)**

Spójne wykorzystanie kolorów z logo do wnętrza aplikacji jest kluczowe dla wrażenia Premium.

* **Deep Navy:** \#003355 (Sugerowane zastosowanie: Górny pasek aplikacji / AppBar, główny tekst nagłówków).  
* **Electric Blue:** \#005A9C (Sugerowane zastosowanie: Przyciski akcji, przycisk Floating Action Button (FAB) do dodawania nowego pomiaru cukru).  
* **Mint Green:** \#34D399 (Sugerowane zastosowanie: Feedback sukcesu, podświetlanie wyników będących w normie, detale wykresów).  
* **Pure White:** \#FFFFFF (Tło głównych kart z pomiarami).