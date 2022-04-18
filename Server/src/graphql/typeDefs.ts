import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Booking {
    id: ID!
    listing: Listing!
    tenant: User!
    checkIn: String!
    checkOut: String!
    total: Float!
  }

  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  type Review {
    user: User!
    name: String!
    rating: Float!
    comment: String!
  }

  enum ListingType {
    APARTMENT
    HOUSE
  }

  enum ListingsFilter {
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
    SALE_LOW_TO_HIGH
    SALE_HIGH_TO_LOW
    TYPE_APARTMENT
    TYPE_HOUSE
  }

  enum PendingListingsFilter {
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
  }

  type Listing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    country: String!
    admin: String!
    city: String!
    bookings(limit: Int!, page: Int!): Bookings
    bookingsIndex: String!
    price: Int!
    numOfGuests: Int!
    rating: Float!
    favorite: Boolean!
    salepercent: Int!
    numofReview: Int!
    review: [Review]
  }

  type PendingListing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    country: String!
    admin: String!
    city: String!
    bookings(limit: Int!, page: Int!): Bookings
    bookingsIndex: String!
    price: Int!
    numOfGuests: Int!
    rating: Float!
    favorite: Boolean!
  }

  type Listings {
    region: String
    total: Int!
    result: [Listing!]!
  }

  type PendingListings {
    region: String
    total: Int!
    result: [PendingListing!]!
  }

  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
    isadmin: Boolean!
    isreviewer: Boolean!
  }

  type Users {
    total: Int!
    result: [User!]!
  }

  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
    isadmin: Boolean
    isreviewer: Boolean
  }

  input LogInInput {
    code: String!
  }

  input ConnectStripeInput {
    code: String!
  }

  input HostListingInput {
    title: String!
    description: String!
    image: String!
    type: ListingType!
    address: String!
    price: Int!
    numOfGuests: Int!
  }

  input HostPendingListingInput {
    title: String!
    description: String!
    image: String!
    type: ListingType!
    address: String!
    price: Int!
    numOfGuests: Int!
  }

  input UpdateListingInput {
    title: String!
    description: String!
    image: String!
    type: ListingType!
    address: String!
    price: Int!
    numOfGuests: Int!
  }

  input CreateBookingInput {
    id: ID!
    source: String!
    checkIn: String!
    checkOut: String!
    total: Float!
  }

  type Query {
    authUrlGoogle: String!
    user(id: ID!): User!
    users(limit: Int!, page: Int!): Users!
    listing(id: ID!): Listing!
    listings(
      location: String
      filter: ListingsFilter!
      limit: Int!
      page: Int!
    ): Listings!
    pendinglisting(id: ID!): PendingListing!
    pendinglistings(
      location: String
      filter: PendingListingsFilter!
      limit: Int!
      page: Int!
    ): PendingListings!
    bookings(limit: Int!, page: Int!): Bookings!
  }

  type Mutation {
    logInGoogle(input: LogInInput): Viewer!
    logOut: Viewer!
    connectStripe(input: ConnectStripeInput!): Viewer!
    disconnectStripe: Viewer!
    hostListing(input: HostListingInput): Listing!
    hostListingFromPending(id: ID!, input: HostListingInput): Listing!
    updateListing(id: ID!, input: UpdateListingInput): Listing!
    deleteListing(id: ID!): Listing!
    favoriteListing(id: ID!): Listing!
    reviewListing(id: ID!, rating: Float!, comment: String!): Listing!
    saleListing(id: ID!, salepercent: Int!): Listing!
    deleteBooking(id: ID!): Booking!
    createBooking(input: CreateBookingInput!): Booking!
    deleteUser(id: ID!): User!
    addAdmin(id: ID!): User!
    addReviewer(id: ID!): User!
    hostPendingListing(input: HostPendingListingInput): PendingListing!
    updatePendingListing(id: ID!, input: UpdateListingInput): PendingListing!
    deletePendingListing(id: ID!): PendingListing!
    sendEmail(id: ID!, subject: String!, mess: String): Viewer!
    sendMeetEmail(
      id: ID!
      hour: String!
      subject: String!
      mess: String
    ): Viewer!
  }
`;
