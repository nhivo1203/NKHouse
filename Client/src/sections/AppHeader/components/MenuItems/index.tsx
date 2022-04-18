import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import { Avatar, Button, Icon, Menu } from "antd";
import { LOG_OUT } from "../../../../lib/graphql/mutation";
import { LogOut as logOutData } from "../../../../lib/graphql/mutation/LogOut/__generated__/LogOut";
import {
  displayErrorNotification,
  displaySuccessNotification,
} from "../../../../lib/utils";
import { Viewer } from "../../../../lib/types";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Item, SubMenu } = Menu;

export const MenuItems = ({ viewer, setViewer }: Props) => {
  const [logOut] = useMutation<logOutData>(LOG_OUT, {
    onCompleted: (data) => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        sessionStorage.removeItem("token");
        displaySuccessNotification("Bạn đăng xuất thành công!");
      }
    },
    onError: () => {
      displayErrorNotification(
        "Xin lỗi! Chúng tôi đang có vấn đề . Xin hãy thử lại sau!"
      );
    },
  });

  const handleLogOut = () => {
    logOut();
  };
  const subMenuLogin =
    viewer.id && viewer.avatar && viewer.isadmin ? (
      <SubMenu title={<Avatar src={viewer.avatar} />}>
        <Item key="/user">
          <Link to={`/user/${viewer.id}`}>
            <Icon type="user" />
            Hồ sơ
          </Link>
        </Item>
        <Item key="/admin">
          <Link to={`/admin`}>
            <Icon type="dashboard" />
            Admin
          </Link>
        </Item>
        <Item key="/logout">
          <div onClick={handleLogOut}>
            <Icon type="logout" />
            Đăng xuất
          </div>
        </Item>
      </SubMenu>
    ) : viewer.id && viewer.avatar && viewer.isreviewer ? (
      <SubMenu title={<Avatar src={viewer.avatar} />}>
        <Item key="/user">
          <Link to={`/user/${viewer.id}`}>
            <Icon type="user" />
            Hồ sơ
          </Link>
        </Item>
        <Item key="/admin">
          <Link to={`/admin/pendinglistings`}>
            <Icon type="dashboard" />
            Pending
          </Link>
        </Item>
        <Item key="/logout">
          <div onClick={handleLogOut}>
            <Icon type="logout" />
            Đăng xuất
          </div>
        </Item>
      </SubMenu>
    ) : viewer.id && viewer.avatar ? (
      <SubMenu title={<Avatar src={viewer.avatar} />}>
        <Item key="/user">
          <Link to={`/user/${viewer.id}`}>
            <Icon type="user" />
            Hồ sơ
          </Link>
        </Item>
        <Item key="/logout">
          <div onClick={handleLogOut}>
            <Icon type="logout" />
            Đăng xuất
          </div>
        </Item>
      </SubMenu>
    ) : (
      <Item>
        <Link to="/login">
          <Button type="primary">Đăng nhập</Button>
        </Link>
      </Item>
    );

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/meet">
        <Link to="/meet">
          <Icon type="video-camera" />
          NKMeet
        </Link>
      </Item>
      <Item key="/host">
        <Link to="/host">
          <Icon type="home" />
          Cho thuê
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};
