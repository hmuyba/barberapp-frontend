import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';
import {
  Appointment,
  DashboardStats,
} from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-dashboard-barbero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-barbero.component.html',
  styleUrl: './dashboard-barbero.component.scss',
})
export class DashboardBarberoComponent implements OnInit {
  currentUser: User | null = null;

  // Datos reales del backend
  agendaHoy: Appointment[] = [];
  stats: DashboardStats = {
    totalAppointmentsToday: 0,
    completedToday: 0,
    pendingToday: 0,
    incomeToday: 0,
    totalClients: 0,
    totalBarbers: 0,
  };

  // Estados
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Cargar citas del día
    this.appointmentService.getBarberAppointments(new Date()).subscribe({
      next: (appointments) => {
        this.agendaHoy = appointments.sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.error = 'Error al cargar la agenda';
        this.loading = false;
      },
    });

    // Cargar estadísticas
    this.appointmentService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      },
    });
  }

  fechaHoy(): string {
    const dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const hoy = new Date();
    return `${dias[hoy.getDay()]}, ${hoy.getDate()} ${
      meses[hoy.getMonth()]
    } ${hoy.getFullYear()}`;
  }

  logout(): void {
    this.authService.logout();
  }

  marcarCompletada(citaId: number): void {
    this.appointmentService
      .updateAppointmentStatus(citaId, 'Completed')
      .subscribe({
        next: () => {
          // Actualizar localmente
          const cita = this.agendaHoy.find((c) => c.id === citaId);
          if (cita) {
            cita.status = 'Completed';
            this.stats.completedToday++;
            this.stats.pendingToday--;
            this.stats.incomeToday += cita.servicePrice;
          }
        },
        error: (err) => {
          console.error('Error al actualizar cita:', err);
          alert('Error al marcar la cita como completada');
        },
      });
  }

  llamarCliente(telefono: string): void {
    window.open(`tel:${telefono}`, '_self');
  }

  gestionarDisponibilidad(): void {
    alert('Funcionalidad de gestionar disponibilidad en desarrollo.');
  }

  verEstadisticas(): void {
    alert('Estadísticas detalladas en desarrollo.');
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

  getTimeRange(dateString: string, durationMinutes: number): string {
    const dateStr = dateString.toString().replace('Z', '');
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return `${start.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  isProxima(dateString: string): boolean {
    const dateStr = dateString.toString().replace('Z', '');
    const citaTime = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffMinutes = (citaTime - now) / 60000;
    return diffMinutes > 0 && diffMinutes <= 60;
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
        return 'CONFIRMADA';
      case 'Pending':
        return 'PENDIENTE';
      case 'Completed':
        return 'COMPLETADA';
      case 'Cancelled':
        return 'CANCELADA';
      default:
        return status;
    }
  }

  getCardClass(cita: Appointment): string {
    if (cita.status === 'Completed') return 'completada';
    if (this.isProxima(cita.dateTime)) return 'proxima';
    return '';
  }
}
