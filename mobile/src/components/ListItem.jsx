import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/layout';

export default function ListItem({
  label,
  value,
  onPress,
  right,
  subtitle,
  labelStyle,
  valueStyle,
}) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.left}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {value ? <Text style={[styles.value, valueStyle]}>{value}</Text> : null}
        {right}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: fontSize.md,
    color: colors.gray[700],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    marginTop: 2,
  },
  value: {
    fontSize: fontSize.md,
    color: colors.gray[900],
    fontWeight: '600',
  },
});
