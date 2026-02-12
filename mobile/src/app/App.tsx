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
import CoursesScreen from '@/domains/courses/screens/CoursesScreen';
import CourseDetailScreen from '@/domains/courses/screens/CourseDetailScreen';
import DecksScreen from '@/domains/decks/screens/DecksScreen';
import DeckDetailScreen from '@/domains/decks/screens/DeckDetailScreen';
import MarketplaceScreen from '@/domains/marketplace/screens/MarketplaceScreen';
import WalletScreen from '@/domains/wallet/screens/WalletScreen';
import ReputationScreen from '@/domains/reputation/screens/ReputationScreen';
import TodosScreen from '@/domains/todos/screens/TodosScreen';
import TodoDetailScreen from '@/domains/todos/screens/TodoDetailScreen';
import FilesScreen from '@/domains/files/screens/FilesScreen';
import FileDetailScreen from '@/domains/files/screens/FileDetailScreen';
import type { RootStackParamList } from './types';
import { AuthProvider, useAuth } from '@/domains/auth/hooks/use-auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

function AppNavigator() {
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
          <Stack.Screen name="Courses" component={CoursesScreen} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="Decks" component={DecksScreen} />
          <Stack.Screen name="DeckDetail" component={DeckDetailScreen} />
          <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="Reputation" component={ReputationScreen} />
          <Stack.Screen name="Todos" component={TodosScreen} />
          <Stack.Screen name="TodoDetail" component={TodoDetailScreen} />
          <Stack.Screen name="Files" component={FilesScreen} />
          <Stack.Screen name="FileDetail" component={FileDetailScreen} />
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
