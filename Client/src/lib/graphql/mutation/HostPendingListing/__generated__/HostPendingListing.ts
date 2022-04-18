/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { HostPendingListingInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: HostPendingListing
// ====================================================

export interface HostPendingListing_hostPendingListing {
  __typename: "PendingListing";
  id: string;
}

export interface HostPendingListing {
  hostPendingListing: HostPendingListing_hostPendingListing;
}

export interface HostPendingListingVariables {
  input: HostPendingListingInput;
}
