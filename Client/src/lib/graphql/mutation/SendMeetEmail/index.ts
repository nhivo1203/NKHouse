import { gql } from "apollo-boost";

export const SEND_MEET_EMAIL = gql`
  mutation SendMeetEmail($id: ID!,$hour: String!, $subject: String! , $mess:String!) {
    sendMeetEmail(id: $id, hour:$hour ,subject: $subject , mess: $mess) {
      id
    }
  }
`;
