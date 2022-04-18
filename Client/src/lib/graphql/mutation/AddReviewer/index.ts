import {gql} from "apollo-boost";

export const ADD_REVIEWER = gql`
  mutation AddReviewer($id: ID!) {
    addReviewer(id: $id) {
      id
    }
  }
`;