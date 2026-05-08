import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlyseLogo from '../components/GlyseLogo';
import { getPin, savePin, getPinHint, savePinHint } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState('loading'); // loading, set, hint, verify
  const [storedPin, setStoredPin] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [tempHint, setTempHint] = useState('');
  const { theme, toggleTheme, themeMode, isDark } = useTheme();
  
  const PIN_LENGTH = 4;
  const activeTheme = theme || { background: '#003355', text: '#FFFFFF', textSecondary: '#A0B3C6', card: 'rgba(255,255,255,0.05)', accent: '#005A9C' };

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const p = await getPin();
    if (p) {
      setStoredPin(p);
      setMode('verify');
    } else {
      setMode('set');
    }
  };

  const handlePress = async (num) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === PIN_LENGTH) {
        if (mode === 'set') {
          setTimeout(() => setMode('hint'), 300);
        } else if (mode === 'verify') {
          const actualPin = await getPin();
          if (newPin === actualPin) {
            onLogin();
          } else {
            setAttempts(attempts + 1);
            setTimeout(() => setPin(''), 500);
          }
        }
      }
    }
  };

  const handleSaveAll = async () => {
    await savePin(pin);
    await savePinHint(tempHint);
    onLogin();
  };

  const getThemeIcon = () => {
    if (themeMode === 'light') return 'sunny';
    if (themeMode === 'dark') return 'moon';
    return 'time-outline';
  };

  if (mode === 'loading') return <View style={[styles.container, { backgroundColor: activeTheme.background }]} />;

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View style={styles.themeToggleContainer}>
        <TouchableOpacity style={[styles.themeToggle, { backgroundColor: isDark ? '#334155' : '#F2F2F7' }]} onPress={toggleTheme}>
          <Ionicons name={getThemeIcon()} size={18} color={activeTheme.accent} />
          <Text style={[styles.themeToggleText, { color: activeTheme.text }]}>
            {themeMode === 'auto' ? 'Auto' : themeMode === 'light' ? 'Jasny' : 'Ciemny'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <GlyseLogo size={80} />
        <Text style={[styles.welcomeText, { color: activeTheme.textSecondary }]}>
          {mode === 'set' ? 'Ustaw swój kod PIN' : mode === 'hint' ? 'Dodaj podpowiedź' : 'Zabezpieczony Dostęp'}
        </Text>

        <View style={styles.pinIndicatorContainer}>
          {[...Array(PIN_LENGTH)].map((_, i) => (
            <View key={i} style={[styles.pinDot, { borderColor: activeTheme.accent }, pin.length > i && { backgroundColor: '#34D399', borderColor: '#34D399' }]} />
          ))}
        </View>

        {mode === 'hint' ? (
          <View style={styles.hintBox}>
            <TextInput
              style={[styles.hintInput, { backgroundColor: activeTheme.card, color: activeTheme.text }]}
              placeholder="np. imię psa"
              placeholderTextColor="#475569"
              value={tempHint}
              onChangeText={setTempHint}
              autoFocus
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveAll}>
              <Text style={styles.buttonText}>Zatwierdź i wejdź</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity key={num} style={[styles.key, { backgroundColor: activeTheme.card }]} onPress={() => handlePress(num.toString())}>
                <Text style={[styles.keyText, { color: activeTheme.text }]}>{num}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.key} />
            <TouchableOpacity style={[styles.key, { backgroundColor: activeTheme.card }]} onPress={() => handlePress('0')}>
              <Text style={[styles.keyText, { color: activeTheme.text }]}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, { backgroundColor: activeTheme.card }]} onPress={() => setPin(pin.slice(0, -1))}>
              <Ionicons name="backspace-outline" size={28} color={activeTheme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {attempts >= 2 && (
            <TouchableOpacity onPress={async () => {
                const h = await getPinHint();
                Alert.alert('Podpowiedź', h || 'Brak podpowiedzi.');
            }} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Zapomniałeś PINu?</Text>
            </TouchableOpacity>
        )}
        
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => onLogin()}>
            <Text style={{ color: '#34D399', fontSize: 12, opacity: 0.5 }}>Tryb Deweloperski: Pomiń logowanie</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { width: '100%', maxWidth: 400, alignItems: 'center', paddingHorizontal: 40 },
  themeToggleContainer: { position: 'absolute', top: 50, right: 20 },
  themeToggle: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 20 },
  themeToggleText: { fontSize: 11, fontWeight: '700', marginLeft: 6 },
  welcomeText: { fontSize: 14, marginTop: 20, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '600', marginBottom: 40 },
  pinIndicatorContainer: { flexDirection: 'row', marginBottom: 40, gap: 20 },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  key: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center', margin: 10, borderRadius: 35 },
  keyText: { fontSize: 28 },
  hintBox: { width: '100%', alignItems: 'center' },
  hintInput: { width: '100%', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#34D399', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#003355', fontWeight: '800' },
  forgotBtn: { marginTop: 20 },
  forgotText: { color: '#34D399', fontWeight: '700' }
});
