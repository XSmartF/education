import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useDeckDetail } from '../hooks/use-deck-detail';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'DeckDetail'>;

export default function DeckDetailScreen({ route }: Props) {
  const { t: translate } = useTranslation(['decks', 'common']);
  const auth = useAuth();
  const { deckId } = route.params;
  const { item, loading, error, addCard, publish } = useDeckDetail(deckId);

  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');

  const submitCard = async () => {
    if (!frontText.trim() || !backText.trim()) {
      return;
    }

    await addCard({ frontText: frontText.trim(), backText: backText.trim(), difficulty: 2 });
    setFrontText('');
    setBackText('');
  };

  return (
    <Screen title={item?.title ?? translate('decks:title')} subtitle={item?.description}>
      <View style={styles.card}>
        {loading && <Text>{translate('common:loading')}</Text>}
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        {item && !item.isPublished && auth.isAuthenticated && (
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void publish()}>
            <Text style={styles.btnText}>{translate('decks:publish')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {auth.isAuthenticated && (
        <View style={styles.card}>
          <Text style={styles.h2}>{translate('decks:addCard')}</Text>
          <TextInput
            style={styles.input}
            value={frontText}
            onChangeText={setFrontText}
            placeholder={translate('decks:frontText')}
          />
          <TextInput
            style={styles.input}
            value={backText}
            onChangeText={setBackText}
            placeholder={translate('decks:backText')}
            multiline
          />
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => void submitCard()}>
            <Text style={styles.btnText}>{translate('decks:addCard')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.h2}>{translate('decks:cardsList')}</Text>
        <FlatList
          data={item?.cards ?? []}
          keyExtractor={(card) => card.id}
          renderItem={({ item: card }) => (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.todoTitle}>{card.frontText}</Text>
              <Text style={styles.subtitle}>{card.backText}</Text>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}
