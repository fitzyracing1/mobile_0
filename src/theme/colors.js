export const colors = {
  background: '#0a0a1a',
  surface: '#111128',
  surfaceElevated: '#1a1a35',
  border: '#2a2a4a',

  accent: '#00d4ff',
  accentDim: '#00d4ff22',
  accentMid: '#00d4ff66',

  success: '#00e676',
  successDim: '#00e67622',
  warning: '#ff8c00',
  warningDim: '#ff8c0022',
  error: '#ff4444',
  errorDim: '#ff444422',
  info: '#7c6af7',
  infoDim: '#7c6af722',

  textPrimary: '#ffffff',
  textSecondary: '#9999bb',
  textMuted: '#555577',

  categoryColors: {
    'Version Control': '#f7931e',
    'Runtime Error': '#ff4444',
    'Async': '#7c6af7',
    'Type System': '#00bcd4',
    'Modules': '#8bc34a',
    'Build': '#ff5722',
    'Dependencies': '#ffc107',
    'Performance': '#00e676',
    'Memory': '#e91e63',
    'Auth': '#9c27b0',
    'Network': '#03a9f4',
    'Syntax': '#ff9800',
    'Logic': '#607d8b',
    'Regex': '#795548',
    'Database': '#4caf50',
  },
};

export const severityColors = {
  low: colors.success,
  medium: colors.warning,
  high: colors.error,
  critical: '#ff0055',
};
