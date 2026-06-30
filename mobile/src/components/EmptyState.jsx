import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { spacing, fontSize } from '../constants/layout';

export default function EmptyState({ message = 'No data available.', icon = '📭' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  text: {
    color: colors.gray[500],
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
