import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/app/Screen';
import type { RootStackParamList } from '@/app/types';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useCourseDetail } from '../hooks/use-course-detail';
import { styles } from '@/shared/ui/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;

export default function CourseDetailScreen({ route }: Props) {
  const { t: translate } = useTranslation(['courses', 'common']);
  const auth = useAuth();
  const { courseId } = route.params;
  const { item, loading, error, enroll, publish, addModule, addLesson } = useCourseDetail(courseId);

  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonModuleId, setLessonModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');

  const submitModule = async () => {
    if (!moduleTitle.trim()) {
      return;
    }

    await addModule({ title: moduleTitle.trim(), sortOrder: 0 });
    setModuleTitle('');
  };

  const submitLesson = async () => {
    if (!lessonModuleId || !lessonTitle.trim()) {
      return;
    }

    await addLesson(lessonModuleId, {
      title: lessonTitle.trim(),
      contentType: 'video',
      contentUrl: null,
      durationMinutes: 10,
      sortOrder: 0,
    });

    setLessonTitle('');
  };

  return (
    <Screen title={item?.title ?? translate('courses:title')} subtitle={item?.description}>
      <View style={styles.card}>
        {loading && <Text>{translate('common:loading')}</Text>}
        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        {item && (
          <>
            <Text style={styles.subtitle}>{item.category} • {item.level}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void enroll()}>
                <Text style={styles.btnText}>{translate('courses:enroll')}</Text>
              </TouchableOpacity>
              {auth.isStaff && !item.isPublished && (
                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => void publish()}>
                  <Text style={styles.btnText}>{translate('courses:publish')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {auth.isStaff && (
        <View style={styles.card}>
          <Text style={styles.h2}>{translate('courses:addModule')}</Text>
          <TextInput
            style={styles.input}
            value={moduleTitle}
            onChangeText={setModuleTitle}
            placeholder={translate('courses:moduleTitle')}
          />
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => void submitModule()}>
            <Text style={styles.btnText}>{translate('courses:addModule')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {auth.isStaff && item?.modules.length ? (
        <View style={styles.card}>
          <Text style={styles.h2}>{translate('courses:addLesson')}</Text>
          <Text style={styles.label}>{translate('courses:module')}</Text>
          <FlatList
            data={item.modules}
            keyExtractor={(module) => module.id}
            horizontal
            renderItem={({ item: module }) => (
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => setLessonModuleId(module.id)}
              >
                <Text style={styles.btnText}>{module.title}</Text>
              </TouchableOpacity>
            )}
          />
          <TextInput
            style={styles.input}
            value={lessonTitle}
            onChangeText={setLessonTitle}
            placeholder={translate('courses:lessonTitle')}
          />
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => void submitLesson()}>
            <Text style={styles.btnText}>{translate('courses:addLesson')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.h2}>{translate('courses:modulesList')}</Text>
        {item?.modules.map((module) => (
          <View key={module.id} style={{ marginTop: 10 }}>
            <Text style={styles.todoTitle}>{module.title}</Text>
            {module.lessons.map((lesson) => (
              <Text key={lesson.id} style={styles.subtitle}>{lesson.title}</Text>
            ))}
            {module.lessons.length === 0 && <Text style={styles.subtitle}>{translate('courses:noLessons')}</Text>}
          </View>
        ))}
      </View>
    </Screen>
  );
}
