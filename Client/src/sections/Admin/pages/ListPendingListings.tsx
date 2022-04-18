import React, { useState, FormEvent, useEffect } from "react";
// import Axios from "axios";
import { Link, Redirect } from "react-router-dom";
import {
  Form,
  Layout,
  Typography,
  Icon,
  Menu,
  Row,
  Col,
  Card,
  Tabs,
  Table,
  Radio,
  Input,
  Button,
  Popconfirm,
  Modal,
  Upload,
  InputNumber,
  Divider,
  Drawer,
  Result,
} from "antd";

import "antd/dist/antd";
import {
  PendingListingsVariables,
  PendingListings as PendingListingsData,
} from "../../../lib/graphql/queries/PendingListings/__generated__/PendingListings";
import {
  ListingsFilter,
  ListingType,
  PendingListingsFilter,
} from "../../../lib/graphql/globalTypes";
import { Viewer } from "../../../lib/types";
import { Slider, WrappedAddListingForm as AddListingForm } from "../components";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { LISTINGS, PENDINGLISTINGS } from "../../../lib/graphql/queries";
import {
  displayErrorNotification,
  displaySuccessNotification,
  iconColor,
} from "../../../lib/utils";
import {
  DeleteListing as DeleteListingData,
  DeleteListingVariables,
} from "../../../lib/graphql/mutation/DeleteListing/__generated__/DeleteListing";
import {
  HostListingFromPending as HostListingFromPendingData,
  HostListingFromPendingVariables,
} from "../../../lib/graphql/mutation/HostListingFromPending/__generated__/HostListingFromPending";
import {
  HOST_LISTING_FROM_PENDING
} from "../../../lib/graphql/mutation/HostListingFromPending";
import {
  DELETE_LISTING,
  DELETE_PENDINGLISTING,
  HOST_LISTING,
  UPDATE_LISTING,
} from "../../../lib/graphql/mutation";
import { UploadChangeParam } from "antd/lib/upload";
import { FormComponentProps } from "antd/lib/form";
import {
  UpdateListing as UpdateListingData,
  UpdateListingVariables,
} from "../../../lib/graphql/mutation/UpdateListing/__generated__/UpdateListing";
import {
  DeletePendingListingVariables,
  DeletePendingListing as DeletePendingListingData,
} from "../../../lib/graphql/mutation/DeletePendingListing/__generated__/DeletePendingListing";
import {
  SendEmailVariables,
  SendEmail as SendEmailData,
} from "../../../lib/graphql/mutation/SendEmail/__generated__/SendEmail";
import { SEND_EMAIL } from "../../../lib/graphql/mutation/SendEmail";

interface Props {
  viewer: Viewer;
}

const { Footer, Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Search } = Input;
const { Item } = Form;

const PAGE_LIMIT = 100000;

