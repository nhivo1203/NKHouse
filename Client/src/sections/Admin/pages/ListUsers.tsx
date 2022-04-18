import 'antd/dist/antd';

import { useMutation, useQuery } from '@apollo/react-hooks';
import { Button, Divider, Input, Layout, Menu, Popconfirm, Result, Table, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ADD_ADMIN } from '../../../lib/graphql/mutation/AddAdmin';
import { AddAdmin as AddAdminData, AddAdminVariables } from '../../../lib/graphql/mutation/AddAdmin/__generated__/AddAdmin';
import { ADD_REVIEWER } from '../../../lib/graphql/mutation/AddReviewer';
import {
    AddReviewer as AddReviewerData,
    AddReviewerVariables,
} from '../../../lib/graphql/mutation/AddReviewer/__generated__/AddReviewer';
import { DELETE_USER } from '../../../lib/graphql/mutation/DeleteUser';
import {
    DeleteUser as DeleteUserData,
    DeleteUserVariables,
} from '../../../lib/graphql/mutation/DeleteUser/__generated__/DeleteUser';
import { USERS } from '../../../lib/graphql/queries/Users';
import { Users as UsersData, UsersVariables } from '../../../lib/graphql/queries/Users/__generated__/Users';
import { Viewer } from '../../../lib/types';
import { displayErrorNotification, displaySuccessNotification } from '../../../lib/utils';
import { Slider } from '../components';

// import Axios from "axios";

interface Props {
	viewer: Viewer;
}

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Search } = Input;

const PAGE_LIMIT = 100000;

export const ListUsers = ({ viewer }: Props) => {
	const [collapsed, setCollapsed] = useState(false);
	const [page, setPage] = useState(1);
	const [tabledata, setTableData] = useState<any>();


	const { loading, data } = useQuery<UsersData, UsersVariables>(USERS, {
		variables: {
			limit: PAGE_LIMIT,
			page,
		},
	});

	const [
		addAdmin,
		{ loading: AddAdminloading, data: AddAdmindata },
	] = useMutation<AddAdminData, AddAdminVariables>(ADD_ADMIN, {
		onCompleted: () => {
			displaySuccessNotification("Bạn đã thay đổi quyền admin thành công!");
		},
		onError: () => {
			displayErrorNotification(
				"Xin lỗi ! hiện chúng tôi không thể giúp bạn thay đổi quyền admin. Xin hãy thử lại sau"
			);
		},
	});

	const [
		addReviewer,
		{ loading: AddReviewerloading, data: AddReviewerdata },
	] = useMutation<AddReviewerData, AddReviewerVariables>(ADD_REVIEWER, {
		onCompleted: () => {
			displaySuccessNotification("Bạn đã thay đổi quyền reviewer thành công!");
		},
		onError: () => {
			displayErrorNotification(
				"Xin lỗi ! hiện chúng tôi không thể giúp bạn thay đổi quyền reviewer. Xin hãy thử lại sau"
			);
		},
	});

	const [
		deleteUser,
		{ loading: DeleteUserloading, data: DeleteUserdata },
	] = useMutation<DeleteUserData, DeleteUserVariables>(DELETE_USER, {
		onCompleted: () => {
			displaySuccessNotification("Bạn đã xóa user  thành công!");
		},
		onError: () => {
			displayErrorNotification(
				"Xin lỗi ! hiện chúng tôi không thể giúp bạn xóa user. Xin hãy thử lại sau"
			);
		},
	});

	const handleAddAdmin = async (id: string) => {
		await addAdmin({ variables: { id } });
	};

	const handleAddReviewer = async (id: string) => {
		await addReviewer({ variables: { id } });
	};

	const handleDeleteUser = async (id: string) => {
		await deleteUser({ variables: { id } });
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
			title: "User Name",
			dataIndex: "name",
			key: "name",
			sorter: (a: any, b: any) => a.username.localeCompare(b.username),
		},
		{
			title: "Contact",
			dataIndex: "contact",
			key: "contact",
		},
		{
			title: "Income",
			key: "income",
			dataIndex: "income",
			sorter: (a: any, b: any) => a.income - b.income,
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (text: any, record: any) => (
				<span>
					<Popconfirm
						title="Sure to delete?"
						onConfirm={() => handleDeleteUser(record.id)}
					>
						<a>Delete</a>
					</Popconfirm>
					<Divider type="vertical" />
					<Popconfirm
						title="Sure to change?"
						onConfirm={() => handleAddAdmin(record.id)}
					>
						<a>{record.isadmin ? "Remove Admin" : "Add Admin"}</a>
					</Popconfirm>
					<Divider type="vertical" />
					<Popconfirm
						title="Sure to change?"
						onConfirm={() => handleAddReviewer(record.id)}
					>
						<a>{record.isreviewer ? "Remove Reviewer" : "Add Reviewer"}</a>
					</Popconfirm>
				</span>
			),
		},
	];

	const users = data ? data.users : null;

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



	const sliderElement = <Slider viewer={viewer} />;

	const usersSectionElement =
		users && users.result.length ? (
			<div className="table">
				<Search
						placeholder="Tìm VietNam"
						enterButton
						style={{ width: "100%" }}
						onChange={(e) => {
							handleSearch(e.target.value, users.result);
						}}
						defaultValue=" "
						allowClear={true}
					/>
				<Table
					rowSelection={rowSelection}
					columns={tablecolumns}
					dataSource={tabledata}
					style={{ paddingTop: "10px" }}
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
				<div className="table">
					{usersSectionElement}
				</div>
			</Layout>
		</Layout>
	);
};
