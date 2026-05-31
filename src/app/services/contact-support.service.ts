import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface ContactChannelData {
    support_email: string;
    support_phone: string;
}

export interface SendPublicContactPayload {
    full_name: string;
    email: string;
    subject: string;
    message: string;
}

export interface ContactInquirySummary {
    id: number;
    sender_user_id: number | null;
    contact_origin: 'internal' | 'external';
    leido: boolean;
    contestado: boolean;
    fecha_contacto: string | null;
    fecha_respuesta: string | null;
    full_name: string | null;
    email: string;
    subject: string;
    message: string;
    status: string;
    created_at: string | null;
}

export interface ContactInquiryDetail extends ContactInquirySummary {
    read_at: string | null;
    admin_reply: string | null;
    replied_at: string | null;
}

export interface UpdateInquiryStatePayload {
    leido: boolean;
    contestado: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContactSupportService {
    private readonly baseUrl = `${environment.url_base}`;

    constructor(private readonly http: HttpClient) {}

    getChannel(): Observable<{ data: ContactChannelData }> {
        return this.http.get<{ data: ContactChannelData }>(`${this.baseUrl}/contact-channel`);
    }

    sendPublicContact(payload: SendPublicContactPayload): Observable<{ data: { id: number } }> {
        return this.http.post<{ data: { id: number } }>(`${this.baseUrl}/contact-us/messages`, payload, {
            headers: this.getAuthHeaders(),
        });
    }

    getAdminInquiries(): Observable<{ data: ContactInquirySummary[] }> {
        return this.http.get<{ data: ContactInquirySummary[] }>(`${this.baseUrl}/admin/contact-us/messages`, {
            headers: this.getAuthHeaders(),
        });
    }

    getAdminInquiryDetail(inquiryId: number): Observable<{ data: ContactInquiryDetail }> {
        return this.http.get<{ data: ContactInquiryDetail }>(`${this.baseUrl}/admin/contact-us/messages/${inquiryId}`, {
            headers: this.getAuthHeaders(),
        });
    }

    updateAdminInquiryState(
        inquiryId: number,
        payload: UpdateInquiryStatePayload
    ): Observable<{ data: { id: number; leido: boolean; contestado: boolean; fecha_contacto: string | null; fecha_respuesta: string | null; status: string } }> {
        return this.http.patch<{ data: { id: number; leido: boolean; contestado: boolean; fecha_contacto: string | null; fecha_respuesta: string | null; status: string } }>(
            `${this.baseUrl}/admin/contact-us/messages/${inquiryId}/state`,
            payload,
            { headers: this.getAuthHeaders() }
        );
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