export const ListPendingListings = ({
  viewer,
  form,
}: Props & FormComponentProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
  const [page, setPage] = useState(1);
  const [modalvisible, setmodalvisible] = useState(false);
  const [drawervisible, setdrawervisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any>();
  const [updatelistingid, setUpdateListingId] = useState("");
  const [recordRow, setRecordRow] = useState<any>();
  const [tabledata, setTableData] = useState<any>();

  const showModal = () => {
    setmodalvisible(true);
  };

  const { data } = useQuery<
    PendingListingsData,
    PendingListingsVariables
  >(PENDINGLISTINGS, {
    variables: {
      filter: PendingListingsFilter.PRICE_LOW_TO_HIGH,
      limit: PAGE_LIMIT,
      page,
    },
  });

  const [
    hostListingFromPending,
    { data: HostListingFromPendingdata },
  ] = useMutation<HostListingFromPendingData, HostListingFromPendingVariables>(HOST_LISTING_FROM_PENDING, {
    onCompleted: () => {
      displaySuccessNotification(
        "Bạn đã tạo danh sách cho thuê nhà/phòng thành công!"
      );
    },
    onError: () => {
      displayErrorNotification(
        "Xin lỗi ! hiện chúng tôi không thể giúp bạn tạo danh sách nhà/phòng. Xin hãy thử lại sau"
      );
    },
  });

  const [
    updateListing,
  ] = useMutation<UpdateListingData, UpdateListingVariables>(UPDATE_LISTING, {
    onCompleted: () => {
      displaySuccessNotification(
        "Bạn đã update danh sách cho thuê nhà/phòng thành công!"
      );
    },
    onError: () => {
      displayErrorNotification(
        "Xin lỗi ! hiện chúng tôi không thể giúp bạn update danh sách nhà/phòng. Xin hãy thử lại sau"
      );
    },
  });

  const [
    deletePendingListing,
  ] = useMutation<DeletePendingListingData, DeletePendingListingVariables>(
    DELETE_PENDINGLISTING,
    {
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
    }
  );

  const [
    sendEmail,
    { data: SendEmaildata },
  ] = useMutation<SendEmailData, SendEmailVariables>(SEND_EMAIL);

  const listings = data ? data.pendinglistings : null;

  const handleHostListing = (values: any) => {
    const input = {
      title: values.title,
      description: values.description,
      type: values.type,
      numOfGuests: values.numOfGuests,
      address: values.address,
      image: values.image,
      price: values.price,
    };

    hostListingFromPending({
      variables: {
        id:values.id,
        input,
      },
    });

    sendEmail({
      variables: {
        id:values.id,
        subject: "Thông báo chấp nhận cho thuê",
        mess:
          "Bạn nhận được email này vì chúng tôi đã chấp nhận danh sách nhà/phòng cho thuê của bạn !",
      },
    });

    deletePendingListing({
      variables: {
        id: values.id,
      },
    });
  };

  const handleDeletePendingListing = (id: string) => {
    deletePendingListing({ variables: { id } });
    sendEmail({
      variables: {
        id:id,
        subject: "Thông báo từ chối cho thuê",
        mess:
          "Bạn nhận được email này vì chúng tôi đã từ chối danh sách nhà/phòng cho thuê của bạn vì lí do không đúng quy định",
      },
    });
  };

  if (SendEmaildata){
    console.log("Gửi mail thành công!");
  }

  const handleSearch = (shareKey: any, data: any) => {
    setTableData(
      data.filter((datarow: any) =>
        JSON.stringify(datarow)
          .toLocaleLowerCase()
          .includes(shareKey.toLocaleLowerCase())
      )
    );
    console.log(tabledata);
    console.log(shareKey);
  };

	useEffect(() => {
      console.log(viewer)
  }, []);

  const tablecolumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Num Of Guests",
      dataIndex: "numOfGuests",
      key: "numOfGuests",
      sorter: (a: any, b: any) => a.numOfGuests - b.numOfGuests,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Price",
      key: "price",
      dataIndex: "price",
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text: any, record: any) => (
        <span>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDeletePendingListing(record.id)}
          >
            <a>Delete</a>
          </Popconfirm>
          <Divider type="vertical" />
          <Popconfirm
            title="Sure to edit?"
            onConfirm={() => handleHostListing(record)}
          >
            <a>Add</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  const { getFieldDecorator } = form;

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRow(selectedRows);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };

  const CardlistingsElement =
    listings && listings.result.length ? (
      <div className="table">
        <Row gutter={16}>
          <Col span={8} style={{ alignItems: "center" }}>
            <Card title="Total Listings" bordered={false}>
              <Text strong>{listings.total}</Text>
            </Card>
          </Col>
        </Row>
      </div>
    ) : null;

  const sliderElement = <Slider viewer={viewer} />;

  const listingsSectionElement =
    listings && listings.result.length ? (
      <div className="table">
        {" "}
        <Button
          type="primary"
          onClick={showModal}
          className="user-profile__details-cta"
          style={{ marginBottom: 16 }}
        >
          <Icon type="plus" />
          New Listing
        </Button>
        <Divider type="vertical" />
        <Button
          type="primary"
          //   onClick={() => {
          //     selectedRow
          //       ? handleDeletePendingListing(selectedRow.id)
          //       : console.log("Choose a row");
          //   }}
          style={{ marginBottom: 16, paddingLeft: 10 }}
        >
          Delete Listings
        </Button>
        <Search
          placeholder="Tìm VietNam"
          enterButton
          style={{ width: "40%", paddingLeft: 10 }}
          onChange={(e) => {
            handleSearch(e.target.value, listings.result);
          }}
          defaultValue=" "
          allowClear={true}
        />
      </div>
    ) : null;

  if (HostListingFromPendingdata && HostListingFromPendingdata.hostListingFromPending) {
    return <Redirect to={`/listing/${HostListingFromPendingdata.hostListingFromPending.id}`} />;
  }

  if (!viewer.isadmin && !viewer.isreviewer) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Link to="/login">
            <Button type="primary">Go to Login</Button>
          </Link>
        }
      />
    );
  }

  if (viewer.isreviewer) {
    return (
      <Layout>
        <div className="table">
          {CardlistingsElement}
          {listingsSectionElement}
          <Table
            rowSelection={rowSelection}
            columns={tablecolumns}
            dataSource={tabledata}
            style={{ paddingTop: "5px" }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {sliderElement}
      <Layout>
        <div className="table">
          {CardlistingsElement}
          {listingsSectionElement}
          <Table
            rowSelection={rowSelection}
            columns={tablecolumns}
            dataSource={tabledata}
            style={{ paddingTop: "5px" }}
          />
        </div>
      </Layout>
    </Layout>
  );
};

export const WrappedListPendingListings = Form.create<
  Props & FormComponentProps
>({
  name: "pendinglistlistings_form",
})(ListPendingListings);
