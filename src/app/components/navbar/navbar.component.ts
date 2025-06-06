import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-navbar',
    imports: [
        Menubar,
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
    private authSub?: Subscription;

    constructor(
        private router: Router,
        private translate: TranslateService,
        private authService: AuthService
    ) {
        const browserLang = translate.getBrowserLang();
        const supportedLangs = ['es', 'en', 'pt', 'it', 'fr', 'de'];
        const defaultLang = supportedLangs.includes(browserLang!) ? browserLang : 'es';
        this.translate.setDefaultLang(defaultLang!);
        this.translate.use(defaultLang!);
        this.selectedLang = defaultLang!;
        // Asigna el objeto completo, no solo el valor
        this.selectedLang = this.languages.find(l => l.value === defaultLang);
        this.translate.onLangChange.subscribe(() => {
            this.updateMenuItems();
        });
    }

    ngOnInit() {
        this.updateMenuItems();
        this.authSub = this.authService.isLoggedIn$.subscribe(logged => {
            this.isLoggedIn = logged;
            console.log('User logged in:', this.isLoggedIn);
            this.updateMenuItems();
        });
    }

    ngOnDestroy() {
        this.authSub?.unsubscribe();
    }

    updateMenuItems() {
        this.items = [
            {
                isLogo: true,
                command: () => this.router.navigate(['/'])
            },
            // {
            //     label: 'menu.about_us',
            //     icon: 'pi pi-users',
            //     route: '/about-us'
            // },
            
            // Ejemplo: solo mostrar si está logueado
            ...(this.isLoggedIn ? [
                {
                    label: 'welcome',
                    route: '/welcome'
                },
                {
                    label: 'projects',
                    route: '/projects'
                },
                {
                    label: 'Gestión',
                    items: [
                        {
                            label: 'Proyectos'
                        },
                        {
                            label: 'Campañas'
                        },
                        {
                            label: 'Usuarios'
                        },
                        {
                            label: 'Roles'
                        },
                        {
                            label: 'Permisos'
                        }
                    ]
                },
            ] : [
                {
                    label: 'menu.about_us',
                    icon: 'pi pi-users',
                    route: '/about-us'
                },
                {
                    label: 'campaigns',
                    route: '/campaigns'
                },
            ])
        ];
    }

    changeLang(lang: any) {
        this.translate.use(lang.value);
        this.selectedLang = lang;
    }

    onLogout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    onLogin(){
        this.router.navigate(['login'])
    }
    
    onRegister(){
        this.router.navigate(['register'])
    }
}
