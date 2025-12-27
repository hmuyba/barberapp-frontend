import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  credentials: LoginRequest = {
    email: '',
    password: '',
  };

  // Estados
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;

  // 2FA
  show2FAModal = false;
  twoFactorCode = '';
  isVerifying2FA = false;
  canResendCode = true;
  resendCountdown = 0;

  private apiUrl = 'http://localhost:5199/api/auth';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Limpiar cualquier sesión anterior al cargar el componente
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Reiniciar estado del componente
    this.resetState();
  }

  private resetState(): void {
    this.credentials = { email: '', password: '' };
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
    this.show2FAModal = false;
    this.twoFactorCode = '';
    this.isVerifying2FA = false;
    this.canResendCode = true;
    this.resendCountdown = 0;
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.requiresTwoFactor) {
          // Mostrar modal de 2FA
          this.show2FAModal = true;
          this.successMessage = 'Código de verificación enviado a tu correo';
          this.startResendCountdown();
        }
        // Si no requiere 2FA, el redirect se maneja en AuthService
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ||
          'Error al iniciar sesión. Verifica tus credenciales.';
        console.error('Login error:', error);
      },
    });
  }

  verify2FA(): void {
    console.log('=== VERIFY 2FA CALLED ===');

    if (!this.twoFactorCode || this.twoFactorCode.length !== 6) {
      this.errorMessage = 'Ingresa el código de 6 dígitos';
      return;
    }

    this.isVerifying2FA = true;
    this.errorMessage = '';

    const payload = {
      email: this.credentials.email,
      code: this.twoFactorCode,
    };

    this.http.post<any>(`${this.apiUrl}/verify-2fa`, payload).subscribe({
      next: (response) => {
        console.log('2FA Success:', response);
        this.isVerifying2FA = false;

        if (response.success && response.token) {
          // Guardar token y usuario en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));

          // Cerrar modal
          this.show2FAModal = false;

          // Forzar recarga de la página para limpiar todo el estado
          window.location.href = this.getRedirectUrl(response.user.role);
        }
      },
      error: (error) => {
        console.log('2FA Error:', error);
        this.isVerifying2FA = false;
        this.errorMessage =
          error.error?.message || 'Código inválido o expirado';
        this.twoFactorCode = '';
      },
    });
  }

  private getRedirectUrl(role: string): string {
    switch (role) {
      case 'Client':
      case 'Cliente':
        return '/cliente/dashboard';
      case 'Barber':
      case 'Barbero':
        return '/barbero/dashboard';
      case 'Administrator':
      case 'Administrador':
      case 'Manager':
        return '/admin/dashboard';
      default:
        return '/';
    }
  }

  resend2FACode(): void {
    if (!this.canResendCode) return;

    this.http
      .post<any>(
        `${this.apiUrl}/resend-2fa`,
        JSON.stringify(this.credentials.email),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Nuevo código enviado a tu correo';
          this.errorMessage = '';
          this.startResendCountdown();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Error al reenviar código';
        },
      });
  }

  private startResendCountdown(): void {
    this.canResendCode = false;
    this.resendCountdown = 60;

    const interval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.canResendCode = true;
        clearInterval(interval);
      }
    }, 1000);
  }

  private redirectByRole(role: string): void {
    switch (role) {
      case 'Client':
      case 'Cliente':
        this.router.navigate(['/cliente/dashboard']);
        break;
      case 'Barber':
      case 'Barbero':
        this.router.navigate(['/barbero/dashboard']);
        break;
      case 'Administrator':
      case 'Administrador':
      case 'Manager':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  close2FAModal(): void {
    this.show2FAModal = false;
    this.twoFactorCode = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  // Formatear input de código (solo números, máx 6)
  onCodeInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 6) {
      value = value.substring(0, 6);
    }
    this.twoFactorCode = value;
  }
}
