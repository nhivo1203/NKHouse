import {gql} from "apollo-boost";

export const ADD_ADMIN = gql`
  mutation AddAdmin($id: ID!) {
    addAdmin(id: $id) {
      id
    }
  }
`;