import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, severityColors } from '../theme/colors';
import { PROBLEMS } from '../data/problemDatabase';
import { streamAiSolution } from '../services/aiService';
import { markSolved, getApiKey } from '../services/storageService';
import CodeBlock from '../components/CodeBlock';

export default function SolutionScreen({ route, navigation }) {
  const { problemId, historyEntryId, simulated = false, fromHistory = false } = route.params;
  const problem = PROBLEMS[problemId];

  const [solved, setSolved] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    checkApiKey();
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (hasApiKey && !fromHistory) {
      loadAiSolution();
    }
  }, [hasApiKey]);

  async function checkApiKey() {
    const key = await getApiKey();
    if (isMounted.current) setHasApiKey(!!key);
  }

  async function loadAiSolution() {
    if (!isMounted.current) return;
    setAiLoading(true);
    setAiText('');
    setAiError(null);

    streamAiSolution(
      problem,
      {},
      (chunk, full) => { if (isMounted.current) setAiText(full); },
      (full) => { if (isMounted.current) setAiLoading(false); },
      (err) => {
        if (!isMounted.current) return;
        setAiLoading(false);
        if (err.message === 'NO_API_KEY') {
          setAiError('Add your Anthropic API key in Settings to get AI analysis.');
        } else {
          setAiError(`AI unavailable: ${err.message}`);
        }
      }
    );
  }

  async function handleMarkSolved() {
    await markSolved(historyEntryId, !solved);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSolved(!solved);
  }

  if (!problem) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.error}>
          <Text style={styles.errorText}>Problem not found: {problemId}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.accent }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const catColor = colors.categoryColors[problem.category] ?? colors.accent;
  const sevColor = severityColors[problem.severity] ?? colors.textMuted;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>{problem.icon}</Text>
          <View style={styles.heroBadges}>
            <View style={[styles.badge, { backgroundColor: catColor + '22', borderColor: catColor + '55' }]}>
              <Text style={[styles.badgeText, { color: catColor }]}>{problem.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: sevColor + '22', borderColor: sevColor + '55' }]}>
              <Text style={[styles.badgeText, { color: sevColor }]}>
                {problem.severity} severity
              </Text>
            </View>
            {simulated && (
              <View style={[styles.badge, { backgroundColor: colors.infoDim, borderColor: colors.info + '55' }]}>
                <Text style={[styles.badgeText, { color: colors.info }]}>demo</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroTitle}>{problem.title}</Text>
          <Text style={styles.heroDesc}>{problem.description}</Text>
        </View>

        {/* Symptoms */}
        <Section title="Symptoms" icon="🩺">
          {problem.symptoms.map((s, i) => (
            <View key={i} style={styles.symptomRow}>
              <Text style={styles.bullet}>›</Text>
              <Text style={styles.symptomText}>{s}</Text>
            </View>
          ))}
        </Section>

        {/* Quick Fixes */}
        <Section title="Quick Fixes" icon="⚡">
          {problem.quickFixes.map((fix) => (
            <TouchableOpacity
              key={fix.step}
              style={[styles.fixCard, expandedStep === fix.step && styles.fixCardOpen]}
              onPress={() => setExpandedStep(expandedStep === fix.step ? null : fix.step)}
              activeOpacity={0.75}
            >
              <View style={styles.fixHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>{fix.step}</Text>
                </View>
                <Text style={styles.fixTitle} numberOfLines={expandedStep === fix.step ? 0 : 1}>
                  {fix.title}
                </Text>
                <Text style={[styles.chevron, expandedStep === fix.step && styles.chevronOpen]}>
                  ›
                </Text>
              </View>
              {expandedStep === fix.step && (
                <View style={styles.fixBody}>
                  <Text style={styles.fixDesc}>{fix.description}</Text>
                  <CodeBlock code={fix.code} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Section>

        {/* AI Analysis */}
        <Section title="AI Analysis" icon="🤖">
          {aiLoading && (
            <View style={styles.aiLoading}>
              <ActivityIndicator color={colors.accent} size="small" />
              <Text style={styles.aiLoadingText}>Claude is analyzing…</Text>
            </View>
          )}

          {aiText && !aiLoading && (
            <View style={styles.aiContent}>
              <AiMarkdown text={aiText} />
            </View>
          )}

          {aiError && (
            <View style={styles.aiError}>
              <Text style={styles.aiErrorText}>{aiError}</Text>
              {!hasApiKey && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Settings')}
                  style={styles.configBtn}
                >
                  <Text style={styles.configBtnText}>Configure API Key →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {hasApiKey && fromHistory && !aiText && !aiLoading && (
            <TouchableOpacity style={styles.reloadBtn} onPress={loadAiSolution}>
              <Text style={styles.reloadText}>✦ Get AI Analysis</Text>
            </TouchableOpacity>
          )}
        </Section>

        {/* Resources */}
        {problem.resources?.length > 0 && (
          <Section title="Resources" icon="📖">
            {problem.resources.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.resourceRow}
                onPress={() => Linking.openURL(r.url)}
              >
                <Text style={styles.resourceText}>{r.title}</Text>
                <Text style={styles.resourceArrow}>↗</Text>
              </TouchableOpacity>
            ))}
          </Section>
        )}

        {/* Mark Solved */}
        <TouchableOpacity
          style={[styles.solveBtn, solved && styles.solveBtnSolved]}
          onPress={handleMarkSolved}
          activeOpacity={0.8}
        >
          <Text style={[styles.solveBtnText, solved && styles.solveBtnTextSolved]}>
            {solved ? '✓ Marked as Solved' : 'Mark as Solved'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, icon, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function AiMarkdown({ text }) {
  const segments = text.split(/(```[\s\S]*?```)/g).filter(Boolean);
  return (
    <View>
      {segments.map((seg, i) => {
        if (seg.startsWith('```')) {
          const lines = seg.split('\n');
          const lang = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return <CodeBlock key={i} code={code} language={lang} />;
        }
        return (
          <Text key={i} style={styles.aiParagraph}>
            {seg.trim()}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  hero: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  heroIcon: { fontSize: 52, marginBottom: 12 },
  heroBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { fontSize: 16, marginRight: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },

  symptomRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { color: colors.accent, fontSize: 16, marginRight: 8, lineHeight: 20 },
  symptomText: { color: colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 20 },

  fixCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fixCardOpen: { borderColor: colors.accentMid },
  fixHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.accentMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNum: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  fixTitle: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  chevron: { color: colors.textMuted, fontSize: 20, transform: [{ rotate: '0deg' }] },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
  fixBody: { paddingHorizontal: 14, paddingBottom: 14 },
  fixDesc: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, lineHeight: 19 },

  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiLoadingText: { color: colors.textSecondary, fontSize: 14 },
  aiContent: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  aiParagraph: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  aiError: {
    backgroundColor: colors.errorDim,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.error + '44',
  },
  aiErrorText: { color: colors.error, fontSize: 13, marginBottom: 10 },
  configBtn: {
    backgroundColor: colors.accentDim,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentMid,
  },
  configBtnText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  reloadBtn: {
    backgroundColor: colors.accentDim,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentMid,
  },
  reloadText: { color: colors.accent, fontSize: 14, fontWeight: '600' },

  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceText: { color: colors.accent, fontSize: 14 },
  resourceArrow: { color: colors.textMuted, fontSize: 16 },

  solveBtn: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  solveBtnSolved: {
    backgroundColor: colors.successDim,
    borderColor: colors.success + '66',
  },
  solveBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
  solveBtnTextSolved: { color: colors.success },

  error: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { color: colors.error, fontSize: 16 },
});
