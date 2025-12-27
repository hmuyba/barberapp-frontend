import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarberService } from '../../../../core/services/barber.service';
import { ServiceService } from '../../../../core/services/service.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import {
  Barber,
  BarberService as BarberServiceModel,
  AvailableSlot,
  CreateAppointmentRequest,
} from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar-cita.component.html',
  styleUrl: './agendar-cita.component.scss',
})
export class AgendarCitaComponent implements OnInit {
  // Control del wizard
  currentStep = 1;
  totalSteps = 3;

  // Datos cargados
  barbers: Barber[] = [];
  services: BarberServiceModel[] = [];
  availableSlots: AvailableSlot[] = [];

  // Selecciones del usuario
  selectedBarber: Barber | null = null;
  selectedDate: string = '';
  selectedSlot: AvailableSlot | null = null;
  selectedService: BarberServiceModel | null = null;
  notes: string = '';

  // Estados
  loading = false;
  loadingSlots = false;
  error: string | null = null;
  success = false;
  createdAppointmentId: number | null = null;

  // Fecha mínima (hoy)
  minDate: string;

  constructor(
    private barberService: BarberService,
    private serviceService: ServiceService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
    this.selectedDate = this.minDate;
  }

  ngOnInit(): void {
    this.loadBarbers();
    this.loadServices();
  }

  // ===== CARGA DE DATOS =====
  loadBarbers(): void {
    this.loading = true;
    this.barberService.getAllBarbers().subscribe({
      next: (barbers) => {
        this.barbers = barbers;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar barberos';
        this.loading = false;
        console.error(err);
      },
    });
  }

  loadServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
      },
    });
  }

  loadAvailableSlots(): void {
    if (!this.selectedBarber || !this.selectedDate) return;

    this.loadingSlots = true;
    const duration = this.selectedService?.durationMinutes || 30;

    // Pasar el string directamente, no convertir a Date
    this.barberService
      .getAvailableSlots(this.selectedBarber.id, this.selectedDate, duration)
      .subscribe({
        next: (slots) => {
          console.log('Slots recibidos:', slots);
          this.availableSlots = slots;
          this.loadingSlots = false;
        },
        error: (err) => {
          this.error = 'Error al cargar horarios';
          this.loadingSlots = false;
          console.error(err);
        },
      });
  }

  // ===== SELECCIONES =====
  selectBarber(barber: Barber): void {
    this.selectedBarber = barber;
    this.selectedSlot = null;
    if (this.selectedDate) {
      this.loadAvailableSlots();
    }
  }

  onDateChange(): void {
    this.selectedSlot = null;
    if (this.selectedBarber) {
      this.loadAvailableSlots();
    }
  }

  selectSlot(slot: AvailableSlot): void {
    if (slot.isAvailable) {
      this.selectedSlot = slot;
    }
  }

  selectService(service: BarberServiceModel): void {
    this.selectedService = service;
    // Recargar slots si cambia la duración
    if (this.selectedBarber && this.selectedDate) {
      this.loadAvailableSlots();
    }
  }

  // ===== NAVEGACIÓN DEL WIZARD =====
  nextStep(): void {
    if (this.canProceed() && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.selectedBarber !== null;
      case 2:
        return this.selectedSlot !== null;
      case 3:
        return this.selectedService !== null;
      default:
        return false;
    }
  }

  // ===== CONFIRMAR CITA =====
  confirmAppointment(): void {
    if (!this.selectedBarber || !this.selectedSlot || !this.selectedService) {
      this.error = 'Por favor completa todos los pasos';
      return;
    }

    this.loading = true;
    this.error = null;

    const request: CreateAppointmentRequest = {
      barberId: this.selectedBarber.id,
      serviceId: this.selectedService.id,
      dateTime: this.selectedSlot.dateTime,
      notes: this.notes || undefined,
    };

    this.appointmentService.createAppointment(request).subscribe({
      next: (appointment) => {
        this.success = true;
        this.createdAppointmentId = appointment.id;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear la cita';
        this.loading = false;
        console.error(err);
      },
    });
  }

  // ===== UTILIDADES =====
  goToDashboard(): void {
    this.router.navigate(['/cliente/dashboard']);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Seleccionar Barbero';
      case 2:
        return 'Seleccionar Fecha y Hora';
      case 3:
        return 'Seleccionar Servicio';
      default:
        return '';
    }
  }
}
