import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Barber, AvailableSlot } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class BarberService {
  private apiUrl = 'http://localhost:5199/api/barbers';

  constructor(private http: HttpClient) {}

  getAllBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(this.apiUrl);
  }

  getBarber(id: number): Observable<Barber> {
    return this.http.get<Barber>(`${this.apiUrl}/${id}`);
  }

  // Cambiar para aceptar string directamente
  getAvailableSlots(
    barberId: number,
    dateString: string, // Ahora recibe string "YYYY-MM-DD"
    serviceDuration: number = 30
  ): Observable<AvailableSlot[]> {
    const params = new HttpParams()
      .set('date', dateString) // Pasar directamente sin conversión
      .set('serviceDuration', serviceDuration.toString());

    return this.http.get<AvailableSlot[]>(
      `${this.apiUrl}/${barberId}/available-slots`,
      { params }
    );
  }

  updateMyAvailability(availability: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/my-availability`,
      JSON.stringify(availability),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
