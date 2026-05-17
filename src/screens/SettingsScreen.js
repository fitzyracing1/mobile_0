import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import {
  saveApiKey,
  getApiKey,
  clearApiKey,
  getSettings,
  saveSettings,
} from '../services/storageService';
import { PROBLEMS } from '../data/problemDatabase';
import { writeNfcTag, isNfcSupported } from '../services/nfcService';

export default function SettingsScreen({ navigation }) {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [settings, setSettings] = useState(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [writingTag, setWritingTag] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [key, s, nfc] = await Promise.all([
      getApiKey(),
      getSettings(),
      isNfcSupported(),
    ]);
    if (key) setSavedKey(key);
    setSettings(s);
    setNfcSupported(nfc);
  }

  async function handleSaveKey() {
    if (!apiKey.trim()) return;
    await saveApiKey(apiKey.trim());
    setSavedKey(apiKey.trim());
    setApiKey('');
    Alert.alert('Saved', 'API key saved successfully.');
  }

  async function handleClearKey() {
    Alert.alert('Remove API Key', 'Remove the saved Anthropic API key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await clearApiKey();
          setSavedKey('');
        },
      },
    ]);
  }

  async function toggleSetting(key, value) {
    const updated = await saveSettings({ [key]: value });
    setSettings(updated);
  }

  async function handleWriteTag(problemId) {
    setWritingTag(problemId);
    try {
      Alert.alert(
        'Write NFC Tag',
        `Hold a writable NFC tag near your phone to program it with "${problemId}"`,
        [{ text: 'OK' }]
      );
      await writeNfcTag(problemId);
      Alert.alert('Success', `Tag programmed with: ${problemId}`);
    } catch (err) {
      Alert.alert('Write Failed', err.message);
    } finally {
      setWritingTag(null);
    }
  }

  if (!settings) return null;

  const maskedKey = savedKey
    ? `${savedKey.slice(0, 7)}…${savedKey.slice(-4)}`
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* API Key */}
        <SettingSection title="AI Configuration">
          <Text style={styles.label}>Anthropic API Key</Text>
          {maskedKey ? (
            <View style={styles.savedKeyRow}>
              <Text style={styles.savedKey}>{maskedKey}</Text>
              <TouchableOpacity onPress={handleClearKey} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.keyRow}>
              <TextInput
                style={styles.input}
                placeholder="sk-ant-api03-…"
                placeholderTextColor={colors.textMuted}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.saveBtn, !apiKey && styles.saveBtnDisabled]}
                onPress={handleSaveKey}
                disabled={!apiKey}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.hint}>
            Get a key at console.anthropic.com. Required for AI-powered solution analysis.
          </Text>
        </SettingSection>

        {/* Preferences */}
        <SettingSection title="Preferences">
          <SettingRow
            label="Haptic feedback"
            description="Vibrate on scan success or error"
            value={settings.hapticFeedback}
            onToggle={(v) => toggleSetting('hapticFeedback', v)}
          />
          <SettingRow
            label="Auto AI analysis"
            description="Automatically call AI when a new tag is scanned"
            value={settings.autoOpenAi}
            onToggle={(v) => toggleSetting('autoOpenAi', v)}
          />
          <SettingRow
            label="Demo mode"
            description="Simulate NFC scans without a real NFC reader"
            value={settings.demoMode}
            onToggle={(v) => toggleSetting('demoMode', v)}
          />
        </SettingSection>

        {/* Tag Writer */}
        {nfcSupported && (
          <SettingSection title="Program NFC Tags">
            <Text style={styles.label}>
              Write a problem ID to a blank NFC tag to create your own problem cards.
            </Text>
            <View style={styles.tagGrid}>
              {Object.values(PROBLEMS).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.tagChip,
                    writingTag === p.id && styles.tagChipActive,
                  ]}
                  onPress={() => handleWriteTag(p.id)}
                  disabled={writingTag !== null}
                >
                  <Text style={styles.tagChipIcon}>{p.icon}</Text>
                  <Text style={styles.tagChipText} numberOfLines={2}>
                    {p.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingSection>
        )}

        {/* About */}
        <SettingSection title="About">
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Problem types</Text>
            <Text style={styles.aboutValue}>{Object.keys(PROBLEMS).length}</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>AI model</Text>
            <Text style={styles.aboutValue}>claude-opus-4-7</Text>
          </View>
        </SettingSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingRow({ label, description, value, onToggle }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingBody}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.accentMid }}
        thumbColor={value ? colors.accent : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },

  section: { marginBottom: 28 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  label: {
    color: colors.textSecondary,
    fontSize: 13,
    padding: 14,
    paddingBottom: 0,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    padding: 14,
    paddingTop: 6,
    lineHeight: 17,
  },

  keyRow: { flexDirection: 'row', padding: 14, gap: 10 },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: 'monospace',
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  saveBtnDisabled: { backgroundColor: colors.accentDim },
  saveBtnText: { color: colors.background, fontWeight: '700', fontSize: 14 },

  savedKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  savedKey: { flex: 1, color: colors.success, fontFamily: 'monospace', fontSize: 13 },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.error + '44',
  },
  removeBtnText: { color: colors.error, fontSize: 13, fontWeight: '600' },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingBody: { flex: 1 },
  settingLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  settingDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 8,
  },
  tagChip: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    width: '47%',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tagChipActive: { borderColor: colors.accentMid, backgroundColor: colors.accentDim },
  tagChipIcon: { fontSize: 20, marginBottom: 4 },
  tagChipText: { color: colors.textSecondary, fontSize: 11, textAlign: 'center' },

  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  aboutLabel: { color: colors.textSecondary, fontSize: 14 },
  aboutValue: { color: colors.textMuted, fontSize: 14 },
});
