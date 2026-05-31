import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

import { ContactSupportService } from '../../services/contact-support.service';

@Component({
    selector: 'app-contact-us',
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
    templateUrl: './contact-us.component.html',
    styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent implements OnInit {
    loading = false;
    sending = false;

    supportEmail = '';
    supportPhone = '';

    form = {
        full_name: '',
        email: '',
        subject: '',
        message: '',
    };

    private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly contactSupportService: ContactSupportService,
        private readonly messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.prefillFromLoggedUserIfRequested();
        this.loadContactChannel();
    }

    loadContactChannel(): void {
        this.loading = true;

        this.contactSupportService.getChannel().subscribe({
            next: (response) => {
                this.supportEmail = response?.data?.support_email || '';
                this.supportPhone = response?.data?.support_phone || '';
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.toast('error', 'Contacto', 'No se pudo cargar el canal de contacto.');
            },
        });
    }

    sendMessage(): void {
        if (!this.isFormValid()) {
            this.toast('warn', 'Contacto', 'Completa nombre y apellido, email valido, asunto y mensaje.');
            return;
        }

        this.sending = true;

        this.contactSupportService.sendPublicContact({
            full_name: this.form.full_name.trim(),
            email: this.form.email.trim(),
            subject: this.form.subject.trim(),
            message: this.form.message.trim(),
        }).subscribe({
            next: () => {
                this.sending = false;
                this.form.full_name = '';
                this.form.email = '';
                this.form.subject = '';
                this.form.message = '';
                this.toast('success', 'Contacto', 'Mensaje enviado correctamente.');
            },
            error: (errorResponse: { error?: { errors?: { email?: string } } }) => {
                this.sending = false;
                const emailError = errorResponse?.error?.errors?.email;
                this.toast('error', 'Contacto', emailError || 'No se pudo enviar el mensaje.');
            },
        });
    }

    isFormValid(): boolean {
        return !!this.form.full_name.trim()
            && !!this.form.subject.trim()
            && !!this.form.message.trim()
            && this.isValidEmail(this.form.email);
    }

    isValidEmail(value: string): boolean {
        return this.emailRegex.test(value.trim());
    }

    private toast(severity: 'success' | 'error' | 'warn', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail, life: 3200 });
    }

    private prefillFromLoggedUserIfRequested(): void {
        const shouldPrefill = this.route.snapshot.queryParamMap.get('prefillLoggedUser') === '1';

        if (!shouldPrefill) {
            return;
        }

        const rawResponse = sessionStorage.getItem('response_logged_user');
        const rawLoggedUser = sessionStorage.getItem('logged_user');

        try {
            const responseData = rawResponse
                ? JSON.parse(rawResponse) as {
                    user?: { nombre?: string; apellido?: string; email?: string };
                }
                : null;
            const loggedUser = rawLoggedUser
                ? JSON.parse(rawLoggedUser) as { nombre?: string; apellido?: string; email?: string }
                : null;

            const firstName = responseData?.user?.nombre || loggedUser?.nombre || '';
            const lastName = responseData?.user?.apellido || loggedUser?.apellido || '';
            const fullName = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();
            const email = responseData?.user?.email || loggedUser?.email || '';

            if (fullName) {
                this.form.full_name = fullName;
            }

            if (email) {
                this.form.email = email;
            }
        } catch {
            // Si la sesión no es parseable, se mantiene el formulario vacío.
        }
    }

}
