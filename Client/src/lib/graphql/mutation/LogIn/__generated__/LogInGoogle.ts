/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogInInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: LogInGoogle
// ====================================================

export interface LogInGoogle_logInGoogle {
  __typename: "Viewer";
  id: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
  isadmin: boolean | null;
  isreviewer: boolean | null;
}

export interface LogInGoogle {
  logInGoogle: LogInGoogle_logInGoogle;
}

export interface LogInGoogleVariables {
  input?: LogInInput | null;
}
