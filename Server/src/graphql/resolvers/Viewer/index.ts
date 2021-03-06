import crypto from "crypto";
import { Request, Response } from "express";
import { IResolvers } from "apollo-server-express";
import nodemailer from "nodemailer";
import { Google, Stripe } from "../../../lib/api";
import { Viewer, Database, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { LogInArgs, ConnectStripeArgs } from "./types";
import { ObjectId } from "mongodb";

const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_ENV === "development" ? false : true,
};

let sendSimpleEmail = async (
  user: any,
  id: string,
  title: string,
  address: string,
  reviewer: string,
  receiverEmail: string,
  subject: string,
  mess: string
) => {
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
    subject: subject, // Subject line
    html: getBodyHTMLEmail(user, id, title, address, reviewer, mess),
  });
};

let sendSimpleMeetEmail = async (
  user: any,
  hour: string,
  receiverEmail: string,
  subject: string,
  tenant: string,
  mess: string
) => {
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
    subject: subject, // Subject line
    html: getBodyHTMLMeetEmail(user, hour, tenant, mess),
  });
};

let getBodyHTMLEmail = (
  user: any,
  id: string,
  title: string,
  address: string,
  reviewer: string,
  mess: string
) => {
  let result = "";
  result = `
            <h3>Xin ch??o ${user}</h3>
            <p>${mess}</p>
            <p>Th??ng tin nh?? ph??ng: </p>
            <div><b>ID: ${id}</b></div>
            <div><b>Ti??u ????? ph??ng: ${title}</b></div>
            <div><b>?????a ch??? ph??ng: ${address}</b></div>
            <div><b>Reviewer: ${reviewer}</b></div>


            <div>Xin ch??n th??nh c???m ??n!</div>    
        `;
  return result;
};

let getBodyHTMLMeetEmail = (
  host: any,
  hour: string,
  tenant: string,
  mess: string
) => {
  let result = "";
  result = `
            <h3>Xin ch??o ${host}</h3>
            <p>${mess}</p>
            <p>Th??ng tin nh?? ph??ng: </p>
            <div><b>H???n g???p l??c: ${hour} gi???</b></div>
            <div><b>Ng?????i h???n: ${tenant}</b></div>


            <div>Xin ch??n th??nh c???m ??n!</div>    
        `;
  return result;
};

const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database,
  res: Response
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("L???i ????ng nh???p Google");
  }

  // Name/Photo/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length
      ? user.emailAddresses
      : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList &&
    userNamesList[0].metadata &&
    userNamesList[0].metadata.source
      ? userNamesList[0].metadata.source.id
      : null;

  // User Avatar
  const userAvatar =
    userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;

  // User Email
  const userEmail =
    userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

  if (!userId || !userName || !userAvatar || !userEmail) {
    throw new Error("L???i ????ng nh???p Google");
  }

  const updateRes = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token,
      },
    },
    { returnOriginal: false }
  );

  let viewer = updateRes.value;

  if (!viewer) {
    const insertResult = await db.users.insertOne({
      _id: userId,
      token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: [],
      isadmin: false,
      isreviewer: false,
    });

    viewer = insertResult.ops[0];
  }

  res.cookie("viewer", userId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });

  return viewer;
};

const logInViaCookie = async (
  token: string,
  db: Database,
  req: Request,
  res: Response
): Promise<User | undefined> => {
  const updateRes = await db.users.findOneAndUpdate(
    { _id: req.signedCookies.viewer },
    { $set: { token } },
    { returnOriginal: false }
  );

  let viewer = updateRes.value;

  if (!viewer) {
    res.clearCookie("viewer", cookieOptions);
  }

  return viewer;
};

