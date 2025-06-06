import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { TranslateModule } from '@ngx-translate/core';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? [])
  ]
}).catch((err) => console.error(err));
