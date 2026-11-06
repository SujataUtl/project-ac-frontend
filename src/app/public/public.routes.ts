import { Routes } from '@angular/router';

export const publicRoutes: Routes = [
  { path: '', loadComponent: () => import('./pages/home').then((m) => m.HomePage) },
  { path: 'about', loadComponent: () => import('./pages/about').then((m) => m.AboutPage) },
  { path: 'services', loadComponent: () => import('./pages/services').then((m) => m.ServicesPage) },
  { path: 'services/:slug', loadComponent: () => import('./pages/service-detail').then((m) => m.ServiceDetailPage) },
  { path: 'portfolio', loadComponent: () => import('./pages/portfolio').then((m) => m.PortfolioPage) },
  { path: 'portfolio/:slug', loadComponent: () => import('./pages/project-detail').then((m) => m.ProjectDetailPage) },
  { path: 'technology', loadComponent: () => import('./pages/technology').then((m) => m.TechnologyPage) },
  { path: 'industries', loadComponent: () => import('./pages/industries').then((m) => m.IndustriesPage) },
  { path: 'process', loadComponent: () => import('./pages/process').then((m) => m.ProcessPage) },
  { path: 'contact', loadComponent: () => import('./pages/contact').then((m) => m.ContactPage) },
  { path: '**', title: 'Page not found | App Circuit Labs', loadComponent: () => import('./pages/not-found').then((m) => m.NotFoundPage) },
];
