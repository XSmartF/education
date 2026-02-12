import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFiles } from '../hooks/use-files';
import { styles } from '@/shared/ui/styles';
import type { FileItem } from '../model/types';

type Props = {
  canEdit: boolean;
  onOpen?: (id: string) => void;
};

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileList({ canEdit, onOpen }: Props) {
  const { t: translate } = useTranslation('files');
  const { items, loading, error, upload, remove, download } = useFiles();
  const [fileName, setFileName] = useState('note.txt');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    const name = fileName.trim();
    if (!canEdit || !name) {
      return;
    }

    await upload(name, content);
    setContent('');
    setMessage('');
  };

  const onDownload = async (id: string) => {
    const result = await download(id);
    setMessage(`${translate('downloaded')}: ${result.fileName} (${formatBytes(result.size)})`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.h2}>{translate('title')}</Text>
        {!canEdit && <Text style={styles.badge}>{translate('readOnly')}</Text>}
      </View>

      <Text style={styles.label}>{translate('fileName')}</Text>
      <TextInput
        style={styles.input}
        value={fileName}
        onChangeText={setFileName}
        placeholder={translate('uploadFilePlaceholder')}
        editable={canEdit}
      />

      <Text style={styles.label}>{translate('content')}</Text>
      <TextInput
        style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
        value={content}
        onChangeText={setContent}
        placeholder={translate('uploadContentPlaceholder')}
        editable={canEdit}
        multiline
      />

      <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submit} disabled={!canEdit}>
        <Text style={styles.btnText}>{translate('uploadButton')}</Text>
      </TouchableOpacity>

      {loading && <Text>{translate('loading')}</Text>}
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
      {message.length > 0 && <Text>{message}</Text>}
      {!loading && items.length === 0 && <Text>{translate('empty')}</Text>}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FileRow
            item={item}
            canEdit={canEdit}
            onOpen={onOpen}
            onDownload={onDownload}
            onRemove={remove}
          />
        )}
      />
    </View>
  );
}

type RowProps = {
  item: FileItem;
  canEdit: boolean;
  onOpen?: (id: string) => void;
  onDownload: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

function FileRow({ item, canEdit, onOpen, onDownload, onRemove }: RowProps) {
  const { t: translate } = useTranslation('files');

  return (
    <View style={styles.todoRow}>
      <View style={styles.todoTitleWrap}>
        <Text style={styles.todoTitle}>{item.fileName}</Text>
        <Text style={styles.subtitle}>
          {translate('size')}: {formatBytes(item.size)}
        </Text>
      </View>
      <View style={styles.todoActions}>
        {onOpen && (
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => onOpen(item.id)}>
            <Text style={styles.btnText}>{translate('detail')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void onDownload(item.id)}>
          <Text style={styles.btnText}>{translate('download')}</Text>
        </TouchableOpacity>
        {canEdit && (
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void onRemove(item.id)}>
            <Text style={styles.btnText}>{translate('remove')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
