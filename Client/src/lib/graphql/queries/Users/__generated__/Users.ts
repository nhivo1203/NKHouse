/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Users
// ====================================================

export interface Users_users_result {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
  contact: string;
  hasWallet: boolean;
  income: number | null;
  isadmin: boolean;
  isreviewer: boolean;
}

export interface Users_users {
  __typename: "Users";
  total: number;
  result: Users_users_result[];
}

export interface Users {
  users: Users_users;
}

export interface UsersVariables {
  limit: number;
  page: number;
}
