import { getData, addEntry, deleteEntry } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('Storage Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getData powinno zwrócić pustą tablicę, gdy brak danych', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const data = await getData();
    expect(data).toEqual([]);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@blood_sugar_data');
  });

  it('getData powinno zwrócić sparsowane dane', async () => {
    const mockData = [{ id: '1', sugarLevel: 100, mealTime: 'Na czczo' }];
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockData));
    const data = await getData();
    expect(data).toEqual(mockData);
  });

  it('addEntry powinno dodać nowy pomiar do istniejących danych', async () => {
    const existingData = [{ id: '1', sugarLevel: 100, mealTime: 'Na czczo' }];
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingData));
    
    await addEntry('120', '2026-05-05T10:00:00.000Z', 'Test', 'Przed posiłkiem');

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const setItemArgs = AsyncStorage.setItem.mock.calls[0];
    expect(setItemArgs[0]).toBe('@blood_sugar_data');
    
    const savedData = JSON.parse(setItemArgs[1]);
    expect(savedData.length).toBe(2);
    expect(savedData[0].sugarLevel).toBe(120);
    expect(savedData[0].mealTime).toBe('Przed posiłkiem');
    expect(savedData[0].notes).toBe('Test');
  });

  it('deleteEntry powinno usunąć element o podanym ID', async () => {
    const mockData = [
      { id: '1', sugarLevel: 100 },
      { id: '2', sugarLevel: 120 }
    ];
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockData));

    await deleteEntry('1');

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const savedData = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
    expect(savedData.length).toBe(1);
    expect(savedData[0].id).toBe('2');
  });

  it('replaceData powinno nadpisać całą bazę nowymi danymi (Backup)', async () => {
    const backupData = [{ id: '99', sugarLevel: 200, mealTime: 'Przed snem' }];
    
    await storage.replaceData(backupData);

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@blood_sugar_data', JSON.stringify(backupData));
  });
});
