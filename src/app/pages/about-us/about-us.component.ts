import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ButtonModule } from 'primeng/button';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@Component({
  selector: 'app-about-us',
  imports: [
    ButtonModule,
    TranslateModule
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
    email: string = 'info_prioridad_uno@email.com';
    phone: string = '+54 9 11 1234-5678';
    constructor(private router: Router, private translate: TranslateService) {
        console.log(this.translate.currentLang);
    }

    goToContact() {
      this.router.navigate(['/contact-us']);
    }

    goToDonate() {
      this.router.navigate(['/donate']);
    }
}
