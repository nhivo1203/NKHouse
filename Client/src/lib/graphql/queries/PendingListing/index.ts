import { gql } from "apollo-boost";

export const PENDINGLISTING = gql`
  query PendingListing($id: ID!) {
    pendinglisting(id: $id) {
      id
      title
      description
      image
      host {
        id
        name
        avatar
        hasWallet
      }
      type
      address
      city
      admin
      bookingsIndex
      price
      numOfGuests
      rating
      favorite
    }
  }
`;
