import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useDecks } from '../hooks/use-decks';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Decks'>;

export default function DecksScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['decks', 'common', 'nav']);
  const auth = useAuth();
  const { published, mine, loading, error, publish } = useDecks(auth.isAuthenticated);

  return (
    <Screen
      title={translate('decks:title')}
      subtitle={translate('decks:subtitle')}
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
            onPress={() => navigation.navigate('Marketplace')}
          >
            <Text style={styles.btnText}>{translate('nav:marketplace')}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {auth.isAuthenticated && mine.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.h2}>{translate('decks:myDecks')}</Text>
          {mine.map((deck) => (
            <View key={deck.id} style={styles.todoRow}>
              <View style={styles.todoTitleWrap}>
                <Text style={styles.todoTitle}>{deck.title}</Text>
                <Text style={styles.subtitle}>{deck.description}</Text>
              </View>
              <View style={styles.todoActions}>
                {!deck.isPublished && (
                  <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void publish(deck.id)}>
                    <Text style={styles.btnText}>{translate('decks:publish')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => navigation.navigate('DeckDetail', { deckId: deck.id })}
                >
                  <Text style={styles.btnText}>{translate('decks:details')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.h2}>{translate('decks:publishedDecks')}</Text>
        {loading && <Text>{translate('common:loading')}</Text>}
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        <FlatList
          data={published}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoRow}>
              <View style={styles.todoTitleWrap}>
                <Text style={styles.todoTitle}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })}
              >
                <Text style={styles.btnText}>{translate('decks:details')}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}
