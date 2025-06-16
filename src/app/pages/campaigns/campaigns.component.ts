import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TabViewModule } from 'primeng/tabview';
import { DataViewModule } from 'primeng/dataview';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-campaigns',
    imports: [
        CommonModule,
        TranslateModule,
        TabViewModule,
        DataViewModule,
        ScrollPanelModule,
        NgClass,
        ButtonModule
    ],
    templateUrl: './campaigns.component.html',
    styleUrl: './campaigns.component.scss'
})
export class CampaignsComponent {
    finishedCampaigns = [
        {
            title: 'Campaña Frazadas',
            image: 'https://picsum.photos/id/1005/400/200',
            dateFrom: '2024-01-01',
            dateTo: '2024-03-15',
            duration: 2.5,
            goal: 100,
            goal_text: 'Frazadas para familias',
            result: 120,
            result_text: 'Frazadas entregadas',
            achieved: true
        },
        {
            title: 'Campaña Kits Escolares',
            image: 'https://picsum.photos/id/1011/400/200',
            dateFrom: '2023-10-10',
            dateTo: '2024-01-10',
            duration: 3,
            goal: 200,
            goal_text: 'Kits escolares',
            result: 180,
            result_text: 'Kits entregados',
            achieved: false
        },
        {
            title: 'Campaña Biblias',
            image: 'https://picsum.photos/id/1012/400/200',
            dateFrom: '2023-11-05',
            dateTo: '2023-12-05',
            duration: 1,
            goal: 50,
            goal_text: 'Biblias',
            result: 50,
            result_text: 'Biblias entregadas',
            achieved: true
        }
    ];

    activeCampaigns = [
        {
            title: 'Campaña Alimentos',
            image: 'https://picsum.photos/id/1025/400/200',
            dateFrom: '2025-05-01',
            dateTo: '2025-08-01',
            duration: 3,
            goal: 300,
            goal_text: 'Alimentos para familias',
            result: 120,
            result_text: 'Alimentos entregados',
            achieved: false,
            phone: '+591 700-12345',
            email: 'contacto@ejemplo.org'
        },
        {
            title: 'Campaña Juguetes',
            image: 'https://picsum.photos/id/1026/400/200',
            dateFrom: '2025-06-01',
            dateTo: '2025-09-01',
            duration: 3,
            goal: 80,
            goal_text: 'Juguetes para niños',
            result: 20,
            result_text: 'Juguetes entregados',
            achieved: false,
            phone: '+591 700-54321',
            email: 'ayuda@ejemplo.org'
        }
    ];

    constructor(private router: Router) {}

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    goToDonate() {
        this.router.navigate(['/donate']);
    }
}
