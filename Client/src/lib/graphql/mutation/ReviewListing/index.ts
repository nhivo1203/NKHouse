import {gql} from "apollo-boost";

export const REVIEW_LISTING = gql`
  mutation ReviewListing($id: ID!, $rating: Float!, $comment: String!) {
    reviewListing(id: $id,rating:$rating , comment: $comment) {
      id
    }
  }
`;