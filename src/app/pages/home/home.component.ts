import { Component, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { GalleriaModule, Galleria } from 'primeng/galleria';
import { CarouselModule } from 'primeng/carousel';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [
        TranslateModule,
        GalleriaModule,
        CarouselModule
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    @ViewChild('galleria') galleria!: Galleria;
    images = [
        {
            image: 'https://picsum.photos/id/1015/800/400',
            thumbnail: 'https://picsum.photos/id/1015/200/100',
            alt: 'Imagen 1',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        },
        {
            image: 'https://picsum.photos/id/1016/800/400',
            thumbnail: 'https://picsum.photos/id/1016/200/100',
            alt: 'Imagen 2',
            text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem. ed ut perspiciatis unde omnis iste natus error sit voluptatem. ed ut perspiciatis unde omnis iste natus error sit voluptatem. ed ut perspiciatis unde omnis iste natus error sit voluptatem.'
        },
        {
            image: 'https://picsum.photos/id/1018/800/400',
            thumbnail: 'https://picsum.photos/id/1018/200/100',
            alt: 'Imagen 3',
            text: 'At vero eos et accusamus et iusto odio dignissimos ducimus. At vero eos et accusamus et iusto odio dignissimos ducimus. At vero eos et accusamus et iusto odio dignissimos ducimus. At vero eos et accusamus et iusto odio dignissimos ducimus.'
        },
        {
            image: 'https://picsum.photos/id/1020/800/400',
            thumbnail: 'https://picsum.photos/id/1020/200/100',
            alt: 'Imagen 4',
            text: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit. Quis autem vel eum iure reprehenderit qui in ea voluptate velit. Quis autem vel eum iure reprehenderit qui in ea voluptate velit. Quis autem vel eum iure reprehenderit qui in ea voluptate velit.'
        },
        {
            image: 'https://picsum.photos/id/1024/800/400',
            thumbnail: 'https://picsum.photos/id/1024/200/100',
            alt: 'Imagen 5',
            text: 'Ut enim ad minima veniam, quis nostrum exercitationem ullam. Ut enim ad minima veniam, quis nostrum exercitationem ullam. Ut enim ad minima veniam, quis nostrum exercitationem ullam. Ut enim ad minima veniam, quis nostrum exercitationem ullam.'
        }
    ];

    constructor(private router: Router) {}

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
