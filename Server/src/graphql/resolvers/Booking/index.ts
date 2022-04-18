import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Stripe } from "../../../lib/api";
import { Database, Listing, Booking, BookingsIndex } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { BookingsArgs, BookingsData, BookingsQuery ,CreateBookingArgs } from "./types";

const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }

    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }

    if (!newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = true;
    } else {
      throw new Error(
        "Những ngày đã chọn không được trùng với những ngày đã được đặt trước"
      );
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};

const removeBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = false;
    } else {
      throw new Error(
        "Những ngày đã chọn không được trùng với những ngày đã được đặt trước"
      );
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};

export const bookingResolvers: IResolvers = {
  Query : {
    bookings: async (
      _root: undefined,
      { limit, page }: BookingsArgs,
      { db }: { db: Database }
    ): Promise<BookingsData | null> => {
      try {


        const data: BookingsData = {
          total: 0,
          result: []
        };

        const query: BookingsQuery = {};


        let cursor = await db.bookings.find(query)

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Truy vấn danh sách đặt chỗ  thất bại! : ${error}`);
      }
    },
  },
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Booking> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("Không tìm thấy người này");
        }

        const listing = await db.listings.findOne({
          _id: new ObjectId(id),
        });
        if (!listing) {
          throw new Error("Không tìm thấy nhà/phòng này");
        }

        if (listing.host === viewer._id) {
          throw new Error("Bạn không thể đặt chỗ phòng của chính mình !");
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error("Ngày Check out không thể sớm hơn ngày Check in!");
        }

        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex,
          checkIn,
          checkOut
        );


        const totalPrice =
          (listing.price - (listing.price * (listing.salepercent/100))) *
          ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        const host = await db.users.findOne({
          _id: listing.host,
        });

        if (!host || !host.walletId) {
          throw new Error(
            "Không tìm thấy người cho thuê này hoặc người này không kết nối với Stripe"
          );
        }

        await Stripe.charge(totalPrice, source, host.walletId);

        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut,
          total: totalPrice,
        });

        const insertedBooking: Booking = insertRes.ops[0];

        await db.users.updateOne(
          {
            _id: host._id,
          },
          {
            $inc: { income: totalPrice },
          }
        );

        await db.users.updateOne(
          {
            _id: viewer._id,
          },
          {
            $push: { bookings: insertedBooking._id },
          }
        );

        await db.listings.updateOne(
          {
            _id: listing._id,
          },
          {
            $set: { bookingsIndex }, // to be handled in the next lesson
            $push: { bookings: insertedBooking._id },
          }
        );

        return insertedBooking;
      } catch (error) {
        throw new Error(`Đặt chỗ thất bại: ${error}`);
      }
    },
    deleteBooking: async (
      _root: undefined,
      { id }: { id: string },
      { db }: { db: Database }
    ): Promise<Booking> => {

      const booking = await db.bookings.findOne({ _id: new ObjectId(id) });



      if (!booking) {
        throw new Error("failed to find booking");
      }

      const listing = await db.listings.findOne({_id: new ObjectId(booking.listing)});

      if (!listing) {
        throw new Error("failed to find listing");
      }

      const deleteRes = await db.bookings.findOneAndDelete({
        _id: new ObjectId(id),
      });


      const bookingsIndex = removeBookingsIndex(
        listing.bookingsIndex,
        booking.checkIn,
        booking.checkOut
      );

      await db.listings.updateOne(
        {
          _id: listing._id,
        },
        {
          $set: { bookingsIndex }, // to be handled in the next lesson
        }
      );


      const host = await db.users.findOne({
        _id: listing.host
      });

      if (!host) {
        throw new Error("failed to find user");
      }

      await db.users.updateOne(
        {
          _id: host._id
        },
        {
          $inc: { income: -booking.total },
        }
      );

      if (!deleteRes.value) {
        throw new Error("failed to delete booking");
      }

      return deleteRes.value;
    },
  },
  Booking: {
    id: (booking: Booking): string => {
      return booking._id.toString();
    },
    listing: (
      booking: Booking,
      _args: {},
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: booking.listing });
    },
    tenant: (booking: Booking, _args: {}, { db }: { db: Database }) => {
      return db.users.findOne({ _id: booking.tenant });
    },
  },
};
