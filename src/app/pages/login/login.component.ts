import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    imports: [
        TranslateModule,
        CommonModule,
        RouterModule,
        FormsModule,
        ButtonModule,
        SelectModule,
        InputTextModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    email: string = '';
    username: string = '';
    password: string = '';
    rememberMe: boolean = false;
    showPassword: boolean = false;
    isLoading: boolean = false;
    private returnUrl: string = '/welcome';
    
    constructor(
        private router: Router,
        private route: ActivatedRoute,
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
        this.translate.onLangChange.subscribe(() => {
            // Actualizar el idioma de la interfaz si es necesario
            console.log('Language changed to:', this.translate.currentLang);
        }
    );

        this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/welcome';
    }
    
    loginError: string = '';

    onLogin() {
        this.loginError = '';
        this.isLoading = true;
        this.authService.login(this.username, this.password).subscribe({
            next: (response: any) => {
                sessionStorage.setItem('response_logged_user', JSON.stringify(response));
                this.isLoading = false;
                if (response && response.token) {
                    const loggedUser = response?.user ?? null;
                    if (loggedUser) {
                        sessionStorage.setItem('logged_user', JSON.stringify(loggedUser));
                        const supportedLangs = ['es', 'en', 'pt', 'it', 'fr', 'de'];
                        const selectedLang = localStorage.getItem('selected_lang');
                        const userLang = loggedUser?.idioma;
                        if (selectedLang && supportedLangs.includes(selectedLang)) {
                            this.translate.use(selectedLang);
                        } else if (userLang && supportedLangs.includes(userLang)) {
                            this.translate.use(userLang);
                            localStorage.setItem('selected_lang', userLang);
                        }
                    }
                    sessionStorage.setItem('isLoggedIn', 'true');
                    this.authService.setIsLoggedIn(true);
                    console.log('Login successful, navigating to return URL...');
                    this.router.navigateByUrl(this.returnUrl);
                } else {
                    this.authService.setIsLoggedIn(false);
                    this.loginError = this.translate.instant('login.invalid_credentials');
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.loginError = this.translate.instant('login.invalid_credentials');
            }
        });
    }
    
    onRegister() {
        // Redirigir a la página de registro
        console.log('Redirecting to register page...');
        this.router.navigate(['register'])
    }
}
