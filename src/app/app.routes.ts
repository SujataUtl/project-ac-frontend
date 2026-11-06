import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'login', loadComponent: () => import('./admin/pages/login').then((m) => m.LoginPage), title: 'Admin login' },
      {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./admin/admin-layout').then((m) => m.AdminLayout),
        loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./public/public-layout').then((m) => m.PublicLayout),
    loadChildren: () => import('./public/public.routes').then((m) => m.publicRoutes),
  },
];
