import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import NfcAnimation from '../components/NfcAnimation';
import { colors } from '../theme/colors';
import { readNfcTag, cancelNfcScan, isNfcSupported } from '../services/nfcService';
import { detectProblem, randomProblem } from '../utils/problemDetector';
import { saveScan, getSettings } from '../services/storageService';
import { PROBLEMS } from '../data/problemDatabase';

const STATUS = {
  WAITING: 'waiting',
  SCANNING: 'scanning',
  SUCCESS: 'success',
  ERROR: 'error',
  NO_NFC: 'no_nfc',
};

export default function ScanScreen({ navigation }) {
  const [status, setStatus] = useState(STATUS.WAITING);
  const [statusText, setStatusText] = useState('Ready to scan');
  const [demoMode, setDemoMode] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    startScan();
    return () => {
      isMounted.current = false;
      cancelNfcScan();
    };
  }, []);

  async function startScan() {
    const settings = await getSettings();
    const nfcSupported = await isNfcSupported();

    if (!nfcSupported || settings.demoMode) {
      setDemoMode(true);
      setStatus(STATUS.SCANNING);
      setStatusText('Demo mode — simulating NFC scan…');
      // Simulate a 2-second scan delay
      setTimeout(() => simulateScan(), 2000);
      return;
    }

    setStatus(STATUS.SCANNING);
    setStatusText('Hold an NFC tag near the top of your phone');

    try {
      const rawPayload = await readNfcTag();
      if (!isMounted.current) return;
      await handleTagRead(rawPayload);
    } catch (err) {
      if (!isMounted.current) return;
      if (err.message?.includes('cancelled') || err.message?.includes('cancel')) {
        navigation.goBack();
        return;
      }
      setStatus(STATUS.ERROR);
      setStatusText(`Read failed: ${err.message}`);
    }
  }

  async function simulateScan() {
    if (!isMounted.current) return;
    const problem = randomProblem();
    await handleProblem(problem, true);
  }

  async function handleTagRead(rawPayload) {
    setStatusText('Reading tag…');
    const problem = detectProblem(rawPayload);

    if (!problem) {
      setStatus(STATUS.ERROR);
      setStatusText(`Unknown tag: "${rawPayload}"\nCheck tag format.`);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await handleProblem(problem, false);
  }

  async function handleProblem(problem, simulated) {
    setStatus(STATUS.SUCCESS);
    setStatusText(`Detected: ${problem.title}`);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = await saveScan(problem);

    // Brief success flash, then navigate
    setTimeout(() => {
      if (!isMounted.current) return;
      navigation.replace('Solution', {
        problemId: problem.id,
        historyEntryId: entry.id,
        simulated,
      });
    }, 900);
  }

  function handleCancel() {
    cancelNfcScan();
    navigation.goBack();
  }

  function handleRetry() {
    setStatus(STATUS.WAITING);
    setStatusText('Ready to scan');
    startScan();
  }

  const animColor =
    status === STATUS.SUCCESS
      ? colors.success
      : status === STATUS.ERROR
      ? colors.error
      : colors.accent;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {demoMode ? '🎮 Demo Scan' : '📡 NFC Scan'}
        </Text>

        <View style={styles.animContainer}>
          <NfcAnimation
            status={
              status === STATUS.SCANNING
                ? 'scanning'
                : status === STATUS.SUCCESS
                ? 'success'
                : status === STATUS.ERROR
                ? 'error'
                : 'idle'
            }
            size={220}
          />
        </View>

        <Text style={[styles.statusText, { color: animColor }]}>{statusText}</Text>

        {status === STATUS.ERROR && (
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {/* Problem ID reference */}
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Supported problem IDs</Text>
          <Text style={styles.hintText}>
            {Object.keys(PROBLEMS).join(' · ')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  animContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  retryBtn: {
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.accentMid,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  retryText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hintTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
