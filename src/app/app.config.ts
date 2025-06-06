import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { 
	TranslateLoader, 
	TranslateService, 
	TranslateStore, 
	TranslateCompiler, 
	TranslateFakeCompiler, 
	TranslateParser, 
	TranslateDefaultParser,
	MissingTranslationHandler,
	FakeMissingTranslationHandler,
	USE_DEFAULT_LANG,
	ISOLATE_TRANSLATE_SERVICE,
	USE_EXTEND,
	DEFAULT_LANGUAGE
} from '@ngx-translate/core';
import { HttpLoaderFactory } from './app'; // o donde tengas tu factory

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideAnimationsAsync(),
		providePrimeNG({
			theme: {
				preset: Aura
			}
		}),
		provideHttpClient(),
		TranslateService,
    	TranslateStore,
		{
			provide: TranslateLoader,
			useFactory: HttpLoaderFactory,
			deps: [HttpClient]
		},
		        {
            provide: TranslateCompiler,
            useClass: TranslateFakeCompiler
        },
		{
			provide: TranslateParser,
			useClass: TranslateDefaultParser
		},
		{
			provide: MissingTranslationHandler,
			useClass: FakeMissingTranslationHandler
		},
		{
			provide: USE_DEFAULT_LANG,
			useValue: true // o false si no quieres usar el idioma por defecto
    	},
		{
			provide: ISOLATE_TRANSLATE_SERVICE,
			useValue: false
		},
		{
			provide: USE_EXTEND,
			useValue: false // o true si quieres extender traducciones
		},
		{
			provide: DEFAULT_LANGUAGE,
			useValue: 'es' // Idioma por defecto
		}
	]
};
