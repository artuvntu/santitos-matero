import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env/environment';

import { AdminLayoutComponent } from '../theme/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '../theme/auth-layout/auth-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './sessions/login/login.component';
import { RegisterComponent } from './sessions/register/register.component';

import { BienvenidaComponent } from './bienvenida/bienvenida.component';
import { GraficasComponent } from './graficas/graficas.component';
import { VentasComponent } from './ventas/ventas.component';

import { IsLoginInterceptor } from '../core/services/islogin.interceptor';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard', titleI18n: 'dashboard' },
      },
      {
        path: 'sessions',
        loadChildren: () =>
          import('./sessions/sessions.module').then(m => m.SessionsModule),
        data: { title: 'Sessions', titleI18n: 'Sessions' },
      },
      {
        path: 'bienvenida',
        component: BienvenidaComponent,
        data: {title: 'Bienvenida', titleI18n: 'Bienvenida'}
      },
      {
        path: 'graficas',
        component: GraficasComponent,
        data: {title: 'Graficas', titleI18n: 'Graficas'}
      },
      {
        path: 'ventas',
        component: VentasComponent,
        data: {title: 'Ventas', titleI18n: 'Ventas'}
      },
      { path: '**', redirectTo: 'auth/login' },
    ],
    resolve: [IsLoginInterceptor],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login', titleI18n: 'Login' },
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register', titleI18n: 'Register' },
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
    }),
  ],
  exports: [RouterModule],
  providers: [IsLoginInterceptor]
})
export class RoutesRoutingModule {}
