import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useWallet } from '../hooks/use-wallet';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallet'>;

export default function WalletScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['wallet', 'common', 'nav']);
  const auth = useAuth();
  const { overview, pending, loading, error, topUp, requestWithdrawal, review } = useWallet(auth.isAdmin);

  const [topUpAmount, setTopUpAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('10');

  return (
    <Screen
      title={translate('wallet:title')}
      subtitle={translate('wallet:subtitle')}
      action={
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost, styles.headerAction]}
          onPress={() => navigation.navigate('Courses')}
        >
          <Text style={styles.btnText}>{translate('nav:courses')}</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.card}>
        <Text style={styles.h2}>{translate('wallet:balance')}</Text>
        <Text style={styles.h1}>{overview?.balance ?? 0}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>{translate('wallet:topUp')}</Text>
        <TextInput style={styles.input} value={topUpAmount} onChangeText={setTopUpAmount} />
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => void topUp(Number(topUpAmount))}>
          <Text style={styles.btnText}>{translate('wallet:topUp')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>{translate('wallet:requestWithdrawal')}</Text>
        <TextInput style={styles.input} value={withdrawAmount} onChangeText={setWithdrawAmount} />
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => void requestWithdrawal(Number(withdrawAmount))}
        >
          <Text style={styles.btnText}>{translate('wallet:requestWithdrawal')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>{translate('wallet:transactions')}</Text>
        {loading && <Text>{translate('common:loading')}</Text>}
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        <FlatList
          data={overview?.transactions ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoRow}>
              <View style={styles.todoTitleWrap}>
                <Text style={styles.todoTitle}>{item.type}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
              </View>
              <Text style={styles.subtitle}>{item.amount}</Text>
            </View>
          )}
        />
      </View>

      {auth.isAdmin && (
        <View style={styles.card}>
          <Text style={styles.h2}>{translate('wallet:pendingWithdrawals')}</Text>
          {pending.map((item) => (
            <View key={item.id} style={styles.todoRow}>
              <View style={styles.todoTitleWrap}>
                <Text style={styles.todoTitle}>{item.userId}</Text>
                <Text style={styles.subtitle}>{item.amount}</Text>
              </View>
              <View style={styles.todoActions}>
                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void review(item.id, true)}>
                  <Text style={styles.btnText}>{translate('wallet:approve')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void review(item.id, false)}>
                  <Text style={styles.btnText}>{translate('wallet:reject')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
