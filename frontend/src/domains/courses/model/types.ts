export type CourseLesson = {
  id: string;
  title: string;
  contentType: string;
  contentUrl?: string | null;
  durationMinutes: number;
  sortOrder: number;
};

export type CourseModule = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: CourseLesson[];
};

export type CourseItem = {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  isPublic: boolean;
  isPublished: boolean;
  moduleCount: number;
  enrollmentCount: number;
};

export type CourseDetail = {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  isPublic: boolean;
  isPublished: boolean;
  enrollmentCount: number;
  modules: CourseModule[];
};

export type CreateCourseRequest = {
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  isPublic: boolean;
};

export type UpdateCourseRequest = CreateCourseRequest;

export type CreateCourseModuleRequest = {
  title: string;
  sortOrder: number;
};

export type CreateCourseLessonRequest = {
  title: string;
  contentType: string;
  contentUrl?: string | null;
  durationMinutes: number;
  sortOrder: number;
};

