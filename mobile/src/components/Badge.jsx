import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { fontSize, borderRadius } from '../constants/layout';

export default function Badge({ label, color, bgColor, size = 'sm' }) {
  const isSmall = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor || '#dcfce7',
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: color || '#16a34a',
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
