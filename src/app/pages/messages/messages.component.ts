import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

import {
    ContactSupportService,
    SupportThreadDetail,
    SupportThreadSummary,
} from '../../services/contact-support.service';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        ToastModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
    ],
    providers: [MessageService],
    templateUrl: './messages.component.html',
    styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
    sending = false;
    loadingThreads = false;
    loadingThreadDetail = false;

    form = {
        sender_email: '',
        subject: '',
        message: '',
    };

    threads: SupportThreadSummary[] = [];
    selectedThreadId: number | null = null;
    selectedThread: SupportThreadDetail | null = null;

    constructor(
        private readonly contactSupportService: ContactSupportService,
        private readonly messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.prefillEmailFromSession();
        this.loadThreads();
    }

    sendMessage(): void {
        if (!this.form.sender_email || !this.form.subject.trim() || !this.form.message.trim()) {
            this.toast('warn', 'Mensajes', 'Completa email, asunto y mensaje.');
            return;
        }

        this.sending = true;

        this.contactSupportService.sendMessage({
            sender_email: this.form.sender_email.trim(),
            subject: this.form.subject.trim(),
            message: this.form.message.trim(),
        }).subscribe({
            next: () => {
                this.sending = false;
                this.form.subject = '';
                this.form.message = '';
                this.toast('success', 'Mensajes', 'Mensaje interno enviado correctamente.');
                this.loadThreads();
            },
            error: () => {
                this.sending = false;
                this.toast('error', 'Mensajes', 'No se pudo enviar el mensaje interno.');
            },
        });
    }

    loadThreads(): void {
        this.loadingThreads = true;

        this.contactSupportService.getMyThreads().subscribe({
            next: (response) => {
                this.threads = response?.data || [];
                this.loadingThreads = false;

                if (this.threads.length > 0) {
                    const preferredId = this.selectedThreadId && this.threads.some((thread) => thread.id === this.selectedThreadId)
                        ? this.selectedThreadId
                        : this.threads[0].id;
                    this.openThread(preferredId);
                } else {
                    this.selectedThreadId = null;
                    this.selectedThread = null;
                }
            },
            error: () => {
                this.loadingThreads = false;
                this.toast('error', 'Mensajes', 'No se pudieron cargar tus conversaciones.');
            },
        });
    }

    openThread(threadId: number): void {
        this.selectedThreadId = threadId;
        this.loadingThreadDetail = true;

        this.contactSupportService.getThread(threadId).subscribe({
            next: (response) => {
                this.selectedThread = response?.data || null;
                this.loadingThreadDetail = false;
            },
            error: () => {
                this.loadingThreadDetail = false;
                this.toast('error', 'Mensajes', 'No se pudo abrir la conversación.');
            },
        });
    }

    private prefillEmailFromSession(): void {
        const rawResponse = sessionStorage.getItem('response_logged_user');
        const rawLoggedUser = sessionStorage.getItem('logged_user');

        try {
            const responseData = rawResponse ? JSON.parse(rawResponse) as { user?: { email?: string } } : null;
            const loggedUser = rawLoggedUser ? JSON.parse(rawLoggedUser) as { email?: string } : null;
            this.form.sender_email = responseData?.user?.email || loggedUser?.email || '';
        } catch {
            this.form.sender_email = '';
        }
    }

    private toast(severity: 'success' | 'error' | 'warn', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail, life: 3200 });
    }
}
