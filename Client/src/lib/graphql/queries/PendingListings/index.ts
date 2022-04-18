import { gql } from "apollo-boost";

export const PENDINGLISTINGS = gql`
	query PendingListings(
		$location: String
		$filter: PendingListingsFilter!
		$limit: Int!
		$page: Int!
	) {
		pendinglistings(location: $location, filter: $filter, limit: $limit, page: $page) {
			region
			total
			result {
				id
				title
				description
				type
				image
				address
				city
				admin
				country
				price
				numOfGuests
				rating
				favorite
				host {
					id
					name
					avatar
					hasWallet
					contact
				}
			}
		}
	}
`;
