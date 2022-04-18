/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SendMeetEmail
// ====================================================

export interface SendMeetEmail_sendMeetEmail {
  __typename: "Viewer";
  id: string | null;
}

export interface SendMeetEmail {
  sendMeetEmail: SendMeetEmail_sendMeetEmail;
}

export interface SendMeetEmailVariables {
  id: string;
  hour: string;
  subject: string;
  mess: string;
}
