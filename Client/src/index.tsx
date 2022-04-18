import React, { useState, useEffect, useRef } from "react";
import { render } from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider, useMutation } from "@apollo/react-hooks";
import { Affix, Layout, Spin } from "antd";
import { StripeProvider, Elements } from "react-stripe-elements";
import {
  AppHeader,
  Home,
  WrappedHost as Host,
  WrappedUpdate as Update,
  Listing,
  Listings,
  NotFound,
  User,
  Login,
  Stripe,
} from "./sections";
import { AppHeaderSkeleton, ErrorBanner } from "./lib/components";
import { LOG_IN_GOOGLE } from "./lib/graphql/mutation";
import {
  LogInGoogle as LogInGoogleData,
  LogInGoogleVariables,
} from "./lib/graphql/mutation/LogIn/__generated__/LogInGoogle";
import * as serviceWorker from "./serviceWorker";
import { Viewer } from "./lib/types";
import "./styles/index.css";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import {
  ListUsers,
  WrappedListListings as ListListings,
  Dashboard,
  ListBookings,
  WrappedListPendingListings as ListPendingListings,
} from "./sections/Admin/pages";
import "tailwindcss/dist/tailwind.min.css";
import { Provider } from "react-redux";
import initStore from "./sections/Meet/store";
import { StylesProvider } from "@material-ui/core";
import SnackbarProvider from "react-simple-snackbar";
import MeetingPage from "./sections/Meet/pages/Meeting";
import HomePage from "./sections/Meet/pages/Home";


const client = new ApolloClient({
  uri: "/api",
  request: async (operation) => {
    const token = sessionStorage.getItem("token");
    operation.setContext({
      headers: {
        "X-CSRF-TOKEN": token || "",
      },
    });
  },
});

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
  isadmin: null,
  isreviewer: null,
};

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  const [logInGoogle, { error }] = useMutation<
    LogInGoogleData,
    LogInGoogleVariables
  >(LOG_IN_GOOGLE, {
    onCompleted: (data) => {
      if (data && data.logInGoogle) {
        setViewer(data.logInGoogle);

        if (data.logInGoogle.token) {
          sessionStorage.setItem("token", data.logInGoogle.token);
        } else {
          sessionStorage.removeItem("token");
        }
      }
    },
  });

  const logInGoogleRef = useRef(logInGoogle);

  useEffect(() => {
    logInGoogleRef.current();
  }, []);

  if (!viewer.didRequest && !error) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Đang khởi động NKHouse" />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement = error ? (
    <ErrorBanner description="chúng tôi không thể xác minh nếu bạn đã đăng nhập. Làm ơn thử lại sau!" />
  ) : null;

  return (
    <StripeProvider apiKey={process.env.REACT_APP_S_PUBLISHABLE_KEY as string}>
      <Router>
        <Layout id="app">
          {logInErrorBannerElement}
          <Affix offsetTop={0} className="app__affix-header">
            <AppHeader viewer={viewer} setViewer={setViewer} />
          </Affix>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route
              exact
              path="/admin"
              render={(props) => <Dashboard {...props} viewer={viewer} />}
            />
            <Route
              exact
              path="/admin/users"
              render={(props) => <ListUsers {...props} viewer={viewer} />}
            />
            <Route
              exact
              path="/admin/listings"
              render={(props) => <ListListings {...props} viewer={viewer} />}
            />
            <Route
              exact
              path="/admin/pendinglistings"
              render={(props) => (
                <ListPendingListings {...props} viewer={viewer} />
              )}
            />
            <Route
              exact
              path="/admin/bookings"
              render={(props) => <ListBookings {...props} viewer={viewer} />}
            />

            <Route
              exact
              path="/host"
              render={(props) => <Host {...props} viewer={viewer} />}
            />
            <Route
              exact
              path="/update/:id"
              render={(props) => <Update {...props} viewer={viewer} />}
            />
            <Route
              exact
              path="/listing/:id"
              render={(props) => (
                <Elements>
                  <Listing {...props} viewer={viewer} />
                </Elements>
              )}
            />
            <Route exact path="/listings/:location?" component={Listings} />
            <Route
              exact
              path="/login"
              render={(props) => <Login {...props} setViewer={setViewer} />}
            />
            <Route
              exact
              path="/stripe"
              render={(props) => (
                <Stripe {...props} viewer={viewer} setViewer={setViewer} />
              )}
            />
            <Route
              exact
              path="/user/:id"
              render={(props) => (
                <User {...props} viewer={viewer} setViewer={setViewer} />
              )}
            />
            <Route exact path="/meeting/:id" component={MeetingPage} />
            <Route exact path="/meet" component={HomePage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Router>
    </StripeProvider>
  );
};

const store = initStore();

render(
  <ApolloProvider client={client}>
    <StylesProvider injectFirst>
      <SnackbarProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </SnackbarProvider>
    </StylesProvider>
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
