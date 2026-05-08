import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@blood_sugar_data';
const PIN_KEY = '@app_pin';
const HINT_KEY = '@app_pin_hint';
const TARGETS_KEY = '@app_targets';

export const savePinHint = async (hint) => {
    try {
        if (hint === null) {
            await AsyncStorage.removeItem(HINT_KEY);
        } else {
            await AsyncStorage.setItem(HINT_KEY, hint);
        }
    } catch (e) {
        console.error('Error saving pin hint', e);
    }
};

export const getPinHint = async () => {
    try {
        return await AsyncStorage.getItem(HINT_KEY);
    } catch (e) {
        console.error('Error getting pin hint', e);
        return null;
    }
};

export const saveTargets = async (targets) => {
    try {
        await AsyncStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
    } catch (e) {
        console.error('Error saving targets', e);
    }
};

export const getTargets = async () => {
    try {
        const value = await AsyncStorage.getItem(TARGETS_KEY);
        return value != null ? JSON.parse(value) : { min: 70, max: 180 };
    } catch (e) {
        console.error('Error getting targets', e);
        return { min: 70, max: 180 };
    }
};

export const savePin = async (pin) => {
    try {
        if (pin === null) {
            await AsyncStorage.removeItem(PIN_KEY);
        } else {
            await AsyncStorage.setItem(PIN_KEY, pin);
        }
    } catch (e) {
        console.error('Error saving pin', e);
    }
};

export const getPin = async () => {
    try {
        return await AsyncStorage.getItem(PIN_KEY);
    } catch (e) {
        console.error('Error getting pin', e);
        return null;
    }
};

export const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    // Return sorted by date (newest first), though we usually prepend new entries
    const data = jsonValue != null ? JSON.parse(jsonValue) : [];
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (e) {
    console.error('Failed to fetch data from storage', e);
    return [];
  }
};

export const addEntry = async (sugarLevel, date, notes, mealTime = 'Na czczo', mealContent = '', activityLevel = 'Medium') => {
  try {
    const currentData = await getData();
    const newEntry = {
      id: Date.now().toString(),
      sugarLevel: parseFloat(sugarLevel.replace(',', '.')),
      date: date, // expecting ISO string or sortable format
      notes: notes || '',
      mealTime: mealTime,
      mealContent: mealContent || '', // Added for Contextual IQ
      activityLevel: activityLevel || 'Medium', // Added for Contextual IQ
    };
    
    const newData = [newEntry, ...currentData];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return newEntry;
  } catch (e) {
    console.error('Failed to save data to storage', e);
    throw e;
  }
};

export const deleteEntry = async (id) => {
    try {
        const currentData = await getData();
        const newData = currentData.filter(entry => entry.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch(e) {
        console.error('Failed to delete entry', e);
    }
};

export const clearData = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch(e) {
        console.error('Failed to clear data', e);
    }
};

export const replaceData = async (newDataArray) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDataArray));
    } catch (e) {
        console.error('Failed to replace data', e);
        throw e;
    }
};

export const savePatientData = async (patientData) => {
    try {
        await AsyncStorage.setItem('@patient_data', JSON.stringify(patientData));
    } catch (e) {
        console.error('Error saving patient data', e);
    }
};

export const getPatientData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@patient_data');
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error reading patient data', e);
        return null;
    }
};
