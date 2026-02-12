import { Text, TouchableOpacity, View, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useCourses } from '../hooks/use-courses';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Courses'>;

export default function CoursesScreen({ navigation }: Props) {
  const { t: translate } = useTranslation(['courses', 'common', 'nav']);
  const auth = useAuth();
  const { catalog, mine, loading, error, enroll, publish } = useCourses(auth.isStaff);

  return (
    <Screen
      title={translate('courses:title')}
      subtitle={translate('courses:subtitle')}
      action={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost, styles.headerAction]}
            onPress={() => navigation.navigate('Marketplace')}
          >
            <Text style={styles.btnText}>{translate('nav:marketplace')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGhost, styles.headerAction]} onPress={auth.signOut}>
            <Text style={styles.btnText}>{translate('nav:logout')}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.navigate('Decks')}>
            <Text style={styles.btnText}>{translate('nav:decks')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.navigate('Wallet')}>
            <Text style={styles.btnText}>{translate('nav:wallet')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => navigation.navigate('Reputation')}
          >
            <Text style={styles.btnText}>{translate('nav:reputation')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.navigate('Todos')}>
            <Text style={styles.btnText}>{translate('nav:todos')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation.navigate('Files')}>
            <Text style={styles.btnText}>{translate('nav:files')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {auth.isStaff && mine.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.h2}>{translate('courses:myCourses')}</Text>
          {mine.map((course) => (
            <View key={course.id} style={styles.todoRow}>
              <View style={styles.todoTitleWrap}>
                <Text style={styles.todoTitle}>{course.title}</Text>
                <Text style={styles.subtitle}>{course.category} • {course.level}</Text>
              </View>
              <View style={styles.todoActions}>
                {!course.isPublished && (
                  <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void publish(course.id)}>
                    <Text style={styles.btnText}>{translate('courses:publish')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                >
                  <Text style={styles.btnText}>{translate('courses:details')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.h2}>{translate('courses:catalog')}</Text>
        {loading && <Text>{translate('common:loading')}</Text>}
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        <FlatList
          data={catalog}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoRow}>
              <View style={styles.todoTitleWrap}>
                <Text style={styles.todoTitle}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
              </View>
              <View style={styles.todoActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
                >
                  <Text style={styles.btnText}>{translate('courses:details')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void enroll(item.id)}>
                  <Text style={styles.btnText}>{translate('courses:enroll')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}
