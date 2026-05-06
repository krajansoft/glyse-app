import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function GlyseLogo({ size = 40, showText = true, orientation = 'horizontal' }) {
    // Reverting to the symmetric SVG version (v1)
    return (
        <View style={[
            styles.container, 
            orientation === 'vertical' ? styles.vertical : styles.horizontal
        ]}>
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Defs>
                    <LinearGradient id="premium_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0" stopColor="#003355" />
                        <Stop offset="0.5" stopColor="#005A9C" />
                        <Stop offset="1" stopColor="#0077CC" />
                    </LinearGradient>
                    <LinearGradient id="glow_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0" stopColor="#34D399" />
                        <Stop offset="1" stopColor="#10B981" />
                    </LinearGradient>
                </Defs>
                {/* Outer Ring */}
                <Path 
                    d="M50,5 C25.1,5 5,25.1 5,50 C5,74.9 25.1,95 50,95 C74.9,95 95,74.9 95,50 C95,25.1 74.9,5 50,5 Z M50,85 C30.7,85 15,69.3 15,50 C15,30.7 30.7,15 50,15 C69.3,15 85,30.7 85,50 C85,69.3 69.3,85 50,85 Z" 
                    fill="url(#premium_grad)" 
                />
                {/* Dynamic Inner Element */}
                <Path 
                    d="M50,30 C39,30 30,39 30,50 C30,61 39,70 50,70 C61,70 70,61 70,50 C70,39 61,30 50,30 Z M50,62 C43.4,62 38,56.6 38,50 C38,43.4 43.4,38 50,38 C56.6,38 62,43.4 62,50 C62,56.6 56.6,62 50,62 Z" 
                    fill="url(#premium_grad)" 
                    opacity="0.8"
                />
                <Circle cx="50" cy="50" r="6" fill="url(#glow_grad)" />
            </Svg>
            
            {showText && (
                <Text style={[
                    styles.text, 
                    { fontSize: size * 0.6 },
                    orientation === 'vertical' ? { marginTop: 12 } : { marginLeft: 12 }
                ]}>
                    GLYSE
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
    horizontal: { flexDirection: 'row' },
    vertical: { flexDirection: 'column' },
    text: {
        fontWeight: '600',
        letterSpacing: 3,
        color: '#003355',
        fontFamily: 'System',
        textTransform: 'uppercase',
        opacity: 0.95 // Delikatne zmiękczenie koloru
    }
});
