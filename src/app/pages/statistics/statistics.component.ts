import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { SiteVisitService, SiteVisitStats } from '../../services/site-visit.service';

@Component({
    selector: 'app-statistics',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
    ],
    templateUrl: './statistics.component.html',
    styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
    loading = false;
    stats: SiteVisitStats = {
        unique_total: 0,
        unique_today: 0,
        pageviews_total: 0,
        pageviews_today: 0,
    };

    constructor(private readonly siteVisitService: SiteVisitService) {}

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.loading = true;

        this.siteVisitService.getStats().subscribe({
            next: (response) => {
                this.stats = response?.data ?? this.stats;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            },
        });
    }
}
