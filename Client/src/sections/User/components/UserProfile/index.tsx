import React, { Fragment, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Typography,
  Tag,
  Input,
  Icon,
} from "antd";
import { User as UserData } from "../../../../lib/graphql/queries/User/__generated__/User";
import { Viewer } from "../../../../lib/types";
import {
  displayErrorNotification,
  displaySuccessNotification,
  formatListingPrice,
} from "../../../../lib/utils";
import { DisconnectStripe as DisconnectStripeData } from "../../../../lib/graphql/mutation/DisconnectStripe/__generated__/DisconnectStripe";
import { useMutation } from "@apollo/react-hooks";
import { DISCONNECT_STRIPE } from "../../../../lib/graphql/mutation";
import { useDispatch } from "react-redux";
import { useSnackbar } from "react-simple-snackbar";
import { useHistory } from "react-router-dom";
import * as MeetingAPi from "../../../Meet/lib/meeting-api";
import { getErrorMessage } from "../../../Meet/lib/error-handling";
import { start } from "../../../Meet/store/meeting/actions";
import {
  SendMeetEmail as SendMeetEmailData,
  SendMeetEmailVariables,
} from "../../../../lib/graphql/mutation/SendMeetEmail/__generated__/SendMeetEmail";
import { SEND_MEET_EMAIL } from "../../../../lib/graphql/mutation/SendMeetEmail";

interface Props {
  user: UserData["user"];
  viewer: Viewer;
  viewerIsUser: boolean;
  setViewer: (viewer: Viewer) => void;
  handleUserRefetch: () => Promise<void>;
}

const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_S_CLIENT_ID}&scope=read_write`;

const { Paragraph, Text, Title } = Typography;

const { Search } = Input;

export const UserProfile = ({
  user,
  viewer,
  viewerIsUser,
  setViewer,
  handleUserRefetch,
}: Props) => {
  const [disconnectStripe, { loading }] = useMutation<DisconnectStripeData>(
    DISCONNECT_STRIPE,
    {
      onCompleted: (data) => {
        if (data && data.disconnectStripe) {
          setViewer({ ...viewer, hasWallet: data.disconnectStripe.hasWallet });
          displaySuccessNotification(
            "Bạn đã ngắt kết nối Stripe thành công!",
            "Bạn phải kết nối lại với Stripe để có thể tiếp tục cho thuê nhà/phòng!"
          );
          handleUserRefetch();
        }
      },
      onError: () => {
        displayErrorNotification(
          "Xin lỗi! Chúng tôi hiện không ngắt kết nối được tài khoản Stripe của bạn !"
        );
      },
    }
  );

  const [sendMeetEmail, { data: SendMeetEmaildata }] = useMutation<
    SendMeetEmailData,
    SendMeetEmailVariables
  >(SEND_MEET_EMAIL);

  const dispatch = useDispatch();
  const history = useHistory();
  const [openSnackbar] = useSnackbar({
    position: "top-center",
  });

  const startMeeting = async (hour:string) => {
    try {
      const { meetingId } = await MeetingAPi.start("");
      sendMeetEmail({
        variables: {
          id: user.id,
          hour: hour,
          subject: "Hẹn gặp mặt ở NKMeet",
          mess: `NKMeet gửi lịch hẹn gặp mặt đường link http://localhost:3000/meeting/${meetingId}`,
        },
      });
      dispatch(start({ name: "", meetingId }));
      history.push(`/meeting/${meetingId}`);
    } catch (error) {
      openSnackbar(getErrorMessage(error));
    }
  };


  const redirectToStripe = () => {
    window.location.href = stripeAuthUrl;
  };

  const MeetButton = viewerIsUser ? null : (
    <Search
      placeholder="Nhập giờ cần hẹn"
      enterButton="Hẹn gặp"
      suffix = "giờ"
      onSearch={(value) => startMeeting(value)}
    />
  );

  const additionalDetails = user.hasWallet ? (
    <Fragment>
      <Paragraph>
        <Tag color="green">Đã đăng ký Stripe</Tag>
      </Paragraph>
      <Paragraph>
        Thu nhập:{" "}
        <Text strong>
          {user.income ? formatListingPrice(user.income) : `0$`}
        </Text>
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        loading={loading}
        onClick={() => disconnectStripe()}
      >
        Ngắt kết nối Stripe
      </Button>
      <Paragraph type="secondary">
        Bằng cách ngắt kết nối, bạn sẽ không thể nhận thêm{" "}
        <Text strong> bất kỳ khoản thanh toán nào</Text>. Điều này sẽ ngăn người
        dùng đặt trước danh sách mà bạn có thể đã tạo.
      </Paragraph>
    </Fragment>
  ) : (
    <Fragment>
      <Paragraph>
        Bạn muốn trở thành một người cho thuê nhà/phòng.Hãy đăng ký với tài
        khoản Stripe!
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        onClick={redirectToStripe}
      >
        Kết nối với tài khoản Stripe
      </Button>
      <Paragraph type="secondary">
        NKHouse dùng{""}
        <a href="https://stripe.com/en-US/connect" rel="nooper noreferrer">
          {" "}
          Stripe
        </a>{" "}
        {""}
        để giúp chuyển thu nhập của bạn một cách an toàn và đáng tin cậy
      </Paragraph>
    </Fragment>
  );

  const additionalDetailsSection = viewerIsUser ? (
    <Fragment>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>Thông tin bổ sung</Title>
        {additionalDetails}
      </div>
    </Fragment>
  ) : null;

  return (
    <div className="user-profile">
      <Card className="user-profile__card">
        <div className="user-profile__avatar">
          <Avatar size={100} src={user.avatar} />
        </div>
        <Divider />
        <div className="user-profile__details">
          <Title level={4}> Thông tin </Title>
          <Paragraph>
            Tên: <Text strong>{user.name}</Text>
          </Paragraph>
          <Paragraph>
            Liên hệ: <Text strong>{user.contact}</Text>
          </Paragraph>
          <Paragraph>
            Role:{" "}
            <Text strong>
              {user.isadmin ? "Admin" : user.isreviewer ? "Reviewer" : "User"}
            </Text>
          </Paragraph>
          {MeetButton}
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  );
};
