import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../screens/DashboardScreen';
import * as storage from '../utils/storage';

jest.mock('../utils/storage', () => ({
  getData: jest.fn()
}));

// Zamiast renderować skomplikowany wykres wektory/svg, który rzuca błędami w wierszu poleceń, renderujemy prosty view
jest.mock('react-native-chart-kit', () => ({
  LineChart: () => {
    const { View, Text } = require('react-native');
    return <View><Text>Mockowany Wykres</Text></View>;
  }
}));

describe('DashboardScreen', () => {
  const mockData = [
    { id: '1', date: '2026-05-05T08:00:00.000Z', sugarLevel: 100, mealTime: 'Na czczo' },      // TIR
    { id: '2', date: '2026-05-05T14:00:00.000Z', sugarLevel: 150, mealTime: '2h po posiłku' }, // TIR
    { id: '3', date: '2026-05-06T08:00:00.000Z', sugarLevel: 110, mealTime: 'Na czczo' },      // TIR
    { id: '4', date: '2026-05-06T12:00:00.000Z', sugarLevel: 60, mealTime: 'Przed posiłkiem' }, // TBR (Hipo)
    { id: '5', date: '2026-05-06T20:00:00.000Z', sugarLevel: 200, mealTime: 'Przed snem' }      // TAR (Hiper)
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    storage.getData.mockResolvedValue(mockData);
  });

  it('renderuje HbA1c i statystyki TIR ze wszystkich danych', async () => {
    const { getByText } = render(<DashboardScreen />);
    
    // Średnia: (100+150+110+60+200)/5 = 124.0
    // HbA1c: (124 + 46.7) / 28.7 = 5.9
    // TIR: 3 z 5 = 60%
    // Hipo: 1 z 5 = 20%
    // Hiper: 1 z 5 = 20%
    
    await waitFor(() => {
      expect(getByText('5.9')).toBeTruthy(); // Szacowane HbA1c
      expect(getByText('60%')).toBeTruthy(); // TIR
      expect(getByText('20%')).toBeTruthy(); // TBR i TAR mają tyle samo
    });
  });

  it('przelicza statystyki medyczne po kliknięciu na filtr', async () => {
    const { getByText } = render(<DashboardScreen />);
    
    await waitFor(() => getByText('5.9'));
    
    // Klikamy filtr "Na czczo" (2 wyniki: 100 i 110)
    // Średnia: 105.0
    // HbA1c: (105 + 46.7) / 28.7 = 5.3
    // TIR: 2 z 2 = 100%
    // Hipo: 0%
    fireEvent.press(getByText('Na czczo'));
    
    await waitFor(() => {
      expect(getByText('5.3')).toBeTruthy();
      expect(getByText('100%')).toBeTruthy();
      expect(getByText('0%')).toBeTruthy();
    });
  });

  it('wyświetla komunikat o braku danych gdy kategoria jest pusta', async () => {
    const { getByText } = render(<DashboardScreen />);
    
    await waitFor(() => getByText('5.9'));
    
    // Klikamy filtr dla którego nie ma danych w mocku (np. 2h po posiłku - oh wait, jest. 
    // Dodajmy filtr który nie ma danych). W mocku nie ma np. "Przed snem" (oops, jest).
    // W filtrach mamy: 'Wszystkie', 'Na czczo', 'Przed posiłkiem', '2h po posiłku', 'Przed snem'.
    // Wszystkie są zajęte w nowym mockData.
    
    // Sprawdźmy filtr, który usuniemy z mocka lub wymyślmy inny sposób.
    // Zmieniam mockData dla tego testu:
    storage.getData.mockResolvedValueOnce([]);
    
    const { getByText: getByTextEmpty } = render(<DashboardScreen />);
    
    await waitFor(() => {
      expect(getByTextEmpty(/Brak danych/i)).toBeTruthy();
    });
  });
});
