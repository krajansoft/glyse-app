import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddEntryScreen from '../screens/AddEntryScreen';
import * as storage from '../utils/storage';

jest.mock('../utils/storage', () => ({
  addEntry: jest.fn()
}));

describe('AddEntryScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderuje podstawowe elementy ekranu', () => {
    const { getByText, getByPlaceholderText } = render(<AddEntryScreen />);
    expect(getByText('Nowy pomiar')).toBeTruthy();
    expect(getByPlaceholderText('np. 105')).toBeTruthy();
    expect(getByText('Zapisz Wynik')).toBeTruthy();
  });

  it('pokazuje błąd gdy pole cukru jest puste', async () => {
    const { getByText } = render(<AddEntryScreen />);
    
    fireEvent.press(getByText('Zapisz Wynik'));
    
    expect(storage.addEntry).not.toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('prawidłowy wynik'));
  });

  it('wywołuje funkcję zapisu po wpisaniu poprawnych danych', async () => {
    const { getByText, getByPlaceholderText } = render(<AddEntryScreen />);
    
    const input = getByPlaceholderText('np. 105');
    fireEvent.changeText(input, '115');

    fireEvent.press(getByText('Przed snem'));
    fireEvent.press(getByText('Zapisz Wynik'));

    await waitFor(() => {
      expect(storage.addEntry).toHaveBeenCalledTimes(1);
      expect(storage.addEntry).toHaveBeenCalledWith('115', expect.any(String), '', 'Przed snem');
    });
  });

  it('zamyka klawiaturę po kliknięciu w tło na urządzeniu mobilnym', () => {
    const { Keyboard } = require('react-native');
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss');
    
    const { getByTestId } = render(<AddEntryScreen />);
    
    // Test domyślnie leci w środowisku 'ios' więc użyje mobile-wrapper
    const wrapper = getByTestId('mobile-wrapper');
    fireEvent.press(wrapper);
    
    expect(dismissSpy).toHaveBeenCalled();
  });
});
