// /types/api.ts

export interface Location {
  id?: string;
  city?: string;
  state: string;
}

export interface UserClient {
  id: string;
  name: string;
  is_driver: boolean;
  average_rating: number;
  warning_count: number;
  suspension_until: string | null;
  is_suspended: boolean;
}

export interface Vehicle {
  id?: string;
  user: string; // UUID do UserClient
  model: string;
  type_vehicle: 'carro' | 'moto';
  color: 'preto' | 'branco' | 'vermelho' | 'azul' | string;
  plate: string;
  seats: number;
}

export interface Ride {
  id?: string;
  uuid?: string;
  vehicle: string; // ID do veículo
  origin: Location;
  destination: Location;
  start_time: string;
  expected_arrival: string;
  available_seats: number;
  status: 'pendente' | 'confirmada' | 'em_andamento' | 'cancelada' | 'finalizada';
  price: number;
  ai_reason?: string; // Campo injetado pela IA viewset
}

export interface Reservation {
  id?: string;
  ride: string;
  passenger: string;
  requested_seats: number;
  status: 'pendente' | 'confirmada' | 'cancelada';
}

// Filtros aceitos pelo django-filters
export interface RideFilterParams {
  origin?: string;             
  destination?: string;       
  origin_city?: string;        
  origin_state?: string;       
  destination_city?: string;
  destination_state?: string;
  start_time_after?: string;
  price_max?: number;
  // ... outros filtros que você já possua
}