import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface ContactChannelData {
    support_email: string;
    support_phone: string;
}

export interface SendSupportMessagePayload {
    sender_email: string;
    subject: string;
    message: string;
}

export interface SendPublicContactPayload {
    full_name: string;
    email: string;
    subject: string;
    message: string;
}

export interface ContactInquirySummary {
    id: number;
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

export interface SupportThreadSummary {
    id: number;
    subject: string;
    status: string;
    last_message_at: string | null;
    last_message_preview: string;
    unread_count: number;
    created_at: string | null;
}

export interface SupportThreadMessage {
    id: number;
    sender_type: 'user' | 'admin' | 'system';
    from_email: string;
    body: string;
    sent_via_email: boolean;
    read_at: string | null;
    created_at: string | null;
}

export interface SupportThreadDetail {
    id: number;
    subject: string;
    status: string;
    messages: SupportThreadMessage[];
}

@Injectable({ providedIn: 'root' })
export class ContactSupportService {
    private readonly baseUrl = `${environment.url_base}`;

    constructor(private readonly http: HttpClient) {}

    getChannel(): Observable<{ data: ContactChannelData }> {
        return this.http.get<{ data: ContactChannelData }>(`${this.baseUrl}/contact-channel`);
    }

    sendPublicContact(payload: SendPublicContactPayload): Observable<{ data: { id: number } }> {
        return this.http.post<{ data: { id: number } }>(`${this.baseUrl}/contact-us/messages`, payload);
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

    sendMessage(payload: SendSupportMessagePayload): Observable<{ data: { thread_id: number; message_id: number; mail_sent: boolean } }> {
        return this.http.post<{ data: { thread_id: number; message_id: number; mail_sent: boolean } }>(
            `${this.baseUrl}/support/messages`,
            payload,
            { headers: this.getAuthHeaders() }
        );
    }

    getMyThreads(): Observable<{ data: SupportThreadSummary[] }> {
        return this.http.get<{ data: SupportThreadSummary[] }>(`${this.baseUrl}/support/threads`, {
            headers: this.getAuthHeaders(),
        });
    }

    getThread(threadId: number): Observable<{ data: SupportThreadDetail }> {
        return this.http.get<{ data: SupportThreadDetail }>(`${this.baseUrl}/support/threads/${threadId}`, {
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
