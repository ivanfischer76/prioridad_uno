import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { marked } from 'marked';
import { firstValueFrom } from 'rxjs';

import { Table } from 'primeng/table';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {
    ApiResponse,
    NovedadApi,
    NovedadImageApi,
    NovedadesService,
    ProyectoApi,
} from '../../services/novedades.service';
import { environment } from '../../../environments/environment';
import { Role } from '../../models/admin/role';
import { User } from '../../models/admin/user';
import { AuthService } from '../../services/auth.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface ManagedImage {
    id?: number;
    path?: string;
    name: string;
    type: string;
    size: number;
    previewUrl: string;
    order?: number;
    alt?: string;
    file?: File;
}

interface AmazonasPost {
    id: number;
    projectId: number;
    title: string;
    markdown: string;
    prayerReasons: string[];
    images: ManagedImage[];
    createdAt: Date;
    updatedAt: Date;
}

@Component({
    selector: 'app-gestionar-amazonas-boliviano',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        TableModule,
        TooltipModule,
        ToastModule,
    ],
    providers: [MessageService],
    templateUrl: './gestionar-amazonas-boliviano.component.html',
    styleUrls: ['./gestionar-amazonas-boliviano.component.scss']
})
export class GestionarAmazonasBolivianoComponent implements OnInit, OnDestroy {
    @ViewChild('richEditor') richEditor?: ElementRef<HTMLDivElement>;

    title = '';
    markdownText = '';
    editorHtml = '';
    newPrayerReason = '';
    prayerReasons: string[] = [];
    uploadedImages: ManagedImage[] = [];
    roles: Role[] = [];
    loggedUser: User | null = null;
    posts: AmazonasPost[] = [];

    editingPostId: number | null = null;
    statusMessage = '';
    isLoadingPosts = false;
    isSubmitting = false;

    amazonasProjectId: number | null = null;
    private readonly amazonasProjectName = 'Amazonas Boliviano';
    private readonly publicFeedSyncKey = 'amazonas_public_feed_sync';
    private readonly debugEnabled = !environment.production;
    private imagesMarkedForDeletion: ManagedImage[] = [];
    showPostDialog = false;

    showImagesDialog = false;
    selectedPostForImages: AmazonasPost | null = null;

    formatToggleState = {
        bold: false,
        italic: false,
        underline: false,
        bulletList: false,
        numberedList: false
    };

    globalFilterValue = '';
    altoTabla: string = '58vh';
    cabeceraAcciones: string = 'Acciones';

    constructor(
        private readonly authService: AuthService,
        private readonly sanitizer: DomSanitizer,
        private readonly novedadesService: NovedadesService,
        private readonly messageService: MessageService,
    ) {
        marked.setOptions({
            gfm: true,
            breaks: true
        });
    }

    ngOnInit(): void {
        this.loadLoggedUser();
        void this.loadPosts();
    }

    private loadLoggedUser(): void {
        const rawLoggedUser = sessionStorage.getItem('logged_user');
        const rawLoginResponse = sessionStorage.getItem('response_logged_user');

        const loggedUser = rawLoggedUser ? JSON.parse(rawLoggedUser) as User : null;
        const loginResponse = rawLoginResponse ? JSON.parse(rawLoginResponse) as { user?: User } : null;
        const responseUser = loginResponse?.user ?? null;

        // Prefer the source that actually contains permissions/roles.
        if (responseUser?.permissions?.length || responseUser?.roles?.length) {
            this.loggedUser = responseUser;
            return;
        }

        this.loggedUser = loggedUser;
    }

    private loadRoles(): void {
        this.authService.listRoles().subscribe({
            next: (response: { data?: Role[] }) => {
                this.roles = Array.isArray(response?.data) ? response.data : [];
            },
            error: () => {
                this.roles = [];
            }
        });
    }

    openCreatePostDialog(): void {
        this.resetForm();
        this.statusMessage = '';
        this.showPostDialog = true;
        this.writeEditorHtml('');
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        this.addFiles(files);
    }

    onFileSelection(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.addFiles(input.files);
        input.value = '';
    }

    onEditorInput(): void {
        this.syncMarkdownFromEditor();
        this.refreshToggleState();
    }

    onEditorSelectionChange(): void {
        this.refreshToggleState();
    }

    addPrayerReason(): void {
        const trimmed = this.newPrayerReason.trim();
        if (!trimmed) {
            return;
        }

        this.prayerReasons = [...this.prayerReasons, trimmed];
        this.newPrayerReason = '';
    }

