import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { getData, replaceData, savePatientData, getPatientData, getTargets, saveTargets, getPinHint, savePinHint, savePin } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ onLogout }) {
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState({ firstName: '', lastName: '', birthYear: '' });
  const [targets, setTargets] = useState({ min: '70', max: '180' });
  const [pinHint, setPinHint] = useState('');
  const { theme, isDark } = useTheme();

  React.useEffect(() => {
    const loadSettings = async () => {
        const pData = await getPatientData();
        if (pData) setPatientData(pData);
        
        const tData = await getTargets();
        if (tData) setTargets({ min: tData.min.toString(), max: tData.max.toString() });

        const hData = await getPinHint();
        if (hData) setPinHint(hData);
    };
    loadSettings();
  }, []);

  const handleResetPin = async () => {
    if (Platform.OS === 'web') {
        if (window.confirm('Czy na pewno chcesz usunąć kod PIN? Aplikacja zostanie zablokowana i poprosi o nowy kod.')) {
            await savePin(null);
            await savePinHint(null);
            onLogout();
        }
    } else {
        Alert.alert('Reset PIN', 'Czy na pewno chcesz usunąć zabezpieczenia?', [
            { text: 'Anuluj', style: 'cancel' },
            { text: 'Resetuj', style: 'destructive', onPress: async () => {
                await savePin(null);
                await savePinHint(null);
                onLogout();
            }}
        ]);
    }
  };

  const handleSaveConfig = async () => {
    try {
        await savePatientData(patientData);
        await saveTargets({ min: parseInt(targets.min), max: parseInt(targets.max) });
        await savePinHint(pinHint);
        
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        if (Platform.OS === 'web') {
            window.alert('Ustawienia i cele terapeutyczne zostały zapisane!');
        } else {
            Alert.alert('Sukces', 'Dane i cele terapeutyczne zostały zapisane.');
        }
    } catch (e) {
        console.error(e);
        Alert.alert('Błąd', 'Nie udało się zapisać ustawień.');
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsLoading(true);
      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const data = await getData();
      if (!data || data.length === 0) {
        if (Platform.OS === 'web') window.alert('Brak danych do eksportu.');
        else Alert.alert('Brak danych', 'Nie masz żadnych danych do wyeksportowania.');
        return;
      }

      const jsonString = JSON.stringify(data);
      const filename = `Glyse_Backup_${new Date().toISOString().split('T')[0]}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, jsonString);
        await Sharing.shareAsync(fileUri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Błąd', 'Nie udało się wyeksportować danych.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;

      setIsLoading(true);
      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const importedData = JSON.parse(content);

      if (Array.isArray(importedData)) {
        Alert.alert('Przywracanie', `Czy na pewno chcesz przywrócić ${importedData.length} pomiarów? Obecne dane zostaną zastąpione.`, [
          { text: 'Anuluj', style: 'cancel' },
          { text: 'Przywróć', style: 'destructive', onPress: async () => {
              await replaceData(importedData);
              if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Sukces', 'Dane zostały przywrócone pomyślnie.');
            }
          }
        ]);
      } else {
        Alert.alert('Błąd', 'Niepoprawny format pliku backupu.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Błąd', 'Nie udało się przywrócić danych.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <GlyseLogo size={50} />
        <Text style={[styles.title, { color: theme.text }]}>Konfiguracja</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Zarządzaj swoim profilem klinicznym</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Profil Pacjenta</Text>
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Imię</Text>
            <TextInput 
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
                value={patientData.firstName}
                onChangeText={(text) => setPatientData({...patientData, firstName: text})}
                placeholder="np. Jan"
                placeholderTextColor={isDark ? "#475569" : "#A0B3C6"}
            />
        </View>
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Nazwisko</Text>
            <TextInput 
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
                value={patientData.lastName}
                onChangeText={(text) => setPatientData({...patientData, lastName: text})}
                placeholder="np. Kowalski"
                placeholderTextColor={isDark ? "#475569" : "#A0B3C6"}
            />
        </View>
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Rok urodzenia</Text>
            <TextInput 
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
                value={patientData.birthYear}
                onChangeText={(text) => setPatientData({...patientData, birthYear: text})}
                placeholder="np. 1980"
                placeholderTextColor={isDark ? "#475569" : "#A0B3C6"}
                keyboardType="numeric"
            />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cele Terapeutyczne</Text>
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Ustaw zakres docelowy glikemii (Time in Range), który ustaliłeś ze swoim lekarzem.
        </Text>
        <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Min (mg/dL)</Text>
                <TextInput 
                    style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
                    value={targets.min}
                    onChangeText={(text) => setTargets({...targets, min: text})}
                    keyboardType="numeric"
                />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Max (mg/dL)</Text>
                <TextInput 
                    style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
                    value={targets.max}
                    onChangeText={(text) => setTargets({...targets, max: text})}
                    keyboardType="numeric"
                />
            </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.accent }]} onPress={handleSaveConfig}>
            <Text style={styles.saveButtonText}>Zapisz Konfigurację</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Bezpieczeństwo Danych</Text>
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Eksportuj i importuj dane w formacie JSON.
        </Text>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? '#334155' : '#003355' }]} onPress={handleExportBackup} disabled={isLoading}>
          <Ionicons name="cloud-download-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Utwórz kopię (Eksport)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.importButton]} onPress={handleImportBackup} disabled={isLoading}>
          <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Przywróć kopię (Import)</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, isDark ? { backgroundColor: theme.card, borderColor: '#7F1D1D' } : styles.dangerSection]}>
        <Text style={[styles.sectionTitle, { color: '#FF3B30' }]}>Zabezpieczenia</Text>
        
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Podpowiedź do kodu PIN</Text>
            <TextInput 
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
                value={pinHint}
                onChangeText={setPinHint}
                placeholder="np. rok urodzenia psa"
                placeholderTextColor={isDark ? "#475569" : "#A0B3C6"}
            />
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#FF9500', marginTop: 10 }]} 
          onPress={handleResetPin}
        >
          <Ionicons name="refresh-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Zresetuj PIN i Podpowiedź</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#FF3B30', marginTop: 10 }]} 
          onPress={() => {
            if (Platform.OS === 'web') {
              if (window.confirm('Czy na pewno chcesz się wylogować?')) onLogout();
            } else {
              Alert.alert('Wyloguj', 'Zablokować aplikację?', [
                { text: 'Anuluj', style: 'cancel' },
                { text: 'Wyloguj', style: 'destructive', onPress: onLogout }
              ]);
            }
          }}
        >
          <Ionicons name="lock-closed" size={24} color="#fff" />
          <Text style={styles.buttonText}>Wyloguj i zablokuj</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#003355',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003355',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003355',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#003355',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#005A9C',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003355',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  importButton: {
    backgroundColor: '#34D399',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 12,
  },
  dangerSection: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFD6D6',
  }
});
