import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { BarberService } from '../../../../core/services/barber.service';
import { ServiceService } from '../../../../core/services/service.service';
import { User } from '../../../../core/models/user.model';
import {
  Appointment,
  DashboardStats,
  Barber,
  BarberService as BarberServiceModel,
} from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss',
})
export class DashboardAdminComponent implements OnInit {
  currentUser: User | null = null;

  // Datos del backend
  stats: DashboardStats = {
    totalAppointmentsToday: 0,
    completedToday: 0,
    pendingToday: 0,
    incomeToday: 0,
    totalClients: 0,
    totalBarbers: 0,
  };

  citasHoy: Appointment[] = [];
  barbers: Barber[] = [];
  services: BarberServiceModel[] = [];

  // Estados
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private barberService: BarberService,
    private serviceService: ServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.error = null;

    // Cargar estadísticas
    this.appointmentService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      },
    });

    // Cargar citas de hoy - usar formato YYYY-MM-DD
    const today = new Date();
    const todayStr = this.formatDateForApi(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = this.formatDateForApi(tomorrow);

    this.appointmentService
      .getAllAppointmentsByDateRange(todayStr, tomorrowStr)
      .subscribe({
        next: (appointments) => {
          this.citasHoy = appointments.sort((a, b) => {
            const dateA = new Date(a.dateTime.toString().replace('Z', ''));
            const dateB = new Date(b.dateTime.toString().replace('Z', ''));
            return dateA.getTime() - dateB.getTime();
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar citas:', err);
          this.error = 'Error al cargar datos';
          this.loading = false;
        },
      });

    // Cargar barberos
    this.barberService.getAllBarbers().subscribe({
      next: (barbers) => {
        this.barbers = barbers;
      },
      error: (err) => {
        console.error('Error al cargar barberos:', err);
      },
    });

    // Cargar servicios
    this.serviceService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
      },
    });
  }

  // Helper para formatear fecha para API
  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Utilidades de formato
  formatTime(dateString: string): string {
    const dateStr = dateString.toString().replace('Z', '');
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  logout(): void {
    this.authService.logout();
  }

  // Navegación
  gestionarUsuarios(): void {
    alert('Gestión de usuarios en desarrollo.');
  }

  gestionarServicios(): void {
    alert('Gestión de servicios en desarrollo.');
  }

  verReportes(): void {
    alert('Reportes en desarrollo.');
  }

  configuracion(): void {
    alert('Configuración en desarrollo.');
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'bg-primary';
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Completed':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'Confirmada';
      case 'Pending':
        return 'Pendiente';
      case 'Completed':
        return 'Completada';
      case 'Cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  }

  fechaHoy(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('es-ES', options);
  }
}
