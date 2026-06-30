import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import colors from '../constants/colors';
import { spacing, fontSize, borderRadius } from '../constants/layout';

export default function ConfirmDialog({ visible, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', destructive }) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          {title && <Text style={styles.title}>{title}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, destructive ? styles.destructiveBtn : styles.confirmBtn]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, destructive && styles.destructiveText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '80%',
    maxWidth: 320,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.gray[600],
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  btn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  cancelBtn: {
    backgroundColor: colors.gray[100],
  },
  confirmBtn: {
    backgroundColor: colors.maroon[900],
  },
  destructiveBtn: {
    backgroundColor: colors.red[600],
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.gray[700],
  },
  confirmText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
  destructiveText: {
    color: colors.white,
  },
});
