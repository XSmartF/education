import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useCourseDetail } from '../hooks/use-courses';
import { formatMoney } from '@/shared/utils/format';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  PageIntro,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Textarea,
} from '@/shared/ui';

export default function CourseDetailPage() {
  const { courseId } = useParams({ from: '/courses/$courseId' });
  const { t: translate } = useTranslation(['courses', 'common']);
  const auth = useAuth();
  const { detail, updateCourse, addModule, addLesson, publishCourse, enrollCourse } = useCourseDetail(courseId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [price, setPrice] = useState('0');
  const [isPublic, setIsPublic] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);

  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleSortOrder, setModuleSortOrder] = useState('0');

  const [lessonModuleId, setLessonModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContentType, setLessonContentType] = useState('video');
  const [lessonContentUrl, setLessonContentUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('0');
  const [lessonSortOrder, setLessonSortOrder] = useState('0');

  const course = detail.data;
  const modules = useMemo(() => course?.modules ?? [], [course]);

  useEffect(() => {
    if (!course) {
      return;
    }

    setTitle(course.title);
    setDescription(course.description);
    setCategory(course.category);
    setLevel(course.level);
    setPrice(String(course.price));
    setIsPublic(course.isPublic);
  }, [course]);

  useEffect(() => {
    if (lessonModuleId || !modules.length) {
      return;
    }

    setLessonModuleId(modules[0].id);
  }, [lessonModuleId, modules]);

  const canManage = auth.isStaff;

  const moduleOptions = useMemo(
    () => modules.map((module) => ({ id: module.id, title: module.title })),
    [modules]
  );

  const submitUpdate = async () => {
    if (!course) {
      return;
    }

    const parsedPrice = Number.parseFloat(price);
    await updateCourse({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      level: level.trim(),
      price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      isPublic,
    });
    setIsUpdateDialogOpen(false);
  };

  const submitModule = async () => {
    const parsedSort = Number.parseInt(moduleSortOrder, 10);
    await addModule({
      title: moduleTitle.trim(),
      sortOrder: Number.isFinite(parsedSort) ? parsedSort : 0,
    });
    setModuleTitle('');
    setModuleSortOrder('0');
    setIsModuleDialogOpen(false);
  };

  const submitLesson = async () => {
    if (!lessonModuleId) {
      return;
    }

    const parsedDuration = Number.parseInt(lessonDuration, 10);
    const parsedSort = Number.parseInt(lessonSortOrder, 10);
    await addLesson(lessonModuleId, {
      title: lessonTitle.trim(),
      contentType: lessonContentType.trim(),
      contentUrl: lessonContentUrl.trim() || null,
      durationMinutes: Number.isFinite(parsedDuration) ? parsedDuration : 0,
      sortOrder: Number.isFinite(parsedSort) ? parsedSort : 0,
    });

    setLessonTitle('');
    setLessonContentType('video');
    setLessonContentUrl('');
    setLessonDuration('0');
    setLessonSortOrder('0');
    setIsLessonDialogOpen(false);
  };

  if (detail.isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Card className="border-primary/10 bg-card/90">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-72" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 bg-card/90">
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!course) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{translate('courses:notFound')}</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/courses">{translate('courses:backToCourses')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <PageIntro title={course.title} description={course.description} />

      <Card className="border-primary/10 bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{translate('courses:overview')}</CardTitle>
          <div className="flex flex-wrap items-center gap-1">
            {course.isPublished ? (
              <Badge variant="default">{translate('courses:published')}</Badge>
            ) : (
              <Badge variant="secondary">{translate('courses:draft')}</Badge>
            )}
            <Badge variant={course.isPublic ? 'outline' : 'secondary'}>
              {course.isPublic ? translate('courses:visibilityPublic') : translate('courses:visibilityPrivate')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {course.category} • {course.level} • {formatMoney(course.price)} • {translate('courses:enrollments')}:{' '}
            {course.enrollmentCount}
          </p>
          <div className="flex flex-wrap gap-2">
            {auth.isAuthenticated && (
              <Button variant="outline" onClick={() => void enrollCourse()}>
                {translate('courses:enroll')}
              </Button>
            )}
            {canManage && !course.isPublished && (
              <Button onClick={() => void publishCourse()}>{translate('courses:publish')}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {canManage && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('courses:manage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">{translate('courses:updateCourse')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{translate('courses:updateCourse')}</DialogTitle>
                    <DialogDescription>{course.title}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="detail-title">{translate('courses:courseTitle')}</Label>
                      <Input id="detail-title" value={title} onChange={(event) => setTitle(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="detail-description">{translate('courses:courseDescription')}</Label>
                      <Textarea
                        id="detail-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <Label htmlFor="detail-category">{translate('courses:courseCategory')}</Label>
                        <Input id="detail-category" value={category} onChange={(event) => setCategory(event.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="detail-level">{translate('courses:courseLevel')}</Label>
                        <Input id="detail-level" value={level} onChange={(event) => setLevel(event.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="detail-price">{translate('courses:coursePrice')}</Label>
                        <Input id="detail-price" value={price} onChange={(event) => setPrice(event.target.value)} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
                      <Label htmlFor="detail-public" className="cursor-pointer">
                        {translate('courses:isPublic')}
                      </Label>
                      <Switch id="detail-public" checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => void submitUpdate()}>{translate('courses:saveChanges')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">{translate('courses:addModule')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{translate('courses:addModule')}</DialogTitle>
                    <DialogDescription>{course.title}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="module-title">{translate('courses:moduleTitle')}</Label>
                      <Input id="module-title" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="module-order">{translate('courses:sortOrder')}</Label>
                      <Input id="module-order" value={moduleSortOrder} onChange={(event) => setModuleSortOrder(event.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => void submitModule()} disabled={!moduleTitle.trim()}>
                      {translate('courses:addModule')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">{translate('courses:addLesson')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{translate('courses:addLesson')}</DialogTitle>
                    <DialogDescription>{course.title}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>{translate('courses:module')}</Label>
                      <Select value={lessonModuleId} onValueChange={setLessonModuleId}>
                        <SelectTrigger>
                          <SelectValue placeholder={translate('courses:selectModule')} />
                        </SelectTrigger>
                        <SelectContent>
                          {moduleOptions.map((module) => (
                            <SelectItem key={module.id} value={module.id}>
                              {module.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="lesson-title">{translate('courses:lessonTitle')}</Label>
                        <Input id="lesson-title" value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lesson-content-type">{translate('courses:contentType')}</Label>
                        <Input
                          id="lesson-content-type"
                          value={lessonContentType}
                          onChange={(event) => setLessonContentType(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lesson-content-url">{translate('courses:contentUrl')}</Label>
                      <Input
                        id="lesson-content-url"
                        value={lessonContentUrl}
                        onChange={(event) => setLessonContentUrl(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="lesson-duration">{translate('courses:durationMinutes')}</Label>
                        <Input id="lesson-duration" value={lessonDuration} onChange={(event) => setLessonDuration(event.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lesson-order">{translate('courses:sortOrder')}</Label>
                        <Input id="lesson-order" value={lessonSortOrder} onChange={(event) => setLessonSortOrder(event.target.value)} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => void submitLesson()} disabled={!lessonTitle.trim() || !lessonModuleId}>
                      {translate('courses:addLesson')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10 bg-card/90">
        <CardHeader>
          <CardTitle>{translate('courses:modulesList')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {modules.map((module) => (
            <article key={module.id} className="rounded-lg border bg-muted/20 p-4">
              <p className="font-medium">{module.title}</p>
              <p className="text-xs text-muted-foreground">
                {translate('courses:sortOrder')}: {module.sortOrder}
              </p>
              <ul className="mt-3 space-y-2">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="rounded-md border bg-background/70 p-3">
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.contentType} • {translate('courses:durationMinutes')}: {lesson.durationMinutes}
                    </p>
                    {lesson.contentUrl && (
                      <p className="mt-1 text-xs text-muted-foreground">{lesson.contentUrl}</p>
                    )}
                  </li>
                ))}
                {!module.lessons.length && (
                  <li className="text-xs text-muted-foreground">{translate('courses:noLessons')}</li>
                )}
              </ul>
            </article>
          ))}
          {!modules.length && <p className="text-sm text-muted-foreground">{translate('courses:noModules')}</p>}
        </CardContent>
      </Card>
    </section>
  );
}

