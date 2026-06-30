import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/layout';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.red[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  text: {
    color: colors.red[700],
    fontSize: fontSize.sm,
  },
});
