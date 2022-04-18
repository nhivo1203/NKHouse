import merge from "lodash.merge";
import { bookingResolvers } from "./Booking";
import { listingResolvers } from "./Listing";
import { pendinglistingResolvers } from "./PendingListing";
import { userResolvers } from "./User";
import { viewerResolvers } from "./Viewer";

export const resolvers = merge(
  bookingResolvers,
  listingResolvers,
  userResolvers,
  pendinglistingResolvers,
  viewerResolvers
);
