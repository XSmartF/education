import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { SlidersHorizontal } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@/shared/ui';
import { cn } from '@/shared/utils';
import type { CourseItem } from '../model/types';

const CATALOG_PAGE_SIZE = 9;

type PriceFilter = 'all' | 'free' | 'paid';

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [catalogPage, setCatalogPage] = useState(1);

  const catalogItems = useMemo(() => catalog.data ?? [], [catalog.data]);

  const categoryOptions = useMemo(
    () =>
      [...new Set(catalogItems.map((item) => item.category.trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [catalogItems]
  );

  const levelOptions = useMemo(
    () =>
      [...new Set(catalogItems.map((item) => item.level.trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [catalogItems]
  );

  const filteredCatalog = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return catalogItems.filter((item) => {
      const matchedSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.level.toLowerCase().includes(keyword);

      const matchedCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchedLevel = levelFilter === 'all' || item.level === levelFilter;
      const matchedPrice =
        priceFilter === 'all' ||
        (priceFilter === 'free' && item.price <= 0) ||
        (priceFilter === 'paid' && item.price > 0);

      return matchedSearch && matchedCategory && matchedLevel && matchedPrice;
    });
  }, [catalogItems, searchQuery, categoryFilter, levelFilter, priceFilter]);

  useEffect(() => {
    setCatalogPage(1);
  }, [searchQuery, categoryFilter, levelFilter, priceFilter]);

  const totalCatalogPages = Math.max(1, Math.ceil(filteredCatalog.length / CATALOG_PAGE_SIZE));

  useEffect(() => {
    setCatalogPage((current) => Math.min(current, totalCatalogPages));
  }, [totalCatalogPages]);

  const pagedCatalog = useMemo(() => {
    const start = (catalogPage - 1) * CATALOG_PAGE_SIZE;
    return filteredCatalog.slice(start, start + CATALOG_PAGE_SIZE);
  }, [filteredCatalog, catalogPage]);

  const catalogPageNumbers = useMemo(() => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, catalogPage - half);
    const end = Math.min(totalCatalogPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [catalogPage, totalCatalogPages]);

  const showingFrom = filteredCatalog.length === 0 ? 0 : (catalogPage - 1) * CATALOG_PAGE_SIZE + 1;
  const showingTo = Math.min(catalogPage * CATALOG_PAGE_SIZE, filteredCatalog.length);

  const hasActiveFilters = categoryFilter !== 'all' || levelFilter !== 'all' || priceFilter !== 'all';
  const activeFilterCount =
    Number(categoryFilter !== 'all') + Number(levelFilter !== 'all') + Number(priceFilter !== 'all');

  const resetFilters = () => {
    setCategoryFilter('all');
    setLevelFilter('all');
    setPriceFilter('all');
  };

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
    setIsCreateDialogOpen(false);
  };

  return (
    <section className="space-y-6">
      {auth.isStaff && (
        <Card className="border-border/90">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Creator Studio</CardTitle>
              <p className="text-sm text-muted-foreground">
                {translate('courses:createCourse')}
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>{translate('courses:createCourse')}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{translate('courses:createCourse')}</DialogTitle>
                  <DialogDescription>
                    Creator Studio
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
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
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="grid gap-2">
                      <Label htmlFor="course-category">{translate('courses:courseCategory')}</Label>
                      <Input id="course-category" value={category} onChange={(event) => setCategory(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course-level">{translate('courses:courseLevel')}</Label>
                      <Input id="course-level" value={level} onChange={(event) => setLevel(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course-price">{translate('courses:coursePrice')}</Label>
                      <Input id="course-price" value={price} onChange={(event) => setPrice(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course-public">{translate('courses:isPublic')}</Label>
                      <button
                        id="course-public"
                        type="button"
                        className={cn(
                          'h-11 rounded-lg border border-border/90 px-3 text-left text-sm font-medium',
                          isPublic ? 'bg-secondary text-secondary-foreground' : 'bg-muted/50 text-muted-foreground'
                        )}
                        onClick={() => setIsPublic((prev) => !prev)}
                      >
                        {isPublic ? 'Public' : 'Private'}
                      </button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => void submit()}
                    disabled={!title.trim() || !description.trim() || catalog.isFetching}
                  >
                    {translate('courses:createCourse')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {translate('courses:courseTitle')} / {translate('courses:courseDescription')} / {translate('courses:courseCategory')}
            </p>
          </CardContent>
        </Card>
      )}

      {auth.isStaff && (
        <Card className="border-border/90">
          <CardHeader>
            <CardTitle>{translate('courses:myCourses')}</CardTitle>
          </CardHeader>
          <CardContent>
            {mine.isLoading ? (
              <CourseGridSkeleton count={3} />
            ) : mine.data?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {mine.data.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    detailsLabel={translate('courses:manage')}
                    publishLabel={translate('courses:publish')}
                    priceLabel={translate('courses:coursePrice')}
                    modulesLabel={translate('courses:modules')}
                    enrollmentsLabel={translate('courses:enrollments')}
                    publishedLabel={translate('courses:published')}
                    draftLabel={translate('courses:draft')}
                    visibilityPublicLabel={translate('courses:visibilityPublic')}
                    visibilityPrivateLabel={translate('courses:visibilityPrivate')}
                    canPublish
                    onPublish={publishCourse}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{translate('courses:noCourses')}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-border/90">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{translate('courses:catalog')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredCatalog.length} {translate('courses:results')}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={translate('courses:searchPlaceholder')}
              className="sm:flex-1"
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 self-start sm:self-auto">
                  <SlidersHorizontal className="size-4" />
                  {translate('courses:filter')}
                  {activeFilterCount > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-semibold text-primary">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{translate('courses:filterTitle')}</SheetTitle>
                  <SheetDescription>{translate('courses:filterDescription')}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 grid gap-4">
                  <div className="grid gap-2">
                    <Label>{translate('courses:filterCategory')}</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={translate('courses:filterCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{translate('courses:filterAll')}</SelectItem>
                        {categoryOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>{translate('courses:filterLevel')}</Label>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={translate('courses:filterLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{translate('courses:filterAll')}</SelectItem>
                        {levelOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>{translate('courses:filterPrice')}</Label>
                    <Select value={priceFilter} onValueChange={(value) => setPriceFilter(value as PriceFilter)}>
                      <SelectTrigger>
                        <SelectValue placeholder={translate('courses:filterPrice')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{translate('courses:filterAll')}</SelectItem>
                        <SelectItem value="free">{translate('courses:filterFree')}</SelectItem>
                        <SelectItem value="paid">{translate('courses:filterPaid')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <SheetFooter className="mt-6">
                  <Button variant="outline" onClick={resetFilters} disabled={!hasActiveFilters}>
                    {translate('courses:resetFilters')}
                  </Button>
                  <SheetClose asChild>
                    <Button>{translate('courses:applyFilters')}</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {catalog.isLoading ? (
            <CourseGridSkeleton count={6} />
          ) : pagedCatalog.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pagedCatalog.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    detailsLabel={translate('courses:details')}
                    publishLabel={translate('courses:publish')}
                    enrollLabel={translate('courses:enroll')}
                    priceLabel={translate('courses:coursePrice')}
                    modulesLabel={translate('courses:modules')}
                    enrollmentsLabel={translate('courses:enrollments')}
                    publishedLabel={translate('courses:published')}
                    draftLabel={translate('courses:draft')}
                    visibilityPublicLabel={translate('courses:visibilityPublic')}
                    visibilityPrivateLabel={translate('courses:visibilityPrivate')}
                    canPublish={auth.isStaff}
                    canEnroll={auth.isAuthenticated}
                    onPublish={publishCourse}
                    onEnroll={enrollCourse}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
                <p className="text-sm text-muted-foreground">
                  {translate('courses:showing')} {showingFrom}-{showingTo} / {filteredCatalog.length}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={catalogPage === 1}
                    onClick={() => setCatalogPage((current) => Math.max(1, current - 1))}
                  >
                    {translate('courses:previous')}
                  </Button>
                  {catalogPageNumbers.map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === catalogPage ? 'default' : 'outline'}
                      onClick={() => setCatalogPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={catalogPage === totalCatalogPages}
                    onClick={() => setCatalogPage((current) => Math.min(totalCatalogPages, current + 1))}
                  >
                    {translate('courses:next')}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{translate('courses:noFilteredCatalog')}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function CourseGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <article key={`course-grid-skeleton-${index}`} className="edu-panel h-full space-y-3 p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </article>
      ))}
    </div>
  );
}

type CourseCardProps = {
  course: CourseItem;
  detailsLabel: string;
  publishLabel: string;
  enrollLabel?: string;
  canPublish?: boolean;
  priceLabel: string;
  modulesLabel: string;
  enrollmentsLabel: string;
  publishedLabel: string;
  draftLabel: string;
  visibilityPublicLabel: string;
  visibilityPrivateLabel: string;
  canEnroll?: boolean;
  onPublish: (courseId: string) => Promise<void>;
  onEnroll?: (courseId: string) => Promise<void>;
};

function CourseCard({
  course,
  detailsLabel,
  publishLabel,
  enrollLabel,
  canPublish = false,
  priceLabel,
  modulesLabel,
  enrollmentsLabel,
  publishedLabel,
  draftLabel,
  visibilityPublicLabel,
  visibilityPrivateLabel,
  canEnroll = false,
  onPublish,
  onEnroll,
}: CourseCardProps) {
  return (
    <article className="edu-panel flex h-full flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{course.title}</h3>
          <p className="text-xs text-muted-foreground">
            {course.category} | {course.level}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {course.isPublished ? (
            <Badge variant="default">{publishedLabel}</Badge>
          ) : (
            <Badge variant="secondary">{draftLabel}</Badge>
          )}
          <Badge variant={course.isPublic ? 'outline' : 'secondary'}>
            {course.isPublic ? visibilityPublicLabel : visibilityPrivateLabel}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{course.description}</p>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-border/80 bg-muted/35 p-2.5">
          <p className="text-xs text-muted-foreground">{priceLabel}</p>
          <p className="mt-1 font-semibold">{formatMoney(course.price)}</p>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/35 p-2.5">
          <p className="text-xs text-muted-foreground">{modulesLabel}</p>
          <p className="mt-1 font-semibold">{course.moduleCount}</p>
        </div>
        <div className="col-span-2 rounded-lg border border-border/80 bg-muted/35 p-2.5">
          <p className="text-xs text-muted-foreground">{enrollmentsLabel}</p>
          <p className="mt-1 font-semibold">{course.enrollmentCount}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {canPublish && !course.isPublished && (
          <Button size="sm" onClick={() => void onPublish(course.id)}>
            {publishLabel}
          </Button>
        )}

        <Button asChild size="sm" variant="outline">
          <Link to="/courses/$courseId" params={{ courseId: course.id }}>
            {detailsLabel}
          </Link>
        </Button>

        {canEnroll && onEnroll && enrollLabel && (
          <Button size="sm" onClick={() => void onEnroll(course.id)}>
            {enrollLabel}
          </Button>
        )}
      </div>
    </article>
  );
}
