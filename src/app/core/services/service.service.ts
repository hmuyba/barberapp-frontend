import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberService } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private apiUrl = 'http://localhost:5199/api/services';

  constructor(private http: HttpClient) {}

  // ===== Obtener todos los servicios activos =====
  getAllServices(): Observable<BarberService[]> {
    return this.http.get<BarberService[]>(this.apiUrl);
  }

  // ===== Obtener servicio por ID =====
  getService(id: number): Observable<BarberService> {
    return this.http.get<BarberService>(`${this.apiUrl}/${id}`);
  }

  // ===== Crear servicio (Admin) =====
  createService(service: Partial<BarberService>): Observable<BarberService> {
    return this.http.post<BarberService>(this.apiUrl, service);
  }

  // ===== Actualizar servicio (Admin) =====
  updateService(id: number, service: Partial<BarberService>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, service);
  }

  // ===== Eliminar servicio (Admin) =====
  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
