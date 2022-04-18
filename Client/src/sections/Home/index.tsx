import React, { useEffect, useState } from "react";
import { Layout, Typography, Col, Row, Button } from "antd";
import { Link, RouteComponentProps } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { LISTINGS } from "../../lib/graphql/queries";
import {
  ListingsVariables,
  Listings as ListingsData,
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { ListingsFilter } from "../../lib/graphql/globalTypes";
import { displayErrorNotification } from "../../lib/utils";
import { HomeHero, HomeListings, HomeListingsSkeleton } from "./components";

///Ảnh
import mapBackground from "./assets/map-background.jpg";
import sanFransiscoImage from "./assets/san-fransisco.jpg";
import cancunImage from "./assets/cancun.jpg";

const { Content } = Layout;

const { Title, Paragraph } = Typography;

const PAGE_LIMIT = 4;
const PAGE_NUMBER = 1;

export const Home = ({ history }: RouteComponentProps) => {
  const { loading, data } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      variables: {
        filter: ListingsFilter.PRICE_HIGH_TO_LOW,
        limit: PAGE_LIMIT,
        page: PAGE_NUMBER,
      },
    }
  );



  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      history.push(`/listings/${trimmedValue}`);
    } else {
      displayErrorNotification("Hãy điền tên một nơi bạn muốn đến!");
    }
  };

	useEffect (() =>{
		console.log(data);
	},[]);

  const renderListingsSection = () => {
    if (loading) {
      return <HomeListingsSkeleton />;
    }

    if (data) {
      return (
        <HomeListings
          title="Danh sách nhà/phòng tốt nhất"
          listings={data.listings.result}
        />
      );
    }

    return null;
  };

  return (
    <Content
      className="home"
      style={{ backgroundImage: `url${mapBackground}` }}
    >
      <HomeHero onSearch={onSearch} />
      <div className="home__cta-section">
        <Title level={2} className="home__cta-section-title">
          Hướng dẫn bạn cho thuê tất cả mọi thứ
        </Title>
        <Paragraph>
          Giúp bạn đưa ra quyết định tốt nhất trong việc thuê địa điểm vào phút
          cuối của mình.
        </Paragraph>
        <Link
          to="/listings/viet%20nam"
          className="ant-btn ant-btn-primary ant-btn-lg home__cta-section-button"
        >
          Danh sách phổ biến ở Việt Nam
        </Link>
      </div>

      {renderListingsSection()}

      <div className="home__listings">
        <Title level={4} className="home__listings-title">
          Danh sách nhà/phòng thuộc bất kỳ loại nào
        </Title>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Link to="/listings/san%20fransisco">
              <div className="home__listings-img-cover">
                <img
                  src={sanFransiscoImage}
                  alt="San Fransisco"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
          <Col xs={24} sm={12}>
            <Link to="/listings/cancún">
              <div className="home__listings-img-cover">
                <img
                  src={cancunImage}
                  alt="Cancún"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </Content>
  );
};
