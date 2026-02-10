import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_KEY = 'education_device_id';

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_KEY);
  if (existing) {
    return existing;
  }

  const generated = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await AsyncStorage.setItem(DEVICE_KEY, generated);
  return generated;
}
