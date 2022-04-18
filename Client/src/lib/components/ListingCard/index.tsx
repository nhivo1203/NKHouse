import React from "react";
import { Card, Icon, Rate, Typography, Tag } from "antd";
import { iconColor, formatListingPrice } from "../../utils";
import { Link } from "react-router-dom";

interface Props {
  listing: {
    id: string;
    title: string;
    address: string;
    image: string;
    price: number;
    numOfGuests: number;
    rating: number;
    salepercent: number;
  };
}

const { Text, Title } = Typography;

export const ListingCard = ({ listing }: Props) => {
  const {
    id,
    address,
    image,
    price,
    numOfGuests,
    rating,
    salepercent,
  } = listing;

  const salepercentTag = salepercent ? (
    <div className="listing-card__salepercent-tag">
      <Tag color="#108ee9">-{salepercent}%</Tag>
    </div>
  ) : null;

  return (
    <Link to={`/listing/${id}`}>
      <Card
        hoverable
        cover={
          <div
            style={{ backgroundImage: `url(${image})` }}
            className="listing-card__cover-img"
          />
        }
      >
        <div className="listing-card__details">
          <div className="listing-card__description">
            <Title level={4} className="listing-card__price">
              {formatListingPrice(price - price * (salepercent / 100))}
              <span>/ngày</span>
            </Title>
            {/* <Title level={4} delete className="listing-card__price">
              {formatListingPrice(price)}
              <span>/ngày</span>
            </Title> */}
            <Text ellipsis className="listing-card__address">
              {address}
            </Text>
            <div className="listing-card__rating-tag">
              <Rate
                disabled
                allowHalf={true}
                style={{ color: "#fbf40e" }}
                defaultValue={rating}
              />
            </div>
            {salepercentTag}
          </div>
          <div className="listing-card__dimensions listing-card__dimensions--guests">
            <Icon type="user" style={{ color: iconColor }} />
            <Text>{numOfGuests} Khách</Text>
          </div>
          <div className="listing-card__dimensions listing-card__dimensions--rating">
            <Icon type="star" theme="filled" style={{ color: iconColor }} />
            <Text>{rating} Sao</Text>
          </div>
        </div>
      </Card>
    </Link>
  );
};
