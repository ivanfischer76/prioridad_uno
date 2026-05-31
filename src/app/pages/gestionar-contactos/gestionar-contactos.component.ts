import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { Table } from 'primeng/table';

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
        FormsModule,
        ButtonModule,
        CheckboxModule,
        DialogModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        TableModule,
        TextareaModule,
        ToastModule,
        TooltipModule,
    ],
    providers: [MessageService],
    templateUrl: './gestionar-contactos.component.html',
    styleUrls: ['./gestionar-contactos.component.scss'],
})
export class GestionarContactosComponent implements OnInit {
    loading = false;
    loadingDetail = false;

    inquiries: ContactInquirySummary[] = [];

    dialogVisible = false;
    selectedInquiry: ContactInquiryDetail | null = null;
    stateRespondido = false;
    tempResponseDate: string | null = null;
    savingState = false;

    altoTabla: string = '58vh';
    cabeceraAcciones: string = 'Acciones';
    globalFilterValue = '';

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
                this.stateRespondido = !!this.selectedInquiry?.contestado;
                this.tempResponseDate = null;
                this.loadingDetail = false;

                if (this.selectedInquiry) {
                    this.inquiries = this.inquiries.map((item) => item.id === this.selectedInquiry?.id
                        ? {
                            ...item,
                            status: this.selectedInquiry?.status || item.status,
                            leido: !!this.selectedInquiry?.leido,
                            contestado: !!this.selectedInquiry?.contestado,
                            fecha_contacto: this.selectedInquiry?.fecha_contacto || item.fecha_contacto,
                            fecha_respuesta: this.selectedInquiry?.fecha_respuesta || item.fecha_respuesta,
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
        this.stateRespondido = false;
        this.tempResponseDate = null;
        this.savingState = false;
    }

    onRespondidoChange(value: boolean): void {
        if (!this.selectedInquiry || this.savingState || this.loadingDetail) {
            this.stateRespondido = !!this.selectedInquiry?.contestado;
            return;
        }

        const inquiryId = this.selectedInquiry.id;
        const previousRespondido = !!this.selectedInquiry.contestado;
        const previousFechaRespuesta = this.selectedInquiry.fecha_respuesta;

        this.stateRespondido = value;

        if (value) {
            if (!this.selectedInquiry?.fecha_respuesta) {
                this.tempResponseDate = new Date().toISOString();
            }
        } else {
            this.tempResponseDate = null;
        }

        this.savingState = true;

        this.contactSupportService.updateAdminInquiryState(inquiryId, {
            leido: !!this.selectedInquiry.leido,
            contestado: value,
        }).subscribe({
            next: (response) => {
                const updated = response?.data;

                if (!updated || !this.selectedInquiry || this.selectedInquiry.id !== inquiryId) {
                    this.savingState = false;
                    return;
                }

                this.selectedInquiry = {
                    ...this.selectedInquiry,
                    status: updated.status,
                    leido: updated.leido,
                    contestado: updated.contestado,
                    fecha_contacto: updated.fecha_contacto,
                    fecha_respuesta: updated.fecha_respuesta,
                };
                this.stateRespondido = updated.contestado;
                this.tempResponseDate = null;
                this.inquiries = this.inquiries.map((item) => item.id === updated.id
                    ? {
                        ...item,
                        status: updated.status,
                        leido: updated.leido,
                        contestado: updated.contestado,
                        fecha_contacto: updated.fecha_contacto,
                        fecha_respuesta: updated.fecha_respuesta,
                    }
                    : item
                );

                this.savingState = false;
                this.showToast('success', 'Contactos', 'Estado de respondido actualizado.');
            },
            error: () => {
                if (this.selectedInquiry && this.selectedInquiry.id === inquiryId) {
                    this.selectedInquiry = {
                        ...this.selectedInquiry,
                        contestado: previousRespondido,
                        fecha_respuesta: previousFechaRespuesta,
                    };
                    this.stateRespondido = previousRespondido;
                    this.tempResponseDate = null;
                    this.inquiries = this.inquiries.map((item) => item.id === inquiryId
                        ? {
                            ...item,
                            contestado: previousRespondido,
                            fecha_respuesta: previousFechaRespuesta,
                        }
                        : item
                    );
                }

                this.savingState = false;
                this.showToast('error', 'Contactos', 'No se pudo guardar el estado de respondido.');
            },
        });
    }

    getResponseDateDisplay(): string | null {
        return this.selectedInquiry?.fecha_respuesta || this.tempResponseDate;
    }

    previewText(value: string): string {
        const clean = (value || '').replace(/\s+/g, ' ').trim();
        if (clean.length <= 120) {
            return clean;
        }

        return `${clean.slice(0, 120)}...`;
    }

    getInquiryOriginLabel(inquiry: ContactInquirySummary | ContactInquiryDetail | null): string {
        if (!inquiry) {
            return '-';
        }

        return inquiry.sender_user_id ? 'usuario' : 'visitante';
    }

    formatDateTime(value: string | null | undefined): string {
        if (!value) {
            return '-';
        }

        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) {
            return '-';
        }

        return parsed.toLocaleDateString('es-BO');
    }

    saveState(leido: boolean): void {
        if (!this.selectedInquiry || this.savingState) {
            return;
        }

        this.savingState = true;

        this.contactSupportService.updateAdminInquiryState(this.selectedInquiry.id, {
            leido,
            contestado: !!this.stateRespondido,
        }).subscribe({
            next: (response) => {
                const updated = response?.data;

                if (!updated || !this.selectedInquiry) {
                    this.savingState = false;
                    return;
                }

                this.selectedInquiry = {
                    ...this.selectedInquiry,
                    status: updated.status,
                    leido: updated.leido,
                    contestado: updated.contestado,
                    fecha_contacto: updated.fecha_contacto,
                    fecha_respuesta: updated.fecha_respuesta,
                };
                this.stateRespondido = updated.contestado;
                this.tempResponseDate = null;
                this.inquiries = this.inquiries.map((item) => item.id === updated.id
                    ? {
                        ...item,
                        status: updated.status,
                        leido: updated.leido,
                        contestado: updated.contestado,
                        fecha_contacto: updated.fecha_contacto,
                        fecha_respuesta: updated.fecha_respuesta,
                    }
                    : item
                );

                this.savingState = false;
                this.showToast('success', 'Contactos', 'Estado actualizado correctamente.');
                this.closeDialog();
            },
            error: () => {
                this.savingState = false;
                this.showToast('error', 'Contactos', 'No se pudo guardar el estado.');
            },
        });
    }

    private showToast(severity: 'success' | 'error' | 'warn', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail, life: 3200 });
    }

    cambiarCabeceraAcciones(title: string){
        this.cabeceraAcciones = title;
    }
    
    clear(table: Table): void {
        table.clear();
        this.globalFilterValue = '';
    }

    filterGlobal($event: Event, table: Table): void {
        const input = $event.target as HTMLInputElement | null;
        this.globalFilterValue = input?.value || '';
        table.filterGlobal(this.globalFilterValue, 'contains');
    }
}
