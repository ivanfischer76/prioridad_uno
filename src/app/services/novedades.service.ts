import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
    estado: string;
    message: string;
    code: number;
    errors: unknown;
    data: T;
}

export interface ProyectoApi {
    id: number;
    nombre: string;
    descripcion?: string | null;
}

export interface NovedadImageApi {
    id: number;
    name: string;
    type: string;
    size: number;
    previewUrl: string;
    url: string;
    path: string;
    order: number;
    alt?: string | null;
}

export interface NovedadApi {
    id: number;
    projectId: number;
    title: string;
    markdown: string;
    prayerReasons: string[];
    images: NovedadImageApi[];
    date?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrUpdateNovedadPayload {
    projectId?: number;
    title?: string;
    markdown?: string;
    prayerReasons?: string[];
    date?: string | null;
}

@Injectable({ providedIn: 'root' })
export class NovedadesService {
    private readonly apiBase = environment.url_base;

    constructor(private readonly http: HttpClient) {}

    getProjects(): Observable<ProyectoApi[]> {
        return this.http.get<ProyectoApi[]>(`${this.apiBase}/proyectos`);
    }

    listNovedades(projectId: number): Observable<ApiResponse<NovedadApi[]>> {
        return this.http.get<ApiResponse<NovedadApi[]>>(`${this.apiBase}/novedades?projectId=${projectId}`, {
            headers: this.getAuthHeaders(),
        });
    }

    getNovedad(id: number): Observable<ApiResponse<NovedadApi>> {
        return this.http.get<ApiResponse<NovedadApi>>(`${this.apiBase}/novedades/${id}`, {
            headers: this.getAuthHeaders(),
        });
    }

    createNovedad(payload: CreateOrUpdateNovedadPayload): Observable<ApiResponse<NovedadApi>> {
        return this.http.post<ApiResponse<NovedadApi>>(`${this.apiBase}/novedades`, payload, {
            headers: this.getAuthHeaders(),
        });
    }

    updateNovedad(id: number, payload: CreateOrUpdateNovedadPayload): Observable<ApiResponse<NovedadApi>> {
        return this.http.put<ApiResponse<NovedadApi>>(`${this.apiBase}/novedades/${id}`, payload, {
            headers: this.getAuthHeaders(),
        });
    }

    deleteNovedad(id: number): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.apiBase}/novedades/${id}`, {
            headers: this.getAuthHeaders(),
        });
    }

    uploadImage(novedadId: number, file: File, order: number, alt?: string): Observable<ApiResponse<NovedadImageApi>> {
        const body = new FormData();
        body.append('file', file);
        body.append('order', String(order));

        if (alt?.trim()) {
            body.append('alt', alt.trim());
        }

        return this.http.post<ApiResponse<NovedadImageApi>>(`${this.apiBase}/novedades/${novedadId}/imagenes`, body, {
            headers: this.getAuthHeaders(),
        });
    }

    deleteImage(novedadId: number, imageId: number): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.apiBase}/novedades/${novedadId}/imagenes/${imageId}`, {
            headers: this.getAuthHeaders(),
        });
    }

    reorderImages(novedadId: number, images: Array<{ id: number; order: number }>): Observable<ApiResponse<NovedadImageApi[]>> {
        return this.http.patch<ApiResponse<NovedadImageApi[]>>(`${this.apiBase}/novedades/${novedadId}/imagenes/orden`, { images }, {
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

            if (!token) {
                return new HttpHeaders();
            }

            const tokenType = parsed.token_type?.trim() || 'Bearer';
            const normalizedType = tokenType.toLowerCase() === 'bearer' ? 'Bearer' : tokenType;

            return new HttpHeaders({
                Authorization: `${normalizedType} ${token}`,
            });
        } catch {
            return new HttpHeaders();
        }
    }
}
