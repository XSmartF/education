import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth-api';
import type { AuthResponse } from '../model/types';
import { styles } from '@/shared/ui/styles';

type AuthMode = 'login' | 'register';
type UserRole = 'Student' | 'Teacher' | 'Organize';

type Props = {
  onAuth: (session: AuthResponse) => void;
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
};

export function AuthPanel({ onAuth, mode, onModeChange }: Props) {
  const { t: translate } = useTranslation(['auth', 'errors']);
  const [internalMode, setInternalMode] = useState<AuthMode>(mode ?? 'login');
  const activeMode = mode ?? internalMode;
  const setMode = (next: AuthMode) => {
    if (onModeChange) {
      onModeChange(next);
    } else {
      setInternalMode(next);
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [activeMode]);

  const submit = async () => {
    setError('');
    try {
      if (activeMode === 'register') {
        const res = await authApi.register({ email, password, displayName, role });
        onAuth(res);
      } else {
        const res = await authApi.login({ email, password });
        onAuth(res);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.h2}>
        {activeMode === 'login' ? translate('auth:loginTitle') : translate('auth:registerTitle')}
      </Text>
      <Text style={styles.label}>{translate('auth:email')}</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      {activeMode === 'register' && (
        <>
          <Text style={styles.label}>{translate('auth:displayName')}</Text>
          <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />
          <Text style={styles.label}>{translate('auth:roleLabel')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setRole('Student')}>
              <Text style={styles.btnText}>{translate('auth:roleStudent')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setRole('Teacher')}>
              <Text style={styles.btnText}>{translate('auth:roleTeacher')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setRole('Organize')}>
              <Text style={styles.btnText}>{translate('auth:roleOrganize')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>{role}</Text>
        </>
      )}
      <Text style={styles.label}>{translate('auth:password')}</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submit}>
        <Text style={styles.btnText}>
          {activeMode === 'login'
            ? translate('auth:loginButton')
            : translate('auth:registerButton')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnGhost]}
        onPress={() => setMode(activeMode === 'login' ? 'register' : 'login')}
      >
        <Text style={styles.btnText}>
          {activeMode === 'login'
            ? translate('auth:switchToRegister')
            : translate('auth:switchToLogin')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
