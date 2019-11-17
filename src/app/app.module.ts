import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ThemeModule } from './theme/theme.module';
import { RoutesModule } from './routes/routes.module';
import { AppComponent } from './app.component';

import { DefaultInterceptor } from '@core';
import { StartupService } from '@core';
export function StartupServiceFactory(startupService: StartupService) {
  return () => startupService.load();
}

import { FormlyModule } from '@ngx-formly/core';
import { ToastrModule } from 'ngx-toastr';

// Electron
import { NgxElectronModule } from 'ngx-electron';
import { AuthenticationService } from '@core/services/authentication.service';
import { RequestManagerService } from '@core/services/requestmanager.service';
import { RequestAuthService, DialogOverviewExampleDialogComponent } from '@core/services/requestauth.service';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    DialogOverviewExampleDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    ThemeModule,
    RoutesModule,
    FormlyModule.forRoot(),
    ToastrModule.forRoot(),
    NgxElectronModule,
    MatDialogModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
    StartupService,
    AuthenticationService,
    RequestManagerService,
    RequestAuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: StartupServiceFactory,
      deps: [StartupService],
      multi: true,
    },
  ],
  entryComponents: [
    DialogOverviewExampleDialogComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
