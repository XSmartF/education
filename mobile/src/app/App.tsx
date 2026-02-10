import '@/shared/i18n';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from './Screen';
import LoginScreen from '@/domains/auth/screens/LoginScreen';
import RegisterScreen from '@/domains/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '@/domains/auth/screens/ForgotPasswordScreen';
import ResetPasswordScreen from '@/domains/auth/screens/ResetPasswordScreen';
import TodosScreen from '@/domains/todos/screens/TodosScreen';
import TodoDetailScreen from '@/domains/todos/screens/TodoDetailScreen';
import type { RootStackParamList } from './types';
import { useAuth } from '@/domains/auth/hooks/use-auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { t: translate } = useTranslation(['app', 'common']);
  const auth = useAuth();

  if (auth.loading) {
    return (
      <Screen title={translate('app:title')} subtitle={translate('common:loading')}>
        <Text>{translate('common:loading')}</Text>
      </Screen>
    );
  }

  return (
    <NavigationContainer>
      {auth.isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Todos" component={TodosScreen} />
          <Stack.Screen name="TodoDetail" component={TodoDetailScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
