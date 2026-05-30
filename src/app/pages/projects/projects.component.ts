import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-projects',
    imports: [
        TranslateModule,
        CarouselModule,
        CommonModule
    ],
    templateUrl: './projects.component.html',
    styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
    projects = [
        {
            id: 1,
            image: 'https://picsum.photos/id/1015/400/250',
            title: 'Evangelización en el Amazonas Boliviano',
            description: 'Llevando el evangelio a etnias del amazonas en Bolivia.'
        },
        {
            id: 2,
            image: 'https://picsum.photos/id/1016/400/250',
            title: 'Palabra de Dios en suelo Huarpe',
            description: 'Apoyo Social y evangelismo en tierras huarpes.'
        }
    ];

    constructor(private router: Router) {}

    goToProject(project: any) {
        if (project.id === 1) {
            const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

            if (isLoggedIn) {
                this.router.navigate(['/amazonas-boliviano']);
                return;
            }

            this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/amazonas-boliviano' }
            });
        } else if (project.id === 2) {
            this.router.navigate(['/project-2']);
        } else {
            this.router.navigate(['/projects', project.id]);
        }
    }
}
