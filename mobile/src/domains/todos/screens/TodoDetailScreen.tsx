import { useCallback, useEffect, useState } from 'react';
import { Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/app/Screen';
import { styles } from '@/shared/ui/styles';
import { todoApi } from '@/domains/todos/api/todo-api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TodoDetail'>;

export default function TodoDetailScreen({ route, navigation }: Props) {
  const { t: translate } = useTranslation(['todos', 'errors']);
  const { todoId } = route.params;
  const [title, setTitle] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await todoApi.get(todoId);
      setTitle(data.title);
      setIsDone(data.isDone);
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    } finally {
      setLoading(false);
    }
  }, [todoId, translate]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setError('');
    try {
      await todoApi.update(todoId, { title, isDone });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    }
  };

  const remove = async () => {
    setError('');
    try {
      await todoApi.remove(todoId);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    }
  };

  return (
    <Screen title={translate('todos:detailTitle')} subtitle={translate('todos:detailSubtitle')}>
      <View style={styles.card}>
        {loading ? (
          <Text>{translate('todos:loading')}</Text>
        ) : (
          <>
            <Text style={styles.label}>{translate('todos:labelTitle')}</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <View style={styles.switchRow}>
              <Text style={styles.label}>{translate('todos:labelDone')}</Text>
              <Switch value={isDone} onValueChange={setIsDone} />
            </View>

            {error.length > 0 && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={save}>
              <Text style={styles.btnText}>{translate('todos:save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={remove}>
              <Text style={styles.btnText}>{translate('todos:remove')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.goBack()}>
              <Text style={styles.btnText}>{translate('todos:back')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Screen>
  );
}