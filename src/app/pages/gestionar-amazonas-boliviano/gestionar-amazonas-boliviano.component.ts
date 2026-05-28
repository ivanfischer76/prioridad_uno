import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, SecurityContext, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

interface ManagedImage {
    name: string;
    type: string;
    size: number;
    previewUrl: string;
    file?: File;
}

interface AmazonasPost {
    id: number;
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
        InputTextModule,
        TableModule,
        TooltipModule
    ],
    templateUrl: './gestionar-amazonas-boliviano.component.html',
    styleUrl: './gestionar-amazonas-boliviano.component.scss'
})
export class GestionarAmazonasBolivianoComponent implements OnDestroy {
    @ViewChild('richEditor') richEditor?: ElementRef<HTMLDivElement>;

    title = '';
    markdownText = '';
    editorHtml = '';
    newPrayerReason = '';
    prayerReasons: string[] = [];
    uploadedImages: ManagedImage[] = [];

    posts: AmazonasPost[] = [
        {
            id: 1,
            title: 'Reporte inicial del Amazonas boliviano',
            markdown: '## Reporte inicial\n\nPrimer relevamiento en comunidades riberenas.',
            prayerReasons: ['Proteccion de lideres comunitarios', 'Sabiduria para equipos de campo'],
            images: [],
            createdAt: new Date('2026-04-26T10:00:00'),
            updatedAt: new Date('2026-04-26T10:00:00')
        }
    ];

    editingPostId: number | null = null;
    statusMessage = '';
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

    constructor(private readonly sanitizer: DomSanitizer) {
        marked.setOptions({
            gfm: true,
            breaks: true
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
        if (image?.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(image.previewUrl);
        }
        this.uploadedImages = this.uploadedImages.filter((_, i) => i !== index);
    }

    savePost(): void {
        this.syncMarkdownFromEditor();

        const cleanedTitle = this.title.trim();
        const cleanedMarkdown = this.markdownText.trim();

        if (!cleanedTitle || !cleanedMarkdown) {
            this.statusMessage = 'Debes completar titulo y contenido del post.';
            return;
        }

        const now = new Date();

        if (this.editingPostId === null) {
            const newPost: AmazonasPost = {
                id: this.generatePostId(),
                title: cleanedTitle,
                markdown: cleanedMarkdown,
                prayerReasons: [...this.prayerReasons],
                images: this.uploadedImages.map((image) => ({ ...image })),
                createdAt: now,
                updatedAt: now
            };

            this.posts = [newPost, ...this.posts];
            this.statusMessage = 'Post creado correctamente. Listo para enviar a base de datos.';
        } else {
            this.posts = this.posts.map((post) => {
                if (post.id !== this.editingPostId) {
                    return post;
                }

                return {
                    ...post,
                    title: cleanedTitle,
                    markdown: cleanedMarkdown,
                    prayerReasons: [...this.prayerReasons],
                    images: this.uploadedImages.map((image) => ({ ...image })),
                    updatedAt: now
                };
            });

            this.statusMessage = 'Post actualizado correctamente.';
        }

        this.resetForm();
        this.showPostDialog = false;
    }

    editPost(post: AmazonasPost): void {
        this.releaseCurrentPreviewUrls();

        this.editingPostId = post.id;
        this.title = post.title;
        this.markdownText = post.markdown;
        this.editorHtml = this.markdownToHtml(post.markdown);
        this.prayerReasons = [...post.prayerReasons];
        this.uploadedImages = post.images.map((image) => ({ ...image }));
        this.statusMessage = `Editando post: ${post.title}`;
        this.showPostDialog = true;
        this.writeEditorHtml(this.editorHtml);
    }

    deletePost(postId: number): void {
        this.posts = this.posts.filter((post) => post.id !== postId);

        if (this.editingPostId === postId) {
            this.resetForm();
        }

        this.statusMessage = 'Post eliminado.';
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
        return this.editingPostId ? 'Editar post' : 'Crear nuevo post';
    }

    ngOnDestroy(): void {
        this.releaseCurrentPreviewUrls();
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
    }

    private generatePostId(): number {
        return this.posts.reduce((max, post) => Math.max(max, post.id), 0) + 1;
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
}
