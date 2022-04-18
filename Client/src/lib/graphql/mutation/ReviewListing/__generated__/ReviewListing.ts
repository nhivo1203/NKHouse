/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ReviewListing
// ====================================================

export interface ReviewListing_reviewListing {
  __typename: "Listing";
  id: string;
}

export interface ReviewListing {
  reviewListing: ReviewListing_reviewListing;
}

export interface ReviewListingVariables {
  id: string;
  rating: number;
  comment: string;
}
