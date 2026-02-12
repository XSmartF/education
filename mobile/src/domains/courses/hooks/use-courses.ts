import { useCallback, useEffect, useState } from 'react';
import { courseApi } from '../api/course-api';
import type { CreateCourseRequest, CourseItem } from '../model/types';

type UseCoursesResult = {
  catalog: CourseItem[];
  mine: CourseItem[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  create: (payload: CreateCourseRequest) => Promise<void>;
  publish: (id: string) => Promise<void>;
  enroll: (id: string) => Promise<void>;
};

export function useCourses(isStaff: boolean): UseCoursesResult {
  const [catalog, setCatalog] = useState<CourseItem[]>([]);
  const [mine, setMine] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catalogItems, myItems] = await Promise.all([
        courseApi.listCatalog(),
        isStaff ? courseApi.listMine() : Promise.resolve([]),
      ]);
      setCatalog(catalogItems);
      setMine(myItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai khoa hoc');
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  const create = async (payload: CreateCourseRequest) => {
    await courseApi.create(payload);
    await refresh();
  };

  const publish = async (id: string) => {
    await courseApi.publish(id);
    await refresh();
  };

  const enroll = async (id: string) => {
    await courseApi.enroll(id);
    await refresh();
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { catalog, mine, loading, error, refresh, create, publish, enroll };
}
