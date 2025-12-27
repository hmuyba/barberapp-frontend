import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  // Rutas de autenticación (públicas)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/components/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/components/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
    ],
  },

  // Rutas de Cliente (protegidas)
  {
    path: 'cliente',
    canActivate: [authGuard, roleGuard(['Cliente', 'Client'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/cliente/components/dashboard-cliente/dashboard-cliente.component'
          ).then((m) => m.DashboardClienteComponent),
      },
      {
        path: 'agendar',
        loadComponent: () =>
          import(
            './features/cliente/components/agendar-cita/agendar-cita.component'
          ).then((m) => m.AgendarCitaComponent),
      },
    ],
  },

  // Rutas de Barbero (protegidas)
  {
    path: 'barbero',
    canActivate: [authGuard, roleGuard(['Barbero', 'Barber'])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/barbero/components/dashboard-barbero/dashboard-barbero.component'
          ).then((m) => m.DashboardBarberoComponent),
      },
    ],
  },

  // Rutas de Admin (protegidas)
  {
    path: 'admin',
    canActivate: [
      authGuard,
      roleGuard(['Administrador', 'Administrator', 'Manager']),
    ], // ← Agregar 'Manager'
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/admin/components/dashboard-admin/dashboard-admin.component'
          ).then((m) => m.DashboardAdminComponent),
      },
    ],
  },

  // Ruta 404
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
