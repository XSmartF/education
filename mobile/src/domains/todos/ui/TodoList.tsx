import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTodos } from '../hooks/use-todos';
import { styles } from '@/shared/ui/styles';
import type { TodoItem } from '../model/types';

type Props = {
  canEdit: boolean;
  onOpen?: (id: string) => void;
};

export function TodoList({ canEdit, onOpen }: Props) {
  const { t: translate } = useTranslation('todos');
  const { items, loading, error, add, toggle, remove } = useTodos();
  const [title, setTitle] = useState('');

  const submit = async () => {
    if (!title.trim()) return;
    await add(title.trim());
    setTitle('');
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.h2}>{translate('title')}</Text>
        {!canEdit && <Text style={styles.badge}>{translate('readOnly')}</Text>}
      </View>

      <View style={styles.todoInput}>
        <TextInput
          style={styles.input}
          placeholder={translate('addPlaceholder')}
          value={title}
          onChangeText={setTitle}
          editable={canEdit}
        />
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submit} disabled={!canEdit}>
          <Text style={styles.btnText}>{translate('addButton')}</Text>
        </TouchableOpacity>
      </View>

      {loading && <Text>{translate('loading')}</Text>}
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItemRow
            item={item}
            canEdit={canEdit}
            onToggle={toggle}
            onRemove={remove}
            onOpen={onOpen}
          />
        )}
      />
    </View>
  );
}

type RowProps = {
  item: TodoItem;
  canEdit: boolean;
  onToggle: (item: TodoItem) => void;
  onRemove: (id: string) => void;
  onOpen?: (id: string) => void;
};

function TodoItemRow({ item, canEdit, onToggle, onRemove, onOpen }: RowProps) {
  const { t: translate } = useTranslation('todos');

  return (
    <View style={[styles.todoRow, item.isDone ? styles.todoDone : null]}>
      <TouchableOpacity onPress={() => canEdit && onToggle(item)} style={styles.todoTitleWrap}>
        <Text style={[styles.todoTitle, item.isDone ? styles.todoTitleDone : null]}>{item.title}</Text>
      </TouchableOpacity>
      <View style={styles.todoActions}>
        {onOpen && (
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => onOpen(item.id)}>
            <Text style={styles.btnText}>{translate('detail')}</Text>
          </TouchableOpacity>
        )}
        {canEdit && (
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => onRemove(item.id)}>
            <Text style={styles.btnText}>{translate('remove')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}