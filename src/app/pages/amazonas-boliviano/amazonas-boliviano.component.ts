import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-amazonas-boliviano',
    standalone: true,
    imports: [
        ButtonModule,
        CarouselModule,
        TooltipModule,
        TranslateModule
    ],
    templateUrl: './amazonas-boliviano.component.html',
    styleUrls: ['./amazonas-boliviano.component.scss']
})
export class AmazonasBolivianoComponent {

    imagenesAmazonas = [
        { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', alt: 'Río Amazonas' },
        { url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', alt: 'Selva Amazónica' },
        { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80', alt: 'Comunidad indígena' },
        { url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', alt: 'Fauna del Amazonas' }
    ];

    constructor(private router: Router) {}

    volverAProjects() {
        this.router.navigate(['/welcome']);
    }

    entrada_anterior() {
        this.router.navigate(['/welcome']);
    }

    siguiente_entrada() {
        this.router.navigate(['/welcome']);
    }
}
