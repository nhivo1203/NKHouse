import { gql } from "apollo-boost";

export const SEND_EMAIL = gql`
  mutation SendEmail($id: ID!, $subject: String! , $mess:String!) {
    sendEmail(id: $id, subject: $subject , mess: $mess) {
      id
    }
  }
`;
