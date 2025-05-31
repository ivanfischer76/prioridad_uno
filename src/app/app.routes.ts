import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'join-us', loadComponent: () => import('./pages/join-us/join-us.component').then(m => m.JoinUsComponent) },
  { path: 'amazonas-boliviano', loadComponent: () => import('./pages/projects/pages/amazonas-boliviano/amazonas-boliviano.component').then(m => m.AmazonasBolivianoComponent) },
  { path: 'stories', loadComponent: () => import('./pages/stories/stories.component').then(m => m.StoriesComponent) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'donate', loadComponent: () => import('./pages/donate/donate.component').then(m => m.DonateComponent) },
  { path: '**', redirectTo: 'home' }
];
