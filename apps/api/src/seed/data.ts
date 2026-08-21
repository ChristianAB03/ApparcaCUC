import { ParkingZone, SpaceType, VehicleType, TicketCategory } from '../constants';

/** Fictional demo people — clearly not real students. */
export const DEMO_PEOPLE: { name: string; program: string }[] = [
  { name: 'Valentina Ríos', program: 'Ingeniería de Sistemas' },
  { name: 'Andrés Mercado', program: 'Ingeniería Industrial' },
  { name: 'Camila Fontalvo', program: 'Derecho' },
  { name: 'Sebastián Pardo', program: 'Administración de Empresas' },
  { name: 'Daniela Osorio', program: 'Psicología' },
  { name: 'Mateo Carrillo', program: 'Ingeniería Civil' },
  { name: 'Luciana Barros', program: 'Arquitectura' },
  { name: 'Julián Estrada', program: 'Ingeniería Electrónica' },
  { name: 'Isabella Navarro', program: 'Contaduría Pública' },
  { name: 'Tomás Villa', program: 'Diseño Gráfico' },
];

export const VEHICLE_POOL: { brand: string; model: string; type: VehicleType }[] = [
  { brand: 'Toyota', model: 'Corolla', type: 'car' },
  { brand: 'Mazda', model: '3', type: 'car' },
  { brand: 'Chevrolet', model: 'Onix', type: 'car' },
  { brand: 'Renault', model: 'Logan', type: 'car' },
  { brand: 'Kia', model: 'Picanto', type: 'car' },
  { brand: 'Nissan', model: 'Kicks', type: 'suv' },
  { brand: 'Ford', model: 'Escape', type: 'suv' },
  { brand: 'Yamaha', model: 'FZ 2.0', type: 'motorcycle' },
  { brand: 'Honda', model: 'CB 125F', type: 'motorcycle' },
  { brand: 'Tesla', model: 'Model 3', type: 'ev' },
  { brand: 'Renault', model: 'Zoe', type: 'ev' },
];

export const VEHICLE_COLORS = ['Gris', 'Blanco', 'Negro', 'Rojo', 'Azul', 'Plata', 'Verde'];

/** Schematic parking layout — 50 spaces across 4 zones. */
export const ZONE_LAYOUT: { zone: ParkingZone; count: number }[] = [
  { zone: 'A', count: 14 },
  { zone: 'B', count: 14 },
  { zone: 'C', count: 12 },
  { zone: 'D', count: 10 },
];

/**
 * Assigns a space type from its zone + position so the map has a realistic mix
 * of accessible, EV, visitor and motorcycle spots near the entrances.
 */
export function spaceTypeFor(zone: ParkingZone, position: number, count: number): SpaceType {
  if (zone === 'A' && position <= 2) return 'accessible';
  if (zone === 'A' && position >= count - 1) return 'ev';
  if (zone === 'B' && position <= 2) return 'visitor';
  if (zone === 'C' && position >= count - 1) return 'motorcycle';
  if (zone === 'D' && position >= count - 1) return 'ev';
  if (position % 7 === 0) return 'compact';
  return 'standard';
}

export const TICKET_TEMPLATES: {
  category: TicketCategory;
  subject: string;
  message: string;
}[] = [
  {
    category: 'occupied_space',
    subject: 'Espacio disponible pero ocupado',
    message: 'El espacio B-05 aparece como disponible en el mapa, pero hay un vehículo estacionado allí.',
  },
  {
    category: 'qr',
    subject: 'El código QR no se mostró',
    message: 'Al abrir mi reserva, el código QR no cargó y no pude registrar el ingreso.',
  },
  {
    category: 'reservation',
    subject: 'No pude cancelar mi reserva',
    message: 'Intenté cancelar mi reserva desde el celular y la acción no respondió.',
  },
  {
    category: 'access',
    subject: 'Problema en el simulador de acceso',
    message: 'El simulador de acceso no reconoció mi código de reserva la primera vez.',
  },
  {
    category: 'other',
    subject: 'Sugerencia: tiempo restante',
    message: 'Sería útil ver cuánto tiempo me queda de reserva directamente en el panel principal.',
  },
];
