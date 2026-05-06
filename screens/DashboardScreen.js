import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { getData, getTargets } from '../utils/storage';
import { calculateMedicalStats } from '../utils/medicalCalculations';
import GlyseLogo from '../components/GlyseLogo';

const screenWidth = Dimensions.get('window').width;

const FILTERS = ['Wszystkie', 'Na czczo', 'Przed posiłkiem', '2h po posiłku', 'Przed snem'];

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [targets, setTargets] = useState({ min: 70, max: 180 });
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Wszystkie');

  const loadData = async () => {
    const stored = await getData();
    const tData = await getTargets();
    setData(stored);
    setTargets(tData);
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

  const handleFilterPress = (filter) => {
    setActiveFilter(filter);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const filteredData = data.filter(item => {
    if (activeFilter === 'Wszystkie') return true;
    return item.mealTime === activeFilter;
  });

  const getChartData = () => {
    if (filteredData.length === 0) return null;
    const sorted = [...filteredData].reverse();
    return {
      labels: sorted.slice(-6).map(d => {
        const date = new Date(d.date);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }),
      datasets: [{ data: sorted.slice(-6).map(d => d.sugarLevel) }]
    };
  };

  const medicalStats = calculateMedicalStats(data, targets);
  const chartData = getChartData();

  const calculateTIRData = () => {
    if (data.length === 0) return [];
    return [
      { name: 'W normie', population: medicalStats.tir, color: '#34D399', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'Wysokie', population: medicalStats.tar, color: '#FFB347', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'Niskie', population: medicalStats.tbr, color: '#FF3B30', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    ];
  };

  const tirData = calculateTIRData();

  return (
    <View style={styles.outerContainer}>
      <ScrollView 
          style={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <View style={styles.header}>
          <GlyseLogo size={50} />
          <Text style={styles.title}>Panel Wyników</Text>
          <Text style={styles.subtitle}>Twoje aktualne statystyki kliniczne</Text>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map(filter => (
              <TouchableOpacity 
                key={filter} 
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => handleFilterPress(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsContainer}>
            <View style={styles.statBoxMain}>
                <Text style={styles.statLabelMain}>Szacowane HbA1c</Text>
                <Text style={styles.statValueMain}>{medicalStats.hba1c}%</Text>
                <Text style={styles.statSubValue}>Średni cukier: {medicalStats.average} mg/dL</Text>
            </View>
        </View>

        {data.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Analiza Time in Range (TIR)</Text>
            <PieChart
              data={tirData}
              width={screenWidth - 80}
              height={180}
              chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trend Glikemii</Text>
          {chartData ? (
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 90, 156, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 51, 85, ${opacity})`,
                propsForDots: { r: "6", strokeWidth: "2", stroke: "#005A9C" }
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="stats-chart" size={48} color="#003355" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>Brak danych do wyświetlenia trendu.</Text>
            </View>
          )}
        </View>
        
        <View style={{ height: 100 }} /> 
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Add')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
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
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterChipActive: {
    backgroundColor: '#005A9C',
    borderColor: '#005A9C',
  },
  filterText: {
    color: '#003355',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statBoxMain: {
    backgroundColor: '#003355',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  statLabelMain: {
    color: '#A0B3C6',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValueMain: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    marginVertical: 8,
  },
  statSubValue: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003355',
    marginBottom: 16,
  },
  emptyChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#005A9C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#005A9C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }
});
