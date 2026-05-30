import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface WelcomeTranslationPayload {
    verse_text: string;
    verse_citation: string;
    reflection_text: string;
}

export interface WelcomePublicData extends WelcomeTranslationPayload {
    image_url: string;
    locale: string;
    fallback_from_es?: boolean;
}

export interface WelcomeAdminData {
    image_url: string;
    translations: Record<string, WelcomeTranslationPayload>;
}

@Injectable({ providedIn: 'root' })
export class WelcomeContentService {
    private readonly baseUrl = `${environment.url_base}/welcome-content`;
    private readonly adminUrl = `${environment.url_base}/admin/welcome-content`;

    constructor(private readonly http: HttpClient) {}

    getPublic(locale: string): Observable<{ data: WelcomePublicData }> {
        return this.http.get<{ data: WelcomePublicData }>(`${this.baseUrl}?locale=${encodeURIComponent(locale)}`);
    }

    getAdmin(): Observable<{ data: WelcomeAdminData }> {
        return this.http.get<{ data: WelcomeAdminData }>(this.adminUrl, {
            headers: this.getAuthHeaders(),
        });
    }

    saveTranslation(locale: string, payload: WelcomeTranslationPayload): Observable<{ data: WelcomeTranslationPayload & { locale: string } }> {
        return this.http.put<{ data: WelcomeTranslationPayload & { locale: string } }>(`${this.adminUrl}/translations/${locale}`, payload, {
            headers: this.getAuthHeaders(),
        });
    }

    uploadImage(file: File): Observable<{ data: { image_url: string } }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<{ data: { image_url: string } }>(`${this.adminUrl}/image`, formData, {
            headers: this.getAuthHeaders(),
        });
    }

    private getAuthHeaders(): HttpHeaders {
        const raw = sessionStorage.getItem('response_logged_user');

        if (!raw) {
            return new HttpHeaders();
        }

        try {
            const parsed = JSON.parse(raw) as { token?: string; token_type?: string };
            const token = parsed?.token;
            const tokenType = parsed?.token_type || 'Bearer';

            if (!token) {
                return new HttpHeaders();
            }

            return new HttpHeaders({
                Authorization: `${tokenType} ${token}`,
            });
        } catch {
            return new HttpHeaders();
        }
    }
}
