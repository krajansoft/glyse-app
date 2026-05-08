import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getData, deleteEntry } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import GlyseLogo from '../components/GlyseLogo';

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, isDark } = useTheme();
  
  const activeTheme = theme || { background: '#F8F9FA', text: '#003355', textSecondary: '#666666', card: '#FFFFFF', border: '#F2F2F7', accent: '#005A9C' };

  const loadData = async () => {
    const stored = await getData();
    setData(stored);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      Alert.alert('Pusto', 'Brak danych do eksportu.');
      return;
    }

    const headers = 'Data i godzina,Pora pomiaru,Cukier (mg/dL),Notatki\n';
    const rows = data.map(item => {
      const date = new Date(item.date).toLocaleString('pl-PL');
      const mealTime = item.mealTime || 'Nie określono';
      const notes = item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '';
      return `${date},${mealTime},${item.sugarLevel},${notes}`;
    }).join('\n');
    
    const csvContent = headers + rows;
    const filename = `Pomiary_Cukru_${new Date().toISOString().split('T')[0]}.csv`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
        // Fallback for mobile if sharing is not available yet
        Alert.alert('Eksport', 'Funkcja eksportu na telefonie będzie dostępna w wersji finalnej.');
    }
  };

  const handleDelete = (id) => {
    const performDelete = async () => {
        await deleteEntry(id);
        loadData();
    };

    if (Platform.OS === 'web') {
        if (window.confirm('Czy na pewno chcesz usunąć ten pomiar?')) {
            performDelete();
        }
    } else {
        Alert.alert('Usuń wpis', 'Czy na pewno chcesz usunąć ten pomiar?', [
            { text: 'Anuluj', style: 'cancel' },
            { text: 'Usuń', style: 'destructive', onPress: performDelete }
        ]);
    }
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.date);
    return (
        <View style={[styles.itemContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
          <View style={[styles.itemDateContainer, { borderRightColor: activeTheme.border }]}>
            <Text style={[styles.itemDay, { color: activeTheme.text }]}>{date.getDate().toString().padStart(2, '0')}.{(date.getMonth() + 1).toString().padStart(2, '0')}</Text>
            <Text style={[styles.itemTime, { color: activeTheme.textSecondary }]}>{date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}</Text>
          </View>
          <View style={styles.itemContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.itemSugar, { color: activeTheme.accent }]}>
                {item.sugarLevel} <Text style={[styles.itemUnit, { color: activeTheme.textSecondary }]}>mg/dL</Text>
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#ff4b4b" />
                </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              <View style={[styles.mealTimeTag, { backgroundColor: isDark ? '#334155' : '#F2F2F7' }]}>
                  <Text style={[styles.mealTimeTagText, { color: activeTheme.text }]}>{item.mealTime || 'Na czczo'}</Text>
              </View>
              {item.activityLevel && (
                <View style={[styles.mealTimeTag, { marginLeft: 8, backgroundColor: isDark ? '#075985' : '#E0F2FE' }]}>
                  <Text style={[styles.mealTimeTagText, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>{item.activityLevel}</Text>
                </View>
              )}
            </View>
            {item.mealContent ? (
              <View style={[styles.contextualInfo, { backgroundColor: isDark ? '#0F172A' : '#F9F9FB' }]}>
                <Ionicons name="restaurant-outline" size={14} color={activeTheme.textSecondary} />
                <Text style={[styles.contextualText, { color: activeTheme.textSecondary }]}>{item.mealContent}</Text>
              </View>
            ) : null}
            {item.notes ? <Text style={[styles.itemNotes, { color: activeTheme.textSecondary }]}>{item.notes}</Text> : null}
          </View>
        </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View style={styles.header}>
        <GlyseLogo size={50} />
        <Text style={[styles.title, { color: activeTheme.text }]}>Historia</Text>
        <Text style={[styles.subtitle, { color: activeTheme.textSecondary }]}>Pełna historia Twojego zdrowia</Text>
        
        <TouchableOpacity style={[styles.exportButton, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]} onPress={handleExportCSV}>
          <Ionicons name="download-outline" size={18} color={activeTheme.accent} />
          <Text style={[styles.exportButtonText, { color: activeTheme.accent }]}>Eksportuj CSV</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeTheme.accent} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={activeTheme.accent} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: activeTheme.text }]}>Brak wpisów</Text>
            <Text style={[styles.emptyText, { color: activeTheme.textSecondary }]}>Twoja historia pomiarów jest jeszcze pusta.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 30, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 15, opacity: 0.9 },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, opacity: 0.8, marginBottom: 20 },
  exportButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  exportButtonText: { fontWeight: '700', marginLeft: 8, fontSize: 13 },
  listContent: { padding: 24, paddingTop: 0 },
  itemContainer: { flexDirection: 'row', borderRadius: 20, padding: 20, marginBottom: 16, alignItems: 'center', borderWidth: 1, elevation: 2 },
  itemDateContainer: { marginRight: 20, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, paddingRight: 20 },
  itemDay: { fontSize: 18, fontWeight: '700' },
  itemTime: { fontSize: 12, marginTop: 2 },
  itemContent: { flex: 1 },
  itemSugar: { fontSize: 24, fontWeight: '800' },
  itemUnit: { fontSize: 14, fontWeight: '600' },
  tagContainer: { flexDirection: 'row', marginTop: 6 },
  mealTimeTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  mealTimeTagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  itemNotes: { fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  contextualInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 8, borderRadius: 8, gap: 6 },
  contextualText: { fontSize: 12, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  deleteButton: { padding: 5 }
});
