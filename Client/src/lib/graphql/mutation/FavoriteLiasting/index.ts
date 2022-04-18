import {gql} from "apollo-boost";

export const FAVORITE_LISTING = gql`
  mutation FavoriteListing($id: ID!) {
    favoriteListing(id: $id) {
      id
    }
  }
`;