import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { getData, getTargets } from '../utils/storage';
import { calculateMedicalStats } from '../utils/medicalCalculations';
import GlyseLogo from '../components/GlyseLogo';
import { useTheme } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const FILTERS = ['Wszystkie', 'Na czczo', 'Przed posiłkiem', '2h po posiłku', 'Przed snem'];

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [targets, setTargets] = useState({ min: 70, max: 180 });
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Wszystkie');
  const { theme, toggleTheme, themeMode, isDark } = useTheme();

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
      { name: 'W normie', population: medicalStats.tir, color: '#34D399', legendFontColor: theme.textSecondary, legendFontSize: 12 },
      { name: 'Wysokie', population: medicalStats.tar, color: '#FFB347', legendFontColor: theme.textSecondary, legendFontSize: 12 },
      { name: 'Niskie', population: medicalStats.tbr, color: '#FF3B30', legendFontColor: theme.textSecondary, legendFontSize: 12 },
    ];
  };

  const tirData = calculateTIRData();

  const getThemeIcon = () => {
    if (themeMode === 'light') return 'sunny';
    if (themeMode === 'dark') return 'moon';
    return 'time-outline';
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <ScrollView 
          style={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <GlyseLogo size={50} />
            <TouchableOpacity style={[styles.themeToggle, { backgroundColor: isDark ? '#334155' : '#F2F2F7' }]} onPress={toggleTheme}>
                <Ionicons name={getThemeIcon()} size={20} color={theme.accent} />
                <Text style={[styles.themeToggleText, { color: theme.text }]}>
                    {themeMode === 'auto' ? 'Auto' : themeMode === 'light' ? 'Jasny' : 'Ciemny'}
                </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Panel Wyników</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Twoje aktualne statystyki kliniczne</Text>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map(filter => (
              <TouchableOpacity 
                key={filter} 
                style={[
                    styles.filterChip, 
                    { backgroundColor: theme.card, borderColor: theme.border },
                    activeFilter === filter && { backgroundColor: theme.accent, borderColor: theme.accent }
                ]}
                onPress={() => handleFilterPress(filter)}
              >
                <Text style={[
                    styles.filterText, 
                    { color: theme.text },
                    activeFilter === filter && { color: '#FFFFFF' }
                ]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsContainer}>
            <View style={[styles.statBoxMain, { backgroundColor: isDark ? theme.card : '#003355', borderWidth: isDark ? 1 : 0, borderColor: theme.border }]}>
                <Text style={[styles.statLabelMain, { color: isDark ? theme.textSecondary : '#A0B3C6' }]}>Szacowane HbA1c</Text>
                <Text style={[styles.statValueMain, { color: isDark ? theme.accent : '#FFFFFF' }]}>{medicalStats.hba1c}%</Text>
                <Text style={styles.statSubValue}>Średni cukier: {medicalStats.average} mg/dL</Text>
            </View>
        </View>

        {data.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Analiza Time in Range (TIR)</Text>
            <PieChart
              data={tirData}
              width={screenWidth - 80}
              height={180}
              chartConfig={{ color: (opacity = 1) => theme.text }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Trend Glikemii</Text>
          {chartData ? (
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={220}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.accent,
                labelColor: (opacity = 1) => theme.textSecondary,
                propsForDots: { r: "6", strokeWidth: "2", stroke: theme.accent }
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="stats-chart" size={48} color={theme.accent} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Brak danych do wyświetlenia trendu.</Text>
            </View>
          )}
        </View>
        
        <View style={{ height: 100 }} /> 
      </ScrollView>

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.accent, shadowColor: theme.accent }]} 
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 5,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 13,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statBoxMain: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  statLabelMain: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValueMain: {
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
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }
});
