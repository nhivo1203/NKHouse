/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ListingsFilter } from "./../../../globalTypes";

// ====================================================
// GraphQL query operation: Listings
// ====================================================

export interface Listings_listings_result_host {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
  hasWallet: boolean;
}

export interface Listings_listings_result_review_user {
  __typename: "User";
  id: string;
  avatar: string;
}

export interface Listings_listings_result_review {
  __typename: "Review";
  user: Listings_listings_result_review_user;
  name: string;
  rating: number;
  comment: string;
}

export interface Listings_listings_result {
  __typename: "Listing";
  id: string;
  title: string;
  description: string;
  image: string;
  address: string;
  city: string;
  admin: string;
  country: string;
  price: number;
  numOfGuests: number;
  rating: number;
  favorite: boolean;
  salepercent: number;
  host: Listings_listings_result_host;
  numofReview: number;
  review: (Listings_listings_result_review | null)[] | null;
}

export interface Listings_listings {
  __typename: "Listings";
  region: string | null;
  total: number;
  result: Listings_listings_result[];
}

export interface Listings {
  listings: Listings_listings;
}

export interface ListingsVariables {
  location?: string | null;
  filter: ListingsFilter;
  limit: number;
  page: number;
}
