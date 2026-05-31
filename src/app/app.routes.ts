import { Routes } from '@angular/router';
import { authUsersGuard } from './guards/auth-users.guard';
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
        path: 'donate',
        loadComponent: () => import('./pages/donate/donate.component').then(m => m.DonateComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: 'welcome',
        loadComponent: () => import('./pages/welcome/welcome.component').then(m => m.WelcomeComponent)
    },
    {
        path: 'amazonas-boliviano',
        loadComponent: () => import('./pages/amazonas-boliviano/amazonas-boliviano.component').then(m => m.AmazonasBolivianoComponent)
    },
    {
        path: 'gestionar-amazonas-boliviano',
        canActivate: [authUsersGuard],
        data: { permiso: 'gestionar proyectos' },
        loadComponent: () => import('./pages/gestionar-amazonas-boliviano/gestionar-amazonas-boliviano.component').then(m => m.GestionarAmazonasBolivianoComponent)
    },
    {
        path: 'users',
        canActivate: [authUsersGuard],
        data: { permiso: 'gestionar usuarios' },
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
    },
    {
        path: 'roles',
        canActivate: [authUsersGuard],
        data: { permiso: 'gestionar roles' },
        loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent)
    },
    {
        path: 'permissions',
        canActivate: [authUsersGuard],
        data: { permiso: 'gestionar permisos' },
        loadComponent: () => import('./pages/permissions/permissions.component').then(m => m.PermissionsComponent)
    },
    {
        path: 'gestionar-bienvenida',
        canActivate: [authUsersGuard],
        loadComponent: () => import('./pages/gestionar-bienvenida/gestionar-bienvenida.component').then(m => m.GestionarBienvenidaComponent)
    },
    {
        path: 'gestionar-contactos',
        canActivate: [authUsersGuard],
        data: { permiso: 'gestionar contactos' },
        loadComponent: () => import('./pages/gestionar-contactos/gestionar-contactos.component').then(m => m.GestionarContactosComponent)
    },
    {
        path: 'sistema',
        canActivate: [authUsersGuard],
        data: { permiso: 'gestionar sistema' },
        loadComponent: () => import('./pages/sistema/sistema.component').then(m => m.SistemaComponent)
    },
    {
        path: 'statistics',
        canActivate: [authUsersGuard],
        data: { permisos: ['ver estadisticas', 'ver estadísticas'] },
        loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent)
    }
];
