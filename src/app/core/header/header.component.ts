import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        TranslateModule,
        NgbDropdownModule
],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    menuItems = [
        { label: 'Inicio', routerLink: '/home' },
        { label: 'Quiénes somos', routerLink: '/about' },
        { label: 'Únete', routerLink: '/join-us' },
        { label: 'Amazonas Boliviano', routerLink: '/amazonas-boliviano' },
        { label: 'Historias', routerLink: '/stories' },
        { label: 'Blog', routerLink: '/blog' },
        { label: 'Contacto', routerLink: '/contact' },
        { label: 'Donar', routerLink: '/donate' }
    ];

    languages = [
        { code: 'es', label: 'Español', flag: 'assets/flags/es.svg' },
        { code: 'en', label: 'English', flag: 'assets/flags/en.svg' },
        { code: 'de', label: 'Deutsch', flag: 'assets/flags/de.svg' },
        { code: 'fr', label: 'Français', flag: 'assets/flags/fr.svg' },
        { code: 'it', label: 'Italiano', flag: 'assets/flags/it.svg' },
        { code: 'pt', label: 'Português', flag: 'assets/flags/pt.svg' }
    ];

    currentLang = this.languages[0];
    
    constructor(private translate: TranslateService) {}

    changeLang(lang: string) {
        this.translate.use(lang);
        this.setCurrentLang(lang);
    }

    setCurrentLang(lang: string) {
        const found = this.languages.find(l => l.code === lang);
        this.currentLang = found ? found : this.languages[0];
    }
}
