import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard').then((m) => m.DashboardPage), title: 'Dashboard · Admin' },
  { path: 'settings', loadComponent: () => import('./pages/settings').then((m) => m.SettingsPage), title: 'Site text · Admin' },
  { path: 'enquiries', loadComponent: () => import('./pages/enquiries').then((m) => m.EnquiriesPage), title: 'Enquiries · Admin' },
  { path: 'account', loadComponent: () => import('./pages/account').then((m) => m.AccountPage), title: 'Account · Admin' },
  { path: 'content/:type', loadComponent: () => import('./pages/content-list').then((m) => m.ContentListPage), title: 'Content · Admin' },
  { path: 'content/:type/:id', loadComponent: () => import('./pages/content-form').then((m) => m.ContentFormPage), title: 'Edit · Admin' },
  { path: '**', redirectTo: '' },
];
