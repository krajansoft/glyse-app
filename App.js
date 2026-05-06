import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './screens/DashboardScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import HistoryScreen from './screens/HistoryScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  if (!isAuthenticated) {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle="light-content" backgroundColor="#003355" />
            <LoginScreen onLogin={() => setIsAuthenticated(true)} />
        </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f13" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#003355',
              borderTopColor: '#002244',
              height: 70,
              paddingBottom: 10,
              paddingTop: 10,
            },
            tabBarActiveTintColor: '#34D399',
            tabBarInactiveTintColor: '#A0B3C6',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              } else if (route.name === 'Add') {
                iconName = focused ? 'add-circle' : 'add-circle-outline';
              } else if (route.name === 'History') {
                iconName = focused ? 'list-circle' : 'list-circle-outline';
              } else if (route.name === 'Reports') {
                iconName = focused ? 'document-text' : 'document-text-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={28} color={color} />;
            },
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ tabBarLabel: 'Panel' }}
          />
          <Tab.Screen 
            name="Add" 
            component={AddEntryScreen} 
            options={{ tabBarLabel: 'Dodaj Wynik' }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen} 
            options={{ tabBarLabel: 'Historia' }}
          />
          <Tab.Screen 
            name="Reports" 
            component={ReportsScreen} 
            options={{ tabBarLabel: 'Raporty' }}
          />
          <Tab.Screen 
            name="Settings" 
            options={{ tabBarLabel: 'Opcje' }}
          >
            {props => <SettingsScreen {...props} onLogout={() => setIsAuthenticated(false)} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
