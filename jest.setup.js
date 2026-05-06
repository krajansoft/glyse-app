jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' }
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart'
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue()
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test-directory/',
  writeAsStringAsync: jest.fn().mockResolvedValue(),
  EncodingType: { UTF8: 'utf8' }
}));

jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Path: 'Path',
  Circle: 'Circle',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop'
}));

jest.mock('./components/GlyseLogo', () => 'GlyseLogo');

global.alert = jest.fn();
