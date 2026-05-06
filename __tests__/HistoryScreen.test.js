import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import HistoryScreen from '../screens/HistoryScreen';
import * as storage from '../utils/storage';
import * as Sharing from 'expo-sharing';

jest.mock('../utils/storage', () => ({
  getData: jest.fn(),
  deleteEntry: jest.fn()
}));

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
  };
});

describe('HistoryScreen', () => {
  const mockData = [
    { id: '1', date: '2026-05-05T08:00:00.000Z', sugarLevel: 95, mealTime: 'Na czczo', notes: 'Dobre spanie' },
    { id: '2', date: '2026-05-05T14:00:00.000Z', sugarLevel: 130, mealTime: '2h po posiłku', notes: '' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    storage.getData.mockResolvedValue(mockData);
    jest.spyOn(Alert, 'alert').mockImplementation((title, msg, buttons) => {
      // Automatycznie potwierdzamy usunięcie jeśli są przyciski
      if (buttons && buttons[1] && buttons[1].text === 'Usuń') {
        buttons[1].onPress();
      }
    });
  });

  it('renderuje poprawnie pusty stan', async () => {
    storage.getData.mockResolvedValueOnce([]);
    const { getByText } = render(<HistoryScreen />);
    
    await waitFor(() => {
      expect(getByText('Brak wpisów')).toBeTruthy();
      expect(getByText(/Twoja historia pomiarów jest jeszcze pusta/)).toBeTruthy();
    });
  });

  it('renderuje listę pomiarów', async () => {
    const { getByText, getAllByText } = render(<HistoryScreen />);
    
    await waitFor(() => {
      expect(getByText('95')).toBeTruthy();
      expect(getByText('130')).toBeTruthy();
      expect(getByText('Dobre spanie')).toBeTruthy();
      expect(getAllByText('mg/dL').length).toBe(2);
    });
  });

  it('wywołuje funkcję eksportu CSV', async () => {
    const { getByText } = render(<HistoryScreen />);
    
    await waitFor(() => getByText('Eksportuj CSV'));
    
    fireEvent.press(getByText('Eksportuj CSV'));
    
    await waitFor(() => {
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

});
