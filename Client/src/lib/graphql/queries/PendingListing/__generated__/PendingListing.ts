/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ListingType } from "./../../../globalTypes";

// ====================================================
// GraphQL query operation: PendingListing
// ====================================================

export interface PendingListing_pendinglisting_host {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
  hasWallet: boolean;
}

export interface PendingListing_pendinglisting {
  __typename: "PendingListing";
  id: string;
  title: string;
  description: string;
  image: string;
  host: PendingListing_pendinglisting_host;
  type: ListingType;
  address: string;
  city: string;
  admin: string;
  bookingsIndex: string;
  price: number;
  numOfGuests: number;
  rating: number;
  favorite: boolean;
}

export interface PendingListing {
  pendinglisting: PendingListing_pendinglisting;
}

export interface PendingListingVariables {
  id: string;
}
