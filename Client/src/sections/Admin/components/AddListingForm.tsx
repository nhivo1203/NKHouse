import React, { useState } from "react";
// import Axios from "axios";
import { Link } from "react-router-dom";
import { Layout, Typography, Icon, Menu, Tabs, Result, Button,Form,Input, Radio, InputNumber, Upload } from "antd";
import { FormComponentProps } from "antd/lib/form";
import { ListingType } from "../../../lib/graphql/globalTypes";
import { displayErrorNotification, iconColor } from "../../../lib/utils";
import { UploadChangeParam } from "antd/lib/upload";



const { Footer, Content } = Layout;
const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Search } = Input;
const { Item } = Form;




export const AddListingForm = ({form}:FormComponentProps) => {
    const [imageLoading, setImageLoading] = useState(false);
    const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);

    const { getFieldDecorator } = form;

    const beforeImageUpload = (file: File) => {
		const fileIsValidImage =
			file.type === "image/jpeg" || file.type === "image/png";
		const fileIsValidSize = file.size / 1024 / 1024 < 1;

		if (!fileIsValidImage) {
			displayErrorNotification("Bạn chỉ có thể tải lên các tệp JPG hoặc PNG!");
			return false;
		}

		if (!fileIsValidSize) {
			displayErrorNotification(
				"Bạn chỉ có thể tải lên các tệp hình ảnh có kích thước dưới 1MB!"
			);
			return false;
		}

		return fileIsValidImage && fileIsValidSize;
	};

    const handleImageUpload = (info: UploadChangeParam) => {
		const { file } = info;

		if (file.status === "uploading") {
			setImageLoading(true);
			return;
		}

		if (file.status === "done" && file.originFileObj) {
			getBase64Value(file.originFileObj, (imageBase64Value) => {
				setImageBase64Value(imageBase64Value);
				setImageLoading(false);
			});
		}
	};

	const getBase64Value = (
		img: File | Blob,
		callback: (imageBase64Value: string) => void
	) => {
		const reader = new FileReader();
		reader.readAsDataURL(img);
		reader.onload = () => {
			callback(reader.result as string);
		};
	};

	return (
		<div>
			<Content className="host-content">
				<Form layout="vertical">
					<Item label="Loại Nhà/Phòng">
						{getFieldDecorator("type", {
							rules: [
								{
									required: true,
									message: "Xin hãy chọn loại nhà/phòng!",
								},
							],
						})(
							<Radio.Group>
								<Radio.Button value={ListingType.APARTMENT}>
									<Icon type="bank" style={{ color: iconColor }} />{" "}
									<span>Chung cư</span>
								</Radio.Button>
								<Radio.Button value={ListingType.HOUSE}>
									<Icon type="home" style={{ color: iconColor }} />{" "}
									<span>Nhà</span>
								</Radio.Button>
							</Radio.Group>
						)}
					</Item>

					<Item label="Số khách tối đa">
						{getFieldDecorator("numOfGuests", {
							rules: [
								{
									required: true,
									message: "Xin hãy nhập số khách tối đa của nhà/phòng !",
								},
							],
						})(<InputNumber min={1} placeholder="4" />)}
					</Item>

					<Item label="Tiêu Đề" extra="Số ký tự tối đa là 45">
						{getFieldDecorator("title", {
							rules: [
								{
									required: true,
									message: "Xin hãy điền tiêu đề cho nhà/phòng của bạn!",
								},
							],
						})(
							<Input
								maxLength={45}
								placeholder="Vung Tau Melody,Seaview Apartment"
							/>
						)}
					</Item>

					<Item label="Miêu tả về nhà/phòng" extra="Số ký tự tối đa là 400">
						{getFieldDecorator("description", {
							rules: [
								{
									required: true,
									message: "Xin hãy điền miêu tả cho nhà/phòng của bạn!",
								},
							],
						})(
							<Input.TextArea
								rows={3}
								maxLength={400}
								placeholder="Căn phòng trọ này nằm trên tầng 24, block A của Vũng Tàu Melody, là một trong những vị trí đẹp gần biển ở trung tâm TP Vũng Tàu.This apartment room is located on the 24th floor, block A of Vung Tau Melody, which is one of the beautiful locations near the beach in the center of Vung Tau City."
							/>
						)}
					</Item>

					<Item label="Địa chỉ">
						{getFieldDecorator("address", {
							rules: [
								{
									required: true,
									message: "Xin hãy điền địa chỉ nhà/phòng của bạn!",
								},
							],
						})(<Input placeholder="Thành phố Vũng Tàu" />)}
					</Item>

					<Item label="Thành Phố/Xã">
						{getFieldDecorator("city", {
							rules: [
								{
									required: true,
									message:
										"Xin hãy điền tên thành phố (khu vực) của nhà/phòng của bạn!",
								},
							],
						})(<Input placeholder="Bà Rịa - Vũng Tàu" />)}
					</Item>

					<Item label="Tỉnh">
						{getFieldDecorator("state", {
							rules: [
								{
									required: true,
									message: "Xin hãy điền tên Tỉnh của nhà/phòng của bạn!",
								},
							],
						})(<Input placeholder="Vũng Tàu" />)}
					</Item>

					<Item label="Mã Zip/Bưu Điện">
						{getFieldDecorator("postalCode", {
							rules: [
								{
									required: true,
									message:
										"Xin hãy điền mã zip (hoặc mã bưu điện) của nhà/phòng bạn!",
								},
							],
						})(
							<Input placeholder="Vui lòng nhập mã Zip cho nhà/phòng của bạn!" />
						)}
					</Item>

					<Item
						label="Hình Ảnh"
						extra="Hình ảnh phải có kích thước dưới 1MB và thuộc loại JPG hoặc PNG"
					>
						<div className="host__form-image-upload">
							{getFieldDecorator("image", {
								rules: [
									{
										required: true,
										message: "Xin hãy cung cấp hình ảnh cho nhà/phòng của bạn",
									},
								],
							})(
								<Upload
									name="image"
									listType="picture-card"
									action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
									showUploadList={false}
									beforeUpload={beforeImageUpload}
									onChange={handleImageUpload}
								>
									{imageBase64Value ? (
										<img src={imageBase64Value} alt="Listing" />
									) : (
										<div>
											<Icon type={imageLoading ? "loading" : "plus"} />
											<div className="ant-upload-text">Tải lên</div>
										</div>
									)}
								</Upload>
							)}
						</div>
					</Item>

					<Item label="Giá" extra="Tất cả tính bằng $/ngày">
						{getFieldDecorator("price", {
							rules: [
								{
									required: true,
									message: "Xin hãy điền giá cho nhà/phòng của bạn",
								},
							],
						})(<InputNumber min={0} placeholder="120" />)}
					</Item>
				</Form>
			</Content>
		</div>
	);
};

export const WrappedAddListingForm = Form.create<FormComponentProps>({
	name: "addlistingform_form",
})(AddListingForm);