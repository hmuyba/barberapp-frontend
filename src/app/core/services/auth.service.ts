import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5199/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.token && response.user) {
            this.setSession(response);
          }
        })
      );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private setSession(authResult: LoginResponse): void {
    if (authResult.token && authResult.user) {
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('user', JSON.stringify(authResult.user));
      this.currentUserSubject.next(authResult.user);
      this.redirectByRole(authResult.user.role);
    }
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      const user: User = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    }
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

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
