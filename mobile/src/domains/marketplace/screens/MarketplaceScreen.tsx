import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { useMarketplace } from '../hooks/use-marketplace';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Marketplace'>;

export default function MarketplaceScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['marketplace', 'common', 'nav']);
  const { items, loading, error, latestResult, purchase } = useMarketplace();

  return (
    <Screen
      title={translate('marketplace:title')}
      subtitle={translate('marketplace:subtitle')}
      action={
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost, styles.headerAction]}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.btnText}>{translate('nav:wallet')}</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.card}>
        {loading && <Text>{translate('common:loading')}</Text>}
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        {latestResult && (
          <Text style={styles.subtitle}>
            {translate('marketplace:lastResult')}: {latestResult.status}
          </Text>
        )}
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.itemType}-${item.id}`}
          renderItem={({ item }) => (
            <View style={styles.todoRow}>
              <View style={styles.todoTitleWrap}>
                <Text style={styles.todoTitle}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
                <Text style={styles.subtitle}>{item.isFree ? translate('marketplace:free') : `${item.price}`}</Text>
              </View>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => void purchase(item.id, item.itemType)}
              >
                <Text style={styles.btnText}>{item.isFree ? translate('marketplace:claim') : translate('marketplace:buy')}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}
