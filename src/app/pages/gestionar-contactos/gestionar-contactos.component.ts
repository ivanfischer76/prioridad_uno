import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import {
    ContactInquiryDetail,
    ContactInquirySummary,
    ContactSupportService,
} from '../../services/contact-support.service';

@Component({
    selector: 'app-gestionar-contactos',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TableModule,
        TextareaModule,
        ToastModule,
    ],
    providers: [MessageService],
    templateUrl: './gestionar-contactos.component.html',
    styleUrl: './gestionar-contactos.component.scss',
})
export class GestionarContactosComponent implements OnInit {
    loading = false;
    loadingDetail = false;

    inquiries: ContactInquirySummary[] = [];

    dialogVisible = false;
    selectedInquiry: ContactInquiryDetail | null = null;

    constructor(
        private readonly contactSupportService: ContactSupportService,
        private readonly messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.loadInquiries();
    }

    loadInquiries(): void {
        this.loading = true;

        this.contactSupportService.getAdminInquiries().subscribe({
            next: (response) => {
                this.inquiries = response?.data || [];
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.showToast('error', 'Contactos', 'No se pudo cargar la lista de mensajes.');
            },
        });
    }

    openInquiry(inquiryId: number): void {
        this.dialogVisible = true;
        this.loadingDetail = true;
        this.selectedInquiry = null;

        this.contactSupportService.getAdminInquiryDetail(inquiryId).subscribe({
            next: (response) => {
                this.selectedInquiry = response?.data || null;
                this.loadingDetail = false;

                if (this.selectedInquiry) {
                    this.inquiries = this.inquiries.map((item) => item.id === this.selectedInquiry?.id
                        ? {
                            ...item,
                            status: this.selectedInquiry?.status || item.status,
                        }
                        : item
                    );
                }
            },
            error: () => {
                this.loadingDetail = false;
                this.showToast('error', 'Contactos', 'No se pudo abrir el mensaje.');
            },
        });
    }

    closeDialog(): void {
        this.dialogVisible = false;
        this.selectedInquiry = null;
    }

    previewText(value: string): string {
        const clean = (value || '').replace(/\s+/g, ' ').trim();
        if (clean.length <= 120) {
            return clean;
        }

        return `${clean.slice(0, 120)}...`;
    }

    private showToast(severity: 'success' | 'error' | 'warn', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail, life: 3200 });
    }
}
