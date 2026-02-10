import { useAuth } from '@/domains/auth/hooks/use-auth';
import { AuthPanel } from '@/domains/auth/ui/AuthPanel';
import { Screen } from '@/app/Screen';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/types';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['app', 'auth']);
  const auth = useAuth();

  return (
    <Screen title={translate('app:title')} subtitle={translate('auth:loginSubtitle')}>
      <AuthPanel
        onAuth={(session) => auth.saveSession(session)}
        mode="login"
        onModeChange={() => navigation.navigate('Register')}
      />
      <TouchableOpacity
        style={[styles.btn, styles.btnGhost]}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.btnText}>{translate('auth:forgotPasswordLink')}</Text>
      </TouchableOpacity>
    </Screen>
  );
}
