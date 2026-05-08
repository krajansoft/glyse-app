import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getData, replaceData, savePatientData, getPatientData, getTargets, saveTargets, getPinHint, savePinHint, savePin } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import GlyseLogo from '../components/GlyseLogo';

export default function SettingsScreen({ onLogout }) {
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState({ firstName: '', lastName: '', birthYear: '' });
  const [targets, setTargets] = useState({ min: '70', max: '180' });
  const [pinHint, setPinHint] = useState('');
  const { theme, isDark } = useTheme();
  
  const activeTheme = theme || { background: '#F8F9FA', text: '#003355', textSecondary: '#666666', card: '#FFFFFF', border: '#F2F2F7', accent: '#005A9C' };

  React.useEffect(() => {
    const loadSettings = async () => {
        try {
            const pData = await getPatientData();
            if (pData) setPatientData(pData);
            
            const tData = await getTargets();
            if (tData) setTargets({ min: tData.min.toString(), max: tData.max.toString() });

            const hData = await getPinHint();
            if (hData) setPinHint(hData);
        } catch (e) {
            console.warn('Failed to load settings');
        }
    };
    loadSettings();
  }, []);

  const handleSaveConfig = async () => {
    try {
        await savePatientData(patientData);
        await saveTargets({ min: parseInt(targets.min), max: parseInt(targets.max) });
        await savePinHint(pinHint);
        
        if (Platform.OS === 'web') {
            window.alert('Ustawienia i cele terapeutyczne zostały zapisane!');
        } else {
            Alert.alert('Sukces', 'Dane zostały zapisane.');
        }
    } catch (e) {
        Alert.alert('Błąd', 'Nie udało się zapisać ustawień.');
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsLoading(true);
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
        Alert.alert('Eksport', 'Funkcja backupu na telefonie będzie dostępna w wersji finalnej.');
      }
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się wyeksportować danych.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBackup = async () => {
    if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData)) {
                        if (window.confirm(`Czy na pewno chcesz przywrócić ${importedData.length} pomiarów? Obecne dane zostaną zastąpione.`)) {
                            await replaceData(importedData);
                            window.alert('Dane zostały przywrócone pomyślnie!');
                        }
                    } else {
                        window.alert('Niepoprawny format pliku backupu.');
                    }
                } catch (err) {
                    window.alert('Błąd podczas odczytu pliku.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    } else {
        Alert.alert('Import', 'Funkcja importu na telefonie będzie dostępna w wersji finalnej.');
    }
  };

  const handleResetPin = async () => {
    const performReset = async () => {
        await savePin(null);
        await savePinHint(null);
        onLogout();
    };

    if (Platform.OS === 'web') {
        if (window.confirm('Czy na pewno chcesz usunąć kod PIN i wylogować się?')) {
            performReset();
        }
    } else {
        Alert.alert('Reset PIN', 'Usunąć zabezpieczenia?', [
            { text: 'Anuluj', style: 'cancel' },
            { text: 'Resetuj', style: 'destructive', onPress: performReset }
        ]);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View style={styles.header}>
        <GlyseLogo size={50} />
        <Text style={[styles.title, { color: activeTheme.text }]}>Konfiguracja</Text>
        <Text style={[styles.subtitle, { color: activeTheme.textSecondary }]}>Zarządzaj swoim profilem klinicznym</Text>
      </View>

      <View style={[styles.section, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Profil Pacjenta</Text>
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: activeTheme.text }]}>Imię</Text>
            <TextInput 
                style={[styles.textInput, { backgroundColor: activeTheme.background, color: activeTheme.text }]}
                value={patientData.firstName}
                onChangeText={(text) => setPatientData({...patientData, firstName: text})}
                placeholder="Jan"
                placeholderTextColor="#A0B3C6"
            />
        </View>
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: activeTheme.text }]}>Nazwisko</Text>
            <TextInput 
                style={[styles.textInput, { backgroundColor: activeTheme.background, color: activeTheme.text }]}
                value={patientData.lastName}
                onChangeText={(text) => setPatientData({...patientData, lastName: text})}
                placeholder="Kowalski"
                placeholderTextColor="#A0B3C6"
            />
        </View>
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: activeTheme.text }]}>Rok urodzenia</Text>
            <TextInput 
                style={[styles.textInput, { backgroundColor: activeTheme.background, color: activeTheme.text }]}
                value={patientData.birthYear}
                onChangeText={(text) => setPatientData({...patientData, birthYear: text})}
                placeholder="1980"
                placeholderTextColor="#A0B3C6"
                keyboardType="numeric"
            />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Cele Terapeutyczne</Text>
        <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.inputLabel, { color: activeTheme.text }]}>Min (mg/dL)</Text>
                <TextInput 
                    style={[styles.textInput, { backgroundColor: activeTheme.background, color: activeTheme.text }]}
                    value={targets.min}
                    onChangeText={(text) => setTargets({...targets, min: text})}
                    keyboardType="numeric"
                />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: activeTheme.text }]}>Max (mg/dL)</Text>
                <TextInput 
                    style={[styles.textInput, { backgroundColor: activeTheme.background, color: activeTheme.text }]}
                    value={targets.max}
                    onChangeText={(text) => setTargets({...targets, max: text})}
                    keyboardType="numeric"
                />
            </View>
        </View>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: activeTheme.accent }]} onPress={handleSaveConfig}>
            <Text style={styles.saveButtonText}>Zapisz Konfigurację</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>Bezpieczeństwo Danych</Text>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#003355' }]} onPress={handleExportBackup}>
          <Ionicons name="cloud-download-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Utwórz kopię (Eksport)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#34D399' }]} onPress={handleImportBackup}>
          <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Przywróć kopię (Import)</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: activeTheme.card, borderColor: '#FFD6D6' }]}>
        <Text style={[styles.sectionTitle, { color: '#FF3B30' }]}>Zabezpieczenia</Text>
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: activeTheme.text }]}>Podpowiedź do kodu PIN</Text>
            <TextInput 
                style={[styles.textInput, { backgroundColor: activeTheme.background, color: activeTheme.text }]}
                value={pinHint}
                onChangeText={setPinHint}
                placeholder="np. rok urodzenia psa"
                placeholderTextColor="#A0B3C6"
            />
        </View>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F59E0B' }]} onPress={() => onLogout()}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Wyloguj (Zablokuj aplikację)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF3B30' }]} onPress={handleResetPin}>
          <Ionicons name="refresh-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Zresetuj PIN i wyloguj</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 30, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 15 },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, opacity: 0.8 },
  section: { marginHorizontal: 24, marginBottom: 24, padding: 20, borderRadius: 24, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  textInput: { borderRadius: 12, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 16 },
  saveButton: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginTop: 10 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', marginLeft: 12 }
});
