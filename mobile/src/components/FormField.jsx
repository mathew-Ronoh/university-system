import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/layout';

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
  numberOfLines,
  required,
  error,
  editable = true,
  autoCapitalize,
}) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.red[500],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.red[500],
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.gray[500],
  },
  error: {
    color: colors.red[500],
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
