import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslateModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'prioridad_uno';

  constructor(private translate: TranslateService) {
    // Lista de idiomas soportados
    const supportedLangs = ['es', 'en', 'it', 'de', 'pt', 'fr'];

    // Detecta el idioma del navegador
    const browserLang = navigator.language.split('-')[0];

    // Si el idioma está soportado, úsalo; si no, usa 'es'
    const langToSet = supportedLangs.includes(browserLang) ? browserLang : 'es';

    translate.addLangs(supportedLangs);
    translate.setDefaultLang('es');
    translate.use(langToSet);
  }

  changeLang(lang: string) {
    this.translate.use(lang);
  }
}
