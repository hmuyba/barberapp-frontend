# 💈 BarberApp Frontend

Aplicación web para el Sistema de Gestión de Citas para Barberías, desarrollada como proyecto final del Diplomado en Desarrollo Web y Móvil Full Stack.

## 🚀 Tecnologías

- **Framework:** Angular 19
- **Lenguaje:** TypeScript 5.x
- **UI Framework:** Bootstrap 5
- **Estilos:** SCSS
- **Patrón:** Componentes Standalone
- **HTTP Client:** Angular HttpClient
- **Routing:** Angular Router con Guards

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios, guards, interceptors, modelos
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── models/
│   │   └── services/
│   ├── features/                # Módulos por funcionalidad
│   │   ├── auth/               # Login, Register
│   │   ├── cliente/            # Dashboard, Agendar cita
│   │   ├── barbero/            # Dashboard barbero
│   │   └── admin/              # Dashboard admin
│   └── shared/                  # Componentes compartidos
├── assets/
└── environments/
```

## ⚙️ Configuración

### 1. Requisitos Previos
- Node.js 18+
- npm o yarn
- Angular CLI 19

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar API URL
Verificar en `src/app/core/services/` que la URL del backend sea correcta:
```typescript
private apiUrl = 'http://localhost:5199/api';
```

### 4. Ejecutar
```bash
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

## 🔐 Características de Seguridad

| Característica | Implementación |
|----------------|----------------|
| Autenticación | JWT almacenado en localStorage |
| Protección de Rutas | AuthGuard, RoleGuard |
| Interceptor | Agrega token a cada request |
| 2FA | Modal de verificación de código |
| Roles | Cliente, Barbero, Administrador |

## 📱 Módulos y Funcionalidades

### Módulo de Autenticación
- ✅ Login con validación
- ✅ Registro de usuarios
- ✅ Verificación 2FA
- ✅ Logout seguro

### Módulo Cliente
- ✅ Dashboard personalizado
- ✅ Wizard de agendamiento (3 pasos)
- ✅ Ver próximas citas
- ✅ Historial de citas
- ✅ Cancelar/Reprogramar citas
- ✅ Modales de confirmación

### Módulo Barbero
- ✅ Dashboard con agenda del día
- ✅ Marcar citas completadas
- ✅ Estadísticas de desempeño
- ✅ Llamar a clientes

### Módulo Administrador
- ✅ Dashboard con métricas globales
- ✅ Lista de citas del día
- ✅ Gestión de barberos y servicios
- ✅ Estadísticas generales

## 🎨 Capturas de Pantalla

### Login con 2FA
El sistema solicita un código de verificación enviado por email.

### Dashboard Cliente
Visualización de próximas citas y acceso rápido para agendar.

### Wizard de Agendamiento
Proceso de 3 pasos: Barbero → Fecha/Hora → Servicio

## 👤 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Cliente | cliente@barberia.com | Cliente123! |
| Barbero | barbero@barberia.com | Barbero123! |
| Admin | admin@barberia.com | Admin123! |

## 🔗 Backend

Repositorio del backend: [barberapp-backend](https://github.com/hmuyba/barberapp-backend)

## 📝 Comandos Útiles

```bash
# Desarrollo
ng serve

# Build producción
ng build --configuration=production

# Ejecutar tests
ng test

# Lint
ng lint
```
