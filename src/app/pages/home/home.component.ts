import { Component, ViewChild, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GalleriaModule, Galleria } from 'primeng/galleria';
import { CarouselModule } from 'primeng/carousel';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SiteVisitService } from '../../services/site-visit.service';

@Component({
    selector: 'app-home',
    imports: [
        TranslateModule,
        GalleriaModule,
        CarouselModule,
        ButtonModule
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    @ViewChild('galleria') galleria!: Galleria;

    visitStats = {
        unique_total: 0,
        unique_today: 0,
        pageviews_total: 0,
        pageviews_today: 0,
    };

    images = [
        {
            image: 'assets/images/foto_1.jpeg',
            thumbnail: 'assets/images/foto_1.jpeg',
            alt: 'Imagen 1',
            textKey: 'texto_imagen_1',
            text: ''
        },
        {
            image: 'assets/images/foto_2.jpeg',
            thumbnail: 'assets/images/foto_2.jpeg',
            alt: 'Imagen 2',
            textKey: 'texto_imagen_2',
            text: ''
        },
        {
            image: 'assets/images/foto_3.jpeg',
            thumbnail: 'assets/images/foto_3.jpeg',
            alt: 'Imagen 3',
            textKey: 'texto_imagen_3',
            text: ''
        },
        {
            image: 'assets/images/foto_4.jpeg',
            thumbnail: 'assets/images/foto_4.jpeg',
            alt: 'Imagen 4',
            textKey: 'texto_imagen_4',
            text: ''
        },
        {
            image: 'assets/images/foto_5.jpeg',
            thumbnail: 'assets/images/foto_5.jpeg',
            alt: 'Imagen 5',
            textKey: 'texto_imagen_5',
            text: ''
        },
        {
            image: 'assets/images/foto_6.jpeg',
            thumbnail: 'assets/images/foto_6.jpeg',
            alt: 'Imagen 6',
            textKey: 'texto_imagen_6',
            text: ''
        },
        {
            image: 'assets/images/foto_7.jpeg',
            thumbnail: 'assets/images/foto_7.jpeg',
            alt: 'Imagen 7',
            textKey: 'texto_imagen_7',
            text: ''
        }
    ];

    constructor(
        private router: Router,
        private translate: TranslateService,
        private siteVisitService: SiteVisitService
    ) {}

    ngOnInit(): void {
        this.loadTranslations();
        this.trackHomeVisit();
        this.translate.onLangChange.subscribe(() => this.loadTranslations());
    }

    private trackHomeVisit(): void {
        const path = this.router.url || '/';

        this.siteVisitService.trackVisit(path).subscribe({
            next: (response) => {
                if (response?.data) {
                    this.visitStats = response.data;
                }
            },
            error: () => {
                // If counting fails, the home page should still work normally.
            },
        });
    }

    private loadTranslations() {
        for (const img of this.images) {
            this.translate.get(img.textKey).subscribe(val => img.text = val);
        }
    }

    goToLogin() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn) {
            this.router.navigate(['/amazonas-boliviano']);
            return;
        }

        this.router.navigate(['/login'], {
            queryParams: { returnUrl: '/amazonas-boliviano' }
        });
    }


}
