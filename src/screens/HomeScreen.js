import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { colors, severityColors } from '../theme/colors';
import { getHistory, getTodayStats } from '../services/storageService';
import { isNfcSupported, isNfcEnabled } from '../services/nfcService';

export default function HomeScreen({ navigation }) {
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({ scanned: 0, solved: 0 });
  const [nfcAvailable, setNfcAvailable] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    checkNfc();
  }, []);

  async function checkNfc() {
    const supported = await isNfcSupported();
    const enabled = supported ? await isNfcEnabled() : false;
    setNfcAvailable(supported && enabled);
  }

  async function loadData() {
    const [history, todayStats] = await Promise.all([getHistory(), getTodayStats()]);
    setRecentScans(history.slice(0, 5));
    setStats(todayStats);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function handleScan() {
    navigation.navigate('Scan');
  }

  function handleHistoryItem(item) {
    navigation.navigate('Solution', {
      problemId: item.problemId,
      historyEntryId: item.id,
      fromHistory: true,
    });
  }

  const solveRate =
    stats.scanned > 0 ? Math.round((stats.solved / stats.scanned) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>NFC Coder</Text>
            <Text style={styles.subtitle}>Tap a tag. Fix the bug.</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsBtn}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* NFC Warning */}
        {nfcAvailable === false && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ NFC is not available. Demo mode active — tap Scan to simulate.
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Today's scans" value={stats.scanned} color={colors.accent} />
          <StatCard label="Solved" value={stats.solved} color={colors.success} />
          <StatCard label="Solve rate" value={`${solveRate}%`} color={colors.info} />
        </View>

        {/* Big Scan Button */}
        <TouchableOpacity onPress={handleScan} activeOpacity={0.85} style={styles.scanWrapper}>
          <LinearGradient
            colors={['#00d4ff22', '#00d4ff08', '#00d4ff00']}
            style={styles.scanGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <View style={styles.scanBtn}>
              <Text style={styles.scanIcon}>📡</Text>
              <Text style={styles.scanTitle}>Scan NFC Tag</Text>
              <Text style={styles.scanHint}>
                {nfcAvailable
                  ? 'Hold a problem card near your phone'
                  : 'Demo: simulates a random problem'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Problems</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            {recentScans.map((item) => (
              <RecentItem key={item.id} item={item} onPress={() => handleHistoryItem(item)} />
            ))}
          </View>
        )}

        {recentScans.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No problems scanned yet</Text>
            <Text style={styles.emptyText}>
              Program NFC tags with problem IDs (e.g. "git-conflict") and tap scan to begin.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '44' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RecentItem({ item, onPress }) {
  const sevColor = severityColors[item.severity] ?? colors.textMuted;
  const timeAgo = formatTimeAgo(item.scannedAt);
  return (
    <TouchableOpacity style={styles.recentItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.recentIcon}>{item.icon}</Text>
      <View style={styles.recentBody}>
        <Text style={styles.recentTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.recentMeta}>
          {item.category} · {timeAgo}
        </Text>
      </View>
      <View style={styles.recentRight}>
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

function formatTimeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  settingsBtn: { padding: 4 },
  settingsIcon: { fontSize: 22 },

  warningBanner: {
    backgroundColor: colors.warningDim,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning + '44',
  },
  warningText: { color: colors.warning, fontSize: 13 },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  scanWrapper: { marginBottom: 28 },
  scanGradient: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.accentMid,
  },
  scanBtn: {
    padding: 32,
    alignItems: 'center',
  },
  scanIcon: { fontSize: 48, marginBottom: 12 },
  scanTitle: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  scanHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: { color: colors.accent, fontSize: 13 },

  recentItem: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentIcon: { fontSize: 22, marginRight: 10 },
  recentBody: { flex: 1 },
  recentTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  recentMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  recentRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  solvedBadge: {
    backgroundColor: colors.successDim,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solvedText: { color: colors.success, fontSize: 11, fontWeight: '700' },
  sevDot: { width: 8, height: 8, borderRadius: 4 },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