    removePrayerReason(index: number): void {
        this.prayerReasons = this.prayerReasons.filter((_, i) => i !== index);
    }

    removeImage(index: number): void {
        const image = this.uploadedImages[index];

        if (image?.id) {
            this.imagesMarkedForDeletion = [...this.imagesMarkedForDeletion, image];
        }

        if (image?.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(image.previewUrl);
        }
        this.uploadedImages = this.uploadedImages.filter((_, i) => i !== index);
    }

    async savePost(): Promise<void> {
        if (this.isSubmitting) {
            return;
        }

        if (!this.hasSessionToken()) {
            this.statusMessage = 'No hay una sesion valida. Inicia sesion nuevamente para guardar.';
            this.showToast('warn', 'Sesion', this.statusMessage);
            return;
        }

        this.syncMarkdownFromEditor();

        const cleanedTitle = this.title.trim();
        const cleanedMarkdown = this.markdownText.trim();

        if (!cleanedTitle || !cleanedMarkdown) {
            this.statusMessage = 'Debes completar titulo y contenido del post.';
            this.showToast('warn', 'Validacion', this.statusMessage);
            return;
        }

        const projectId = await this.ensureAmazonasProjectId();
        if (projectId === null) {
            this.statusMessage = 'No se encontro el proyecto Amazonas Boliviano en el backend.';
            this.showToast('error', 'Proyecto', this.statusMessage);
            return;
        }

        this.isSubmitting = true;

        try {
            const payload = {
                title: cleanedTitle,
                markdown: cleanedMarkdown,
                prayerReasons: [...this.prayerReasons],
            };

            this.debugLog('savePost:start', {
                mode: this.editingPostId === null ? 'create' : 'update',
                projectId,
                editingPostId: this.editingPostId,
                payload,
                imagesInEditor: this.uploadedImages.length,
                imagesMarkedForDeletion: this.imagesMarkedForDeletion.length,
            });

            const wasCreating = this.editingPostId === null;
            let postId: number;
            let baseSavedPost: AmazonasPost | null = null;

            if (wasCreating) {
                const created = await firstValueFrom(this.novedadesService.createNovedad({
                    ...payload,
                    projectId,
                }));
                postId = created.data.id;
                baseSavedPost = this.mapApiPost(created.data);
                this.debugLog('savePost:create:ok', { postId, response: created });
            } else {
                const editingId = this.editingPostId;
                if (editingId === null) {
                    throw new Error('No se encontro el identificador del post para actualizar.');
                }

                const updated = await firstValueFrom(this.novedadesService.updateNovedad(editingId, payload));
                postId = updated.data.id;
                baseSavedPost = this.mapApiPost(updated.data);
                this.debugLog('savePost:update:ok', { postId, response: updated });
            }

            let warningMessage = '';

            try {
                await this.syncPostImages(postId);
                this.debugLog('savePost:images:ok', { postId });
            } catch (imageError) {
                this.debugError('savePost:images:error', imageError);
                warningMessage = `El post se guardo, pero hubo un problema al sincronizar imagenes: ${this.extractErrorMessage(imageError, 'Error de imagenes.')}`;
            }

            let finalPost = baseSavedPost;

            try {
                finalPost = await this.fetchPost(postId);
                this.debugLog('savePost:fetchPost:ok', { postId });
            } catch {
                // Si falla la recarga puntual, refrescamos listado para no perder consistencia visual.
                this.debugLog('savePost:fetchPost:fallback:list', { postId });
                await this.loadPosts();
            }

            if (finalPost) {
                this.posts = this.upsertPost(finalPost);
            }

            this.markPublicFeedAsChanged();
            this.statusMessage = warningMessage || (wasCreating
                ? 'Post creado correctamente.'
                : 'Post actualizado correctamente.');

            if (warningMessage) {
                this.showToast('warn', 'Guardado parcial', warningMessage);
            } else {
                this.showToast('success', 'Post', this.statusMessage);
            }

            this.resetForm();
            this.showPostDialog = false;
            this.debugLog('savePost:done', { postId, warningMessage });
        } catch (error) {
            this.debugError('savePost:error', error);
            this.statusMessage = this.extractErrorMessage(error, 'No se pudo guardar el post.');
            this.showToast('error', 'Guardado', this.statusMessage);
        } finally {
            this.isSubmitting = false;
        }
    }

