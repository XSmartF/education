import { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { styles } from '@/shared/ui/styles';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
}>;

export function Screen({ title, subtitle, action, children }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.h1}>{title}</Text>
          {action}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </SafeAreaView>
  );
}
