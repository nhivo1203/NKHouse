import { Request } from "express";
import { ObjectId } from "mongodb";
import { IResolvers } from "apollo-server-express";
import { Database, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import {
	UserArgs,
	UserBookingsArgs,
	UserBookingsData,
	UserListingsArgs,
	UserListingsData,
	UsersArgs,
	UsersData,
} from "./types";

export const userResolvers: IResolvers = {
	Query: {
		user: async (
			_root: undefined,
			{ id }: UserArgs,
			{ db, req }: { db: Database; req: Request }
		): Promise<User> => {
			try {
				const user = await db.users.findOne({ _id: id });

				if (!user) {
					throw new Error("Không tìm thấy người dùng này !");
				}

				const viewer = await authorize(db, req);

				if (viewer && viewer._id === user._id) {
					user.authorized = true;
				}

				return user;
			} catch (error) {
				throw new Error(`Truy vấn người dùng thất bại: ${error}`);
			}
		},
		users: async (
			_root: undefined,
			{ limit, page }: UsersArgs,
			{ db }: { db: Database }
		): Promise<UsersData | null> => {
			try {
				const data: UsersData = {
					total: 0,
					result: [],
				};

				let cursor = await db.users.find();

				cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
				cursor = cursor.limit(limit);

				data.total = await cursor.count();
				data.result = await cursor.toArray();

				return data;
			} catch (error) {
				throw new Error(`Truy vấn danh sách user thất bại! : ${error}`);
			}
		},
	},
	Mutation: {
		addAdmin: async (
			_root: undefined,
			{ id }: { id: string },
			{ db }: { db: Database }
		  ): Promise<User> => {
			const user = await db.users.findOne({ _id: id });
	  
			if (!user) {
			  throw new Error("failed to find this user");
			}
	  
			const updateRes = await db.users.findOneAndUpdate(
			  { _id: id },
			  { $set: { isadmin: !user.isadmin } },
			  { returnOriginal: false }
			);
	  
			if (!updateRes.value) {
			  throw new Error("failed to add admin user");
			}
	  
			return updateRes.value;
		  },
		  addReviewer: async (
			_root: undefined,
			{ id }: { id: string },
			{ db }: { db: Database }
		  ): Promise<User> => {
			const user = await db.users.findOne({ _id: id });
	  
			if (!user) {
			  throw new Error("failed to find this user");
			}
	  
			const updateRes = await db.users.findOneAndUpdate(
			  { _id: id },
			  { $set: { isreviewer: !user.isreviewer } },
			  { returnOriginal: false }
			);
	  
			if (!updateRes.value) {
			  throw new Error("failed to add admin user");
			}
	  
			return updateRes.value;
		  },
		deleteUser: async (
			_root: undefined,
			{ id }: { id: string },
			{ db }: { db: Database }
		): Promise<User> => {
			
			await db.listings.deleteMany({ host: id });
			await db.bookings.deleteMany({ tenant: id });

			const deleteRes = await db.users.findOneAndDelete({
				_id: id,
			});



			if (!deleteRes.value) {
				throw new Error("failed to delete user");
			}

			return deleteRes.value;
		},
	},
	User: {
		id: (user: User): string => {
			return user._id;
		},
		hasWallet: (user: User): boolean => {
			return Boolean(user.walletId);
		},
		income: (user: User): number => {
			return user.income;
		},
		isadmin: (user: User): boolean | false => {
			return user.isadmin;
		},
		isreviewer: (user: User): boolean | false => {
			return user.isreviewer;
		},
		bookings: async (
			user: User,
			{ limit, page }: UserBookingsArgs,
			{ db }: { db: Database }
		): Promise<UserBookingsData | null> => {
			try {
				if (!user.authorized) {
					return null;
				}

				const data: UserBookingsData = {
					total: 0,
					result: [],
				};

				let cursor = await db.bookings.find({
					_id: { $in: user.bookings },
				});

				cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
				cursor = cursor.limit(limit);

				data.total = await cursor.count();
				data.result = await cursor.toArray();

				return data;
			} catch (error) {
				throw new Error(
					`Truy vấn danh sách đặt chỗ của người dùng này thất bại! : ${error}`
				);
			}
		},
		listings: async (
			user: User,
			{ limit, page }: UserListingsArgs,
			{ db }: { db: Database }
		): Promise<UserListingsData | null> => {
			try {
				const data: UserListingsData = {
					total: 0,
					result: [],
				};

				let cursor = await db.listings.find({
					_id: { $in: user.listings },
				});

				cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
				cursor = cursor.limit(limit);

				data.total = await cursor.count();
				data.result = await cursor.toArray();

				return data;
			} catch (error) {
				throw new Error(
					`Truy vấn danh sách nhà/phòng của người dùng này thất bại!: ${error}`
				);
			}
		},
	},
};
