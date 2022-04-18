import { gql } from "apollo-boost";

export const UPDATE_PENDINGLISTING = gql`
  mutation UpdatePendingListing($id:ID! , $input: UpdateListingInput!) {
    updatePendingListing(id:$id,input: $input) {
      id
    }
  }
`;
