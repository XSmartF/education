import type { LucideIcon } from 'lucide-react';
import {
  BookOpenText,
  FileText,
  GraduationCap,
  ListTodo,
  LogIn,
  ShoppingBag,
  User,
  UserPlus,
  Wallet,
} from 'lucide-react';
import type { UserRole } from '@/domains/auth/model/types';

export type AccessRole = UserRole | 'Admin';

export const STAFF_ACCESS_ROLES: AccessRole[] = ['Teacher', 'Organize', 'Admin'];

export type SidebarLinkItem = {
  id: string;
  to: '/todos' | '/files' | '/courses' | '/decks' | '/marketplace' | '/wallet' | '/reputation';
  labelKey:
    | 'nav:todos'
    | 'nav:files'
    | 'nav:courses'
    | 'nav:decks'
    | 'nav:marketplace'
    | 'nav:wallet'
    | 'nav:reputation';
  icon: LucideIcon;
  isPublic: boolean;
  allowedRoles?: AccessRole[];
  isActive: (pathname: string) => boolean;
};

export type AuthActionItem = {
  id: 'login' | 'register';
  mode: 'login' | 'register';
  labelKey: 'nav:login' | 'nav:register';
  icon: LucideIcon;
};

export const dashboardLinks: SidebarLinkItem[] = [
  {
    id: 'courses',
    to: '/courses',
    labelKey: 'nav:courses',
    icon: GraduationCap,
    isPublic: true,
    isActive: (pathname) => pathname === '/courses' || pathname.startsWith('/courses/'),
  },
  {
    id: 'decks',
    to: '/decks',
    labelKey: 'nav:decks',
    icon: BookOpenText,
    isPublic: true,
    isActive: (pathname) => pathname === '/decks' || pathname.startsWith('/decks/'),
  },
  {
    id: 'marketplace',
    to: '/marketplace',
    labelKey: 'nav:marketplace',
    icon: ShoppingBag,
    isPublic: true,
    isActive: (pathname) => pathname === '/marketplace' || pathname.startsWith('/marketplace/'),
  },
  {
    id: 'wallet',
    to: '/wallet',
    labelKey: 'nav:wallet',
    icon: Wallet,
    isPublic: false,
    isActive: (pathname) => pathname === '/wallet' || pathname.startsWith('/wallet/'),
  },
  {
    id: 'reputation',
    to: '/reputation',
    labelKey: 'nav:reputation',
    icon: User,
    isPublic: false,
    isActive: (pathname) => pathname === '/reputation' || pathname.startsWith('/reputation/'),
  },
  {
    id: 'todos',
    to: '/todos',
    labelKey: 'nav:todos',
    icon: ListTodo,
    isPublic: false,
    allowedRoles: STAFF_ACCESS_ROLES,
    isActive: (pathname) => pathname === '/todos' || pathname.startsWith('/todos/'),
  },
  {
    id: 'files',
    to: '/files',
    labelKey: 'nav:files',
    icon: FileText,
    isPublic: false,
    allowedRoles: STAFF_ACCESS_ROLES,
    isActive: (pathname) => pathname === '/files' || pathname.startsWith('/files/'),
  },
];

export function canAccessByRole(roles: string[], allowedRoles?: AccessRole[]): boolean {
  if (!allowedRoles?.length) {
    return true;
  }

  return roles.some((role) => allowedRoles.includes(role as AccessRole));
}

export function canViewSidebarLink(
  item: SidebarLinkItem,
  viewer: { isAuthenticated: boolean; roles: string[] }
): boolean {
  if (!viewer.isAuthenticated) {
    return item.isPublic;
  }

  return canAccessByRole(viewer.roles, item.allowedRoles);
}

export const authActions: AuthActionItem[] = [
  { id: 'login', mode: 'login', labelKey: 'nav:login', icon: LogIn },
  { id: 'register', mode: 'register', labelKey: 'nav:register', icon: UserPlus },
];
