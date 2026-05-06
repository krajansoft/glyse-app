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
            <Svg width={size} height={size} viewBox="0 0 24 24">
                <Defs>
                    <LinearGradient id="glyse_gradient_v1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0" stopColor="#003355" />
                        <Stop offset="1" stopColor="#005A9C" />
                    </LinearGradient>
                </Defs>
                <Path 
                    d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10c5.52,0 10,-4.48 10,-10S17.52,2 12,2zM12,18c-3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6 6,2.69 6,6 -2.69,6 -6,6z" 
                    fill="url(#glyse_gradient_v1)" 
                />
                <Circle cx="12" cy="12" r="1.5" fill="#34D399" />
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
