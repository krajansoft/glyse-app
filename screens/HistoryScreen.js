import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { getData, deleteEntry } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, isDark } = useTheme();

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
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Usuń wpis', 'Czy na pewno chcesz usunąć ten pomiar?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: async () => {
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await deleteEntry(id);
          loadData();
        } 
      }
    ]);
  };

  const handleExportCSV = async () => {
    try {
      if (data.length === 0) {
        Alert.alert('Pusto', 'Brak danych do eksportu.');
        return;
      }
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Eksportuj pomiary cukru',
          });
        } else {
          Alert.alert('Błąd', 'Udostępnianie nie jest dostępne na tym urządzeniu.');
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Błąd', 'Nie udało się wyeksportować pliku.');
    }
  };

  const renderRightActions = (id) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDelete(id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteActionText}>Usuń</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.date);
    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <View style={[styles.itemContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.itemDateContainer, { borderRightColor: theme.border }]}>
            <Text style={[styles.itemDay, { color: theme.text }]}>{date.getDate().toString().padStart(2, '0')}.{(date.getMonth() + 1).toString().padStart(2, '0')}</Text>
            <Text style={[styles.itemTime, { color: theme.textSecondary }]}>{date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={[styles.itemSugar, { color: theme.accent }]}>
              {item.sugarLevel} <Text style={[styles.itemUnit, { color: theme.textSecondary }]}>mg/dL</Text>
            </Text>
            <View style={styles.tagContainer}>
              <View style={[styles.mealTimeTag, { backgroundColor: isDark ? '#334155' : '#F2F2F7' }]}>
                  <Text style={[styles.mealTimeTagText, { color: theme.text }]}>{item.mealTime || 'Na czczo'}</Text>
              </View>
              {item.activityLevel && (
                <View style={[styles.mealTimeTag, { marginLeft: 8, backgroundColor: isDark ? '#075985' : '#E0F2FE' }]}>
                  <Text style={[styles.mealTimeTagText, { color: isDark ? '#BAE6FD' : '#0369A1' }]}>{item.activityLevel}</Text>
                </View>
              )}
            </View>
            {item.mealContent ? (
              <View style={[styles.contextualInfo, { backgroundColor: isDark ? '#0F172A' : '#F9F9FB' }]}>
                <Ionicons name="restaurant-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.contextualText, { color: theme.textSecondary }]}>{item.mealContent}</Text>
              </View>
            ) : null}
            {item.notes ? <Text style={[styles.itemNotes, { color: theme.textSecondary }]}>{item.notes}</Text> : null}
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <GlyseLogo size={50} />
        <Text style={[styles.title, { color: theme.text }]}>Historia</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Pełna historia Twojego zdrowia</Text>
        
        <TouchableOpacity style={[styles.exportButton, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleExportCSV}>
          <Ionicons name="download-outline" size={18} color={theme.accent} />
          <Text style={[styles.exportButtonText, { color: theme.accent }]}>Eksportuj CSV</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={theme.accent} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Brak wpisów</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Twoja historia pomiarów jest jeszcze pusta. Dodaj pierwszy wynik na ekranie "Nowy pomiar".</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 15,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
    marginBottom: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  exportButtonText: {
    color: '#005A9C',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 13,
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  itemContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteAction: {
    backgroundColor: '#ff4b4b',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 20,
    marginBottom: 16,
    marginLeft: 10,
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4,
  },
  itemDateContainer: {
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
    paddingRight: 20,
  },
  itemDay: {
    color: '#003355',
    fontSize: 18,
    fontWeight: '700',
  },
  itemTime: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemSugar: {
    fontSize: 24,
    fontWeight: '800',
    color: '#005A9C',
  },
  itemUnit: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  mealTimeTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mealTimeTagText: {
    fontSize: 10,
    color: '#003355',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemNotes: {
    color: '#666',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  contextualInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#F9F9FB',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  contextualText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003355',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  }
});
