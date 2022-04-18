import { Booking, PendingListing, ListingType } from "../../../lib/types";

export enum PendingListingsFilter {
  PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH",
  PRICE_HIGH_TO_LOW = "PRICE_HIGH_TO_LOW",
}

export interface PendingListingArgs {
  id: string;
}

export interface PendingListingBookingsArgs {
  limit: number;
  page: number;
}

export interface PendingListingBookingsData {
  total: number;
  result: Booking[];
}

export interface PendingListingsArgs {
  location: string | null;
  filter: PendingListingsFilter;
  limit: number;
  page: number;
}

export interface PendingListingsData {
  region: string | null;
  total: number;
  result: PendingListing[];
}

export interface PendingListingsQuery {
  country?: string;
  admin?: string;
  city?: string;
}

export interface HostPendingListingInput {
  title: string;
  description: string;
  image: string;
  type: ListingType;
  address: string;
  price: number;
  numOfGuests: number;
  rating: number;
}

export interface UpdatePendingListingInput {
  title?: string;
  description?: string;
  image?: string;
  type?: ListingType;
  address?: string;
  price?: number;
  numOfGuests?: number;
  rating?: number;
}

export interface HostPendingListingArgs {
  input: HostPendingListingInput;
}

export interface UpdatePendingListingArgs {
  input: UpdatePendingListingInput;
}
