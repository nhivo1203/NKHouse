import { Booking } from "../../../lib/types";

export interface CreateBookingInput {
  id: string;
  source: string;
  checkIn: string;
  checkOut: string;
  total: number;
}

export interface CreateBookingArgs {
  input: CreateBookingInput;
}

export interface BookingsArgs {
  limit: number;
  page: number;
}

export interface BookingsData {
  total: number;
  result: Booking[];
}

export interface BookingsQuery {
  checkin?: string;
  checkout?: string;
  tenant?: string;
}