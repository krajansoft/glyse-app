import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { getData, deleteEntry } from '../utils/storage';
import GlyseLogo from '../components/GlyseLogo';

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
        <View style={styles.itemContainer}>
          <View style={styles.itemDateContainer}>
            <Text style={styles.itemDay}>{date.getDate().toString().padStart(2, '0')}.{(date.getMonth() + 1).toString().padStart(2, '0')}</Text>
            <Text style={styles.itemTime}>{date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemSugar}>
              {item.sugarLevel} <Text style={styles.itemUnit}>mg/dL</Text>
            </Text>
            <View style={styles.tagContainer}>
              <View style={styles.mealTimeTag}>
                  <Text style={styles.mealTimeTagText}>{item.mealTime || 'Na czczo'}</Text>
              </View>
            </View>
            {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GlyseLogo size={50} />
        <Text style={styles.title}>Historia</Text>
        <Text style={styles.subtitle}>Pełna historia Twojego zdrowia</Text>
        
        <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
          <Ionicons name="download-outline" size={18} color="#005A9C" />
          <Text style={styles.exportButtonText}>Eksportuj CSV</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#003355" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>Brak wpisów</Text>
            <Text style={styles.emptyText}>Twoja historia pomiarów jest jeszcze pusta. Dodaj pierwszy wynik na ekranie "Nowy pomiar".</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000',
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
