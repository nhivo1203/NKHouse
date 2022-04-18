/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SendEmail
// ====================================================

export interface SendEmail_sendEmail {
  __typename: "Viewer";
  id: string | null;
}

export interface SendEmail {
  sendEmail: SendEmail_sendEmail;
}

export interface SendEmailVariables {
  id: string;
  subject: string;
  mess: string;
}
