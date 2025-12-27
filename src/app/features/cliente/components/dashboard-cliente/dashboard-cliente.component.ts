import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-cliente.component.html',
  styleUrl: './dashboard-cliente.component.scss',
})
export class DashboardClienteComponent implements OnInit {
  currentUser: User | null = null;

  // Datos reales del backend
  appointments: Appointment[] = [];
  proximasCitas: Appointment[] = [];
  historialCitas: Appointment[] = [];

  // Estados
  loading = true;
  error: string | null = null;

  // Modal de confirmación
  showModal = false;
  modalType: 'cancel' | 'reschedule' = 'cancel';
  selectedCita: Appointment | null = null;
  isProcessing = false;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    this.appointmentService.getMyAppointments().subscribe({
      next: (appointments) => {
        console.log('Citas recibidas:', appointments);
        console.log('Fecha actual:', new Date());

        this.appointments = appointments;
        this.filterAppointments();

        console.log('Próximas citas:', this.proximasCitas);
        console.log('Historial:', this.historialCitas);

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.error = 'Error al cargar tus citas';
        this.loading = false;
      },
    });
  }

  filterAppointments(): void {
    const now = new Date();
    console.log('Fecha actual:', now);

    this.proximasCitas = this.appointments
      .filter((a) => {
        // Remover la Z para interpretar como hora local Bolivia
        const dateStr = a.dateTime.toString().replace('Z', '');
        const appointmentDate = new Date(dateStr);
        console.log(
          'Cita:',
          a.id,
          'Fecha:',
          appointmentDate,
          'Status:',
          a.status
        );
        return appointmentDate >= now && a.status !== 'Cancelled';
      })
      .sort((a, b) => {
        const dateA = new Date(a.dateTime.toString().replace('Z', ''));
        const dateB = new Date(b.dateTime.toString().replace('Z', ''));
        return dateA.getTime() - dateB.getTime();
      });

    this.historialCitas = this.appointments
      .filter((a) => {
        const dateStr = a.dateTime.toString().replace('Z', '');
        const appointmentDate = new Date(dateStr);
        return appointmentDate < now || a.status === 'Completed';
      })
      .sort((a, b) => {
        const dateA = new Date(a.dateTime.toString().replace('Z', ''));
        const dateB = new Date(b.dateTime.toString().replace('Z', ''));
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    console.log('Próximas citas filtradas:', this.proximasCitas);
    console.log('Historial filtrado:', this.historialCitas);
  }

  logout(): void {
    this.authService.logout();
  }

  agendarCita(): void {
    this.router.navigate(['/cliente/agendar']);
  }

  // Abrir modal de reprogramar
  reprogramarCita(cita: Appointment): void {
    this.selectedCita = cita;
    this.modalType = 'reschedule';
    this.showModal = true;
  }

  // Abrir modal de cancelar
  cancelarCita(cita: Appointment): void {
    this.selectedCita = cita;
    this.modalType = 'cancel';
    this.showModal = true;
  }

  // Cerrar modal
  closeModal(): void {
    this.showModal = false;
    this.selectedCita = null;
    this.isProcessing = false;
  }

  // Confirmar acción del modal
  confirmAction(): void {
    if (!this.selectedCita) return;

    this.isProcessing = true;

    if (this.modalType === 'cancel') {
      this.appointmentService
        .cancelAppointment(this.selectedCita.id)
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadAppointments();
          },
          error: (err) => {
            console.error('Error al cancelar:', err);
            this.isProcessing = false;
          },
        });
    } else {
      // Reprogramar: cancelar y redirigir a agendar
      this.appointmentService
        .cancelAppointment(this.selectedCita.id)
        .subscribe({
          next: () => {
            this.closeModal();
            this.router.navigate(['/cliente/agendar']);
          },
          error: (err) => {
            console.error('Error al reprogramar:', err);
            this.isProcessing = false;
          },
        });
    }
  }

  // Utilidades de formato
  formatDate(dateString: string): string {
    // Remover Z para interpretar como hora local Bolivia
    const dateStr = dateString.toString().replace('Z', '');
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  }

  formatTime(dateString: string): string {
    // Remover Z para interpretar como hora local Bolivia
    const dateStr = dateString.toString().replace('Z', '');
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatShortDate(dateString: string): string {
    // Remover Z para interpretar como hora local Bolivia
    const dateStr = dateString.toString().replace('Z', '');
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Completed':
        return 'bg-info';
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
}
