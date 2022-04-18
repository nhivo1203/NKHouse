import { gql } from "apollo-boost";

export const DELETE_PENDINGLISTING = gql`
  mutation DeletePendingListing($id: ID!) {
    deletePendingListing(id: $id) {
      id
    }
  }
`;
