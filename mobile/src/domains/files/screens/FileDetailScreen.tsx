import { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/app/Screen';
import { styles } from '@/shared/ui/styles';
import { fileApi, toTextFileFormData } from '@/domains/files/api/file-api';
import type { FileItem } from '@/domains/files/model/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FileDetail'>;

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileDetailScreen({ route, navigation }: Props) {
  const { t: translate } = useTranslation(['files', 'errors']);
  const { fileId } = route.params;
  const [item, setItem] = useState<FileItem | null>(null);
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fileApi.get(fileId);
      setItem(data);
      setFileName(data.fileName);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    } finally {
      setLoading(false);
    }
  }, [fileId, translate]);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = async () => {
    const name = fileName.trim();
    if (!name) {
      return;
    }

    setError('');
    setMessage('');
    try {
      const updated = await fileApi.replace(fileId, toTextFileFormData(name, content));
      setItem(updated);
      setFileName(updated.fileName);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    }
  };

  const remove = async () => {
    setError('');
    try {
      await fileApi.remove(fileId);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    }
  };

  const download = async () => {
    setError('');
    setMessage('');
    try {
      const result = await fileApi.download(fileId);
      setMessage(`${translate('downloaded')}: ${result.fileName} (${formatBytes(result.blob.size)})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('errors:generic'));
    }
  };

  return (
    <Screen title={translate('detailTitle')} subtitle={translate('detailSubtitle')}>
      <View style={styles.card}>
        {loading ? (
          <Text>{translate('loading')}</Text>
        ) : !item ? (
          <Text style={styles.error}>{translate('notFound')}</Text>
        ) : (
          <>
            <Text style={styles.label}>
              {translate('size')}: {formatBytes(item.size)}
            </Text>
            <Text style={styles.label}>
              {translate('contentType')}: {item.contentType}
            </Text>
            <Text style={styles.label}>
              {translate('createdAt')}: {new Date(item.createdAt).toLocaleString()}
            </Text>

            <Text style={styles.label}>{translate('fileName')}</Text>
            <TextInput
              style={styles.input}
              value={fileName}
              onChangeText={setFileName}
              placeholder={translate('uploadFilePlaceholder')}
            />

            <Text style={styles.label}>{translate('content')}</Text>
            <TextInput
              style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
              value={content}
              onChangeText={setContent}
              placeholder={translate('uploadContentPlaceholder')}
              multiline
            />

            {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            {message.length > 0 && <Text>{message}</Text>}

            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={replace}>
              <Text style={styles.btnText}>{translate('replace')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={download}>
              <Text style={styles.btnText}>{translate('download')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={remove}>
              <Text style={styles.btnText}>{translate('remove')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.goBack()}>
              <Text style={styles.btnText}>{translate('back')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Screen>
  );
}
