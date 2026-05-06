import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
const THEME_KEY = '@glyse_theme_mode';

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('auto'); // 'light', 'dark', 'auto'
    const [currentTheme, setCurrentTheme] = useState('light');

    const themes = {
        light: {
            background: '#F8F9FA',
            card: '#FFFFFF',
            text: '#003355',
            textSecondary: '#666666',
            accent: '#005A9C',
            border: '#F2F2F7',
            tabBar: '#003355',
            statusBar: 'dark-content',
            statusBg: '#003355'
        },
        dark: {
            background: '#0F172A',
            card: '#1E293B',
            text: '#F8FAFC',
            textSecondary: '#94A3B8',
            accent: '#38BDF8',
            border: '#334155',
            tabBar: '#0F172A',
            statusBar: 'light-content',
            statusBg: '#0F172A'
        }
    };

    // Load persisted theme
    useEffect(() => {
        const loadPersistedTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_KEY);
                if (saved) setThemeMode(saved);
            } catch (e) {
                console.error('Failed to load theme', e);
            }
        };
        loadPersistedTheme();
    }, []);

    // Save theme when it changes
    useEffect(() => {
        const saveTheme = async () => {
            try {
                await AsyncStorage.setItem(THEME_KEY, themeMode);
            } catch (e) {
                console.error('Failed to save theme', e);
            }
        };
        saveTheme();
    }, [themeMode]);

    useEffect(() => {
        const checkTheme = () => {
            if (themeMode === 'auto') {
                const hour = new Date().getHours();
                // Dark mode after 22:00 or before 06:00
                if (hour >= 22 || hour < 6) {
                    setCurrentTheme('dark');
                } else {
                    setCurrentTheme('light');
                }
            } else {
                setCurrentTheme(themeMode);
            }
        };

        checkTheme();
        const timer = setInterval(checkTheme, 60000); // Re-check every minute
        return () => clearInterval(timer);
    }, [themeMode]);

    const toggleTheme = () => {
        setThemeMode(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'auto';
            return 'light';
        });
    };

    return (
        <ThemeContext.Provider value={{ 
            theme: themes[currentTheme], 
            themeMode, 
            setThemeMode, 
            toggleTheme,
            isDark: currentTheme === 'dark' 
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
