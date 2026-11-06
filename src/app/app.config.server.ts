import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE_URL } from './core/api-base.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Where the SSR server reaches the backend API. Override with the API_URL environment variable.
    { provide: API_BASE_URL, useValue: process.env['API_URL'] || 'http://localhost:3000' },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
