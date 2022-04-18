import { gql } from "apollo-boost";

export const USERS = gql`
	query Users($limit: Int!, $page: Int!) {
		users(limit: $limit, page: $page) {
			total
			result {
				id
				name
				avatar
				contact
				hasWallet
				income
				isadmin
				isreviewer
			}
		}
	}
`;
