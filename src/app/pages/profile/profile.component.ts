import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';

import { User } from '../../models/admin/user';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        ButtonModule,
        CheckboxModule,
        CommonModule, 
        DialogModule, 
        FormsModule, 
        PasswordModule,
        RouterModule, 
        SelectModule,
        ToastModule, 
        TranslateModule 
    ],
    providers: [MessageService],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
    user: User = new User();
    showPasswordDialog = false;
    newPassword = '';
    confirmPassword = '';
    savingPassword = false;

    readonly availableLanguages = [
        { label: 'Español', value: 'es' },
        { label: 'English', value: 'en' },
        { label: 'Português', value: 'pt' },
        { label: 'Italiano', value: 'it' },
        { label: 'Français', value: 'fr' },
        { label: 'Deutsch', value: 'de' },
    ];

    constructor(
        private readonly router: Router,
        private readonly messageService: MessageService,
        private readonly authService: AuthService,
        private readonly translate: TranslateService
    ) {}

    ngOnInit(): void {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const rawLoggedUser = sessionStorage.getItem('logged_user');

        if (!isLoggedIn || !rawLoggedUser) {
            void this.router.navigate(['/login']);
            return;
        }

        this.user = this.normalizeUserDates(JSON.parse(rawLoggedUser) as User);
    }

    saveProfile(): void {
        const payload = {
            username: this.user.username,
            nombre: this.user.nombre,
            apellido: this.user.apellido,
            email: this.user.email,
            iglesia: this.user.iglesia,
            fecha_nacimiento: this.user.fecha_nacimiento || null,
            idioma: this.user.idioma || 'es',
            notificarme: this.user.notificarme === true,
        };

        this.authService.updateProfile(payload).subscribe({
            next: (response: { data?: User }) => {
                const updatedUser = this.normalizeUserDates(response?.data ?? this.user);
                this.user = updatedUser;
                sessionStorage.setItem('logged_user', JSON.stringify(updatedUser));

                const rawResponse = sessionStorage.getItem('response_logged_user');
                if (rawResponse) {
                    const parsedResponse = JSON.parse(rawResponse) as { user?: User };
                    parsedResponse.user = updatedUser;
                    sessionStorage.setItem('response_logged_user', JSON.stringify(parsedResponse));
                }

                if (updatedUser.idioma) {
                    this.translate.use(updatedUser.idioma);
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Perfil',
                    detail: 'Perfil actualizado correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Perfil',
                    detail: 'No se pudo guardar el perfil.',
                    life: 3200,
                });
            }
        });
    }

    private normalizeUserDates(user: User): User {
        return {
            ...user,
            fecha_nacimiento: this.normalizeDateForInput(user.fecha_nacimiento),
        };
    }

    private normalizeDateForInput(value: Date | string | null | undefined): string | null {
        if (!value) {
            return null;
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();

            if (!trimmed) {
                return null;
            }

            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                return trimmed;
            }

            const isoCandidate = trimmed.slice(0, 10);
            if (/^\d{4}-\d{2}-\d{2}$/.test(isoCandidate)) {
                return isoCandidate;
            }
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        return parsed.toISOString().slice(0, 10);
    }

    openPasswordDialog(): void {
        this.newPassword = '';
        this.confirmPassword = '';
        this.savingPassword = false;
        this.showPasswordDialog = true;
    }

    closePasswordDialog(): void {
        if (this.savingPassword) {
            return;
        }

        this.showPasswordDialog = false;
    }

    savePassword(): void {
        if (!this.newPassword || !this.confirmPassword) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseña',
                detail: 'Debes completar ambos campos.',
                life: 2800,
            });
            return;
        }

        if (this.newPassword.length < 6) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseña',
                detail: 'La contraseña debe tener al menos 6 caracteres.',
                life: 3000,
            });
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Contraseña',
                detail: 'La confirmación no coincide.',
                life: 3000,
            });
            return;
        }

        this.savingPassword = true;
        this.authService.changePassword(this.newPassword, this.confirmPassword).subscribe({
            next: () => {
                this.savingPassword = false;
                this.showPasswordDialog = false;
                this.newPassword = '';
                this.confirmPassword = '';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Contraseña',
                    detail: 'Contraseña actualizada correctamente.',
                    life: 2800,
                });
            },
            error: () => {
                this.savingPassword = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Contraseña',
                    detail: 'No se pudo actualizar la contraseña.',
                    life: 3200,
                });
            }
        });
    }
}
