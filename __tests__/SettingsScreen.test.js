import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SettingsScreen from '../screens/SettingsScreen';
import * as storage from '../utils/storage';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

jest.mock('../utils/storage', () => ({
  getData: jest.fn(),
  replaceData: jest.fn()
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn()
}));

describe('SettingsScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation((title, msg, buttons) => {
      // Automatycznie potwierdzamy jeśli to dialog przywracania
      if (buttons && buttons[1] && buttons[1].text === 'Przywróć') {
        buttons[1].onPress();
      }
    });
  });

  it('renderuje ekran ustawień poprawnie', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Konfiguracja')).toBeTruthy();
    expect(getByText('Profil Pacjenta')).toBeTruthy();
    expect(getByText('Utwórz kopię (Eksport)')).toBeTruthy();
    expect(getByText('Przywróć kopię (Import)')).toBeTruthy();
  });

  it('obsługuje błąd przy próbie eksportu bez danych', async () => {
    storage.getData.mockResolvedValueOnce([]);
    const { getByText } = render(<SettingsScreen />);
    
    fireEvent.press(getByText('Utwórz kopię (Eksport)'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Brak danych', expect.any(String));
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });
  });

  it('wykonuje eksport do pliku, gdy dane istnieją', async () => {
    storage.getData.mockResolvedValueOnce([{ id: '1', sugarLevel: 100 }]);
    const { getByText } = render(<SettingsScreen />);
    
    fireEvent.press(getByText('Utwórz kopię (Eksport)'));
    
    await waitFor(() => {
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

  it('anuluje import gdy użytkownik anuluje wybieracz plików', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValueOnce({ canceled: true });
    const { getByText } = render(<SettingsScreen />);
    
    fireEvent.press(getByText('Przywróć kopię (Import)'));
    
    await waitFor(() => {
      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled();
      expect(storage.replaceData).not.toHaveBeenCalled();
    });
  });

  it('przywraca dane gdy użytkownik wgra poprawny plik', async () => {
    const validJson = '[{"id":"2","sugarLevel":150}]';
    DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file://test.json' }]
    });
    FileSystem.readAsStringAsync.mockResolvedValueOnce(validJson);
    
    const { getByText } = render(<SettingsScreen />);
    
    fireEvent.press(getByText('Przywróć kopię (Import)'));
    
    await waitFor(() => {
      expect(storage.replaceData).toHaveBeenCalledTimes(1);
      expect(storage.replaceData).toHaveBeenCalledWith(JSON.parse(validJson));
    });
  });
});
