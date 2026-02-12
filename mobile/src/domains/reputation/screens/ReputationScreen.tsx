import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { useReputation } from '../hooks/use-reputation';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Reputation'>;

export default function ReputationScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['reputation', 'common', 'nav']);
  const { item, loading, error } = useReputation();

  return (
    <Screen
      title={translate('reputation:title')}
      subtitle={translate('reputation:subtitle')}
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
        {loading && <Text>{translate('common:loading')}</Text>}
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        {item && (
          <>
            <Text style={styles.todoTitle}>{translate('reputation:learningScore')}: {item.learningScore}</Text>
            <Text style={styles.todoTitle}>{translate('reputation:contributionScore')}: {item.contributionScore}</Text>
            <Text style={styles.todoTitle}>{translate('reputation:teachingScore')}: {item.teachingScore}</Text>
            <Text style={styles.todoTitle}>{translate('reputation:trustScore')}: {item.trustScore}</Text>
          </>
        )}
      </View>
    </Screen>
  );
}
