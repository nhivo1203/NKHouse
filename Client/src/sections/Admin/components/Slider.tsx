import React, { useState } from "react";
// import Axios from "axios";
import { Link } from "react-router-dom";
import {
	Layout,
	Typography,
	Icon,
	Menu,
	Tabs,
	Result,
	Button,
} from "antd";

import "antd/dist/antd";
import { Viewer } from "../../../lib/types";

interface Props {
	viewer: Viewer;
}

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { SubMenu } = Menu;

export const Slider = ({ viewer }: Props) => {
	const [collapsed, setCollapsed] = useState(false);

	const onCollapse = () => {
		console.log(collapsed);
		setCollapsed(!collapsed);
	};

	if (!viewer.id || !viewer.isadmin) {
		return (
			<Result
				status="403"
				title="403"
				subTitle="Sorry, you are not authorized to access this page."
				extra={<Button type="primary">Go to Login</Button>}
			/>
		);
	}

	return (
		<Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
			<div className="logo" />
			<Menu theme="dark" mode="inline">
				<Menu.Item key="1">
					<Link to="/admin">
						<Icon type="pie-chart" />
						<span> Dashboard </span>
					</Link>
				</Menu.Item>
				<SubMenu
					key="sub1"
					title={
						<span>
							<Icon type="user" />
							<span>List</span>
						</span>
					}
				>
					<Menu.Item key="2">
						<Link to="/admin/users">Users</Link>
					</Menu.Item>
					<Menu.Item key="3">
						<Link to="/admin/listings">Listings</Link>
					</Menu.Item>
					<Menu.Item key="4">
						<Link to="/admin/bookings">Bookings</Link>
					</Menu.Item>
					<Menu.Item key="5">
						<Link to="/admin/pendinglistings">Pending Listings</Link>
					</Menu.Item>
				</SubMenu>
			</Menu>
		</Sider>
	);
};
