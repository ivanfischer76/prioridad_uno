import { Routes } from '@angular/router';
export const routes: Routes = [
    {
    path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'about-us',
        loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent)
    },
    {
        path: 'contact-us',
        loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent)
    },
    {
        path: 'campaigns',
        loadComponent: () => import('./pages/campaigns/campaigns.component').then(m => m.CampaignsComponent)
    },
    {
        path: 'donate',
        loadComponent: () => import('./pages/donate/donate.component').then(m => m.DonateComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'welcome',
        loadComponent: () => import('./pages/welcome/welcome.component').then(m => m.WelcomeComponent)
    }
];
