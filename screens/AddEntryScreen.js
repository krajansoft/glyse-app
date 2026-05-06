import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as Haptics from 'expo-haptics';
import { addEntry } from '../utils/storage';
import GlyseLogo from '../components/GlyseLogo';
import { useTheme } from '../context/ThemeContext';

const MEAL_TIMES = ['Na czczo', 'Przed posiłkiem', '2h po posiłku', 'Przed snem'];
const ACTIVITY_LEVELS = ['Niska', 'Średnia', 'Wysoka'];

const getSuggestedMealTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'Na czczo';
    if ((hour >= 12 && hour < 15) || (hour >= 18 && hour < 21)) return '2h po posiłku';
    if (hour >= 21 || hour < 4) return 'Przed snem';
    return 'Przed posiłkiem';
};

export default function AddEntryScreen({ navigation }) {
  const [sugar, setSugar] = useState('');
  const [notes, setNotes] = useState('');
  const [mealTime, setMealTime] = useState(getSuggestedMealTime());
  const [mealContent, setMealContent] = useState('');
  const [activityLevel, setActivityLevel] = useState('Średnia');
  const [showContextualIQ, setShowContextualIQ] = useState(false);
  const { theme, isDark } = useTheme();

  const handleMealTimeSelect = (time) => {
    setMealTime(time);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  };

  const handleSave = async () => {
    if (!sugar || isNaN(sugar.replace(',', '.'))) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (Platform.OS === 'web') {
        window.alert('Podaj prawidłowy wynik pomiaru (np. 105)');
      } else {
        alert('Podaj prawidłowy wynik pomiaru (np. 105)');
      }
      return;
    }

    try {
      const date = new Date().toISOString();
      await addEntry(sugar, date, notes, mealTime, mealContent, activityLevel);
      setSugar('');
      setNotes('');
      setMealContent('');
      setActivityLevel('Średnia');
      setMealTime(getSuggestedMealTime());
      Keyboard.dismiss();
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (Platform.OS === 'web') {
        window.alert('Pomiar został pomyślnie zapisany!');
      } else {
        alert('Pomiar został pomyślnie zapisany!');
      }
    } catch (e) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (Platform.OS === 'web') {
        window.alert('Nie udało się zapisać pomiaru.');
      } else {
        alert('Nie udało się zapisać pomiaru.');
      }
    }
  };

  const Wrapper = Platform.OS === 'web' ? View : TouchableWithoutFeedback;
  const wrapperProps = Platform.OS === 'web' 
    ? { style: { flex: 1 }, testID: 'web-wrapper' } 
    : { onPress: Keyboard.dismiss, accessible: false, testID: 'mobile-wrapper' };

  return (
    <Wrapper {...wrapperProps}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <GlyseLogo size={50} />
            <Text style={[styles.title, { color: theme.text }]}>Nowy Pomiar</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Wprowadź swoje aktualne wyniki</Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.text }]}>Pora pomiaru</Text>
            <View style={styles.mealTimeContainer}>
              {MEAL_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.mealTimeButton,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    mealTime === time && { backgroundColor: theme.accent, borderColor: theme.accent }
                  ]}
                  onPress={() => handleMealTimeSelect(time)}
                >
                  <Text style={[
                    styles.mealTimeText,
                    { color: theme.text },
                    mealTime === time && { color: '#FFFFFF' }
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Wynik z glukometru (mg/dL)</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TextInput
                style={[styles.mainInput, { color: theme.accent }]}
                value={sugar}
                onChangeText={setSugar}
                keyboardType="numeric"
                placeholder="np. 105"
                placeholderTextColor={isDark ? "#475569" : "#A0B3C6"}
                maxLength={5}
                returnKeyType="next"
              />
              <Text style={[styles.unitText, { color: theme.textSecondary }]}>mg/dL</Text>
            </View>

            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="np. bolała głowa, stres..."
              placeholderTextColor={isDark ? "#475569" : "#A0B3C6"}
              multiline
              numberOfLines={4}
            />

            <View style={styles.contextualIQHeader}>
              <Text style={[styles.label, { color: theme.text }]}>Contextual IQ (Opcjonalnie)</Text>
              <TouchableOpacity 
                onPress={() => setShowContextualIQ(!showContextualIQ)}
                style={[styles.toggleButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={[styles.toggleButtonText, { color: theme.accent }]}>{showContextualIQ ? 'Ukryj' : 'Rozwiń'}</Text>
              </TouchableOpacity>
            </View>

            {showContextualIQ && (
              <View style={[styles.contextualIQContainer, { backgroundColor: isDark ? '#1E293B' : '#F9F9FB', borderColor: theme.border }]}>
                <Text style={[styles.smallLabel, { color: theme.textSecondary }]}>Co było w posiłku?</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, marginBottom: 20 }]}
                  value={mealContent}
                  onChangeText={setMealContent}
                  placeholder="np. pizza, sałatka, owoce..."
                  placeholderTextColor={isDark ? "#475569" : "#A0B3C6"}
                />

                <Text style={[styles.smallLabel, { color: theme.textSecondary }]}>Poziom aktywności fizycznej</Text>
                <View style={styles.activityContainer}>
                  {ACTIVITY_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.activityButton,
                        { backgroundColor: theme.background, borderColor: theme.border },
                        activityLevel === level && { backgroundColor: theme.accent, borderColor: theme.accent }
                      ]}
                      onPress={() => setActivityLevel(level)}
                    >
                      <Text style={[
                        styles.activityText,
                        { color: theme.text },
                        activityLevel === level && { color: '#FFFFFF' }
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent, shadowColor: theme.accent }]} onPress={handleSave}>
              <Text style={styles.buttonText}>Zapisz Wynik</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 15,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mealTimeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
    gap: 8,
  },
  mealTimeButton: {
    flex: screenWidth < 380 ? 1 : 0, // Stretch on small screens
    minWidth: '45%',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  mealTimeButtonActive: {
    backgroundColor: '#005A9C',
    borderColor: '#005A9C',
  },
  mealTimeText: {
    fontWeight: '600',
    fontSize: screenWidth < 380 ? 12 : 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    marginBottom: 32,
    paddingHorizontal: 24,
    height: 100,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  mainInput: {
    flex: 1,
    fontSize: screenWidth < 380 ? 36 : 48,
    fontWeight: '800',
    height: '100%',
  },
  unitText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '600',
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#003355',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 40,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#005A9C',
    borderRadius: 20,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#005A9C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  contextualIQHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: '#005A9C',
    fontSize: 12,
    fontWeight: '700',
  },
  contextualIQContainer: {
    backgroundColor: '#F9F9FB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  smallLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  activityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  activityButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activityButtonActive: {
    backgroundColor: '#005A9C',
    borderColor: '#005A9C',
  },
  activityText: {
    color: '#003355',
    fontSize: 13,
    fontWeight: '600',
  },
  activityTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  }
});
