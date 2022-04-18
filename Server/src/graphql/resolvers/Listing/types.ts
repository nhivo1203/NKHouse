import { Booking, Listing, ListingType } from "../../../lib/types";

export enum ListingsFilter {
  PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH",
  PRICE_HIGH_TO_LOW = "PRICE_HIGH_TO_LOW",
  SALE_LOW_TO_HIGH = "SALE_LOW_TO_HIGH",
  SALE_HIGH_TO_LOW = "SALE_HIGH_TO_LOW",
  TYPE_APARTMENT = "TYPE_APARTMENT",
  TYPE_HOUSE = "TYPE_HOUSE"
}

export interface ListingArgs {
  id: string;
}

export interface ListingBookingsArgs {
  limit: number;
  page: number;
}

export interface ListingBookingsData {
  total: number;
  result: Booking[];
}

export interface ListingsArgs {
  location: string | null;
  filter: ListingsFilter;
  limit: number;
  page: number;
}

export interface ListingsData {
  region: string | null;
  total: number;
  result: Listing[];
}

export interface ListingsQuery {
  country?: string;
  admin?: string;
  city?: string;
}

export interface HostListingInput {
  title: string;
  description: string;
  image: string;
  type: ListingType;
  address: string;
  price: number;
  numOfGuests: number;
  rating: number;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  image?: string;
  type?: ListingType;
  address?: string;
  price?: number;
  numOfGuests?: number;
  rating?: number;
}

export interface HostListingArgs {
  input: HostListingInput;
}

export interface HostListingFromPendingArgs {
  id: string;
  input: HostListingInput;
}

export interface UpdateListingArgs {
  input: UpdateListingInput;
}