    editPost(post: AmazonasPost): void {
        this.releaseCurrentPreviewUrls();
        this.imagesMarkedForDeletion = [];

        this.editingPostId = post.id;
        this.title = post.title;
        this.markdownText = post.markdown;
        this.editorHtml = this.markdownToHtml(post.markdown);
        this.prayerReasons = [...post.prayerReasons];
        this.uploadedImages = post.images.map((image) => ({ ...image }));
        this.showPostDialog = true;
        this.writeEditorHtml(this.editorHtml);
    }

    async deletePost(postId: number): Promise<void> {
        try {
            this.debugLog('deletePost:start', { postId });
            await firstValueFrom(this.novedadesService.deleteNovedad(postId));
            this.posts = this.posts.filter((post) => post.id !== postId);
            this.markPublicFeedAsChanged();

            if (this.editingPostId === postId) {
                this.resetForm();
            }

            this.statusMessage = 'Post eliminado.';
            this.showToast('success', 'Post', this.statusMessage);
            this.debugLog('deletePost:done', { postId });
        } catch (error) {
            this.debugError('deletePost:error', error);
            this.statusMessage = this.extractErrorMessage(error, 'No se pudo eliminar el post.');
            this.showToast('error', 'Eliminacion', this.statusMessage);
        }
    }

    cancelEdit(): void {
        this.resetForm();
        this.statusMessage = 'Edicion cancelada.';
        this.showPostDialog = false;
    }

    closePostDialog(): void {
        this.showPostDialog = false;
        this.resetForm();
    }

    applyBold(): void {
        this.executeEditorCommand('bold');
    }

    applyItalic(): void {
        this.executeEditorCommand('italic');
    }

    applyUnderline(): void {
        this.executeEditorCommand('underline');
    }

    insertBulletList(): void {
        this.executeEditorCommand('insertUnorderedList');
    }

    insertNumberedList(): void {
        this.executeEditorCommand('insertOrderedList');
    }

    insertHeading(level: 2 | 3): void {
        const tag = level === 2 ? 'H2' : 'H3';
        this.executeEditorCommand('formatBlock', tag);
    }

    insertLink(): void {
        const url = window.prompt('URL del enlace', 'https://');
        if (!url) {
            return;
        }

        this.executeEditorCommand('createLink', url);
    }

    insertImageMarkdown(): void {
        const url = window.prompt('URL de la imagen', 'https://');
        if (!url) {
            return;
        }

        this.executeEditorCommand('insertImage', url);
    }

    openImages(post: AmazonasPost): void {
        this.selectedPostForImages = post;
        this.showImagesDialog = true;
    }

    closeImagesDialog(): void {
        this.showImagesDialog = false;
        this.selectedPostForImages = null;
    }

    trackByPostId(_index: number, post: AmazonasPost): number {
        return post.id;
    }

