import { useQuery } from '@apollo/react-hooks';
import { Avatar, Button, Col, Icon, Layout, List, Menu, Result, Row, Statistic, Tabs, Typography } from 'antd';
import 'antd/dist/antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingsFilter } from '../../../lib/graphql/globalTypes';
import { LISTINGS } from '../../../lib/graphql/queries';
import { BOOKINGS } from '../../../lib/graphql/queries/Bookings';
import { Bookings as BookingsData, BookingsVariables } from '../../../lib/graphql/queries/Bookings/__generated__/Bookings';
import { Listings as ListingsData, ListingsVariables } from '../../../lib/graphql/queries/Listings/__generated__/Listings';
import { USERS } from '../../../lib/graphql/queries/Users';
import { Users as UsersData, UsersVariables } from '../../../lib/graphql/queries/Users/__generated__/Users';
import { Viewer } from '../../../lib/types';
import { formatListingPrice } from '../../../lib/utils';
import { Slider } from '../components';



// import Axios from "axios";




interface Props {
	viewer: Viewer;
}

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { SubMenu } = Menu;

const PAGE_LIMIT = 100000;

const IconText = ({ type, text }: any) => (
	<span>
		<Icon type={type} style={{ marginRight: 8 }} />
		{text}
	</span>
);

export const Dashboard = ({ viewer }: Props) => {
	const [collapsed, setCollapsed] = useState(false);
	const [page, setPage] = useState(1);

	const { data: Usersdata } = useQuery<
		UsersData,
		UsersVariables
	>(USERS, {
		variables: {
			limit: PAGE_LIMIT,
			page,
		},
	});

	const { data: Bookingsdata } = useQuery<
		BookingsData,
		BookingsVariables
	>(BOOKINGS, {
		variables: {
			limit: PAGE_LIMIT,
			page,
		},
	});

	const { data: Listingsdata } = useQuery<
		ListingsData,
		ListingsVariables
	>(LISTINGS, {
		variables: {
			filter: ListingsFilter.PRICE_HIGH_TO_LOW,
			limit: PAGE_LIMIT,
			page,
		},
	});

	const users = Usersdata ? Usersdata.users : null;
	const listings = Listingsdata ? Listingsdata.listings : null;
	const bookings = Bookingsdata ? Bookingsdata.bookings : null;

	useEffect(() => {
		console.log(users);
		console.log(listings);
		console.log(bookings);
	});

	const CardlistingsElement =
		listings && listings.result.length ? (
			<Col span={12}>
				<Statistic title="Active Listings" value={listings.total} />
			</Col>
		) : null;
	const CardusersElement =
		users && users.result.length ? (
			<Col span={12}>
				<Statistic title="Active Users" value={users.total} />
			</Col>
		) : null;
	const CardbookingsElement =
		bookings && bookings.result.length ? (
			<Col span={12}>
				<Statistic title="Total Bookings" value={bookings.total} />
			</Col>
		) : null;

	const sliderElement = <Slider viewer={viewer} />;

	const listingsSectionElement =
		listings && listings.result.length ? (
			<div className="table">
				<List
					header={
						<div>
							<h2>Top Listings</h2>
						</div>
					}
					itemLayout="vertical"
					size="large"
					pagination={{
						onChange: (page) => {
							console.log(page);
						},
						pageSize: 3,
					}}
					dataSource={listings.result}
					footer={
						<div>
							<b>ant design</b> footer part
						</div>
					}
					renderItem={(item) => (
						<List.Item
							key={item.title}
							actions={[
								<IconText
									type="star-o"
									text={item.rating}
									key="list-vertical-star-o"
								/>,
								<IconText
									type="user"
									text={item.numOfGuests}
									key="list-vertical-user"
								/>,
								<IconText
									type="home"
									text={item.address}
									key="list-vertical-user"
								/>,
							]}
							extra={<img width={272} alt="image" src={item.image} />}
						>
							<List.Item.Meta
								avatar={<Avatar src={item.host.avatar} />}
								title={<a href={`/listing/${item.id}`}>{item.title}</a>}
								description={formatListingPrice(item.price)}
							/>
							{item.description}
						</List.Item>
					)}
				/>
			</div>
		) : null;

	const usersSectionElement =
		users && users.result.length ? (
			<div className="table">
				<List
					header={
						<div>
							<h2>Top Users</h2>
						</div>
					}
					itemLayout="horizontal"
					dataSource={users.result}
					renderItem={(item) => (
						<List.Item>
							<List.Item.Meta
								avatar={<Avatar src={item.avatar} />}
								title={<a href={`/user/${item.id}`}>{item.name}</a>}
								description={item.contact}
							/>
							<div>{item.isadmin ? "ADMIN" : item.isreviewer ? "REVIEWER" : "USER"}</div>
						</List.Item>
						
					)}
				/>
				,
			</div>
		) : null;

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
					{" "}
					<div className="table">
						<Row gutter={16}>
							{CardlistingsElement}
							{CardbookingsElement}
							{CardusersElement}
						</Row>
					</div>
					{listingsSectionElement}
					{usersSectionElement}
			</Layout>
		</Layout>
	);
};
