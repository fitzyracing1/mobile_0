import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, severityColors } from '../theme/colors';
import { getHistory, clearHistory, deleteHistoryEntry } from '../services/storageService';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [filterSolved, setFilterSolved] = useState(null); // null = all

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    const data = await getHistory();
    setHistory(data);
  }

  async function handleDelete(entryId) {
    await deleteHistoryEntry(entryId);
    setHistory((prev) => prev.filter((e) => e.id !== entryId));
  }

  function confirmClear() {
    Alert.alert(
      'Clear History',
      'Delete all scan history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  }

  const filtered = history.filter((e) => {
    const matchesQuery =
      !query ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.category.toLowerCase().includes(query.toLowerCase());
    const matchesSolved =
      filterSolved === null || e.solved === filterSolved;
    return matchesQuery && matchesSolved;
  });

  function renderItem({ item }) {
    const sevColor = severityColors[item.severity] ?? colors.textMuted;
    const date = new Date(item.scannedAt);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate('Solution', {
            problemId: item.problemId,
            historyEntryId: item.id,
            fromHistory: true,
          })
        }
        onLongPress={() => {
          Alert.alert('Delete Entry', `Remove "${item.title}" from history?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => handleDelete(item.id),
            },
          ]);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.itemIcon}>{item.icon}</Text>
        <View style={styles.itemBody}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.itemMeta}>
            {item.category} · {dateStr} {timeStr}
          </Text>
        </View>
        <View style={styles.itemRight}>
          {item.solved && (
            <View style={styles.solvedBadge}>
              <Text style={styles.solvedText}>✓</Text>
            </View>
          )}
          <View style={[styles.sevDot, { backgroundColor: sevColor }]} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={confirmClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search problems…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <View style={styles.filterRow}>
        {[
          { label: 'All', value: null },
          { label: 'Unsolved', value: false },
          { label: 'Solved', value: true },
        ].map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.filterChip, filterSolved === f.value && styles.filterChipActive]}
            onPress={() => setFilterSolved(f.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterSolved === f.value && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.countText}>{filtered.length} entries</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {history.length === 0 ? 'No scans yet' : 'No results match your filter'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
  clearText: { color: colors.error, fontSize: 14, fontWeight: '600' },

  searchRow: { paddingHorizontal: 20, marginBottom: 10 },
  search: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accentMid,
  },
  filterChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: colors.accent },
  countText: { marginLeft: 'auto', color: colors.textMuted, fontSize: 12 },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  item: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: { fontSize: 22, marginRight: 12 },
  itemBody: { flex: 1 },
  itemTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  itemMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  solvedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.successDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solvedText: { color: colors.success, fontSize: 11, fontWeight: '700' },
  sevDot: { width: 8, height: 8, borderRadius: 4 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
