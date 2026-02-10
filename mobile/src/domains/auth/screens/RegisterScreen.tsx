import { useAuth } from '@/domains/auth/hooks/use-auth';
import { AuthPanel } from '@/domains/auth/ui/AuthPanel';
import { Screen } from '@/app/Screen';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['app', 'auth']);
  const auth = useAuth();

  return (
    <Screen title={translate('app:title')} subtitle={translate('auth:registerSubtitle')}>
      <AuthPanel
        onAuth={(session) => auth.saveSession(session)}
        mode="register"
        onModeChange={() => navigation.navigate('Login')}
      />
    </Screen>
  );
}
