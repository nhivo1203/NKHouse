/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Bookings
// ====================================================

export interface Bookings_bookings_result_listing {
  __typename: "Listing";
  id: string;
  title: string;
}

export interface Bookings_bookings_result_tenant {
  __typename: "User";
  id: string;
  name: string;
}

export interface Bookings_bookings_result {
  __typename: "Booking";
  id: string;
  checkIn: string;
  checkOut: string;
  total: number;
  listing: Bookings_bookings_result_listing;
  tenant: Bookings_bookings_result_tenant;
}

export interface Bookings_bookings {
  __typename: "Bookings";
  total: number;
  result: Bookings_bookings_result[];
}

export interface Bookings {
  bookings: Bookings_bookings;
}

export interface BookingsVariables {
  limit: number;
  page: number;
}
