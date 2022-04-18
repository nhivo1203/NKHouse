import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Google, Cloudinary } from "../../../lib/api";
import { Database, Listing, ListingType, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import {
  ListingArgs,
  ListingBookingsArgs,
  ListingBookingsData,
  ListingsArgs,
  ListingsData,
  ListingsFilter,
  ListingsQuery,
  HostListingArgs,
  HostListingFromPendingArgs,
  HostListingInput,
  UpdateListingArgs,
  UpdateListingInput,
} from "./types";

const verifyHostListingInput = ({
  title,
  description,
  type,
  price,
}: HostListingInput) => {
  if (title.length > 100) {
    throw new Error("Tiêu đề danh sách nhà/phòng phải dưới 100 ký tự");
  }
  if (description.length > 5000) {
    throw new Error("Miêu tả danh sách nhà/phòng phải dưới 5000 ký tự");
  }
  if (type !== ListingType.Apartment && type !== ListingType.House) {
    throw new Error("Loại danh sách phải là một căn hộ hoặc một ngôi nhà");
  }
  if (price < 0) {
    throw new Error("Giá phải lớn hơn 0");
  }
};

export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("Không tìm thấy danh sách nhà/phòng !");
        }

        const viewer = await authorize(db, req);
        if (viewer && viewer._id === listing.host) {
          listing.authorized = true;
        }

        return listing;
      } catch (error) {
        throw new Error(`Truy vấn danh sách nhà/phòng thất bại!: ${error}`);
      }
    },
    listings: async (
      _root: undefined,
      { location, filter, limit, page }: ListingsArgs,
      { db }: { db: Database }
    ): Promise<ListingsData> => {
      try {
        const query: ListingsQuery = {};
        const data: ListingsData = {
          region: null,
          total: 0,
          result: [],
        };

        if (location) {
          const { country, admin, city } = await Google.geocode(location);

          if (city) query.city = city;
          if (admin) query.admin = admin;
          if (country) {
            query.country = country;
          } else {
            throw new Error("Không tìm thấy quốc gia này");
          }

          const cityText = city ? `${city}, ` : "";
          const adminText = admin ? `${admin}, ` : "";
          data.region = `${cityText}${adminText}${country}`;
        }

        let cursor = db.listings.find(query);

        if (filter && filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
          cursor = cursor.sort({ price: 1 });
        }

        if (filter && filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
          cursor = cursor.sort({ price: -1 });
        }

        if (filter && filter === ListingsFilter.SALE_LOW_TO_HIGH) {
          cursor = cursor.sort({ salepercent: 1 });
        }

        if (filter && filter === ListingsFilter.SALE_HIGH_TO_LOW) {
          cursor = cursor.sort({ salepercent: -1 });
        }

        if (filter && filter === ListingsFilter.TYPE_APARTMENT) {
          cursor = cursor.sort({ type: 1 });
        }

        if (filter && filter === ListingsFilter.TYPE_HOUSE) {
          cursor = cursor.sort({ type: -1 });
        }

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Truy vấn danh sách các nhà/phòng thất bại: ${error}`);
      }
    },
  },
  Mutation: {
    hostListing: async (
      _root: undefined,
      { input }: HostListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      verifyHostListingInput(input);

      let viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("Không tìm thấy người này");
      }

      const { country, admin, city } = await Google.geocode(input.address);
      if (!country || !admin || !city) {
        throw new Error("Nhập sai địa chỉ!");
      }

      const imageUrl = await Cloudinary.upload(input.image);

      const insertResult = await db.listings.insertOne({
        _id: new ObjectId(),
        ...input,
        image: imageUrl,
        bookings: [],
        bookingsIndex: {},
        country,
        admin,
        city,
        host: viewer._id,
        rating: 0,
        favorite: false,
        salepercent: 0,
        numofReview: 0,
      });

      const insertedListing: Listing = insertResult.ops[0];

      await db.users.updateOne(
        { _id: viewer._id },
        { $push: { listings: insertedListing._id } }
      );

      return insertedListing;
    },
    hostListingFromPending: async (
      _root: undefined,
      { id, input }: HostListingFromPendingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      verifyHostListingInput(input);

      let viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("Không tìm thấy người này");
      }

      const pendinglisting = await db.pendinglistings.findOne({
        _id: new ObjectId(id),
      });
      if (!pendinglisting) {
        throw new Error("Không tìm thấy danh sách nhà/phòng !");
      }

      const insertResult = await db.listings.insertOne({
        _id: pendinglisting._id,
        ...input,
        image: pendinglisting.image,
        bookings: [],
        bookingsIndex: {},
        country: pendinglisting.country,
        admin: pendinglisting.admin,
        city: pendinglisting.city,
        host: pendinglisting.host,
        rating: 0,
        favorite: false,
        salepercent: 0,
        numofReview: 0,
      });

      const insertedListing: Listing = insertResult.ops[0];

      await db.users.updateOne(
        { _id: pendinglisting.host },
        { $push: { listings: insertedListing._id } }
      );

      return insertedListing;
    },
    updateListing: async (
      _root: undefined,
      { id, input }: { id: string; input: UpdateListingArgs | any },
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      // let viewer = await authorize(db, req);
      // if (!viewer) {
      //   throw new Error("Không tìm thấy người này");
      // }

      const { country, admin, city } = await Google.geocode(input.address);
      if (!country || !admin || !city) {
        throw new Error("Nhập sai địa chỉ!");
      }

      const listing = await db.listings.findOne({ _id: new ObjectId(id) });

      if (!listing) {
        throw new Error("failed to update listing");
      }

      const imageUrl = await Cloudinary.upload(input.image);

      const updateRes = await db.listings.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...input,
            image: imageUrl,
            country,
            admin,
            city,
          },
        },
        { returnOriginal: false }
      );

      if (!updateRes.value) {
        throw new Error("failed to update listing");
      }

      return updateRes.value;
    },
    deleteListing: async (
      _root: undefined,
      { id }: { id: string },
      { db }: { db: Database }
    ): Promise<Listing> => {
      const deleteRes = await db.listings.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!deleteRes.value) {
        throw new Error("failed to delete listing");
      }

      return deleteRes.value;
    },
    favoriteListing: async (
      _root: undefined,
      { id }: { id: string },
      { db }: { db: Database }
    ): Promise<Listing> => {
      const listing = await db.listings.findOne({ _id: new ObjectId(id) });

      if (!listing) {
        throw new Error("failed to favorite listing");
      }

      const updateRes = await db.listings.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { favorite: !listing.favorite } },
        { returnOriginal: false }
      );

      if (!updateRes.value) {
        throw new Error("failed to favorite listing");
      }

      return updateRes.value;
    },
    reviewListing: async (
      _root: undefined,
      { id, rating, comment }: { id: string; rating: number; comment: string },
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      const listing = await db.listings.findOne({ _id: new ObjectId(id) });

      if (!listing) {
        throw new Error("failed to find listing");
      }

      let viewer = await authorize(db, req);

      if (!viewer) {
        throw new Error("Không tìm thấy người này");
      }

      const review = {
        user: viewer,
        name: viewer.name,
        rating: rating,
        comment: comment,
      };

      let insertreview = await db.listings.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $push: { review: review } },
        { returnOriginal: false }
      );

      const updatenumofreview = await db.listings.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $inc: {
            numOfReview: 1,
          },
        },
        { returnOriginal: false }
      );

      await db.listings.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            rating: listing.rating + rating ,
          },
        },
        { returnOriginal: false }
      );

      if (!insertreview.value) {
        throw new Error("failed to review listing");
      }

      return insertreview.value;
    },
    saleListing: async (
      _root: undefined,
      { id, salepercent }: { id: string; salepercent: number },
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      const listing = await db.listings.findOne({ _id: new ObjectId(id) });

      if (!listing) {
        throw new Error("failed to sale listing");
      }

      const updateRes = await db.listings.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { salepercent: salepercent } },
        { returnOriginal: false }
      );

      if (!updateRes.value) {
        throw new Error("failed to sale listing");
      }

      return updateRes.value;
    },
  },
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    },
    host: async (
      listing: Listing,
      _args: {},
      { db }: { db: Database }
    ): Promise<User> => {
      const host = await db.users.findOne({ _id: listing.host });
      if (!host) {
        throw new Error("Không tìm thấy Host này");
      }
      return host;
    },
    bookingsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.bookingsIndex);
    },
    bookings: async (
      listing: Listing,
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        if (!listing.authorized) {
          return null;
        }

        const data: ListingBookingsData = {
          total: 0,
          result: [],
        };

        let cursor = await db.bookings.find({
          _id: { $in: listing.bookings },
        });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Truy vấn danh sách đặt chỗ này thất bại: ${error}`);
      }
    },
  },
};
