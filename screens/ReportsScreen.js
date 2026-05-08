import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getData, getPatientData } from '../utils/storage';
import { calculateMedicalStats } from '../utils/medicalCalculations';
import { generateClinicalReport } from '../utils/pdfGenerator';
import GlyseLogo from '../components/GlyseLogo';
import { useTheme } from '../context/ThemeContext';

const REPORT_PERIODS = [
    { label: 'Ostatnie 30 dni', days: 30 },
    { label: 'Ostatnie 120 dni', days: 120 },
    { label: 'Wszystkie Dane (Pełny)', days: 9999 }
];

export default function ReportsScreen() {
    const [selectedPeriod, setSelectedPeriod] = useState(REPORT_PERIODS[2]);
    const [isGenerating, setIsGenerating] = useState(false);
    const { theme } = useTheme();

    const handleGenerateAndPrint = async () => {
        try {
            setIsGenerating(true);
            const allData = await getData();
            
            if (!allData || allData.length === 0) {
                Alert.alert('Brak danych', 'Historia pomiarów jest pusta.');
                setIsGenerating(false);
                return;
            }

            let filteredData = allData;
            if (selectedPeriod.days !== 9999) {
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - selectedPeriod.days);
                filteredData = allData.filter(item => new Date(item.date) >= cutoff);
            }

            if (filteredData.length === 0) {
                Alert.alert('Brak danych', 'Nie znaleziono danych w tym okresie.');
                setIsGenerating(false);
                return;
            }

            const patient = await getPatientData() || { firstName: 'Pacjent', lastName: '', birthYear: '' };
            const stats = calculateMedicalStats(filteredData);
            
            // DRUKUJEMY BEZPOŚREDNIO - BEZ MODALA
            await generateClinicalReport(filteredData, patient, stats);
            
            setIsGenerating(false);
        } catch (e) {
            console.error(e);
            setIsGenerating(false);
            Alert.alert('Błąd', 'Nie udało się wygenerować raportu.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <GlyseLogo size={50} />
                    <Text style={[styles.title, { color: theme.text }]}>Raporty PDF</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Generuj oficjalną dokumentację medyczną</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Wybierz okres:</Text>
                    {REPORT_PERIODS.map(period => (
                        <TouchableOpacity 
                            key={period.days} 
                            style={[styles.periodBtn, { backgroundColor: theme.card, borderColor: theme.border }, selectedPeriod.days === period.days && { borderColor: theme.accent, borderWidth: 2 }]}
                            onPress={() => setSelectedPeriod(period)}
                        >
                            <Text style={{ color: theme.text, fontWeight: 'bold' }}>{period.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity 
                        style={[styles.mainBtn, { backgroundColor: theme.accent }]} 
                        onPress={handleGenerateAndPrint} 
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="print-outline" size={24} color="#fff" />
                                <Text style={styles.mainBtnText}>GENERUJ I DRUKUJ PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.hint}>Przy dużej ilości danych (np. rok), generowanie może potrwać kilka sekund.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 24, paddingTop: 60 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 26, fontWeight: '700' },
    subtitle: { fontSize: 14, opacity: 0.7, textAlign: 'center', marginTop: 5 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', opacity: 0.6 },
    periodBtn: { padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, alignItems: 'center' },
    mainBtn: { padding: 20, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    mainBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    hint: { fontSize: 11, textAlign: 'center', marginTop: 15, opacity: 0.5 }
});
