import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { WelcomeContentService } from '../../services/welcome-content.service';


@Component({
  selector: 'app-welcome',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit, OnDestroy {

  accessDenied = false;
  deniedFrom = '';
  verseText = '';
  verseCitation = '';
  reflectionText = '';
  showFallbackNotice = false;
  imageUrl = 'assets/images/image_welcome_default.jpg';

  private langSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly welcomeContentService: WelcomeContentService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.accessDenied = params.get('denied') === '1';
      this.deniedFrom = params.get('from') || '';
    });

    this.loadWelcomeContent();
    this.langSub = this.translate.onLangChange.subscribe(() => this.loadWelcomeContent());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadWelcomeContent(): void {
    const locale = this.translate.currentLang || localStorage.getItem('selected_lang') || 'es';

    this.welcomeContentService.getPublic(locale).subscribe({
      next: (response) => {
        const data = response?.data;
        this.verseText = data?.verse_text || '';
        this.verseCitation = data?.verse_citation || '';
        this.reflectionText = data?.reflection_text || '';
        this.showFallbackNotice = data?.fallback_from_es === true;
        this.imageUrl = data?.image_url || 'assets/images/image_welcome_default.jpg';
      },
      error: () => {
        this.showFallbackNotice = false;
        this.imageUrl = 'assets/images/image_welcome_default.jpg';
      },
    });
  }

  onImageError(): void {
    this.imageUrl = 'assets/images/image_welcome_default.jpg';
  }

}
