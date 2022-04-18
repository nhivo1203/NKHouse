import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Input, Row, Typography } from "antd";

import torontoImage from "../../assets/toronto.jpg";
import dubaiImage from "../../assets/dubai.jpg";
import losAngelesImage from "../../assets/los-angeles.jpg";
import londonImage from "../../assets/london.jpg";
import axios from "axios";

const { Title } = Typography;
const { Search } = Input;

interface Props {
  onSearch: (value: string) => void;
}

export const HomeHero = ({ onSearch }: Props) => {
  const [country, setCountry] = useState("");
  const [states1, setStates1] = useState("");
  const [states2, setStates2] = useState("");
  const [states3, setStates3] = useState("");
  const [states4, setStates4] = useState("");
  //creating function to load ip address from the API

  const apiget: string =
    "6Ytg_ZcYVCFY4_YKX0IP8WQsyUinwY30JDYwjyZWjgu1ShuzgoAVaZfO_YjF94wJRoQ";
    // "efd277cf92ddf9d4d03add60046975c5";

  const getData = async () => {
    const res = await axios.get(
      "http://api.ipstack.com/check?access_key=6de303fd49697c7c7a2fa4dced597c81"
      // "http://api.ipstack.com/check?access_key=efd277cf92ddf9d4d03add60046975c5"
    );
    console.log(res.data);

    setCountry(res.data.country_code);
    
  };


  const urlstate: string =
  "https://api.countrystatecity.in/v1/countries/"+country+"/states"

  const options: any = {
    url: urlstate,
    method: "GET",
    headers: {
      'X-CSCAPI-KEY':'VFpEcUdCMTVCdmkzWVd5QkI3YzBKTHU0OGZGeXdCeDNpRElvaWllNw=='
    },
  };

  const getStates = async () => {
    const result = await axios(options);
    console.log(result.data);
    setStates1(result.data[62].name);
    setStates2(result.data[10].name);
    setStates3(result.data[42].name);
    setStates4(result.data[43].name);
  };

  useEffect(() => {
    //passing getData method to the lifecycle method
    getData();
  }, []);

  useEffect(() => {
    //passing getData method to the lifecycle method
    getStates();
  });

  const linkstates1: string = "listings/" + states1;
  const linkstates2: string = "listings/" + states2;
  const linkstates3: string = "listings/" + states3;
  const linkstates4: string = "listings/" + states4;
  
  return (
    <div className="home-hero">
      <div className="home-hero__search">
        <Title className="home-hero__title">
          Tìm đến nơi mà bạn yêu thích!
        </Title>
        <Search
          placeholder="Tìm 'San Fransisco'"
          size="large"
          enterButton
          className="home-hero__search-input"
          onSearch={onSearch}
        />
      </div>
      <Row gutter={12} className="home-hero__cards">
      <Title className="home-hero__title"> Những thành phố nổi bật </Title>
        <Col xs={12} md={6}>
          <Link to={linkstates1}>
            <Card cover={<img alt={states1} src={torontoImage} />}>
              {states1}
            </Card>
          </Link>
        </Col>
        <Col xs={12} md={6}>
          <Link to={linkstates2}>
            <Card cover={<img alt={states2} src={dubaiImage} />}>
              {states2}
            </Card>
          </Link>
        </Col>
        <Col xs={0} md={6}>
          <Link to={linkstates3}>
            <Card cover={<img alt={states3} src={losAngelesImage} />}>
              {states3}
            </Card>
          </Link>
        </Col>
        <Col xs={0} md={6}>
          <Link to={linkstates4}>
            <Card cover={<img alt={states4} src={londonImage} />}>
              {states4}
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};
