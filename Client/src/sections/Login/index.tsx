import React, { useEffect, useRef } from "react";
import { Redirect } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import { Card, Layout, Typography, Spin } from "antd";
import { ErrorBanner } from "../../lib/components";
import { LOG_IN_GOOGLE} from "../../lib/graphql/mutation";
import { AUTH_URL_GOOGLE} from "../../lib/graphql/queries/AuthUrl";
import { LogInGoogle as LogInGoogleData, LogInGoogleVariables } from "../../lib/graphql/mutation/LogIn/__generated__/LogInGoogle";
import { authUrlGoogle } from "../../lib/graphql/queries/AuthUrl/__generated__/authUrlGoogle";
import {
  displayErrorNotification,
  displaySuccessNotification,
} from "../../lib/utils";
import { Viewer } from "../../lib/types";

///Ảnh
import nkLogo from "./assets/nk-logo.png"
import googleLogo from "./assets/google_logo.jpg";

interface Props {
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const { Text, Title } = Typography;

export const Login = ({ setViewer }: Props) => {
  const client = useApolloClient();
  const [logInGoogle, { data: logInGoogleData, loading: logInGoogleLoading, error: logInGoogleError }] =
    useMutation<LogInGoogleData, LogInGoogleVariables>(LOG_IN_GOOGLE, {
      onCompleted: (data) => {
        if (data && data.logInGoogle && data.logInGoogle.token) {
          setViewer(data.logInGoogle);
          sessionStorage.setItem("token",data.logInGoogle.token);
          displaySuccessNotification("Bạn đã đăng nhập thành công!");
        }
      },
    });

  const logInGoogleRef = useRef(logInGoogle);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    

    if (code) {
      logInGoogleRef.current({
        variables: {
          input: { code },
        },
      });
    }

  }, []);

  

  const hanhdleAuthorizeGoogle = async () => {
    try {
      const { data } = await client.query<authUrlGoogle>({
        query: AUTH_URL_GOOGLE,
      });
      window.location.href = data.authUrlGoogle;
    } catch (error) {
      displayErrorNotification(
        "Xin lỗi! Chúng tôi đang có vấn đề. Hãy thử lại sau"
      );
    }
  };


  if (logInGoogleLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Đang đăng nhập..." />
      </Content>
    );
  }

  if (logInGoogleData && logInGoogleData.logInGoogle) {
    const { id: viewerId } = logInGoogleData.logInGoogle;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  const logInGoogleErrorBannerElement = logInGoogleError ? (
    <ErrorBanner description="Xin lỗi! Chúng tôi đang có vấn đề. Hãy thử lại sau" />
  ) : null;




  return (
    <Content className="log-in">
      {logInGoogleErrorBannerElement}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              <img src={nkLogo} alt="NK Logo" />
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Đăng nhập vào NKHouse!
          </Title>
          <Text>Đăng nhập để có thể bắt đầu đặt phòng!</Text>
        </div>
        <button
          className="log-in-card__google-button"
          onClick={hanhdleAuthorizeGoogle}
        >
          <img
            src={googleLogo}
            alt="Google Logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-text">
            Đăng nhập với Google!
          </span>
        </button>
        <Text type="secondary">
          Ghi chú: Bằng cách đăng nhập, bạn sẽ được chuyển hướng đến biểu mẫu
          đồng ý để đăng nhập bằng tài khoản của bạn.
        </Text>
      </Card>
    </Content>
  );
};
