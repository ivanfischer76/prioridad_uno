import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
    
    constructor(
        private router: Router,
        private translate: TranslateService,
        private authService: AuthService
    ) {
        // Configuración del idioma por defecto
        const browserLang = translate.getBrowserLang();
        const supportedLangs = ['es', 'en', 'pt', 'it', 'fr', 'de'];
        const defaultLang = supportedLangs.includes(browserLang!) ? browserLang : 'es';
        this.translate.setDefaultLang(defaultLang!);
        this.translate.use(defaultLang!);
        this.translate.onLangChange.subscribe(() => {
            // Actualizar el idioma de la interfaz si es necesario
            console.log('Language changed to:', this.translate.currentLang);
        }
    );
        this.translate.setDefaultLang('es'); // Establecer el idioma por defecto
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
                    sessionStorage.setItem('isLoggedIn', 'true');
                    this.authService.setIsLoggedIn(true);
                    console.log('Login successful, navigating to welcome page...');
                    this.router.navigate(['welcome']);
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
