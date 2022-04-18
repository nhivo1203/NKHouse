import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { Google, Cloudinary } from "../../../lib/api";
import {
  Database,
  PendingListing,
  ListingType,
  User,
} from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import {
  PendingListingArgs,
  PendingListingBookingsArgs,
  PendingListingBookingsData,
  PendingListingsArgs,
  PendingListingsData,
  PendingListingsFilter,
  PendingListingsQuery,
  HostPendingListingArgs,
  HostPendingListingInput,
  UpdatePendingListingArgs,
  UpdatePendingListingInput,
} from "./types";

const verifyHostPendingListingInput = ({
  title,
  description,
  type,
  price,
}: HostPendingListingInput) => {
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

let sendSimpleEmail = async (user: any, id: string, title:string, address: string, reviewer:string , receiverEmail:string) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_APP, // generated ethereal user
      pass: process.env.EMAIL_APP_PASS, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"NKHouse" <vonhi1203@gmail.com>', // sender address
    to: receiverEmail, // list of receivers
    subject: "Thông báo từ chối cho thuê", // Subject line
    html: getBodyHTMLEmail(user, id, title,address,reviewer),
  });
};

let getBodyHTMLEmail = (user: any, id: string, title:string, address: string, reviewer:string) => {
  let result = "";
  result = `
            <h3>Xin chào ${user}</h3>
            <p>Bạn nhận được email này vì chúng tôi đã từ chối danh sách nhà/phòng cho thuê của bạn vì lí do không đúng quy định</p>
            <p>Thông tin nhà phòng: </p>
            <div><b>ID: ${id}</b></div>
            <div><b>Tiêu đề phòng: ${title}</b></div>
            <div><b>Địa chỉ phòng: ${address}</b></div>
            <div><b>Reviewer: ${reviewer}</b></div>


            <div>Xin chân thành cảm ơn !</div>    
        `;
  return result;
};

export const pendinglistingResolvers: IResolvers = {
  Query: {
    pendinglisting: async (
      _root: undefined,
      { id }: PendingListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<PendingListing> => {
      try {
        const pendinglisting = await db.pendinglistings.findOne({
          _id: new ObjectId(id),
        });
        if (!pendinglisting) {
          throw new Error("Không tìm thấy danh sách nhà/phòng !");
        }

        const viewer = await authorize(db, req);
        if (viewer && viewer._id === pendinglisting.host) {
          pendinglisting.authorized = true;
        }

        return pendinglisting;
      } catch (error) {
        throw new Error(`Truy vấn danh sách nhà/phòng thất bại!: ${error}`);
      }
    },
    pendinglistings: async (
      _root: undefined,
      { location, filter, limit, page }: PendingListingsArgs,
      { db }: { db: Database }
    ): Promise<PendingListingsData> => {
      try {
        const query: PendingListingsQuery = {};
        const data: PendingListingsData = {
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

        let cursor = await db.pendinglistings.find(query);

        if (filter && filter === PendingListingsFilter.PRICE_LOW_TO_HIGH) {
          cursor = cursor.sort({ price: 1 });
        }

        if (filter && filter === PendingListingsFilter.PRICE_HIGH_TO_LOW) {
          cursor = cursor.sort({ price: -1 });
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
    hostPendingListing: async (
      _root: undefined,
      { input }: HostPendingListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<PendingListing> => {
      verifyHostPendingListingInput(input);

      let viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("Không tìm thấy người này");
      }

      const { country, admin, city } = await Google.geocode(input.address);
      if (!country || !admin || !city) {
        throw new Error("Nhập sai địa chỉ!");
      }

      const imageUrl = await Cloudinary.upload(input.image);

      const insertResult = await db.pendinglistings.insertOne({
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
      });

      const insertedPendingListing: PendingListing = insertResult.ops[0];

      return insertedPendingListing;
    },
    updatePendingListing: async (
      _root: undefined,
      { id, input }: { id: string; input: UpdatePendingListingArgs | any },
      { db, req }: { db: Database; req: Request }
    ): Promise<PendingListing> => {
      // let viewer = await authorize(db, req);
      // if (!viewer) {
      //   throw new Error("Không tìm thấy người này");
      // }

      const { country, admin, city } = await Google.geocode(input.address);
      if (!country || !admin || !city) {
        throw new Error("Nhập sai địa chỉ!");
      }

      const PendingListing = await db.pendinglistings.findOne({
        _id: new ObjectId(id),
      });

      if (!PendingListing) {
        throw new Error("failed to update PendingListing");
      }

      //   const imageUrl = await Cloudinary.upload(input.image);

      const updateRes = await db.pendinglistings.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...input,
            image: input.image,
            country,
            admin,
            city,
          },
        },
        { returnOriginal: false }
      );

      if (!updateRes.value) {
        throw new Error("failed to update PendingListing");
      }

      return updateRes.value;
    },
    deletePendingListing: async (
      _root: undefined,
      {
        id
      }: {
        id: string;
      },
      { db,req }: { db: Database, req: Request }
    ): Promise<PendingListing> => {

      const pendinglisting = await db.pendinglistings.findOne({
        _id: new ObjectId(id),
      });
      if (!pendinglisting) {
        throw new Error("Không tìm thấy danh sách nhà/phòng !");
      }

      const host = await db.users.findOne({
        _id: pendinglisting.host,
      });
      if (!host) {
        throw new Error("Không tìm thấy người dùng này !");
      }

      let viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("Không tìm thấy người này");
      }

      const deleteRes = await db.pendinglistings.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!deleteRes.value) {
        throw new Error("failed to delete PendingListing");
      }

      return deleteRes.value;
    },
  },
  PendingListing: {
    id: (PendingListing: PendingListing): string => {
      return PendingListing._id.toString();
    },
    host: async (
      PendingListing: PendingListing,
      _args: {},
      { db }: { db: Database }
    ): Promise<User> => {
      const host = await db.users.findOne({ _id: PendingListing.host });
      if (!host) {
        throw new Error("Không tìm thấy Host này");
      }
      return host;
    },
    bookingsIndex: (PendingListing: PendingListing): string => {
      return JSON.stringify(PendingListing.bookingsIndex);
    },
    bookings: async (
      PendingListing: PendingListing,
      { limit, page }: PendingListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<PendingListingBookingsData | null> => {
      try {
        if (!PendingListing.authorized) {
          return null;
        }

        const data: PendingListingBookingsData = {
          total: 0,
          result: [],
        };

        let cursor = await db.bookings.find({
          _id: { $in: PendingListing.bookings },
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
