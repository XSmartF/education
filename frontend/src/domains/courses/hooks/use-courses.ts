import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../api/course-api';
import { coursesQueryKeys } from '../model/query-keys';
import type {
  CreateCourseLessonRequest,
  CreateCourseModuleRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '../model/types';

export function useCourseCatalog(canManage: boolean) {
  const queryClient = useQueryClient();

  const catalog = useQuery({
    queryKey: coursesQueryKeys.catalog,
    queryFn: () => courseApi.listCatalog(),
  });

  const mine = useQuery({
    queryKey: coursesQueryKeys.mine,
    queryFn: () => courseApi.listMine(),
    enabled: canManage,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCourseRequest) => courseApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.catalog });
      void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.mine });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => courseApi.publish(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.catalog });
      void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.mine });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: (id: string) => courseApi.enroll(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.catalog });
    },
  });

  return {
    catalog,
    mine,
    createCourse: (payload: CreateCourseRequest) =>
      createMutation.mutateAsync(payload).then(() => undefined),
    publishCourse: (id: string) => publishMutation.mutateAsync(id).then(() => undefined),
    enrollCourse: (id: string) => enrollMutation.mutateAsync(id).then(() => undefined),
  };
}

export function useCourseDetail(courseId: string) {
  const queryClient = useQueryClient();

  const detail = useQuery({
    queryKey: coursesQueryKeys.detail(courseId),
    queryFn: () => courseApi.get(courseId),
  });

  const refreshLists = () => {
    void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.catalog });
    void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.mine });
    void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.detail(courseId) });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCourseRequest) => courseApi.update(courseId, payload),
    onSuccess: refreshLists,
  });

  const addModuleMutation = useMutation({
    mutationFn: (payload: CreateCourseModuleRequest) => courseApi.addModule(courseId, payload),
    onSuccess: refreshLists,
  });

  const addLessonMutation = useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: string; payload: CreateCourseLessonRequest }) =>
      courseApi.addLesson(courseId, moduleId, payload),
    onSuccess: refreshLists,
  });

  const publishMutation = useMutation({
    mutationFn: () => courseApi.publish(courseId),
    onSuccess: refreshLists,
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseApi.enroll(courseId),
    onSuccess: refreshLists,
  });

  return {
    detail,
    updateCourse: (payload: UpdateCourseRequest) =>
      updateMutation.mutateAsync(payload).then(() => undefined),
    addModule: (payload: CreateCourseModuleRequest) =>
      addModuleMutation.mutateAsync(payload).then(() => undefined),
    addLesson: (moduleId: string, payload: CreateCourseLessonRequest) =>
      addLessonMutation.mutateAsync({ moduleId, payload }).then(() => undefined),
    publishCourse: () => publishMutation.mutateAsync().then(() => undefined),
    enrollCourse: () => enrollMutation.mutateAsync().then(() => undefined),
  };
}

