import React , {useState} from "react";
import {
	Button,
	Card,
	DatePicker,
	Divider,
	Tooltip,
	Typography,
	Tag,
	Input,
	InputNumber,
	Icon,

} from "antd";
import moment, { Moment } from "moment";
import {
	displayErrorNotification,
	displaySuccessNotification,
	formatListingPrice,
} from "../../../../lib/utils";
import { Viewer } from "../../../../lib/types";
import { Listing as ListingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import { BookingsIndex } from "./types";
import {
	SaleListing as SaleListingdata,
	SaleListingVariables,
} from "../../../../lib/graphql/mutation/SaleListing/__generated__/SaleListing";
import { SALE_LISTING } from "../../../../lib/graphql/mutation/SaleListing";
import { useMutation } from "@apollo/react-hooks";

const { Paragraph, Title, Text } = Typography;
const {Search} = Input;

interface Props {
	viewer: Viewer;
  	id: string;
	host: ListingData["listing"]["host"];
	bookingsIndex: ListingData["listing"]["bookingsIndex"];
	price: number;
	salepercent: number;
	checkInDate: Moment | null;
	checkOutDate: Moment | null;
	setCheckInDate: (checkInDate: Moment | null) => void;
	setCheckOutDate: (checkOutDate: Moment | null) => void;
	setModalVisible: (modalVisible: boolean) => void;
}

export const ListingCreateBooking = ({
	viewer,
  	id,
	host,
	bookingsIndex,
	price,
	salepercent,
	checkInDate,
	checkOutDate,
	setCheckInDate,
	setCheckOutDate,
	setModalVisible,
}: Props) => {
  const [search, setSearch] = useState("");

	const [saleListing, { loading: SaleListingloading }] = useMutation<
		SaleListingdata,
		SaleListingVariables
	>(SALE_LISTING, {
		onCompleted: () => {
			displaySuccessNotification(
				"Bạn đã Sale Listing thành công !",
			);
		},
		onError: () => {
			displayErrorNotification(
				"Xin lỗi! Chúng tôi đã không thể đặt nhà/phòng thành công. Vui lòng thử lại sau!"
			);
		},
	});

  const handleSaleListing = (value: number) => {
    saleListing({
      variables: {
        id: id,
        salepercent: value
      }
    })
  }

	const bookingsIndexJSON: BookingsIndex = JSON.parse(bookingsIndex);

	const dateIsBooked = (currentDate: Moment) => {
		const year = moment(currentDate).year();
		const month = moment(currentDate).month();
		const day = moment(currentDate).date();

		if (bookingsIndexJSON[year] && bookingsIndexJSON[year][month]) {
			return Boolean(bookingsIndexJSON[year][month][day]);
		} else {
			return false;
		}
	};

	const disabledDate = (currentDate?: Moment) => {
		if (currentDate) {
			const dateIsBeforeEndOfDay = currentDate.isBefore(moment().endOf("day"));
			const dateIsMoreThanThreeMonthsAhead = moment(currentDate).isAfter(
				moment().endOf("day").add(90, "days")
			);

			return (
				dateIsBeforeEndOfDay ||
				dateIsMoreThanThreeMonthsAhead ||
				dateIsBooked(currentDate)
			);
		} else {
			return false;
		}
	};

	const verifyAndSetCheckOutDate = (selectedCheckOutDate: Moment | null) => {
		if (checkInDate && selectedCheckOutDate) {
			if (moment(selectedCheckOutDate).isBefore(checkInDate, "days")) {
				return displayErrorNotification(
					`Bạn không thể chọn ngày trả phòng trước ngày nhận phòng !`
				);
			}
		}

		let dateCursor = checkInDate;

		while (moment(dateCursor).isBefore(selectedCheckOutDate, "days")) {
			dateCursor = moment(dateCursor).add(1, "days");

			const year = moment(dateCursor).year();
			const month = moment(dateCursor).month();
			const day = moment(dateCursor).date();

			if (
				bookingsIndexJSON[year] &&
				bookingsIndexJSON[year][month] &&
				bookingsIndexJSON[year][month][day]
			) {
				return displayErrorNotification(
					"Bạn không thể đặt ngày trùng với các ngày đã được đặt chỗ . Vui lòng thử lại!"
				);
			}
		}

		setCheckOutDate(selectedCheckOutDate);
	};

	const viewerIsHost = viewer.id === host.id;
	const checkInInputDisabled = !viewer.id || viewerIsHost || !host.hasWallet;
	const checkOutInputDisabled = checkInInputDisabled || !checkInDate;
	const buttonDisabled = checkInInputDisabled || !checkInDate || !checkOutDate;
	const salepercentTag = salepercent ? (
		<Tag color="#108ee9">-{salepercent}%</Tag>
	) : null;

	const saleButton = viewerIsHost ? (
		<Search
		placeholder = {`${salepercent}`}
		enterButton = "Sale"
		suffix = {<Icon type="percentage" />}
		onSearch = {value => handleSaleListing(Number(value))}
		
	  />
	) : null;

	let buttonMessage = "Bạn vẫn chưa đặt chỗ được";

	if (!viewer.id) {
		buttonMessage = "Bạn phải đăng nhập vào để đặt chỗ";
	} else if (viewerIsHost) {
		buttonMessage = "Bạn không thể tự thuê nhà/phòng của mình";
	} else if (!host.hasWallet) {
		buttonMessage =
			"Người cho thuê nhà/phòng này đã ngắt kết nối Stripe nên không thể nhận thanh toán được!";
	}

	return (
		<div className="listing-booking">
			<Card className="listing-booking__card">
				<div>
					<Paragraph>
						{salepercentTag}
						<Title level={2} className="listing-booking__card-title">
							{formatListingPrice(price - price * (salepercent / 100))}
							<span>/ngày</span>
						</Title>
					</Paragraph>
					{saleButton}
					<Divider />
					<div className="listing-booking__card-date-picker">
						<Paragraph strong>Check In</Paragraph>
						<DatePicker
							value={checkInDate ? checkInDate : undefined}
							format={"YYYY/MM/DD"}
							showToday={false}
							disabled={checkInInputDisabled}
							disabledDate={disabledDate}
							onChange={(dateValue) => setCheckInDate(dateValue)}
							onOpenChange={() => setCheckOutDate(null)}
							renderExtraFooter={() => {
								return (
									<div>
										<Text type="secondary" className="ant-calendar-footer-text">
											Bạn chỉ có thể đặt một danh sách trong vòng 90 ngày kể từ
											hôm nay.
										</Text>
									</div>
								);
							}}
						/>
					</div>
					<div className="listing-booking__card-date-picker">
						<Paragraph strong>Check Out</Paragraph>
						<DatePicker
							value={checkOutDate ? checkOutDate : undefined}
							format={"YYYY/MM/DD"}
							showToday={false}
							disabled={checkOutInputDisabled}
							disabledDate={disabledDate}
							onChange={(dateValue) => verifyAndSetCheckOutDate(dateValue)}
							dateRender={(current) => {
								if (
									moment(current).isSame(
										checkInDate ? checkInDate : undefined,
										"day"
									)
								) {
									return (
										<Tooltip title="Check in date">
											<div className="ant-calendar-date ant-calendar-date__check-in">
												{current.date()}
											</div>
										</Tooltip>
									);
								} else {
									return (
										<div className="ant-calendar-date">{current.date()}</div>
									);
								}
							}}
							renderExtraFooter={() => {
								return (
									<div>
										<Text type="secondary" className="ant-calendar-footer-text">
											Không thể trả phòng trước khi nhận phòng.
										</Text>
									</div>
								);
							}}
						/>
					</div>
				</div>
				<Divider />
				<Button
					disabled={buttonDisabled}
					size="large"
					type="primary"
					className="listing-booking__card-cta"
					onClick={() => setModalVisible(true)}
				>
					Đặt chỗ!
				</Button>
				<Text type="secondary" mark>
					{buttonMessage}
				</Text>
			</Card>
		</div>
	);
};
