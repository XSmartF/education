// Jest setup: mock native AsyncStorage for tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// existing testing library setup
import '@testing-library/react-native/extend-expect';
