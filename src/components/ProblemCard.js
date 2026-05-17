import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, severityColors } from '../theme/colors';

export default function ProblemCard({ problem, onPress, compact = false }) {
  const catColor = colors.categoryColors[problem.category] ?? colors.accent;
  const sevColor = severityColors[problem.severity] ?? colors.textMuted;

  if (compact) {
    return (
      <TouchableOpacity style={styles.compact} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.compactIcon}>{problem.icon}</Text>
        <View style={styles.compactBody}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {problem.title}
          </Text>
          <Text style={[styles.compactCat, { color: catColor }]}>{problem.category}</Text>
        </View>
        <View style={[styles.sevDot, { backgroundColor: sevColor }]} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.topRow}>
        <Text style={styles.icon}>{problem.icon}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: catColor + '22', borderColor: catColor + '55' }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>{problem.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sevColor + '22', borderColor: sevColor + '55' }]}>
            <Text style={[styles.badgeText, { color: sevColor }]}>{problem.severity}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.title}>{problem.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {problem.description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{problem.quickFixes?.length ?? 0} quick fixes</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  arrow: {
    color: colors.accent,
    fontSize: 20,
    lineHeight: 20,
  },

  // Compact styles
  compact: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  compactBody: {
    flex: 1,
  },
  compactTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  compactCat: {
    fontSize: 11,
    marginTop: 2,
  },
  sevDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
