// ===== APPOINTMENT MODELS =====
export interface Appointment {
  id: number;
  dateTime: string;
  status: string;
  notes?: string;
  clientId: number;
  clientName: string;
  clientPhone: string;
  barberId: number;
  barberName: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  barberId: number;
  serviceId: number;
  dateTime: string;
  notes?: string;
}

// ===== BARBER MODELS =====
export interface Barber {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  specialty?: string;
  yearsOfExperience: number;
  rating?: number;
  isManager: boolean;
  availability?: string;
  isActive: boolean;
}

// ===== SERVICE MODELS =====
export interface BarberService {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

// ===== AVAILABLE SLOT =====
export interface AvailableSlot {
  dateTime: string;
  timeString: string;
  isAvailable: boolean;
}

// ===== DASHBOARD STATS =====
export interface DashboardStats {
  totalAppointmentsToday: number;
  completedToday: number;
  pendingToday: number;
  incomeToday: number;
  totalClients: number;
  totalBarbers: number;
}
