import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Appointment,
  CreateAppointmentRequest,
  DashboardStats,
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5199/api/appointments';

  constructor(private http: HttpClient) {}

  // ===== CLIENTE: Obtener mis citas =====
  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/my-appointments`);
  }

  // ===== BARBERO: Obtener citas del día =====
  getBarberAppointments(date?: Date): Observable<Appointment[]> {
    let params = new HttpParams();
    if (date) {
      // Enviar fecha sin conversión a UTC
      const dateStr = this.formatDateLocal(date);
      params = params.set('date', dateStr);
    }
    return this.http.get<Appointment[]>(`${this.apiUrl}/barber-appointments`, {
      params,
    });
  }

  // ===== ADMIN: Obtener todas las citas =====
  getAllAppointments(
    startDate?: Date,
    endDate?: Date
  ): Observable<Appointment[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', this.formatDateLocal(startDate));
    }
    if (endDate) {
      params = params.set('endDate', this.formatDateLocal(endDate));
    }
    return this.http.get<Appointment[]>(`${this.apiUrl}/all`, { params });
  }

  // ===== Crear nueva cita =====
  createAppointment(
    request: CreateAppointmentRequest
  ): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, request);
  }

  // ===== Actualizar estado de cita =====
  updateAppointmentStatus(id: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/status`,
      JSON.stringify(status),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // ===== Cancelar cita =====
  cancelAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ===== Obtener estadísticas del dashboard =====
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  // Helper: Formatear fecha sin conversión a UTC
  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ===== ADMIN: Obtener todas las citas por rango de fechas =====
  getAllAppointmentsByDateRange(
    startDate?: string,
    endDate?: string
  ): Observable<Appointment[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<Appointment[]>(`${this.apiUrl}/all`, { params });
  }
}
