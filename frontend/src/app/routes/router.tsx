import { createRootRoute, createRoute, createRouter, type AnyRouter } from '@tanstack/react-router';
import RootLayout from '../layout/RootLayout';
import DashboardLayout from '../layout/DashboardLayout';
import SimpleLayout from '../layout/SimpleLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '@/domains/auth/pages/LoginPage';
import RegisterPage from '@/domains/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/domains/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/domains/auth/pages/ResetPasswordPage';
import TodosPage from '@/domains/todos/pages/TodosPage';
import TodoDetailPage from '@/domains/todos/pages/TodoDetailPage';
import FilesPage from '@/domains/files/pages/FilesPage';
import FileDetailPage from '@/domains/files/pages/FileDetailPage';
import CoursesPage from '@/domains/courses/pages/CoursesPage';
import CourseDetailPage from '@/domains/courses/pages/CourseDetailPage';
import DecksPage from '@/domains/decks/pages/DecksPage';
import DeckDetailPage from '@/domains/decks/pages/DeckDetailPage';
import MarketplacePage from '@/domains/marketplace/pages/MarketplacePage';
import WalletPage from '@/domains/wallet/pages/WalletPage';
import ReputationPage from '@/domains/reputation/pages/ReputationPage';
import RequireAuth from './RequireAuth';
import NotFoundPage from '../pages/NotFoundPage';
import { STAFF_ACCESS_ROLES } from '@/app/config/navigation';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'dashboard',
  component: DashboardLayout,
});

const simpleLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'simple',
  component: SimpleLayout,
});

const createDashboardRoute = (path: string, component: () => JSX.Element) =>
  createRoute({
    getParentRoute: () => dashboardLayoutRoute,
    path,
    component,
  });

const createSimpleRoute = (path: string, component: () => JSX.Element) =>
  createRoute({
    getParentRoute: () => simpleLayoutRoute,
    path,
    component,
  });

const homeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/',
  component: HomePage,
});

const loginRoute = createSimpleRoute('login', LoginPage);
const registerRoute = createSimpleRoute('register', RegisterPage);
const forgotPasswordRoute = createSimpleRoute('forgot-password', ForgotPasswordPage);
const resetPasswordRoute = createSimpleRoute('reset-password', ResetPasswordPage);

const coursesRoute = createDashboardRoute('courses', CoursesPage);
const courseDetailRoute = createDashboardRoute('courses/$courseId', CourseDetailPage);
const decksRoute = createDashboardRoute('decks', DecksPage);
const deckDetailRoute = createDashboardRoute('decks/$deckId', DeckDetailPage);
const marketplaceRoute = createDashboardRoute('marketplace', MarketplacePage);

const walletRoute = createDashboardRoute('wallet', () => <RequireAuth Component={WalletPage} />);
const reputationRoute = createDashboardRoute('reputation', () => <RequireAuth Component={ReputationPage} />);

const todosRoute = createDashboardRoute('todos', () => (
  <RequireAuth Component={TodosPage} allowedRoles={STAFF_ACCESS_ROLES} />
));
const todoDetailRoute = createDashboardRoute('todos/$todoId', () => (
  <RequireAuth Component={TodoDetailPage} allowedRoles={STAFF_ACCESS_ROLES} />
));
const filesRoute = createDashboardRoute('files', () => (
  <RequireAuth Component={FilesPage} allowedRoles={STAFF_ACCESS_ROLES} />
));
const fileDetailRoute = createDashboardRoute('files/$fileId', () => (
  <RequireAuth Component={FileDetailPage} allowedRoles={STAFF_ACCESS_ROLES} />
));

const routeTree = rootRoute.addChildren([
  dashboardLayoutRoute.addChildren([
    homeRoute,
    coursesRoute,
    courseDetailRoute,
    decksRoute,
    deckDetailRoute,
    marketplaceRoute,
    walletRoute,
    reputationRoute,
    todosRoute,
    todoDetailRoute,
    filesRoute,
    fileDetailRoute,
  ]),
  simpleLayoutRoute.addChildren([loginRoute, registerRoute, forgotPasswordRoute, resetPasswordRoute]),
]);

export const router = createRouter({
  routeTree,
});

type AppRouter = AnyRouter;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
