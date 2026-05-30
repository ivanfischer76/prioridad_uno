import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface SiteVisitStats {
    unique_total: number;
    unique_today: number;
    pageviews_total: number;
    pageviews_today: number;
}

@Injectable({ providedIn: 'root' })
export class SiteVisitService {
    private readonly trackUrl = `${environment.url_base}/visits/track`;
    private readonly statsUrl = `${environment.url_base}/visits/stats`;

    constructor(private readonly http: HttpClient) {}

    trackVisit(path: string): Observable<{ data: SiteVisitStats }> {
        return this.http.post<{ data: SiteVisitStats }>(this.trackUrl, { path });
    }

    getStats(): Observable<{ data: SiteVisitStats }> {
        return this.http.get<{ data: SiteVisitStats }>(this.statsUrl);
    }
}
