/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SaleListing
// ====================================================

export interface SaleListing_saleListing {
  __typename: "Listing";
  id: string;
}

export interface SaleListing {
  saleListing: SaleListing_saleListing;
}

export interface SaleListingVariables {
  id: string;
  salepercent: number;
}
