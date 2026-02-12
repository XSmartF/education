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
    isActive: (pathname) => pathname === '/courses' || pathname.startsWith('/courses/'),
  },
  {
    id: 'decks',
    to: '/decks',
    labelKey: 'nav:decks',
    icon: BookOpenText,
    isActive: (pathname) => pathname === '/decks' || pathname.startsWith('/decks/'),
  },
  {
    id: 'marketplace',
    to: '/marketplace',
    labelKey: 'nav:marketplace',
    icon: ShoppingBag,
    isActive: (pathname) => pathname === '/marketplace' || pathname.startsWith('/marketplace/'),
  },
  {
    id: 'wallet',
    to: '/wallet',
    labelKey: 'nav:wallet',
    icon: Wallet,
    isActive: (pathname) => pathname === '/wallet' || pathname.startsWith('/wallet/'),
  },
  {
    id: 'reputation',
    to: '/reputation',
    labelKey: 'nav:reputation',
    icon: User,
    isActive: (pathname) => pathname === '/reputation' || pathname.startsWith('/reputation/'),
  },
  {
    id: 'todos',
    to: '/todos',
    labelKey: 'nav:todos',
    icon: ListTodo,
    isActive: (pathname) => pathname === '/todos' || pathname.startsWith('/todos/'),
  },
  {
    id: 'files',
    to: '/files',
    labelKey: 'nav:files',
    icon: FileText,
    isActive: (pathname) => pathname === '/files' || pathname.startsWith('/files/'),
  },
];

export const authActions: AuthActionItem[] = [
  { id: 'login', mode: 'login', labelKey: 'nav:login', icon: LogIn },
  { id: 'register', mode: 'register', labelKey: 'nav:register', icon: UserPlus },
];
