import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GlyseLogo from '../components/GlyseLogo';
import { getPin, savePin, getPinHint, savePinHint } from '../utils/storage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState('loading'); // loading, set, verify
  const [storedPin, setStoredPin] = useState(null);
  const [storedHint, setStoredHint] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showHintInput, setShowHintInput] = useState(false);
  const [tempHint, setTempHint] = useState('');
  const PIN_LENGTH = 4;

  React.useEffect(() => {
    const checkPin = async () => {
      const p = await getPin();
      const h = await getPinHint();
      if (p) {
        setStoredPin(p);
        setStoredHint(h);
        setMode('verify');
      } else {
        setMode('set');
      }
    };
    checkPin();
  }, []);

  const handlePress = async (num) => {
    if (showHintInput) return; // Ignore keypad when typing hint text

    if (pin.length < PIN_LENGTH) {
      const newPin = pin + num;
      setPin(newPin);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (newPin.length === PIN_LENGTH) {
        if (mode === 'set') {
          // Krótkie opóźnienie dla efektu wizualnego
          setTimeout(async () => {
            await savePin(newPin);
            setShowHintInput(true);
          }, 300);
        } else if (mode === 'verify') {
          // Pobieramy "świeży" PIN bezpośrednio z bazy, aby uniknąć błędów synchronizacji
          const latestStoredPin = await getPin();
          if (newPin === latestStoredPin) {
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(() => onLogin(), 300);
          } else {
            setAttempts(attempts + 1);
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setTimeout(() => setPin(''), 500);
          }
        }
      }
    }
  };

  const handleSavePinWithHint = async () => {
    await savePin(pin);
    await savePinHint(tempHint);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onLogin();
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (mode === 'loading') {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <GlyseLogo size={80} />
          <Text style={styles.welcomeText}>
            {mode === 'set' ? 'Ustaw swój kod PIN' : 'Bezpieczny Dostęp Kliniczny'}
          </Text>
        </View>

        <View style={styles.pinIndicatorContainer}>
          {[...Array(PIN_LENGTH)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.pinDot, 
                pin.length > i && styles.pinDotFilled
              ]} 
            />
          ))}
        </View>

        {showHintInput ? (
          <View style={styles.hintContainer}>
            <Text style={styles.hintTitle}>Dodaj podpowiedź do PINu</Text>
            <TextInput
              style={styles.hintInput}
              placeholder="np. rok urodzenia psa"
              placeholderTextColor="#A0B3C6"
              value={tempHint}
              onChangeText={setTempHint}
              autoFocus
            />
            <TouchableOpacity style={styles.saveHintButton} onPress={handleSavePinWithHint}>
              <Text style={styles.saveHintButtonText}>Zatwierdź i wejdź</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {attempts >= 2 && (
              <View style={styles.forgotPinContainer}>
                {!storedHint && attempts >= 3 ? (
                   <Text style={styles.reminderText}>Brak podpowiedzi. Skonfiguruj ją w ustawieniach.</Text>
                ) : (
                  <TouchableOpacity 
                    onPress={() => Alert.alert('Podpowiedź', storedHint || 'Brak ustawionej podpowiedzi.')}
                    style={styles.forgotPinButton}
                  >
                    <Ionicons name="help-circle-outline" size={18} color="#34D399" />
                    <Text style={styles.forgotPinText}>Zapomniałeś PINu?</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.keypad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <TouchableOpacity 
                  key={num} 
                  style={styles.key} 
                  onPress={() => handlePress(num.toString())}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.key} onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (Platform.OS === 'web') {
                      window.alert('Biometria niedostępna w przeglądarce. Użyj kodu PIN.');
                  } else {
                      Alert.alert('Biometria', 'Skonfiguruj FaceID/TouchID w ustawieniach systemu, aby korzystać z tej funkcji.');
                  }
              }}>
                <Ionicons name="finger-print" size={32} color="#005A9C" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
                <Text style={styles.keyText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={handleDelete}>
                <Ionicons name="backspace-outline" size={28} color="#A0B3C6" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={{ marginTop: 40, backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: 10, borderRadius: 10, width: '100%', alignItems: 'center' }} 
              onPress={() => onLogin()}
            >
              <Text style={{ color: '#34D399', fontSize: 13, fontWeight: '700' }}>🚀 Zaloguj jako Deweloper (Pomiń PIN)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ marginTop: 20 }} 
              onPress={async () => {
                await savePin(null);
                await savePinHint(null);
                if (Platform.OS === 'web') window.location.reload();
                else Alert.alert('Zresetowano', 'Zrestartuj aplikację.');
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Resetuj zabezpieczenia (Tryb Deweloperski)</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003355', // Deep Navy
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeText: {
    color: '#A0B3C6',
    fontSize: 14,
    marginTop: 20,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  pinIndicatorContainer: {
    flexDirection: 'row',
    marginBottom: 60,
    gap: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#005A9C',
  },
  pinDotFilled: {
    backgroundColor: '#34D399',
    borderColor: '#34D399',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  key: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    color: '#005A9C',
    fontSize: 14,
    fontWeight: '600',
  },
  hintContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hintTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  hintInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  saveHintButton: {
    backgroundColor: '#34D399',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  saveHintButtonText: {
    color: '#003355',
    fontWeight: '800',
    fontSize: 16,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  reminderText: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  forgotPinContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  forgotPinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  forgotPinText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  }
});
