/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PendingListingsFilter, ListingType } from "./../../../globalTypes";

// ====================================================
// GraphQL query operation: PendingListings
// ====================================================

export interface PendingListings_pendinglistings_result_host {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
  hasWallet: boolean;
  contact: string;
}

export interface PendingListings_pendinglistings_result {
  __typename: "PendingListing";
  id: string;
  title: string;
  description: string;
  type: ListingType;
  image: string;
  address: string;
  city: string;
  admin: string;
  country: string;
  price: number;
  numOfGuests: number;
  rating: number;
  favorite: boolean;
  host: PendingListings_pendinglistings_result_host;
}

export interface PendingListings_pendinglistings {
  __typename: "PendingListings";
  region: string | null;
  total: number;
  result: PendingListings_pendinglistings_result[];
}

export interface PendingListings {
  pendinglistings: PendingListings_pendinglistings;
}

export interface PendingListingsVariables {
  location?: string | null;
  filter: PendingListingsFilter;
  limit: number;
  page: number;
}
