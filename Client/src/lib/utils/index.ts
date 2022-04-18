import { message, notification } from "antd";

export const iconColor = "#1890ff";

export const formatListingPrice = (price: number, round = true) => {
  const formatListingPrice = round ? Math.round(price) : price
  return `${formatListingPrice}.000 VNĐ`;
};

export const displaySuccessNotification = (
  message: string,
  description?: string
) => {
  return notification["success"]({
    message,
    description,
    placement: "topLeft",
    style: {
      marginTop: 50,
    },
  });
};

export const displayErrorNotification = (error: string) => {
  return message.error(error);
};
