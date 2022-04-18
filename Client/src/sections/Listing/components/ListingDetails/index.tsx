import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import {
  Avatar,
  Button,
  Comment,
  Divider,
  Form,
  Icon,
  Input,
  Layout,
  Rate,
  Tag,
  List,
  Typography,
} from "antd";
import {
  FavoriteListing as FavoriteListingData,
  FavoriteListingVariables,
} from "../../../../lib/graphql/mutation/FavoriteLiasting/__generated__/FavoriteListing";
import {
  DeleteListing as DeleteListingData,
  DeleteListingVariables,
} from "../../../../lib/graphql/mutation/DeleteListing/__generated__/DeleteListing";
import {
  ReviewListing as ReviewListingData,
  ReviewListingVariables,
} from "../../../../lib/graphql/mutation/ReviewListing/__generated__/ReviewListing";
import { Listing as ListingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import {
  displayErrorNotification,
  displaySuccessNotification,
  iconColor,
} from "../../../../lib/utils";
import {
  DELETE_LISTING,
  FAVORITE_LISTING,
  REVIEW_LISTING,
} from "../../../../lib/graphql/mutation/";
import { Viewer } from "../../../../lib/types";

interface Props {
  listing: ListingData["listing"];
  viewer: Viewer;
}

const { Content } = Layout;
const { TextArea } = Input;
const { Paragraph, Title, Text } = Typography;

export const ListingDetails = ({ listing, viewer }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [rate, setRate] = useState(0);
  const [comment, setComment] = useState("");
  const {
    id,
    title,
    description,
    image,
    type,
    address,
    city,
    numOfGuests,
    host,
    rating,
    favorite,
    numofReview,
    review,
  } = listing;

  const [deleteListing, { loading, data }] = useMutation<
    DeleteListingData,
    DeleteListingVariables
  >(DELETE_LISTING, {
    onCompleted: () => {
      displaySuccessNotification(
        "Bạn đã xóa danh sách cho thuê nhà/phòng thành công!"
      );
    },
    onError: () => {
      displayErrorNotification(
        "Xin lỗi ! hiện chúng tôi không thể giúp bạn xóa danh sách nhà/phòng. Xin hãy thử lại sau"
      );
    },
  });

  const [
    favoriteListing,
    { loading: favoriteListingLoading, error: favoriteListingError },
  ] = useMutation<FavoriteListingData, FavoriteListingVariables>(
    FAVORITE_LISTING
  );

  const [
    reviewListing,
    {
      loading: reviewListingloading,
      data: reviewListingdata,
      error: reviewListingerror,
    },
  ] = useMutation<ReviewListingData, ReviewListingVariables>(REVIEW_LISTING, {
    onCompleted: () => {
      displaySuccessNotification("Đánh giá nhà phòng thành công");
    },
    onError: () => {
      displayErrorNotification(
        "Xin lỗi ! hiện chúng tôi không thể giúp bạn đánh giá nhà/phòng. Xin hãy thử lại sau"
      );
    },
  });

  const disabledButton = viewer.id !== listing.host.id;

  const handleDeleteListing = async (id: string) => {
    await deleteListing({ variables: { id } });
  };

  const handleFavoriteListing = async (id: string) => {
    await favoriteListing({ variables: { id } });
  };

  const handlecommentChange = (e: any) => {
    console.log(e.target.value);
    console.log(comment);

    setComment(e.target.value);
  };

  const handlecommentSubmit = (id: string, rating: number, comment: string) => {
    if (!comment) {
      return displayErrorNotification("Xin hãy nhập bình luận");
    }

    setSubmitting(true);

    reviewListing({
      variables: {
        id: id,
        rating: rating,
        comment: comment,
      },
    });

    setSubmitting(false);
    setComment("");
  };

  const CommentList = ({ data }: any) => (
    <List
      className="comment-list"
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item: any) => (
        <li>
          <Rate disabled defaultValue={item.rating} />
          <Comment
            author={item.name}
            avatar={<Avatar src={item.user.avatar} />}
            content={item.comment}
          /> 
          <Divider orientation= "right">
          <Button type="primary">Xóa</Button>
          </Divider>
        
        </li>
      )}
    />
  );

  const Editor = ({ onChange, onSubmit, submitting, value }: any) => (
    <>
      <Form.Item>
        <TextArea rows={4} onChange={onChange} defaultValue={value} />
      </Form.Item>
      <Form.Item>
        <Button
          htmlType="submit"
          loading={submitting}
          onClick={onSubmit}
          type="primary"
        >
          Thêm bình luận
        </Button>
      </Form.Item>
    </>
  );

  const buttonText = listing.favorite ? "Bỏ Thích" : "Thích";
  const heartIcon = listing.favorite ? (
    <span role="img" aria-label="heart">
      ❤️
    </span>
  ) : null;

  const commentlistSection = listing.review ? (
    <>
      <CommentList data={listing.review} />
    </>
  ) : null;

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Xin hãy đợi
          </Title>
          <Text type="secondary">
            Chúng tôi đang xóa danh sách nhà/phòng cho bạn !.
          </Text>
        </div>
      </Content>
    );
  }

  if (data && data.deleteListing) {
    return <Redirect to={`/`} />;
  }

  return (
    <div className="listing-details">
      <div
        style={{ backgroundImage: `url(${image})` }}
        className="listing-details__image"
      />

      <div className="listing-details__information">
        <Paragraph
          type="secondary"
          ellipsis
          className="listing-details__city-address"
        >
          <Link to={`/listings/${city}`}>
            <Icon type="environment" style={{ color: iconColor }} /> {city}
          </Link>
          <Divider type="vertical" />
          {address}
        </Paragraph>
        <Title level={3} className="listing-details__title">
          {title}
        </Title>
        <div className="listing-details__title.ant-typography">
          <Rate
            allowHalf={true}
            style={{ color: "#fbf40e" }}
            defaultValue={rating}
            onChange={(value: number) => {
              setRate(value);
              console.log(value);
            }}
          />
        </div>
      </div>

      <Divider />

      <div className="listing-details__section">
        <Link to={`/user/${host.id}`}>
          <Avatar src={host.avatar} size={64} />
          <Title level={2} className="listing-details__host-name">
            {host.name}
          </Title>
        </Link>
      </div>

      <Divider />

      <div className="listing-details__section">
        <Title level={4}>Thông tin nhà/phòng</Title>
        <div className="listing-details__about-items">
          <Tag color="magenta">{type}</Tag>
          <Tag color="magenta">{numOfGuests} Guests</Tag>
        </div>
        <Paragraph ellipsis={{ rows: 3, expandable: true }}>
          {description}
        </Paragraph>
        <Button
          type="primary"
          onClick={() => handleDeleteListing(listing.id)}
          disabled={disabledButton}
        >
          Xóa
        </Button>{" "}
        <Link to={`/update/${listing.id}`}>
          <Button type="primary" disabled={disabledButton}>
            Update
          </Button>{" "}
        </Link>
        <Button
          type="primary"
          onClick={() => handleFavoriteListing(listing.id)}
        >
          {buttonText}
        </Button>{" "}
        {heartIcon}
        {commentlistSection}
        <Comment
          avatar={
            <Avatar
              src={
                viewer.avatar
                  ? viewer.avatar
                  : "https://upload.wikimedia.org/wikipedia/commons/d/d3/User_Circle.png"
              }
              alt="Avatar"
            />
          }
          content={
            <Editor
              onChange={handlecommentChange}
              onSubmit={() => {
                handlecommentSubmit(listing.id, rate, comment);
              }}
              submitting={submitting}
              value={comment}
            />
          }
        />
      </div>
    </div>
  );
};
