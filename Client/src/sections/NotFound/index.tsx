import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Button, Empty, Layout, Result, Typography } from "antd";

const { Content } = Layout;
const { Text } = Typography;

export const NotFound = () => {
  return (
    <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Link to="/" >
      <Button type="primary">
         Home
      </Button>
      </Link>
    }
  ></Result>
  );
};
