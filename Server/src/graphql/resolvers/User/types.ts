import { Booking, Listing , User} from "../../../lib/types";

export interface UserArgs {
  id: string;
}

export interface UserBookingsArgs {
  limit: number;
  page: number;
}

export interface UserBookingsData {
  total: number;
  result: Booking[];
}

export interface UserListingsArgs {
  limit: number;
  page: number;
}

export interface UserListingsData {
  total: number;
  result: Listing[];
}

export interface UsersArgs {
  limit: number;
  page: number;
}

export interface UsersData {
  total: number;
  result: User[];
}