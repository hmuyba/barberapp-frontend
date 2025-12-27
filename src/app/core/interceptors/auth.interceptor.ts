import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Rutas que NO deben llevar token
  const publicUrls = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-2fa',
    '/api/auth/resend-2fa',
  ];

  // Verificar si es una ruta pública
  const isPublicUrl = publicUrls.some((url) => req.url.includes(url));

  // Debug log
  console.log(`[Interceptor] ${req.url} - isPublic: ${isPublicUrl}`);

  if (isPublicUrl) {
    console.log('[Interceptor] Skipping auth header for public route');
    return next(req);
  }

  const token = localStorage.getItem('token');

  // Solo agregar token si existe y no está vacío
  if (token && token.length > 0) {
    console.log('[Interceptor] Adding auth header');
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  console.log('[Interceptor] No token found, proceeding without auth');
  return next(req);
};
