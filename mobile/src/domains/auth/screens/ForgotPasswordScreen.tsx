import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { authApi } from '@/domains/auth/api/auth-api';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['auth', 'errors', 'app']);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setMessage('');
    try {
      await authApi.forgotPassword({ email, client: 'mobile' });
      setMessage(translate('auth:forgotPasswordSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    }
  };

  return (
    <Screen title={translate('auth:forgotPasswordTitle')} subtitle={translate('auth:forgotPasswordSubtitle')}>
      <View style={styles.card}>
        <Text style={styles.label}>{translate('auth:email')}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        {message.length > 0 && <Text>{message}</Text>}
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submit}>
          <Text style={styles.btnText}>{translate('auth:forgotPasswordButton')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={() => navigation.navigate('ResetPassword')}
        >
          <Text style={styles.btnText}>{translate('auth:resetPasswordTitle')}</Text>
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
