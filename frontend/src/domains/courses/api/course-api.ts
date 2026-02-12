import { api } from '@/shared/api/http-client';
import type {
  CourseDetail,
  CourseItem,
  CourseLesson,
  CourseModule,
  CreateCourseLessonRequest,
  CreateCourseModuleRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '../model/types';

export const courseApi = {
  listCatalog: () => api.get<CourseItem[]>('/courses'),
  listMine: () => api.get<CourseItem[]>('/courses/me'),
  get: (id: string) => api.get<CourseDetail>(`/courses/${id}`),
  create: (payload: CreateCourseRequest) => api.post<CourseDetail>('/courses', payload),
  update: (id: string, payload: UpdateCourseRequest) =>
    api.put<CourseDetail>(`/courses/${id}`, payload),
  addModule: (id: string, payload: CreateCourseModuleRequest) =>
    api.post<CourseModule>(`/courses/${id}/modules`, payload),
  addLesson: (id: string, moduleId: string, payload: CreateCourseLessonRequest) =>
    api.post<CourseLesson>(`/courses/${id}/modules/${moduleId}/lessons`, payload),
  publish: (id: string) => api.post<void>(`/courses/${id}/publish`),
  enroll: (id: string) => api.post<void>(`/courses/${id}/enroll`),
};

