import { Component, Input, OnChanges, SecurityContext, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
    selector: 'app-markdown-viewer',
    standalone: true,
    templateUrl: './markdown-viewer.component.html',
    styleUrls: ['./markdown-viewer.component.scss']
})
export class MarkdownViewerComponent implements OnChanges {

    @Input() markdown = '';
    @Input() height = '400px';
    @Input() mobileHeight = '280px';
    @Input() compact = false;
    @Input() previewLines = 8;

    renderedHtml = '';

    constructor(private readonly sanitizer: DomSanitizer) {
        marked.setOptions({
            gfm: true,
            breaks: true
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['markdown']) {
            this.renderMarkdown();
        }
    }

    private renderMarkdown(): void {
        const normalizedMarkdown = this.normalizeMarkdown(this.markdown ?? '');
        const rawHtml = marked.parse(normalizedMarkdown) as string;

        // Sanitiza el HTML generado para evitar contenido malicioso.
        this.renderedHtml = this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? '';
    }

    private normalizeMarkdown(content: string): string {
        if (!content) {
            return '';
        }

        const lines = content.replace(/\r\n/g, '\n').split('\n');
        const start = lines.findIndex((line) => line.trim().length > 0);
        const end = lines.length - 1 - [...lines].reverse().findIndex((line) => line.trim().length > 0);

        if (start < 0 || end < start) {
            return '';
        }

        const trimmedLines = lines.slice(start, end + 1);
        const nonEmptyLines = trimmedLines.filter((line) => line.trim().length > 0);

        if (nonEmptyLines.length === 0) {
            return '';
        }

        const minPositiveIndent = nonEmptyLines
            .map((line) => (line.match(/^\s*/)?.[0].length ?? 0))
            .filter((value) => value > 0)
            .reduce((min, value) => Math.min(min, value), Number.POSITIVE_INFINITY);

        if (!Number.isFinite(minPositiveIndent)) {
            return trimmedLines.join('\n');
        }

        const normalized = trimmedLines.map((line) => {
            if (line.trim().length === 0) {
                return '';
            }

            const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
            const charsToRemove = Math.min(minPositiveIndent, currentIndent);
            return line.slice(charsToRemove);
        });

        return normalized.join('\n');
    }
}
