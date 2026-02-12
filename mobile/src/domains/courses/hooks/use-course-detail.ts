import { useCallback, useEffect, useState } from 'react';
import { courseApi } from '../api/course-api';
import type { CourseDetail, CreateCourseLessonRequest, CreateCourseModuleRequest } from '../model/types';

type UseCourseDetailResult = {
  item: CourseDetail | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addModule: (payload: CreateCourseModuleRequest) => Promise<void>;
  addLesson: (moduleId: string, payload: CreateCourseLessonRequest) => Promise<void>;
  publish: () => Promise<void>;
  enroll: () => Promise<void>;
};

export function useCourseDetail(courseId: string): UseCourseDetailResult {
  const [item, setItem] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await courseApi.get(courseId);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai chi tiet khoa hoc');
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const addModule = async (payload: CreateCourseModuleRequest) => {
    await courseApi.addModule(courseId, payload);
    await refresh();
  };

  const addLesson = async (moduleId: string, payload: CreateCourseLessonRequest) => {
    await courseApi.addLesson(courseId, moduleId, payload);
    await refresh();
  };

  const publish = async () => {
    await courseApi.publish(courseId);
    await refresh();
  };

  const enroll = async () => {
    await courseApi.enroll(courseId);
    await refresh();
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { item, loading, error, refresh, addModule, addLesson, publish, enroll };
}
