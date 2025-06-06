import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';

import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { environment } from '../environments/environment';

// Función para el loader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@Component({
    selector: 'app-root',
    imports: [
      RouterOutlet,
      TranslateModule, 
      HttpClientModule,
      FooterComponent,
      NavbarComponent
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App implements OnInit {
    protected title = 'prioridad_uno';

    items: MenuItem[] | undefined;
    
    constructor(private translate: TranslateService) {
        this.translate.setDefaultLang('es');
        console.log('producción?:', environment.production);
    }

    ngOnInit() {
        this.items = [
            {
                label: 'Home',
                icon: 'pi pi-home'
            },
            {
                label: 'Features',
                icon: 'pi pi-star'
            },
            {
                label: 'Projects',
                icon: 'pi pi-search',
                items: [
                    {
                        label: 'Components',
                        icon: 'pi pi-bolt'
                    },
                    {
                        label: 'Blocks',
                        icon: 'pi pi-server'
                    },
                    {
                        label: 'UI Kit',
                        icon: 'pi pi-pencil'
                    },
                    {
                        label: 'Templates',
                        icon: 'pi pi-palette',
                        items: [
                            {
                                label: 'Apollo',
                                icon: 'pi pi-palette'
                            },
                            {
                                label: 'Ultima',
                                icon: 'pi pi-palette'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Contact',
                icon: 'pi pi-envelope'
            }
        ]
    }
    
}
