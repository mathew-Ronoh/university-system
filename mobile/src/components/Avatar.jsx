import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { getInitials } from '../utils/format';

export default function Avatar({ firstName, lastName, avatarUrl, size = 40 }) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
        {getInitials(firstName, lastName)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.gray[100],
  },
  placeholder: {
    backgroundColor: colors.maroon[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.maroon[600],
    fontWeight: '700',
  },
});
