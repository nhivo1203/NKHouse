import { MongoClient } from "mongodb";
import { Database, Booking, Listing, User, PendingListing } from "../lib/types";

const url = `${process.env.DB}`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url);
  const db = client.db("main");

  return {
    bookings: db.collection<Booking>("bookings"),
    listings: db.collection<Listing>("listings"),
    pendinglistings: db.collection<PendingListing>("pendinglistings"),
    users: db.collection<User>("users")
  };
};
