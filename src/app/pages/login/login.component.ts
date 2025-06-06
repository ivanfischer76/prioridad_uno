import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
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
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    email: string = '';
    password: string = '';
    rememberMe: boolean = false;
    
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
    
    onLogin() {
        // NOTA: Actualmente acepta cualquier usuario/contraseña y marca como logueado.
        // Implementar autenticación real contra backend en el futuro.
        this.authService.login(this.email, this.password); // isLoggedIn se pone en true
        this.router.navigate(['welcome']);
    }
    
    onRegister() {
        // Redirigir a la página de registro
        console.log('Redirecting to register page...');
        this.router.navigate(['register'])
    }
}
