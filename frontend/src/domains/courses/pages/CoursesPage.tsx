import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useCourseCatalog } from '../hooks/use-courses';
import { formatMoney } from '@/shared/utils/format';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PageIntro,
  Switch,
  Textarea,
} from '@/shared/ui';

export default function CoursesPage() {
  const { t: translate } = useTranslation(['courses', 'common']);
  const auth = useAuth();
  const { catalog, mine, createCourse, publishCourse, enrollCourse } = useCourseCatalog(auth.isStaff);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [level, setLevel] = useState('Beginner');
  const [price, setPrice] = useState('0');
  const [isPublic, setIsPublic] = useState(true);

  const submit = async () => {
    if (!auth.isStaff) {
      return;
    }

    const parsedPrice = Number.parseFloat(price);
    await createCourse({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      level: level.trim(),
      price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      isPublic,
    });

    setTitle('');
    setDescription('');
    setCategory('General');
    setLevel('Beginner');
    setPrice('0');
    setIsPublic(true);
  };

  return (
    <section className="space-y-6">
      <PageIntro title={translate('courses:title')} description={translate('courses:subtitle')} />

      {auth.isStaff && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('courses:createCourse')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course-title">{translate('courses:courseTitle')}</Label>
              <Input id="course-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-description">{translate('courses:courseDescription')}</Label>
              <Textarea
                id="course-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="course-category">{translate('courses:courseCategory')}</Label>
                <Input
                  id="course-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-level">{translate('courses:courseLevel')}</Label>
                <Input id="course-level" value={level} onChange={(event) => setLevel(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-price">{translate('courses:coursePrice')}</Label>
                <Input
                  id="course-price"
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
              <Label htmlFor="course-public" className="cursor-pointer">
                {translate('courses:isPublic')}
              </Label>
              <Switch id="course-public" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <Button
              onClick={() => void submit()}
              disabled={!title.trim() || !description.trim() || catalog.isFetching}
            >
              {translate('courses:createCourse')}
            </Button>
          </CardContent>
        </Card>
      )}

      {auth.isStaff && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('courses:myCourses')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mine.isLoading && <p className="text-sm text-muted-foreground">{translate('common:loading')}</p>}
            {mine.data?.map((course) => (
              <article key={course.id} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.category} • {course.level} • {formatMoney(course.price)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!course.isPublished && (
                      <Button size="sm" onClick={() => void publishCourse(course.id)}>
                        {translate('courses:publish')}
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link to="/courses/$courseId" params={{ courseId: course.id }}>
                        {translate('courses:manage')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {!mine.isLoading && !mine.data?.length && (
              <p className="text-sm text-muted-foreground">{translate('courses:noCourses')}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10 bg-card/90">
        <CardHeader>
          <CardTitle>{translate('courses:catalog')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {catalog.isLoading && <p className="text-sm text-muted-foreground">{translate('common:loading')}</p>}
          {catalog.data?.map((course) => (
            <article key={course.id} className="rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{course.category}</span>
                    <span>{course.level}</span>
                    <span>{formatMoney(course.price)}</span>
                    <span>{translate('courses:modules')}: {course.moduleCount}</span>
                    <span>{translate('courses:enrollments')}: {course.enrollmentCount}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {course.isPublished ? (
                    <Badge variant="default">{translate('courses:published')}</Badge>
                  ) : (
                    <Badge variant="secondary">{translate('courses:draft')}</Badge>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <Link to="/courses/$courseId" params={{ courseId: course.id }}>
                      {translate('courses:details')}
                    </Link>
                  </Button>
                  {auth.isAuthenticated && (
                    <Button size="sm" onClick={() => void enrollCourse(course.id)}>
                      {translate('courses:enroll')}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
          {!catalog.isLoading && !catalog.data?.length && (
            <p className="text-sm text-muted-foreground">{translate('courses:noCatalog')}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

