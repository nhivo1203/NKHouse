import {gql} from "apollo-boost";

export const SALE_LISTING = gql`
  mutation SaleListing($id: ID!, $salepercent: Int!) {
    saleListing(id: $id,salepercent:$salepercent ) {
      id
    }
  }
`;