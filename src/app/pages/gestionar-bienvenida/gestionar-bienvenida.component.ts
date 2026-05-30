import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { WelcomeContentService, WelcomeTranslationPayload } from '../../services/welcome-content.service';

@Component({
    selector: 'app-gestionar-bienvenida',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        TextareaModule,
        ToastModule,
    ],
    providers: [MessageService],
    templateUrl: './gestionar-bienvenida.component.html',
    styleUrl: './gestionar-bienvenida.component.scss'
})
export class GestionarBienvenidaComponent implements OnInit {
    loading = false;
    saving = false;
    uploading = false;
    isImageDragOver = false;

    imageUrl = 'assets/images/image_welcome_default.jpg';
    selectedLocale = 'es';

    readonly locales = [
        { label: 'Español', value: 'es' },
        { label: 'English', value: 'en' },
        { label: 'Português', value: 'pt' },
        { label: 'Italiano', value: 'it' },
        { label: 'Français', value: 'fr' },
        { label: 'Deutsch', value: 'de' },
    ];

    translations: Record<string, WelcomeTranslationPayload> = {
        es: { verse_text: '', verse_citation: '', reflection_text: '' },
        en: { verse_text: '', verse_citation: '', reflection_text: '' },
        pt: { verse_text: '', verse_citation: '', reflection_text: '' },
        it: { verse_text: '', verse_citation: '', reflection_text: '' },
        fr: { verse_text: '', verse_citation: '', reflection_text: '' },
        de: { verse_text: '', verse_citation: '', reflection_text: '' },
    };

    form: WelcomeTranslationPayload = {
        verse_text: '',
        verse_citation: '',
        reflection_text: '',
    };

    constructor(
        private readonly welcomeContentService: WelcomeContentService,
        private readonly messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;

        this.welcomeContentService.getAdmin().subscribe({
            next: (response) => {
                const data = response?.data;
                this.imageUrl = data?.image_url || 'assets/images/image_welcome_default.jpg';

                if (data?.translations) {
                    this.translations = {
                        ...this.translations,
                        ...data.translations,
                    };
                }

                this.syncFormFromLocale();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.showToast('error', 'Gestión de bienvenida', 'No se pudo cargar el contenido de bienvenida.', 3200);
            },
        });
    }

    onLocaleChange(): void {
        this.syncFormFromLocale();
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];

        if (!file) {
            return;
        }

        this.uploadImage(file, input);
    }

    onImageDragOver(event: DragEvent): void {
        event.preventDefault();

        if (this.saving || this.uploading) {
            return;
        }

        this.isImageDragOver = true;
    }

    onImageDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.isImageDragOver = false;
    }

    onImageDrop(event: DragEvent): void {
        event.preventDefault();
        this.isImageDragOver = false;

        if (this.saving || this.uploading) {
            return;
        }

        const file = event.dataTransfer?.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.showToast('error', 'Gestión de bienvenida', 'El archivo debe ser una imagen.', 3200);
            return;
        }

        this.uploadImage(file);
    }

    private uploadImage(file: File, input?: HTMLInputElement): void {
        if (!file.type.startsWith('image/')) {
            this.showToast('error', 'Gestión de bienvenida', 'El archivo debe ser una imagen.', 3200);
            return;
        }

        this.uploading = true;

        this.welcomeContentService.uploadImage(file).subscribe({
            next: (response) => {
                this.imageUrl = response?.data?.image_url || this.imageUrl;
                this.uploading = false;
                this.showToast('success', 'Gestión de bienvenida', 'Imagen actualizada correctamente.', 2800);
                if (input) {
                    input.value = '';
                }
            },
            error: () => {
                this.uploading = false;
                this.showToast('error', 'Gestión de bienvenida', 'No se pudo subir la imagen.', 3200);
            },
        });
    }

    saveCurrentLocale(): void {
        this.saving = true;

        this.translations[this.selectedLocale] = {
            verse_text: this.form.verse_text,
            verse_citation: this.form.verse_citation,
            reflection_text: this.form.reflection_text,
        };

        this.welcomeContentService.saveTranslation(this.selectedLocale, this.form).subscribe({
            next: () => {
                this.saving = false;
                this.showToast('success', 'Gestión de bienvenida', 'Texto guardado correctamente.', 2800);
            },
            error: () => {
                this.saving = false;
                this.showToast('error', 'Gestión de bienvenida', 'No se pudo guardar la traducción.', 3200);
            },
        });
    }

    private showToast(severity: 'success' | 'error', summary: string, detail: string, life: number): void {
        this.messageService.add({
            severity,
            summary,
            detail,
            life,
        });
    }

    private syncFormFromLocale(): void {
        const current = this.translations[this.selectedLocale] || {
            verse_text: '',
            verse_citation: '',
            reflection_text: '',
        };

        this.form = {
            verse_text: current.verse_text || '',
            verse_citation: current.verse_citation || '',
            reflection_text: current.reflection_text || '',
        };
    }
}
