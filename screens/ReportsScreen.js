import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getData, getPatientData } from '../utils/storage';
import { calculateMedicalStats } from '../utils/medicalCalculations';
import { generateClinicalReport } from '../utils/pdfGenerator';
import GlyseLogo from '../components/GlyseLogo';
import { useTheme } from '../context/ThemeContext';

const REPORT_PERIODS = [
    { label: 'Ostatnie 7 dni', days: 7 },
    { label: 'Ostatnie 14 dni', days: 14 },
    { label: 'Ostatnie 30 dni', days: 30 },
    { label: 'Wszystkie dane', days: 9999 }
];

export default function ReportsScreen() {
    const [selectedPeriod, setSelectedPeriod] = useState(REPORT_PERIODS[0]);
    const [dataCount, setDataCount] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [reportData, setReportData] = useState({ data: [], stats: {}, patient: {} });
    const { theme, isDark } = useTheme();

    const checkData = async () => {
        const data = await getData();
        setDataCount(data.length);
    };

    useFocusEffect(
        useCallback(() => {
            checkData();
        }, [])
    );

    const handlePreparePreview = async () => {
        try {
            const allData = await getData();
            if (allData.length === 0) {
                Alert.alert('Brak danych', 'Dodaj najpierw jakieś pomiary, aby wygenerować raport.');
                return;
            }

            setIsGenerating(true);
            if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod.days);
            const filteredData = allData.filter(item => new Date(item.date) >= cutoffDate);

            if (filteredData.length === 0) {
                Alert.alert('Pusto', `Brak pomiarów z okresu: ${selectedPeriod.label}`);
                setIsGenerating(false);
                return;
            }

            const patient = await getPatientData();
            const stats = calculateMedicalStats(filteredData);
            
            setReportData({ data: filteredData, stats, patient });
            setIsGenerating(false);
            setIsPreviewVisible(true);
        } catch (e) {
            console.error(e);
            setIsGenerating(false);
            Alert.alert('Błąd', 'Nie udało się przygotować podglądu.');
        }
    };

    const handleFinalPrint = async () => {
        try {
            if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await generateClinicalReport(reportData.data, reportData.patient, reportData.stats);
        } catch (e) {
            Alert.alert('Błąd', 'Błąd podczas drukowania.');
        }
    };

    const handleExportCSV = async () => {
        try {
            const allData = await getData();
            if (allData.length === 0) {
                Alert.alert('Brak danych', 'Brak danych do eksportu CSV.');
                return;
            }

            const headers = 'Data i godzina,Pora pomiaru,Cukier (mg/dL),Notatki\n';
            const rows = allData.map(item => {
                const date = new Date(item.date).toLocaleString('pl-PL');
                return `${date},${item.mealTime || ''},${item.sugarLevel},"${(item.notes || '').replace(/"/g, '""')}"`;
            }).join('\n');
            
            const csvContent = headers + rows;
            const filename = `GLYSE_Eksport_${new Date().toISOString().split('T')[0]}.csv`;

            if (Platform.OS === 'web') {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                link.click();
            } else {
                const fileUri = FileSystem.documentDirectory + filename;
                await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
                await Sharing.shareAsync(fileUri);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Błąd', 'Błąd eksportu CSV.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <GlyseLogo size={50} />
                    <Text style={[styles.title, { color: theme.text }]}>Centrum Raportów</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Profesjonalna dokumentacja kliniczna</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Wybierz zakres danych</Text>
                    <View style={styles.periodsContainer}>
                        {REPORT_PERIODS.map(period => (
                            <TouchableOpacity 
                                key={period.days} 
                                style={[
                                    styles.periodButton, 
                                    { backgroundColor: theme.card, borderColor: theme.border },
                                    selectedPeriod.days === period.days && { backgroundColor: theme.accent, borderColor: theme.accent }
                                ]}
                                onPress={() => setSelectedPeriod(period)}
                            >
                                <Text style={[
                                    styles.periodText, 
                                    { color: theme.text },
                                    selectedPeriod.days === period.days && { color: '#FFFFFF' }
                                ]}>
                                    {period.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Generuj raport</Text>
                    
                    <TouchableOpacity 
                        style={[styles.pdfButton, { backgroundColor: theme.accent, shadowColor: theme.accent }, isGenerating && { opacity: 0.7 }]} 
                        onPress={handlePreparePreview}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Ionicons name="eye-outline" size={24} color="#FFFFFF" />
                        )}
                        <View style={styles.buttonTextContainer}>
                            <Text style={styles.pdfButtonText}>
                                {isGenerating ? 'Przetwarzanie...' : 'Pokaż Podgląd Raportu'}
                            </Text>
                            <Text style={styles.pdfButtonSubtext}>Zweryfikuj dane przed wydrukiem</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.csvButton, { borderColor: theme.accent }]} onPress={handleExportCSV}>
                        <Ionicons name="grid-outline" size={20} color={theme.accent} />
                        <Text style={[styles.csvButtonText, { color: theme.accent }]}>Eksportuj do CSV (Arkusz)</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Preview Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={isPreviewVisible}
                onRequestClose={() => setIsPreviewVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: isDark ? theme.background : '#F2F2F7' }]}>
                    <View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                        <TouchableOpacity onPress={() => setIsPreviewVisible(false)}>
                            <Ionicons name="close" size={28} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Podgląd Raportu</Text>
                        <TouchableOpacity onPress={handleFinalPrint} style={styles.modalPrintBtn}>
                            <Ionicons name="print" size={20} color="#FFFFFF" />
                            <Text style={styles.modalPrintText}>DRUKUJ</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.previewScroll}>
                        <View style={styles.previewPaper}>
                            <View style={styles.previewInnerHeader}>
                                <GlyseLogo size={30} />
                                <View style={{alignItems: 'flex-end'}}>
                                    <Text style={styles.previewReportType}>RAPORT KLINICZNY</Text>
                                    <Text style={styles.previewDate}>{new Date().toLocaleDateString('pl-PL')}</Text>
                                </View>
                            </View>

                            <View style={styles.previewPatientInfo}>
                                <Text style={styles.previewLabel}>PACJENT:</Text>
                                <Text style={styles.previewValue}>
                                    {reportData.patient.firstName} {reportData.patient.lastName}
                                </Text>
                                <Text style={styles.previewSubValue}>Rok ur. {reportData.patient.birthYear}</Text>
                            </View>

                            <View style={styles.previewStatsGrid}>
                                <View style={styles.previewStatBox}>
                                    <Text style={styles.previewStatVal}>{reportData.stats.hba1c}%</Text>
                                    <Text style={styles.previewStatLabel}>HbA1c</Text>
                                </View>
                                <View style={styles.previewStatBox}>
                                    <Text style={styles.previewStatVal}>{reportData.stats.tir}%</Text>
                                    <Text style={styles.previewStatLabel}>TIR</Text>
                                </View>
                            </View>

                            <Text style={[styles.previewLabel, {marginTop: 20}]}>DZIENNIK POMIARÓW ({reportData.data.length}):</Text>
                            {reportData.data.slice(0, 10).map((item, idx) => (
                                <View key={idx} style={styles.previewRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.previewRowDate}>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                                        <Text style={styles.previewRowContext}>
                                            {item.mealTime} {item.mealContent ? `• ${item.mealContent}` : ''}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                                        <Text style={styles.previewRowSugar}>{item.sugarLevel} mg/dL</Text>
                                        {item.activityLevel && <Text style={styles.previewRowActivity}>{item.activityLevel}</Text>}
                                    </View>
                                    <View style={[
                                        styles.previewStatusTag,
                                        item.sugarLevel < 70 ? {backgroundColor: '#fee2e2'} : 
                                        item.sugarLevel > 180 ? {backgroundColor: '#ffedd5'} : {backgroundColor: '#f0fdf4'}
                                    ]}>
                                        <Text style={{fontSize: 8, fontWeight: '800'}}>
                                            {item.sugarLevel < 70 ? 'HIPO' : item.sugarLevel > 180 ? 'HIPER' : 'OK'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                            {reportData.data.length > 10 && (
                                <Text style={styles.previewMoreText}>... oraz {reportData.data.length - 10} kolejnych wpisów</Text>
                            )}
                        </View>
                        <View style={{height: 40}} />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { padding: 24, paddingTop: 60 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 26, fontWeight: '700', color: '#003355', marginTop: 15, opacity: 0.9 },
    subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 4, opacity: 0.8 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#003355', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.85 },
    periodsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    periodButton: { 
        paddingVertical: 10, 
        paddingHorizontal: 16, 
        borderRadius: 12, 
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA'
    },
    periodButtonActive: { backgroundColor: '#003355', borderColor: '#003355' },
    periodText: { color: '#003355', fontWeight: '600' },
    periodTextActive: { color: '#FFFFFF' },
    pdfButton: {
        backgroundColor: '#005A9C',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#005A9C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonTextContainer: { marginLeft: 15 },
    pdfButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    pdfButtonSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
    csvButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#005A9C',
    },
    csvButtonText: { color: '#005A9C', fontWeight: '700', marginLeft: 8 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    infoText: { flex: 1, marginLeft: 10, fontSize: 12, color: '#666', lineHeight: 18 },

    /* Modal Styles */
    modalContainer: { flex: 1, backgroundColor: '#F2F2F7' },
    modalHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 20, 
        backgroundColor: '#FFF',
        paddingTop: Platform.OS === 'ios' ? 50 : 20
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#003355' },
    modalPrintBtn: { 
        backgroundColor: '#34D399', 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    modalPrintText: { color: '#FFF', fontWeight: '800', fontSize: 12, marginLeft: 5 },
    previewScroll: { flex: 1, padding: 20 },
    previewPaper: { 
        backgroundColor: '#FFF', 
        padding: 20, 
        borderRadius: 4, 
        minHeight: 500,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    },
    previewInnerHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#003355', paddingBottom: 15, marginBottom: 20 },
    previewReportType: { fontSize: 14, fontWeight: '900', color: '#003355' },
    previewDate: { fontSize: 10, color: '#666' },
    previewPatientInfo: { marginBottom: 20 },
    previewLabel: { fontSize: 10, fontWeight: '800', color: '#005A9C', marginBottom: 2 },
    previewValue: { fontSize: 18, fontWeight: '700', color: '#003355' },
    previewSubValue: { fontSize: 12, color: '#444' },
    previewStatsGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    previewStatBox: { flex: 1, backgroundColor: '#F8F9FA', padding: 10, borderRadius: 8, alignItems: 'center' },
    previewStatVal: { fontSize: 20, fontWeight: '800', color: '#005A9C' },
    previewStatLabel: { fontSize: 9, color: '#666', fontWeight: '700' },
    previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', alignItems: 'center' },
    previewRowDate: { fontSize: 12, color: '#444' },
    previewRowSugar: { fontSize: 14, fontWeight: '700', color: '#003355' },
    previewRowContext: { fontSize: 10, color: '#666', marginTop: 2 },
    previewRowActivity: { fontSize: 9, color: '#005A9C', fontWeight: '600' },
    previewStatusTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    previewMoreText: { textAlign: 'center', marginTop: 15, fontSize: 11, color: '#999', fontStyle: 'italic' }
});
