import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { User } from '../../models/admin/user';

@Component({
    selector: 'app-navbar',
    imports: [
        Menubar,
        MenuModule,
        TranslateModule,
        CommonModule,
        RouterModule,
        FormsModule,
        ButtonModule,
        SelectModule,
        TooltipModule
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
    items: MenuItem[] | undefined;
    userMenuItems: MenuItem[] = [];

    languages = [
        { label: 'Español', value: 'es' },
        { label: 'English', value: 'en' },
        { label: 'Português', value: 'pt' },
        { label: 'Italiano', value: 'it' },
        { label: 'Français', value: 'fr' },
        { label: 'Deutsch', value: 'de' }
    ];

    selectedLang: any;

    isLoggedIn: boolean = false;

    loggedUser: User | null = null;

    private authSub?: Subscription;

    constructor(
        private router: Router,
        private translate: TranslateService,
        private authService: AuthService
    ) {
        const supportedLangs = ['es', 'en', 'pt', 'it', 'fr', 'de'];
        const storedLang = localStorage.getItem('selected_lang');
        const browserLang = translate.getBrowserLang();
        const defaultLang = supportedLangs.includes(storedLang || '')
            ? storedLang
            : (supportedLangs.includes(browserLang || '') ? browserLang : 'es');

        this.translate.setDefaultLang('es');
        this.translate.use(defaultLang || 'es');
        this.selectedLang = this.languages.find(l => l.value === defaultLang) || this.languages[0];
        this.translate.onLangChange.subscribe(() => {
            this.updateMenuItems();
            this.updateUserMenuItems();
        });
    }

    ngOnInit() {
        this.isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        this.syncLoggedUserFromSession();
        this.updateMenuItems();
        this.updateUserMenuItems();
        this.authSub = this.authService.getIsLoggedIn$().subscribe(
            (logged: boolean) => {
                this.isLoggedIn = logged;
                console.log('User logged in:', this.isLoggedIn);
                this.syncLoggedUserFromSession();
                console.log('Logged user data:', this.loggedUser);
                this.updateMenuItems();
            }
        );
    }

    updateUserMenuItems(): void {
        this.userMenuItems = [
            {
                label: this.translate.instant('profile'),
                icon: 'pi pi-user-edit',
                command: () => this.goToProfile(),
            },
            {
                label: this.translate.instant('logout'),
                icon: 'pi pi-sign-out',
                command: () => this.onLogout(),
            }
        ];
    }

    ngOnDestroy() {
        this.authSub?.unsubscribe();
    }

    updateMenuItems() {
        const baseItems = [
            {
                isLogo: true,
                command: () => this.router.navigate(['/'])
            }
        ];
        let menuItems: any[] = [];
        if (this.isLoggedIn) {
            const managementItems: MenuItem[] = [];

            if (this.hasPermission('gestionar proyectos')) {
                managementItems.push({
                    label: 'Proyectos',
                    items: [
                        {
                            label: 'Amazonas Boliviano',
                            command: () => this.router.navigate(['/gestionar-amazonas-boliviano'])
                        },
                    ]
                });
            }

            if (this.hasPermission('gestionar usuarios')) {
                managementItems.push({
                    label: 'Usuarios',
                    command: () => this.router.navigate(['/users'])
                });
            }

            if (this.hasPermission('gestionar roles')) {
                managementItems.push({
                    label: 'Roles',
                    command: () => this.router.navigate(['/roles'])
                });
            }

            if (this.hasPermission('gestionar permisos')) {
                managementItems.push({
                    label: 'Permisos',
                    command: () => this.router.navigate(['/permissions'])
                });
            }

            menuItems = [
                {
                    label: 'welcome',
                    route: '/welcome'
                },
                {
                    label: 'amazonas',
                    route: '/amazonas-boliviano'
                },
                // {
                //     label: 'projects',
                //     route: '/projects'
                // },
                // {
                //     label: 'menu.campaigns',
                //     route: '/campaigns'
                // },
            ];

            if (this.hasAnyPermission(['ver estadisticas', 'ver estadísticas'])) {
                menuItems.push({
                    label: 'menu.statistics',
                    route: '/statistics'
                });
            }

            if (managementItems.length > 0 && this.hasAnyPermission([
                'gestionar usuarios',
                'gestionar roles',
                'gestionar permisos',
                'gestionar proyectos'
            ])) {
                menuItems.push({
                    label: 'menu.management',
                    items: managementItems,
                });
            }
            
        } else {
            menuItems = [
                {
                    label: 'menu.about_us',
                    icon: 'pi pi-users',
                    route: '/about-us'
                },
                // {
                //     label: 'menu.campaigns',
                //     route: '/campaigns'
                // }
            ];
        }
        this.items = [...baseItems, ...menuItems];
    }

    changeLang(lang: any) {
        this.translate.use(lang.value);
        this.selectedLang = lang;
        localStorage.setItem('selected_lang', lang.value);
    }

    onLogout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    goToProfile(): void {
        this.router.navigate(['/profile']);
    }

    onLogin(){
        this.router.navigate(['login'])
    }
    
    onRegister(){
        this.router.navigate(['register'])
    }

    private syncLoggedUserFromSession(): void {
        const rawLoggedUser = sessionStorage.getItem('logged_user');
        const rawLoginResponse = sessionStorage.getItem('response_logged_user');

        const loggedUser = rawLoggedUser ? JSON.parse(rawLoggedUser) as User : null;
        const loginResponse = rawLoginResponse ? JSON.parse(rawLoginResponse) as { user?: User } : null;
        const responseUser = loginResponse?.user ?? null;

        if (responseUser?.permissions?.length || responseUser?.roles?.length) {
            this.loggedUser = responseUser;
            return;
        }

        this.loggedUser = loggedUser;
    }

    private hasPermission(permissionName: string): boolean {
        const userPermissions = this.loggedUser?.permissions?.map(permission => permission?.name?.toString().toLowerCase().trim() || '') || [];
        return userPermissions.includes(permissionName.toLowerCase().trim());
    }

    private hasAnyPermission(permissionNames: string[]): boolean {
        return permissionNames.some(permissionName => this.hasPermission(permissionName));
    }
}
