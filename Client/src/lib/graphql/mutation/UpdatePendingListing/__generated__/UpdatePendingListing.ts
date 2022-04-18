/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateListingInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: UpdatePendingListing
// ====================================================

export interface UpdatePendingListing_updatePendingListing {
  __typename: "PendingListing";
  id: string;
}

export interface UpdatePendingListing {
  updatePendingListing: UpdatePendingListing_updatePendingListing;
}

export interface UpdatePendingListingVariables {
  id: string;
  input: UpdateListingInput;
}
