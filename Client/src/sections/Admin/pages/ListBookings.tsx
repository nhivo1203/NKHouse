import React, { useState, useEffect } from "react";
// import Axios from "axios";
import {
	Layout,
	Typography,
	Menu,
	Tabs,
	Table,
	Input,
	Result,
	Button,
	Popconfirm
} from "antd";

import "antd/dist/antd";
import { Bookings as BookingsData, BookingsVariables } from "../../../lib/graphql/queries/Bookings/__generated__/Bookings";
import { ListingsFilter } from "../../../lib/graphql/globalTypes";
import { Viewer } from "../../../lib/types";
import { Slider } from "../components";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { HomeListings, HomeListingsSkeleton } from "../../Home/components";
import { BOOKINGS } from "../../../lib/graphql/queries/Bookings";
import { Link } from "react-router-dom";

import {DELETE_BOOKING} from "../../../lib/graphql/mutation/DeleteBooking"
import {DeleteBooking as DeleteBookingData, DeleteBookingVariables} from "../../../lib/graphql/mutation/DeleteBooking/__generated__/DeleteBooking"
import { displayErrorNotification, displaySuccessNotification } from "../../../lib/utils";

interface Props {
	viewer: Viewer;
}

const { Footer} = Layout;
const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Search } = Input;

const PAGE_LIMIT = 100000;



export const ListBookings = ({
	viewer,
}: Props ) => {
	const [collapsed, setCollapsed] = useState(false);

	const [page, setPage] = useState(1);

	const [tabledata, setTableData] = useState<any>();


	const { loading, data } = useQuery<BookingsData, BookingsVariables>(
		BOOKINGS,
		{
			variables: {
				limit: PAGE_LIMIT,
				page,
			},
		}
	);

	const [
		deleteBooking,
		{ loading: DeleteBookingloading, data: DeleteBookingdata },
	] = useMutation<DeleteBookingData, DeleteBookingVariables>(DELETE_BOOKING, {
		onCompleted: () => {
			displaySuccessNotification(
				"Bạn đã xóa danh sách cho book nhà/phòng thành công!"
			);
		},
		onError: () => {
			displayErrorNotification(
				"Xin lỗi ! hiện chúng tôi không thể giúp bạn xóa book danh sách nhà/phòng. Xin hãy thử lại sau"
			);
		},
	});
	
	const handleDeleteBooking = async (id: string) => {
		await deleteBooking({ variables: { id } });
	};

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
	
	const tablecolumns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "Check In Day",
			dataIndex: "checkIn",
			key: "checkIn",
		},
		{
			title: "Check Out Day",
			dataIndex: "checkOut",
			key: "checkOut",
		},
		{
			title: "Listing",
			dataIndex: "listing.title",
			key: "listing.title",
		},
		{
			title: "Tenant",
			key: "tenant.name",
			dataIndex: "tenant.name",
		},
		{
			title: "Total Price",
			key: "total",
			dataIndex: "total",
			sorter: (a: any, b: any) => a.total - b.total,
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (text: any, record: any) => (
				<span>
					<Popconfirm
						title="Sure to delete?"
						onConfirm={() => handleDeleteBooking(record.id)}
					>
						<a>Delete</a>
					</Popconfirm>
				</span>
			),
		},
	];

	if (loading) {
		console.log("loading");
	}

	const bookings = data ? data.bookings : null;


	useEffect(() => {
		console.log(data);
	});

	// rowSelection object indicates the need for row selection
	const rowSelection = {
		onChange: (selectedRowKeys: any, selectedRows: any) => {
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

	const bookingsSectionElement = bookings && bookings.result.length ? (
		<div>
		<Search
						placeholder="Tìm VietNam"
						enterButton
						style={{ width: "100%" }}
						onChange={(e) => {
							handleSearch(e.target.value, bookings.result);
						}}
						defaultValue=" "
						allowClear={true}
					/>
        <Table
			rowSelection={rowSelection}
			columns={tablecolumns}
          	dataSource={tabledata}
		  	style={{paddingTop: "10px"}}
        />
      </div>
		):null

	const sliderElement = <Slider viewer={viewer} />;
	
	if (!viewer.isadmin) {
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

	return (
		<Layout style={{ minHeight: "100vh" }}>
			{sliderElement}
			<Layout>
				<div className="table">
				{bookingsSectionElement}
				</div>
			</Layout>
		</Layout>
	);
};