    formatDate(date: Date): string {
        return date.toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    get postDialogTitle(): string {
        if (this.editingPostId) {
            return `Editando informe: ${this.title || 'Sin titulo'}`;
        }

        return 'Crear nuevo informe';
    }

    ngOnDestroy(): void {
        this.releaseCurrentPreviewUrls();
        this.messageService.clear();
    }

    public async loadPosts(): Promise<void> {
        this.isLoadingPosts = true;
        this.statusMessage = 'Cargando informes...';

        try {
            const projectId = await this.ensureAmazonasProjectId();

            if (projectId === null) {
                this.posts = [];
                this.statusMessage = 'No se encontro el proyecto Amazonas Boliviano en el backend.';
                return;
            }

            const response = await firstValueFrom(this.novedadesService.listNovedades(projectId));
            this.posts = response.data.map((item) => this.mapApiPost(item));
            this.statusMessage = this.posts.length > 0
                ? 'Informes cargados correctamente.'
                : 'No hay informes cargados todavia.';
        } catch (error) {
            this.posts = [];
            this.statusMessage = this.extractErrorMessage(error, 'No se pudieron cargar los informes.');
        } finally {
            this.isLoadingPosts = false;
        }
    }

    private async ensureAmazonasProjectId(): Promise<number | null> {
        if (this.amazonasProjectId !== null) {
            return this.amazonasProjectId;
        }

        const projects = await firstValueFrom(this.novedadesService.getProjects());
        const found = projects.find((project: ProyectoApi) => project.nombre.trim().toLowerCase() === this.amazonasProjectName.toLowerCase());

        this.amazonasProjectId = found?.id ?? null;
        return this.amazonasProjectId;
    }

    private async syncPostImages(postId: number): Promise<void> {
        for (const image of this.imagesMarkedForDeletion) {
            if (!image.id) {
                continue;
            }

            await firstValueFrom(this.novedadesService.deleteImage(postId, image.id));
        }

        const currentImages: ManagedImage[] = [];

        for (const image of this.uploadedImages) {
            if (!image.file) {
                currentImages.push(image);
                continue;
            }

            const uploaded = await firstValueFrom(
                this.novedadesService.uploadImage(postId, image.file, currentImages.length, image.alt),
            );

            currentImages.push(this.mapApiImage(uploaded.data));
        }

        const ordered = currentImages
            .map((image, index) => (image.id ? { id: image.id, order: index } : null))
            .filter((item): item is { id: number; order: number } => item !== null);

        if (ordered.length > 0) {
            await firstValueFrom(this.novedadesService.reorderImages(postId, ordered));
        }
    }

    private async fetchPost(postId: number): Promise<AmazonasPost> {
        const response = await firstValueFrom(this.novedadesService.getNovedad(postId));
        return this.mapApiPost(response.data);
    }

    private upsertPost(post: AmazonasPost): AmazonasPost[] {
        const exists = this.posts.some((item) => item.id === post.id);

        if (!exists) {
            return [post, ...this.posts];
        }

        return this.posts.map((item) => (item.id === post.id ? post : item));
    }

    private mapApiPost(apiPost: NovedadApi): AmazonasPost {
        return {
            id: apiPost.id,
            projectId: apiPost.projectId,
            title: apiPost.title,
            markdown: apiPost.markdown,
            prayerReasons: [...apiPost.prayerReasons],
            images: apiPost.images
                .sort((a, b) => a.order - b.order)
                .map((image) => this.mapApiImage(image)),
            createdAt: new Date(apiPost.createdAt),
            updatedAt: new Date(apiPost.updatedAt),
        };
    }

    private mapApiImage(image: NovedadImageApi): ManagedImage {
        return {
            id: image.id,
            path: image.path,
            name: image.name,
            type: image.type,
            size: image.size,
            previewUrl: image.previewUrl,
            order: image.order,
            alt: image.alt ?? undefined,
        };
    }

    private extractErrorMessage(error: unknown, fallback: string): string {
        const err = error as { error?: ApiResponse<unknown> | { message?: string } };
        const backendError = err?.error as ApiResponse<unknown> | undefined;

        if (backendError?.message) {
            return backendError.message;
        }

        const generic = (err?.error as { message?: string } | undefined)?.message;
        return generic || fallback;
    }

    private markPublicFeedAsChanged(): void {
        sessionStorage.setItem(this.publicFeedSyncKey, Date.now().toString());
    }

    private hasSessionToken(): boolean {
        const raw = sessionStorage.getItem('response_logged_user');

        if (!raw) {
            return false;
        }

        try {
            const parsed = JSON.parse(raw) as { token?: string };
            return !!parsed?.token;
        } catch {
            return false;
        }
    }

    private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
        this.messageService.add({
            severity,
            summary,
            detail,
            life: 3000,
        });
    }

    private debugLog(event: string, payload?: unknown): void {
        if (!this.debugEnabled) {
            return;
        }

        // Log temporal para depurar flujo de guardado/errores en entorno local.
        console.log(`[GestionAmazonas] ${event}`, payload ?? '');
    }

    private debugError(event: string, error: unknown): void {
        if (!this.debugEnabled) {
            return;
        }

        if (error instanceof HttpErrorResponse) {
            console.error(`[GestionAmazonas] ${event}`, {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                url: error.url,
                backend: error.error,
            });
            return;
        }

        console.error(`[GestionAmazonas] ${event}`, error);
    }

    private executeEditorCommand(command: string, value?: string): void {
        const editor = this.richEditor?.nativeElement;
        if (!editor) {
            return;
        }

        editor.focus();
        document.execCommand(command, false, value);
        this.syncMarkdownFromEditor();
        this.refreshToggleState();
    }

    private writeEditorHtml(html: string): void {
        setTimeout(() => {
            const editor = this.richEditor?.nativeElement;
            if (!editor) {
                return;
            }

            editor.innerHTML = html;
            this.syncMarkdownFromEditor();
            this.refreshToggleState();
        });
    }

    private syncMarkdownFromEditor(): void {
        const editor = this.richEditor?.nativeElement;
        if (!editor) {
            return;
        }

        this.editorHtml = editor.innerHTML;
        this.markdownText = this.htmlToMarkdown(this.editorHtml);
    }

