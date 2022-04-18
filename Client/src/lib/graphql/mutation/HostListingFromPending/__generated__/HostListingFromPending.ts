/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { HostListingInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: HostListingFromPending
// ====================================================

export interface HostListingFromPending_hostListingFromPending {
  __typename: "Listing";
  id: string;
}

export interface HostListingFromPending {
  hostListingFromPending: HostListingFromPending_hostListingFromPending;
}

export interface HostListingFromPendingVariables {
  id: string;
  input: HostListingInput;
}
