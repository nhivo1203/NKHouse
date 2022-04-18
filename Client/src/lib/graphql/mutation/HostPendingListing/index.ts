import { gql } from "apollo-boost";

export const HOST_PENDINGLISTING = gql`
  mutation HostPendingListing($input: HostPendingListingInput!) {
    hostPendingListing(input: $input) {
      id
    }
  }
`;
