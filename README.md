# NKHouse

## Bắt đầu
Cài đặt tất cả các package bằng yarn hoặc npm.Client và Server đều  chạy câu lệnh này
yarn install hoặc npm install

## Server
Apollo Server và MongoDB dùng để lưu trữ thông tin và CSDL


## Cấu hình các biến môi trường

Tạo một biến môi trường, tệp `.env` trong thư mục `./server`:

```env
PORT = 9000
DB = link kết nôi MongoDB
G_CLIENT_ID = < Id ứng dụng khách Google OAuth >
G_CLIENT_SECRET = < API OAuth của Google >
PUBLIC_URL = <http://localhost:3000>
SECRET = <một số văn bản bí mật>
NODE_ENV = < development  nếu là developer >
G_GEOCODE_KEY = Google Geocoding Key
S_SECRET_KEY = Secret key của Stripe
CLOUDINARY_NAME= Tên Cloudinary 
CLOUDINARY_UPLOAD_PRESET= Upload preset của Cloudinary
CLOUDINARY_KEY= API Key của Cloudinary
CLOUDINARY_SECRET= API secret
EMAIL_APP_PASS = Pass Email của bạn
EMAIL_APP = Email của bạn
```
Sau khi bạn đã định cấu hình các biến của mình, bạn có thể bắt đầu seed dữ liệu

```
yarn seed hoặc npm run seed
```

## Khởi động Server

```
yarn start hoặc npm run start
```

Ở chế độ phát triển, bạn có thể truy cập GraphQL trên URL [http://localhost:9000/api/](http://localhost:9000/api/)

## Client
Client React Apollo hiển thị danh sách nhà/phòng cho thuê.

## Cấu hình các biến môi trường

Tạo một biến môi trường, tệp `.env` trong thư mục `./client`:

```env
REACT_APP_S_CLIENT_ID= Client ID của Stripe
REACT_APP_S_PUBLISHABLE_KEY= Publish Key Của Stripe
```

## Khởi động Client
```
yarn start hoặc npm run start
```

Client sử dụng Apollo CLI để tạo types từ API Server.

Đọc API Schema Server và lưu trữ cho Client.

```
yarn codegen: schema hoặc npm run codegen:schema
```

Đọc tệp Schema và tạo types trong đó các truy vấn GraphQL được xác định.
```
yarn codegen:generate hoặc npm run codegen:generate
```