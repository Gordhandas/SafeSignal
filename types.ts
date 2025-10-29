export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastLocation: Location | null;
  isCurrentUser?: boolean;
  isPinging?: boolean;
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success';
}