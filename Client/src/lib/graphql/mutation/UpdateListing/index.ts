import { gql } from "apollo-boost";

export const UPDATE_LISTING = gql`
  mutation UpdateListing($id:ID! , $input: UpdateListingInput!) {
    updateListing(id:$id,input: $input) {
      id
    }
  }
`;
