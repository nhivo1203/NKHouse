import { gql } from "apollo-boost";

export const BOOKINGS = gql`
	query Bookings($limit: Int!, $page: Int!) {
		bookings(limit: $limit, page: $page) {
			total
			result {
				id
				checkIn
				checkOut
				total
				listing {
					id
					title
				}
				tenant {
					id
					name
				}
			}
		}
	}
`;
