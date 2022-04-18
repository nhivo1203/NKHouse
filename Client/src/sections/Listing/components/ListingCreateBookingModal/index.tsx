import React from "react";
import {useMutation} from "@apollo/react-hooks"
import { Button, Divider, Icon, Modal, Typography } from "antd";
import {
  CardElement,
  injectStripe,
  ReactStripeElements,
} from "react-stripe-elements";
import moment, { Moment } from "moment";
import { CREATE_BOOKING } from "../../../../lib/graphql/mutation";
import { CreateBooking as CreateBookingData,CreateBookingVariables } from "../../../../lib/graphql/mutation/CreateBooking/__generated__/CreateBooking";
import { formatListingPrice,displayErrorNotification,displaySuccessNotification } from "../../../../lib/utils";

interface Props {
  id: string;
  price: number;
  salepercent: number;
  modalVisible: boolean;
  checkInDate: Moment;
  checkOutDate: Moment;
  setModalVisible: (modalVisible: boolean) => void;
  clearBookingData: () => void;
  handleListingRefetch: () => Promise<void>;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBookingModal = ({
  id,
  price,
  salepercent,
  modalVisible,
  checkInDate,
  checkOutDate,
  setModalVisible,
  clearBookingData,
  handleListingRefetch,
  stripe,
}: Props & ReactStripeElements.InjectedStripeProps) => {
  const [createBooking, { loading }] = useMutation<
  CreateBookingData,
  CreateBookingVariables
>(CREATE_BOOKING, {
  onCompleted: () => {
    clearBookingData();
    displaySuccessNotification(
      "Bạn đã đặt chỗ thành công !",
      "Danh sách nhà/phòng đã đặt chỗ có thể tìm trong Hồ sơ của bạn !"
    );
    handleListingRefetch();
  },
  onError: () => {
    displayErrorNotification(
      "Xin lỗi! Chúng tôi đã không thể đặt nhà/phòng thành công. Vui lòng thử lại sau!"
    );
  }
});

  const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
  const listingPrice =price * daysBooked
  const salelistingPrice =(price - (price * (salepercent/100))) * daysBooked


  const handleCreateBooking = async () => {
    if (!stripe) {
      return displayErrorNotification("Xin lỗi! Chúng tôi không thể kết nối với Stripe.");
    }

    let { token: stripeToken, error } = await stripe.createToken();
    if (stripeToken) {
      createBooking({
        variables: {
          input: {
            id,
            source: stripeToken.id,
            checkIn: moment(checkInDate).format("YYYY-MM-DD"),
            checkOut: moment(checkOutDate).format("YYYY-MM-DD"),
            total: salelistingPrice
          }
        }
      });
    } else {
      displayErrorNotification(
        error && error.message
          ? error.message
          : "Xin lỗi! Chúng tôi không thể đặt chỗ cho bạn. Vui lòng thử lại sau."
      );
    }
  };


  return (
    <Modal
      visible={modalVisible}
      centered
      footer={null}
      onCancel={() => setModalVisible(false)}
    >
      <div className="listing-booking-modal">
        <div className="listing-booking-modal__intro">
          <Title className="listing-boooking-modal__intro-title">
            <Icon type="key"></Icon>
          </Title>
          <Title level={3} className="listing-boooking-modal__intro-title">
            Đặt nhà/phòng của bạn
          </Title>
          <Paragraph>
            Nhập thông tin thanh toán của bạn để đặt chỗ từ những ngày{" "}
            <Text mark strong>
              {moment(checkInDate).format("MMMM Do YYYY")}
            </Text>{" "}
            giữa{" "}
            <Text mark strong>
              {moment(checkOutDate).format("MMMM Do YYYY")}
            </Text>
            , bao gồm.
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__charge-summary">
          <Paragraph>
            {formatListingPrice(price - (price * (salepercent/100)), false)} * {daysBooked} ngày ={" "}
            <Text strong>{formatListingPrice(salelistingPrice, false)}</Text>
          </Paragraph>
          <Paragraph className="listing-booking-modal__charge-summary-total">
            Tổng tiền = <Text mark>{formatListingPrice(salelistingPrice)}</Text>
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__stripe-card-section">
          <CardElement
            hidePostalCode
            className="listing-booking-modal__stripe-card"
          />

          <Button
            size="large"
            type="primary"
            className="listing-booking-modal__cta"
            loading={loading}
            onClick={handleCreateBooking}
          >
            Đặt Chỗ
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const WrappedListingCreateBookingModal = injectStripe(
  ListingCreateBookingModal
);
