import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { spacing, borderRadius } from '../constants/layout';

export default function Card({ children, style, padding = true }) {
  return (
    <View style={[styles.card, padding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  padding: {
    padding: spacing.lg,
  },
});
