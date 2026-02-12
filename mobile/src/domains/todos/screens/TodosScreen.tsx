import { TouchableOpacity, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/app/Screen';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { TodoList } from '@/domains/todos/ui/TodoList';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/types';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Todos'>;

export default function TodosScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['app', 'nav']);
  const auth = useAuth();

  return (
    <Screen
      title={translate('app:title')}
      subtitle={translate('app:taglineMobile')}
      action={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost, styles.headerAction]}
            onPress={() => navigation.navigate('Courses')}
          >
            <Text style={styles.btnText}>{translate('nav:courses')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost, styles.headerAction]}
            onPress={() => navigation.navigate('Files')}
          >
            <Text style={styles.btnText}>{translate('nav:files')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost, styles.headerAction]}
            onPress={auth.signOut}
          >
            <Text style={styles.btnText}>{translate('nav:logout')}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <TodoList
        canEdit={auth.isAuthenticated}
        onOpen={(id) => navigation.navigate('TodoDetail', { todoId: id })}
      />
    </Screen>
  );
}
