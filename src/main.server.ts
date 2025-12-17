import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// The SSR engine (AngularNodeAppEngine) looks for a default export function with signature
// (context: BootstrapContext) => Promise<ApplicationRef>
export default function bootstrap(context: BootstrapContext) {
  // You can inspect context.url, context.request, etc. if needed for per-request providers
  return bootstrapApplication(AppComponent, config, context);
}