export const viewerResolvers: IResolvers = {
  Query: {
    authUrlGoogle: (): string => {
      try {
        return Google.authUrl;
      } catch (error) {
        throw new Error(`Kh??ng th??? truy v???n Url Google Auth: ${error}`);
      }
    },
  },
  Mutation: {
    logInGoogle: async (
      _root: undefined,
      { input }: LogInArgs,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString("hex");

        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db, res)
          : await logInViaCookie(token, db, req, res);

        if (!viewer) {
          return { didRequest: true };
        }

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
          isadmin: viewer.isadmin,
          isreviewer: viewer.isreviewer,
        };
      } catch (error) {
        throw new Error(`????ng nh???p th???t b???i: ${error}`);
      }
    },
    logOut: (
      _root: undefined,
      _args: {},
      { res }: { res: Response }
    ): Viewer => {
      try {
        res.clearCookie("viewer", cookieOptions);
        return { didRequest: true };
      } catch (error) {
        throw new Error(`????ng xu???t th???t b???i: ${error}`);
      }
    },
    connectStripe: async (
      _root: undefined,
      { input }: ConnectStripeArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Viewer> => {
      try {
        const { code } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("Kh??ng t??m th???y ng?????i n??y");
        }

        const wallet = await Stripe.connect(code);
        if (!wallet) {
          throw new Error("L???i c???p ph??p Stripe");
        }

        const updateRes = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: wallet.stripe_user_id } },
          { returnOriginal: false }
        );

        if (!updateRes.value) {
          throw new Error("Kh??ng th??? c???p nh???t ng?????i n??y");
        }

        viewer = updateRes.value;

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (error) {
        throw new Error(`K???t n???i Stripe th???t b???i: ${error}`);
      }
    },
    disconnectStripe: async (
      _root: undefined,
      _args: {},
      { db, req }: { db: Database; req: Request }
    ): Promise<Viewer> => {
      try {
        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("Kh??ng t??m th???y ng?????i n??y");
        }

        const updateRes = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: "" } },
          { returnOriginal: false }
        );

        if (!updateRes.value) {
          throw new Error("Kh??ng th??? c???p nh???t ng?????i n??y");
        }

        viewer = updateRes.value;

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (error) {
        throw new Error(`Ng???t k???t n???i Stripe th???t b???i: ${error}`);
      }
    },
    sendEmail: async (
      _root: undefined,
      {
        id,
        subject,
        mess,
      }: {
        id: string;
        subject: string;
        mess: string;
      },
      { db, req }: { db: Database; req: Request }
    ) => {
      const pendinglisting = await db.pendinglistings.findOne({
        _id: new ObjectId(id),
      });
      if (!pendinglisting) {
        throw new Error("Kh??ng t??m th???y danh s??ch nh??/ph??ng !");
      }

      const host = await db.users.findOne({
        _id: pendinglisting.host,
      });
      if (!host) {
        throw new Error("Kh??ng t??m th???y ng?????i d??ng n??y !");
      }

      let viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("Kh??ng t??m th???y ng?????i n??y");
      }

      sendSimpleEmail(
        host.name,
        id,
        pendinglisting.title,
        pendinglisting.address,
        viewer.name,
        host.contact,
        subject,
        mess
      );
    },
    sendMeetEmail: async (
      _root: undefined,
      {
        id,
        hour,
        subject,
        mess,
      }: {
        id: string;
        hour: string;
        subject: string;
        mess: string;
      },
      { db, req }: { db: Database; req: Request }
    ) => {
      let viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("Kh??ng t??m th???y ng?????i n??y");
      }

      const host = await db.users.findOne({
        _id: id,
      });
      if (!host) {
        throw new Error("Kh??ng t??m th???y ng?????i d??ng n??y !");
      }

      sendSimpleMeetEmail(
        host.name,
        hour,
        host.contact,
        subject,
        viewer.name,
        mess
      );
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    },
    isadmin: (viewer: Viewer): boolean | undefined => {
      return viewer.isadmin ? true : undefined;
    },
    isreviewer: (viewer: Viewer): boolean | undefined => {
      return viewer.isreviewer ? true : undefined;
    },
  },
};