    private refreshToggleState(): void {
        try {
            this.formatToggleState = {
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                bulletList: document.queryCommandState('insertUnorderedList'),
                numberedList: document.queryCommandState('insertOrderedList')
            };
        } catch {
            this.resetFormatToggles();
        }
    }

    private markdownToHtml(markdown: string): string {
        const rawHtml = marked.parse(markdown ?? '') as string;
        return this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? '';
    }

    private htmlToMarkdown(html: string): string {
        const container = document.createElement('div');
        container.innerHTML = html;

        const serializeNode = (node: Node): string => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent ?? '';
            }

            if (node.nodeType !== Node.ELEMENT_NODE) {
                return '';
            }

            const element = node as HTMLElement;
            const tag = element.tagName.toLowerCase();
            const children = Array.from(element.childNodes).map((child) => serializeNode(child)).join('');

            switch (tag) {
                case 'br':
                    return '\n';
                case 'strong':
                case 'b':
                    return `**${children}**`;
                case 'em':
                case 'i':
                    return `*${children}*`;
                case 'u':
                    return `<u>${children}</u>`;
                case 'h2':
                    return `## ${children.trim()}\n\n`;
                case 'h3':
                    return `### ${children.trim()}\n\n`;
                case 'p':
                case 'div':
                    return `${children.trim()}\n\n`;
                case 'ul': {
                    const listItems = Array.from(element.children)
                        .filter((child) => child.tagName.toLowerCase() === 'li')
                        .map((li) => `- ${serializeNode(li).trim()}`)
                        .join('\n');
                    return `${listItems}\n\n`;
                }
                case 'ol': {
                    const listItems = Array.from(element.children)
                        .filter((child) => child.tagName.toLowerCase() === 'li')
                        .map((li, index) => `${index + 1}. ${serializeNode(li).trim()}`)
                        .join('\n');
                    return `${listItems}\n\n`;
                }
                case 'li':
                    return children;
                case 'a': {
                    const href = element.getAttribute('href') ?? '';
                    return `[${children || href}](${href})`;
                }
                case 'img': {
                    const src = element.getAttribute('src') ?? '';
                    const alt = element.getAttribute('alt') ?? 'imagen';
                    return `![${alt}](${src})`;
                }
                default:
                    return children;
            }
        };

        const markdown = Array.from(container.childNodes).map((node) => serializeNode(node)).join('');
        return markdown
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+\n/g, '\n')
            .trim();
    }

    private addFiles(fileList: FileList | null | undefined): void {
        if (!fileList || fileList.length === 0) {
            return;
        }

        const files = Array.from(fileList);
        const mapped: ManagedImage[] = files.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            previewUrl: this.isImage(file) ? URL.createObjectURL(file) : '',
            file
        }));

        this.uploadedImages = [...this.uploadedImages, ...mapped];
    }

    private isImage(file: File): boolean {
        return file.type.startsWith('image/');
    }

    private resetForm(): void {
        this.releaseCurrentPreviewUrls();
        this.resetFormatToggles();

        this.editingPostId = null;
        this.title = '';
        this.markdownText = '';
        this.editorHtml = '';
        this.newPrayerReason = '';
        this.prayerReasons = [];
        this.uploadedImages = [];
        this.imagesMarkedForDeletion = [];
    }

    private releaseCurrentPreviewUrls(): void {
        this.uploadedImages.forEach((image) => {
            if (image.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(image.previewUrl);
            }
        });
    }

    private resetFormatToggles(): void {
        this.formatToggleState = {
            bold: false,
            italic: false,
            underline: false,
            bulletList: false,
            numberedList: false
        };
    }

    isLoggedUser(user: User): boolean {
        return typeof user.id === 'number' && typeof this.loggedUser?.id === 'number' && user.id === this.loggedUser.id;
    }

    get filteredRoles(): Role[] {
        const isSuperAdmin = this.loggedUser?.roles?.some(r => r.name === 'super administrador') ?? false;
        if (isSuperAdmin) {
            return this.roles;
        }
        return this.roles.filter(r => r.name !== 'super administrador');
    }

    private hasAnyPermission(permissionNames: string[]): boolean {
        const userPermissions = this.loggedUser?.permissions?.map(p => p?.name?.toString().toLowerCase().trim() || '') || [];
        const targetPermissions = permissionNames.map(name => name.toLowerCase());
        return targetPermissions.some(name => userPermissions.includes(name));
    }

    get canCreateInformes(): boolean {
        return this.hasAnyPermission(['crear informes proyecto']);
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
