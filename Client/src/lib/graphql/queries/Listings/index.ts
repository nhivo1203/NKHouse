import { gql } from "apollo-boost";

export const LISTINGS = gql`
  query Listings(
    $location: String
    $filter: ListingsFilter!
    $limit: Int!
    $page: Int!
  ) {
    listings(location: $location, filter: $filter, limit: $limit, page: $page) {
      region
      total
      result {
        id
        title
        description
        image
        address
        city
        admin
        country
        price
        numOfGuests
        rating
        favorite
        salepercent
        host {
          id
          name
          avatar
          hasWallet
        }
        numofReview
        review {
          user{
			  id
			  avatar
		  }
          name
          rating
          comment
        }
      }
    }
  }
`;
