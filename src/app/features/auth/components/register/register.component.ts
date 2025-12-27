import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: 1, // Siempre Cliente
    enableTwoFactor: false,
  };

  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    // Validaciones
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Registro exitoso. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Error al registrarse. Intenta nuevamente.';
        console.error('Register error:', error);
      },
    });
  }

  validateForm(): boolean {
    if (
      !this.registerData.fullName ||
      !this.registerData.email ||
      !this.registerData.phone ||
      !this.registerData.password
    ) {
      this.errorMessage = 'Por favor completa todos los campos';
      return false;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    return true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
