import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { authApi } from '@/domains/auth/api/auth-api';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { t: translate } = useTranslation(['auth', 'errors']);
  const [userId, setUserId] = useState(route.params?.userId ?? '');
  const [token, setToken] = useState(route.params?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setError('');
    setMessage('');
    if (password !== confirmPassword) {
      setError(translate('auth:confirmPasswordMismatch'));
      return;
    }

    try {
      await authApi.resetPassword({ userId, token, newPassword: password });
      setMessage(translate('auth:resetPasswordSuccess'));
      navigation.navigate('Login');
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    }
  };

  return (
    <Screen title={translate('auth:resetPasswordTitle')} subtitle={translate('auth:resetPasswordSubtitle')}>
      <View style={styles.card}>
        <Text style={styles.label}>{translate('auth:resetUserId')}</Text>
        <TextInput style={styles.input} value={userId} onChangeText={setUserId} autoCapitalize="none" />
        <Text style={styles.label}>{translate('auth:resetToken')}</Text>
        <TextInput style={styles.input} value={token} onChangeText={setToken} autoCapitalize="none" />
        <Text style={styles.label}>{translate('auth:newPassword')}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.label}>{translate('auth:confirmPassword')}</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        {message.length > 0 && <Text>{message}</Text>}
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submit}>
          <Text style={styles.btnText}>{translate('auth:resetPasswordButton')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnText}>{translate('auth:backToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
