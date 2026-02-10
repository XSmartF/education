import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
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
import NotFoundPage from '../pages/NotFoundPage';

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

const homeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/',
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => simpleLayoutRoute,
  path: 'login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => simpleLayoutRoute,
  path: 'register',
  component: RegisterPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => simpleLayoutRoute,
  path: 'forgot-password',
  component: ForgotPasswordPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => simpleLayoutRoute,
  path: 'reset-password',
  component: ResetPasswordPage,
});

const todosRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'todos',
  component: TodosPage,
});

const todoDetailRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: 'todos/$todoId',
  component: TodoDetailPage,
});

const routeTree = rootRoute.addChildren([
  dashboardLayoutRoute.addChildren([homeRoute, todosRoute, todoDetailRoute]),
  simpleLayoutRoute.addChildren([loginRoute, registerRoute, forgotPasswordRoute, resetPasswordRoute]),
]);

export const router = createRouter({
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
