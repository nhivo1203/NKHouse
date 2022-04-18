import { gql } from "apollo-boost";

export const HOST_LISTING_FROM_PENDING = gql`
  mutation HostListingFromPending($id: ID!,$input: HostListingInput!) {
    hostListingFromPending(id :$id,input: $input) {
      id
    }
  }
`;
