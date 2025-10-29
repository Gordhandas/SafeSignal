import { User } from './types';

export const MOCK_FAMILY_MEMBERS: User[] = [
  {
    id: 'user_2',
    name: 'Jane Doe',
    status: 'online',
    lastLocation: { lat: 34.0522, lng: -118.2437, timestamp: Date.now() - 300000 },
  },
  {
    id: 'user_3',
    name: 'Sam Smith',
    status: 'offline',
    lastLocation: { lat: 40.7128, lng: -74.0060, timestamp: Date.now() - 7200000 },
  },
  {
    id: 'user_4',
    name: 'Emily Jones',
    status: 'online',
    lastLocation: { lat: 41.8781, lng: -87.6298, timestamp: Date.now() - 600000 },
  },
];
