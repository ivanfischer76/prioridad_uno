import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MarkdownViewerComponent } from '../../components/markdown-viewer/markdown-viewer.component';

@Component({
    selector: 'app-amazonas-boliviano',
    standalone: true,
    imports: [
        ButtonModule,
        CarouselModule,
        TooltipModule,
        ScrollPanelModule,
        TranslateModule,
        MarkdownViewerComponent
    ],
    templateUrl: './amazonas-boliviano.component.html',
    styleUrls: ['./amazonas-boliviano.component.scss']
})
export class AmazonasBolivianoComponent {

    contenidoMarkdown = `El **Amazonas boliviano** es una de las regiones mas biodiversas y culturalmente ricas de Bolivia.

Con este formato puedes mostrar:

- **Negritas**
- *Cursiva*
- <u>Subrayado</u>
- Saltos de linea
- Listas y subtitulos

### Desafios principales
1. Conservacion de la biodiversidad.
2. Fortalecimiento de comunidades locales.
3. Desarrollo sostenible de largo plazo.

Tambien puedes incluir enlaces como [organizaciones de conservacion](https://www.wwf.org/).
lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut gravida lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor. Pellentesque auctor nisi id magna consequat sagittis. Curabitur dapibus enim sit amet elit pharetra tincidunt feugiat nisl imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed odio eros.
`;

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
