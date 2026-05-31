import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MarkdownViewerComponent } from '../../components/markdown-viewer/markdown-viewer.component';
import { NovedadApi, NovedadesService, ProyectoApi } from '../../services/novedades.service';

@Component({
    selector: 'app-amazonas-boliviano',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CarouselModule,
        TooltipModule,
        ToastModule,
        ScrollPanelModule,
        TranslateModule,
        MarkdownViewerComponent
    ],
    providers: [MessageService],
    templateUrl: './amazonas-boliviano.component.html',
    styleUrls: ['./amazonas-boliviano.component.scss']
})
export class AmazonasBolivianoComponent implements OnInit, OnDestroy {
    private readonly amazonasProjectName = 'Amazonas Boliviano';
    private readonly publicFeedSyncKey = 'amazonas_public_feed_sync';
    private requestedPostId: number | null = null;
    private lastSeenSyncToken = '';

    posts: NovedadApi[] = [];
    selectedPostIndex = 0;
    amazonasProjectId: number | null = null;
    loading = false;
    loadError = '';

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly novedadesService: NovedadesService,
        private readonly messageService: MessageService,
    ) {}

    ngOnInit(): void {
        const postIdParam = this.route.snapshot.queryParamMap.get('postId');
        const parsedPostId = postIdParam ? Number(postIdParam) : NaN;
        this.requestedPostId = Number.isFinite(parsedPostId) ? parsedPostId : null;
        this.lastSeenSyncToken = sessionStorage.getItem(this.publicFeedSyncKey) || '';

        void this.loadPosts();
    }

    ngOnDestroy(): void {
        this.messageService.clear();
    }

    @HostListener('window:focus')
    onWindowFocus(): void {
        void this.refreshIfFeedChanged();
    }

    get currentPost(): NovedadApi | null {
        if (this.posts.length === 0) {
            return null;
        }

        return this.posts[this.selectedPostIndex] ?? null;
    }

    get contenidoMarkdown(): string {
        return this.currentPost?.markdown || 'Sin informe disponible.';
    }

    get imagenesAmazonas(): Array<{ url: string; alt: string }> {
        const post = this.currentPost;

        if (!post) {
            return [];
        }

        const images = this.normalizeImages(post.images);

        return [...images]
            .sort((a, b) => a.order - b.order)
            .map((image) => ({
                url: image.previewUrl || image.url || '',
                alt: image.alt || image.name || 'Imagen de novedad',
            }))
            .filter((image) => image.url.trim().length > 0);
    }

    private normalizeImages(rawImages: unknown): NovedadApi['images'] {
        if (Array.isArray(rawImages)) {
            return rawImages as NovedadApi['images'];
        }

        if (rawImages && typeof rawImages === 'object') {
            return Object.values(rawImages as Record<string, NovedadApi['images'][number]>);
        }

        return [];
    }

    get motivosOracion(): string[] {
        const reasons = this.currentPost?.prayerReasons ?? [];
        return reasons
            .map((reason) => reason?.trim())
            .filter((reason): reason is string => !!reason);
    }

    get tituloInforme(): string {
        return this.currentPost?.title || 'Sin título';
    }

    get fechaActual(): string {
        const current = this.currentPost;

        if (!current) {
            return '';
        }

        const source = current.date || current.updatedAt || current.createdAt;
        return this.formatDate(source);
    }

    get postsReversed(): NovedadApi[] {
        return [...this.posts].reverse();
    }

    getPostIndex(post: NovedadApi): number {
        return this.posts.findIndex((item) => item.id === post.id);
    }

    selectPost(index: number): void {
        if (index < 0 || index >= this.posts.length) {
            return;
        }

        this.setSelectedPostIndex(index, true);
    }

    private async loadPosts(): Promise<void> {
        this.loading = true;
        this.loadError = '';

        try {
            const projectId = await this.ensureAmazonasProjectId();

            if (projectId === null) {
                this.posts = [];
                this.loadError = 'No se encontró el proyecto Amazonas Boliviano.';
                return;
            }

            const response = await firstValueFrom(this.novedadesService.listNovedades(projectId));
            this.posts = (response.data ?? [])
                .map((post) => ({
                    ...post,
                    images: this.normalizeImages(post.images),
                }))
                .sort((a, b) => this.getPostTimestamp(a) - this.getPostTimestamp(b));

            const fallbackIndex = this.posts.length > 0 ? this.posts.length - 1 : 0;
            const initialIndex = this.requestedPostId !== null
                ? this.posts.findIndex((post) => post.id === this.requestedPostId)
                : fallbackIndex;

            this.setSelectedPostIndex(initialIndex >= 0 ? initialIndex : fallbackIndex, false);
        } catch {
            this.posts = [];
            this.loadError = 'No se pudieron cargar las novedades en este momento.';
        } finally {
            this.loading = false;
            this.lastSeenSyncToken = sessionStorage.getItem(this.publicFeedSyncKey) || '';
        }
    }

    private async refreshIfFeedChanged(): Promise<void> {
        const syncToken = sessionStorage.getItem(this.publicFeedSyncKey) || '';

        if (!syncToken || syncToken === this.lastSeenSyncToken || this.loading) {
            return;
        }

        this.requestedPostId = this.currentPost?.id ?? this.requestedPostId;
        await this.loadPosts();
        this.showContentUpdatedNotice();
    }

    private showContentUpdatedNotice(): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Novedades',
            detail: 'Contenido actualizado.',
            life: 2500,
        });
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

    private formatDate(value: string): string {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }

    formatPostDate(post: NovedadApi): string {
        const source = post.date || post.updatedAt || post.createdAt;
        return this.formatDate(source);
    }

    private getPostTimestamp(post: NovedadApi): number {
        const source = post.date || post.updatedAt || post.createdAt;
        const timestamp = new Date(source).getTime();

        return Number.isNaN(timestamp) ? 0 : timestamp;
    }

    private setSelectedPostIndex(index: number, syncUrl: boolean): void {
        if (this.posts.length === 0) {
            this.selectedPostIndex = 0;
            return;
        }

        const safeIndex = Math.max(0, Math.min(index, this.posts.length - 1));
        this.selectedPostIndex = safeIndex;

        if (syncUrl) {
            const postId = this.posts[safeIndex]?.id;
            void this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { postId },
                queryParamsHandling: 'merge',
                replaceUrl: true,
            });
        }
    }

    volverAProjects() {
        this.router.navigate(['/welcome']);
    }

    ir_a_donar(): void {
        void this.router.navigate(['/donate']);
    }

    ir_a_quienes_somos(): void {
        void this.router.navigate(['/about-us']);
    }

    ir_a_contacto(): void {
        void this.router.navigate(['/contact-us'], {
            queryParams: {
                prefillLoggedUser: '1',
            },
        });
    }

    entrada_anterior() {
        if (this.posts.length <= 1 || this.selectedPostIndex === 0) {
            return;
        }

        const newIndex = this.selectedPostIndex - 1;

        this.setSelectedPostIndex(newIndex, true);
    }

    siguiente_entrada() {
        if (this.posts.length <= 1 || this.selectedPostIndex >= this.posts.length - 1) {
            return;
        }

        const newIndex = this.selectedPostIndex + 1;

        this.setSelectedPostIndex(newIndex, true);
    }

    ir_primera_entrada(): void {
        if (this.posts.length <= 1 || this.selectedPostIndex === 0) {
            return;
        }

        this.setSelectedPostIndex(0, true);
    }

    ir_ultima_entrada(): void {
        if (this.posts.length <= 1 || this.selectedPostIndex >= this.posts.length - 1) {
            return;
        }

        this.setSelectedPostIndex(this.posts.length - 1, true);
    }
}
