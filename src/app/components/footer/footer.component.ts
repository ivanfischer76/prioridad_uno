import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SiteVisitService, SiteVisitStats } from '../../services/site-visit.service';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
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

  private loadStats(): void {
    this.siteVisitService.getStats().subscribe({
      next: (response) => {
        this.stats = response?.data ?? this.stats;
      },
      error: () => {
        // Keep footer stable if stats endpoint is unavailable.
      }
    });
  }

}
