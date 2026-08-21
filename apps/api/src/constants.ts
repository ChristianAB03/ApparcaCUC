/** Shared domain enums used across models, services and validation schemas. */

export const PARKING_STATES = ['available', 'occupied', 'reserved', 'disabled'] as const;
export type ParkingState = (typeof PARKING_STATES)[number];

export const SPACE_TYPES = ['standard', 'compact', 'accessible', 'ev', 'motorcycle', 'visitor'] as const;
export type SpaceType = (typeof SPACE_TYPES)[number];

export const RESERVATION_STATES = ['active', 'checked_in', 'completed', 'cancelled', 'expired'] as const;
export type ReservationState = (typeof RESERVATION_STATES)[number];

export const VEHICLE_TYPES = ['car', 'suv', 'motorcycle', 'ev', 'bicycle'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const TICKET_CATEGORIES = ['reservation', 'occupied_space', 'qr', 'access', 'other'] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATES = ['pending', 'in_review', 'resolved'] as const;
export type TicketState = (typeof TICKET_STATES)[number];

export const NOTIFICATION_TYPES = ['reservation', 'space', 'system', 'access'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Parking zones used to lay out the schematic map. */
export const PARKING_ZONES = ['A', 'B', 'C', 'D'] as const;
export type ParkingZone = (typeof PARKING_ZONES)[number];
