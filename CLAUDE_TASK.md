# Shopify Custom Pricing App — Đề bài & Specification

> **Mục tiêu:** Xây dựng Shopify App cho phép merchant tạo các pricing rule để thay đổi giá sản phẩm theo từng tệp/scope sản phẩm cụ thể.
>
> **Kiến trúc tổng thể:** App + API + Database.
>
> **Trạng thái hiện tại của project:** Frontend đã được dựng xong. Phần đang triển khai là **Backend + Database + kết nối Frontend với API**.

---

# 1. Kiến trúc hệ thống

Ứng dụng gồm 3 thành phần:

```text
┌──────────────────────────────┐
│           Shopify            │
│        Admin / Storefront    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│             App              │
│ React + Polaris + App Bridge │
│ Shopify App Template Node    │
└──────────────┬───────────────┘
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│             API              │
│          Koa.js              │
│ Router + Body Parser         │
│ Business Logic / Services    │
└──────────────┬───────────────┘
               │ Sequelize ORM
               ▼
┌──────────────────────────────┐
│          Database            │
│            MySQL             │
└──────────────────────────────┘
```

## 1.1. App

App là Shopify App được generate bằng Shopify CLI.

Yêu cầu:

- Sử dụng **Shopify App Template Node**.
- Frontend sử dụng React.
- UI sử dụng Shopify Polaris.
- Sử dụng Shopify App Bridge khi cần.
- App chạy được trong Shopify Development Store.

## 1.2. API

API là backend của app.

API chịu trách nhiệm:

- Nhận request từ frontend.
- Validate request.
- Xử lý business logic.
- CRUD dữ liệu.
- Kết nối MySQL thông qua Sequelize.
- Gọi Shopify Admin API.
- Nhận và xử lý Shopify Webhook.
- Đồng bộ dữ liệu shop.
- Chuẩn bị dữ liệu cho storefront/theme extension.

Technology bắt buộc:

- Node.js
- TypeScript
- Koa.js
- Koa Router
- Koa Body Parser
- Sequelize

**Không sử dụng Express cho backend API.**

## 1.3. Database

Database sử dụng:

- MySQL
- Sequelize ORM

Các entity tối thiểu:

- Shop
- Rule

Có thể bổ sung entity khác nếu thực sự cần thiết.

---

# 2. Trạng thái hiện tại

Frontend của bài tập đã được dựng xong.

Đã có các màn hình/chức năng frontend liên quan đến:

- List Rule.
- Create Rule.
- Edit Rule.
- Duplicate Rule.
- Remove Rule.
- Shop data.
- Sender email.
- Product pricing details.
- Redux / Redux Toolkit.
- Custom hooks.

## 2.1. Việc cần làm hiện tại

Thay thế mock data/mock API bằng API thật.

Flow mong muốn:

```text
React
  ↓
Custom Hook
  ↓
Redux / Redux Toolkit (nếu phù hợp)
  ↓
HTTP API
  ↓
Koa Router
  ↓
Controller
  ↓
Service
  ↓
Sequelize
  ↓
MySQL
```

## 2.2. Nguyên tắc khi Claude Code làm việc

Trước khi code:

1. Đọc cấu trúc project hiện tại.
2. Đọc `package.json`.
3. Kiểm tra Shopify App Template hiện tại.
4. Kiểm tra frontend hiện tại.
5. Kiểm tra Redux store.
6. Kiểm tra các custom hook.
7. Kiểm tra mock data/mock API.
8. Kiểm tra các type/interface hiện có.
9. Kiểm tra backend hiện có.
10. Kiểm tra database configuration hiện có.

**Không rewrite toàn bộ project nếu không cần thiết.**

Ưu tiên:

- Reuse code hiện tại.
- Giữ nguyên UI.
- Giữ nguyên business logic frontend đã hoàn thiện.
- Chỉ thay mock data bằng API thật.
- Chỉ refactor khi thực sự cần thiết.

---

# 3. Bài tập 1 — Vận dụng kiến thức Shopify App Development Start

## 3.1. Tạo Shopify App

Sử dụng:

```text
Shopify App Template Node
```

App phải được tạo bằng Shopify CLI.

App cần:

- Chạy được development server.
- Install được vào Shopify Development Store.
- Authenticate được merchant.
- Sau authentication có thể lưu thông tin shop vào database.

---

# 4. Access Scopes

App yêu cầu các access scopes:

```text
read_products
read_themes
read_customers
write_themes
```

## 4.1. Ý nghĩa

### `read_products`

Cho phép app đọc:

- Product.
- Product title.
- Product tags.
- Product variants.
- Giá sản phẩm.
- Các thông tin product cần thiết khác.

Mục đích:

- Hiển thị product trong app.
- Xác định product có áp dụng pricing rule hay không.
- Tính modified price.

### `read_themes`

Cho phép app đọc theme cần thiết cho phần Theme App Extension / theme integration.

### `read_customers`

Cho phép app đọc customer data cần thiết cho bài tập.

### `write_themes`

Cho phép app ghi/chỉnh sửa theme khi triển khai phần storefront.

> `write_themes` chỉ được sử dụng khi thực sự cần thiết. Ưu tiên giải pháp Theme App Extension + Metafields theo đề bài.

---

# 5. AfterAuth — Create Shop

Sau khi merchant authenticate app thành công, cần tạo shop trong database.

Thông tin tối thiểu:

```text
id
token
name
```

Nên lưu thêm các thông tin phục vụ các bài sau:

```text
shop
email
senderEmail
status
createdAt
updatedAt
```

Ví dụ:

```text
shops
├── id
├── shop
├── token
├── name
├── email
├── sender_email
├── status
├── created_at
└── updated_at
```

## 5.1. Business logic

Khi AfterAuth chạy:

```text
Shopify Authentication
        ↓
Get shop information
        ↓
Check shop exists?
      /     \
    No       Yes
    ↓         ↓
Create      Update/Reuse
Shop        existing data
```

Không được tạo duplicate shop.

## 5.2. Security

Shopify access token:

- Không trả về frontend.
- Không log token.
- Không expose token trong API response.
- Không hard-code token.
- Không commit token vào Git.

---

# 6. Protected Customer Data

Thiết lập Protected Customer Data theo:

- Shopify documentation.
- Tài liệu hướng dẫn trong tài khoản/hệ thống training.

App cần quyền đọc customer data để phục vụ các chức năng liên quan đến customer.

Nguyên tắc:

- Chỉ lấy các field thực sự cần.
- Không expose dữ liệu nhạy cảm không cần thiết.
- Không lưu customer data nếu không cần cho business logic.

---

# 7. Shopify Theme App Extension

Khởi tạo:

```text
Theme App Extension
```

Loại:

```text
App Embed Block
```

## 7.1. Yêu cầu

Khi merchant:

1. Install app.
2. Vào Theme Editor.
3. Enable App Embed Block.
4. Mở storefront.
5. Mở Browser DevTools.
6. Chọn tab Console.

Console phải hiển thị:

```text
Hello from [DEV NAME]
```

Trong đó `[DEV NAME]` là tên developer.

---

# 8. Bài tập 2 — Frontend ReactJS + Polaris

> **Trạng thái:** Frontend đã được dựng. Không cần xây dựng lại UI trừ khi cần sửa để tích hợp API.

## 8.1. General Information

Rule phải có:

### Name

- Bắt buộc.
- Không được empty.
- Hiển thị trong Rule List.

Ví dụ:

```text
Summer Sale
VIP Customer Discount
Black Friday
```

### Status

Có 2 trạng thái:

```text
Enable
Disable
```

Backend nên lưu dạng thống nhất, ví dụ:

```text
enabled
disabled
```

---

# 9. Apply to Products

Rule có 2 cách xác định product được áp dụng.

## 9.1. All Products

Khi chọn:

```text
All products
```

Rule áp dụng cho toàn bộ sản phẩm.

Ví dụ:

```text
All products
Discount 20%
```

Tất cả product phù hợp đều được tính modified price.

## 9.2. Product Tags

Cho phép merchant nhập nhiều tag.

Ví dụ:

```text
summer
sale
vip
```

### Interaction

Khi merchant:

1. Nhập tag.
2. Nhấn `Enter`.
3. Tag được thêm vào danh sách.

Ví dụ:

```text
Product Tags

[summer] [sale] [vip]
```

### Business rule

Product được áp dụng nếu có **bất kỳ tag nào** trong danh sách.

Ví dụ rule:

```text
Tags:
summer
sale
vip
```

Product:

```text
Tags:
summer
clothing
```

Kết quả:

```text
MATCH
```

Product:

```text
Tags:
winter
shoes
```

Kết quả:

```text
NOT MATCH
```

---

# 10. Custom Prices

Có 3 cách thay đổi giá.

## 10.1. Apply a price to selected products

Đặt giá cố định.

Ví dụ:

```text
Original price: $100
Fixed price: $70

Modified price: $70
```

Backend:

```text
priceType = fixed
priceValue = 70
```

## 10.2. Decrease a fixed amount

Giảm số tiền cố định.

Ví dụ:

```text
Original price: $100
Decrease: $5

Modified price: $95
```

Backend có thể lưu:

```text
priceType = amount
priceValue = 5
```

Không cho phép giá trị âm.

## 10.3. Decrease by percentage

Giảm theo phần trăm.

Ví dụ:

```text
Original price: $100
Decrease: 20%

Modified price: $80
```

Backend:

```text
priceType = percentage
priceValue = 20
```

Validation:

```text
0 < percentage <= 100
```

---

# 11. Show Product Pricing Details

Hiển thị bảng product tương ứng với rule.

Tối thiểu:

| Field | Description |
|---|---|
| Title | Product title |
| Modified Price | Giá sau khi áp dụng rule |

Có thể bổ sung:

| Field | Description |
|---|---|
| Original Price | Giá gốc |
| Modified Price | Giá sau rule |
| Discount | Số tiền/phần trăm giảm |
| Tags | Product tags |

## 11.1. Logic

```text
Selected Rule
      ↓
Determine products
      ↓
Apply pricing strategy
      ↓
Calculate modified price
      ↓
Display product table
```

---

# 12. Sender Email

Merchant có thể thay đổi sender email.

Email mới được lưu trong bảng `shops`.

Ví dụ:

```text
shops
├── email
└── sender_email
```

## 12.1. Frontend

Có thể hiển thị:

```text
Sender email
[ merchant@example.com ]

[Save]
```

## 12.2. Backend

Cần hỗ trợ:

```text
GET shop
PATCH shop
```

Update:

```json
{
  "senderEmail": "new@example.com"
}
```

---

# 13. Rule List

Hiển thị danh sách rule đã tạo.

Mỗi rule có các action:

```text
Edit
Duplicate
Remove
```

## 13.1. Edit

Đi tới màn hình edit rule.

## 13.2. Duplicate

Tạo một rule mới dựa trên rule hiện tại.

Ví dụ:

```text
Original:
Summer Sale

Duplicate:
Summer Sale Copy
```

Rule mới phải có ID khác.

## 13.3. Remove

Xóa rule.

Frontend cần:

- Hiển thị loading nếu cần.
- Xử lý API error.
- Cập nhật danh sách sau khi xóa.

---

# 14. Shopify Polaris

Frontend sử dụng Shopify Polaris.

Các phần cần sử dụng Polaris:

- Page.
- Card.
- Form Layout.
- TextField.
- Select.
- ChoiceList / Radio-style controls.
- Tag / Tag input.
- Button.
- Data table / IndexTable tùy implementation.
- Modal / Confirmation dialog.
- Banner / Toast.
- Spinner.
- EmptyState.
- Loading state.

Không tự xây dựng UI component nếu Polaris đã có component phù hợp, trừ trường hợp UX yêu cầu custom.

---

# 15. React

Áp dụng:

- React hooks.
- Client-side rendering.
- Custom hooks.

Ví dụ:

```text
useRules()
useShop()
useProducts()
```

## 15.1. API client

Có thể sử dụng:

```text
fetch
```

hoặc:

```text
axios
```

Không bắt buộc phải dùng axios nếu `fetch` đã đáp ứng tốt.

## 15.2. Mock data

Giai đoạn đầu có thể dùng mock:

```text
mock data
mock API
local data
```

Nhưng hiện tại backend đang được triển khai nên cần chuyển sang API thật.

---

# 16. Redux / Redux Toolkit

Redux dùng để quản lý:

```text
shopData
```

Tối thiểu:

- Get shop data.
- Update sender email.

Có thể mở rộng cho:

```text
rules
products
customers
```

nếu phù hợp.

Không đưa mọi state UI nhỏ vào Redux một cách không cần thiết.

---

# 17. Bài tập 3 — Backend API Design + Database

# 17.1. KoaJS

Thiết kế một API project nhỏ bằng:

```text
KoaJS
Koa Router
Koa Body Parser
```

**Không sử dụng Express sẵn có của template.**

## 17.1.1. RESTful API

API phải được thiết kế theo RESTful convention.

Resource:

```text
shops
rules
```

---

# 18. Shop API

## 18.1. Create

```http
POST /api/shops
```

Request ví dụ:

```json
{
  "shop": "example.myshopify.com",
  "token": "shopify-access-token",
  "name": "Example Shop"
}
```

Backend:

1. Validate body.
2. Kiểm tra shop tồn tại.
3. Nếu chưa tồn tại → create.
4. Nếu tồn tại → không tạo duplicate.
5. Trả response phù hợp.
6. Không trả access token.

## 18.2. Read

```http
GET /api/shops/:id
```

Response không chứa token.

Ví dụ:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "shop": "example.myshopify.com",
    "name": "Example Shop",
    "email": "merchant@example.com",
    "senderEmail": "sender@example.com",
    "status": "active"
  }
}
```

## 18.3. Update

```http
PATCH /api/shops/:id
```

Ví dụ:

```json
{
  "senderEmail": "new@example.com"
}
```

Có thể update các field hợp lệ khác khi cần.

---

# 19. Rule API

## 19.1. Create

```http
POST /api/rules
```

Ví dụ:

```json
{
  "name": "Summer Sale",
  "status": "enabled",
  "applyType": "tags",
  "productTags": [
    "summer",
    "sale"
  ],
  "priceType": "percentage",
  "priceValue": 20
}
```

## 19.2. Read List

```http
GET /api/rules
```

Có thể filter theo shop:

```http
GET /api/rules?shopId=1
```

## 19.3. Read Detail

```http
GET /api/rules/:id
```

## 19.4. Update

```http
PATCH /api/rules/:id
```

Ví dụ:

```json
{
  "name": "Summer Sale Updated",
  "status": "disabled",
  "priceValue": 15
}
```

## 19.5. Duplicate

```http
POST /api/rules/:id/duplicate
```

Yêu cầu:

- Tạo record mới.
- ID mới.
- Copy cấu hình rule.
- Giữ cùng shop.
- Không làm thay đổi rule gốc.

## 19.6. Remove

```http
DELETE /api/rules/:id
```

Sau khi thành công:

```text
204 No Content
```

hoặc response format thống nhất của project.

---

# 20. Rule Data Model

Đề xuất:

```text
rules
├── id
├── shop_id
├── name
├── status
├── apply_type
├── product_tags
├── price_type
├── price_value
├── created_at
└── updated_at
```

## 20.1. Field definition

| Field | Meaning |
|---|---|
| id | Primary key |
| shop_id | Shop sở hữu rule |
| name | Rule name |
| status | enabled / disabled |
| apply_type | all / tags |
| product_tags | Danh sách tag |
| price_type | fixed / amount / percentage |
| price_value | Giá trị của pricing rule |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

---

# 21. Shop Data Model

Đề xuất:

```text
shops
├── id
├── shop
├── token
├── name
├── email
├── sender_email
├── status
├── created_at
└── updated_at
```

## 21.1. Field definition

| Field | Meaning |
|---|---|
| id | Primary key |
| shop | Shopify shop domain |
| token | Shopify access token |
| name | Shop name |
| email | Shop email |
| sender_email | Sender email merchant cấu hình |
| status | Shop status |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

---

# 22. Relationship

Một Shop có nhiều Rule.

```text
Shop 1 ─────────── N Rule
```

Sequelize:

```ts
Shop.hasMany(Rule);
Rule.belongsTo(Shop);
```

Foreign key:

```text
rules.shop_id
```

Khi lấy rule:

```text
Rule
  ↓
belongsTo Shop
```

---

# 23. MySQL + Sequelize

Backend phải kết nối MySQL thông qua Sequelize.

## 23.1. Database configuration

Không hard-code:

```text
DB password
DB username
DB host
Shopify secrets
```

Sử dụng environment variables.

Ví dụ:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=custom_pricing
DATABASE_USER=custom_pricing
DATABASE_PASSWORD=********
```

---

# 24. Migration

Database schema nên được quản lý bằng migration.

Cần có migration cho:

```text
shops
rules
```

Migration phải tạo:

- Primary key.
- Foreign key.
- Required fields.
- Default values.
- Timestamps.

---

# 25. Validation

Backend phải validate request.

## 25.1. Rule name

Không được:

```text
null
undefined
""
"   "
```

## 25.2. Status

Chỉ:

```text
enabled
disabled
```

## 25.3. Apply Type

Chỉ:

```text
all
tags
```

## 25.4. Product Tags

Nếu:

```text
applyType = tags
```

thì nên có ít nhất một tag.

## 25.5. Price Type

Chỉ:

```text
fixed
amount
percentage
```

## 25.6. Price Value

Không được âm.

## 25.7. Percentage

```text
0 < value <= 100
```

---

# 26. API Response

Nên thống nhất format.

## Success

```json
{
  "success": true,
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "message": "Rule not found"
  }
}
```

HTTP status:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# 27. Error Handling

Koa cần centralized error handling middleware.

Ví dụ:

```http
GET /api/rules/999999
```

Nếu không tồn tại:

```json
{
  "success": false,
  "error": {
    "message": "Rule not found"
  }
}
```

Status:

```text
404
```

Không để exception không được xử lý làm crash server.

---

# 28. Separation of Concerns

Không nên viết toàn bộ logic vào route.

Nên tách:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository / Sequelize Model
  ↓
Database
```

Ví dụ:

```text
routes/ruleRoutes.ts
controllers/ruleController.ts
services/ruleService.ts
models/Rule.ts
```

---

# 29. Frontend Integration

Thay mock data bằng API thật.

## 29.1. List Rule

```text
GET /api/rules
```

Flow:

```text
Rule List
   ↓
useRules()
   ↓
GET /api/rules
   ↓
Koa
   ↓
Sequelize
   ↓
MySQL
```

## 29.2. Create Rule

```text
POST /api/rules
```

## 29.3. Edit Rule

```text
PATCH /api/rules/:id
```

## 29.4. Duplicate Rule

```text
POST /api/rules/:id/duplicate
```

## 29.5. Remove Rule

```text
DELETE /api/rules/:id
```

## 29.6. Shop

```text
GET /api/shops/:id
PATCH /api/shops/:id
```

---

# 30. Loading / Error State

Frontend cần xử lý:

```text
loading
success
error
empty
```

Ví dụ List Rule:

```text
Loading
   ↓
API response
  ↙     ↘
Success  Error
 ↓        ↓
List     Banner/Error
```

---

# 31. Shopify Resources

Backend lấy dữ liệu thông qua Shopify Admin API.

Các resource:

```text
Shop
Product
Customer
```

## 31.1. Shop

Cần lấy thông tin như:

```text
email
firstName / name
shop domain
currency
timezone
```

Tùy field cần thiết.

## 31.2. Product

Cần lấy thông tin phục vụ pricing rule:

```text
id
title
tags
variants
price
```

## 31.3. Customer

Lấy thông tin customer cần thiết cho mục tiêu phát triển pricing theo customer segment.

---

# 32. Shopify GraphQL Admin API

**Ưu tiên GraphQL.**

Shopify REST Admin API là legacy API từ ngày 01/10/2024.

Theo yêu cầu đề bài:

> Starting April 1, 2025, all new public apps must be built exclusively with the GraphQL Admin API.

Vì vậy:

```text
Ưu tiên:
Shopify GraphQL Admin API

Không ưu tiên:
Shopify REST Admin API
```

REST chỉ dùng khi cần nghiên cứu/đối chiếu hoặc khi API tương ứng thực sự cần.

---

# 33. Bài tập 4 — Shopify Dev / Shopify API / Webhook / Storefront

# 33.1. Liquid Object

Sử dụng Liquid object:

```liquid
product
```

Mục đích:

- Lấy product hiện tại trên PDP.
- Xác định product đang được xem.
- Kết hợp với pricing rule.
- Tính modified price.

Flow:

```text
PDP
 ↓
Liquid product
 ↓
Product ID / product information
 ↓
Pricing Rules
 ↓
Check matching
 ↓
Calculate discount
 ↓
Display modified price
```

---

# 34. Metafields — Advanced

Đẩy danh sách pricing rule lên Shopify Metafield.

Mục đích:

```text
Backend rules
      ↓
Shopify Metafield
      ↓
Theme App Extension
      ↓
Storefront
      ↓
Check current product
      ↓
Apply pricing rule
```

## 34.1. Yêu cầu

Data của pricing rule cần được đưa lên Shopify thông qua Theme App Extension / cơ chế phù hợp của Shopify.

Theme App Extension đọc dữ liệu và sử dụng cho storefront.

## 34.2. Tư duy xử lý

Ví dụ:

```json
[
  {
    "id": 1,
    "status": "enabled",
    "applyType": "tags",
    "productTags": ["summer"],
    "priceType": "percentage",
    "priceValue": 20
  },
  {
    "id": 2,
    "status": "enabled",
    "applyType": "all",
    "priceType": "amount",
    "priceValue": 5
  }
]
```

Storefront:

```text
Current Product
      ↓
Product tags
      ↓
Read rules
      ↓
Find matching rules
      ↓
Calculate modified price
```

Developer được tự quyết định cách thiết kế data/flow miễn đáp ứng mục tiêu.

---

# 35. Giải pháp thay thế Metafields

Nếu không làm được phần Metafields:

Sử dụng:

```text
write_themes
```

để đẩy thông tin rule trực tiếp vào theme.

Đây chỉ là phương án thay thế.

**Không được tính điểm cho phần này và bị trừ 1 điểm.**

Vì vậy phải ưu tiên:

```text
Metafields
+
Theme App Extension
```

---

# 36. Webhook — `/shop/update`

Sử dụng Shopify webhook:

```text
/shop/update
```

Mục đích:

Khi shop information thay đổi:

```text
Shopify
   ↓
shop/update webhook
   ↓
Koa webhook endpoint
   ↓
Validate webhook
   ↓
Find shop
   ↓
Update database
```

Đặc biệt:

```text
email
```

phải được update vào bảng `shops`.

---

# 37. Webhook — `/app/uninstalled`

Sử dụng:

```text
/app/uninstalled
```

Flow:

```text
Merchant uninstall app
        ↓
Shopify
        ↓
Webhook
        ↓
Backend
        ↓
Find shop
        ↓
Update status
```

Không nên xóa record shop.

Ví dụ:

```text
status = uninstalled
```

hoặc trạng thái tương đương phù hợp architecture.

---

# 38. Storefront — Product Detail Page

Chỉ cần xử lý:

```text
PDP
Product Detail Page
```

Không bắt buộc xử lý:

```text
Cart
Checkout
Collection page
Search page
```

trong phạm vi bài tập này.

---

# 39. Price Selector

Theme App Extension cần tìm price element trên PDP.

Flow:

```text
PDP
 ↓
Find main product price
 ↓
Get current product
 ↓
Check pricing rules
 ↓
Calculate discount
 ↓
Replace/update displayed price
```

Ví dụ:

```text
Original Price:

$100

Rule:

20% OFF

Displayed:

$80
```

Có thể hiển thị cả:

```text
$80
$100
```

để thể hiện giá giảm.

---

# 40. Money Format

Giá phải được format theo `money_format` của shop.

Liquid:

```liquid
{{ shop.money_format | json }}
```

Không được hard-code:

```text
$
€
₫
```

Ví dụ cùng một giá trị có thể được hiển thị khác nhau tùy shop:

```text
$100.00
100,00 €
100.000 ₫
```

Tham khảo:

https://help.shopify.com/en/manual/international/pricing/currency-formatting

---

# 41. Database Business Rules

## Rule thuộc Shop

Một rule bắt buộc thuộc một shop.

```text
rules.shop_id → shops.id
```

Không được tạo rule không xác định shop.

## Rule status

Rule chỉ được áp dụng nếu:

```text
status = enabled
```

Nếu:

```text
status = disabled
```

thì không áp dụng pricing.

## Apply All

Nếu:

```text
applyType = all
```

thì tất cả product phù hợp được áp dụng.

## Apply Tags

Nếu:

```text
applyType = tags
```

product được áp dụng khi có ít nhất một tag match.

## Pricing

### Fixed

```text
modifiedPrice = priceValue
```

### Amount

```text
modifiedPrice = originalPrice - priceValue
```

### Percentage

```text
modifiedPrice = originalPrice * (1 - priceValue / 100)
```

Không để modified price nhỏ hơn 0.

Ví dụ:

```text
Original = $5
Discount = $10

Result:
$0
```

không phải:

```text
-$5
```

---

# 42. API Security

## Access Token

Không trả token:

```json
{
  "token": "..."
}
```

cho frontend.

## Logs

Không:

```ts
console.log(shop.token);
```

## Environment

Secrets nằm trong:

```text
.env
```

và `.env` không commit Git.

---

# 43. Suggested Backend Structure

Không bắt buộc giống hoàn toàn, nhưng nên hướng tới:

```text
server/
├── app.ts
├── server.ts
│
├── config/
│   ├── database.ts
│   └── shopify.ts
│
├── models/
│   ├── Shop.ts
│   ├── Rule.ts
│   └── index.ts
│
├── migrations/
│   ├── xxx-create-shops.ts
│   └── xxx-create-rules.ts
│
├── routes/
│   ├── index.ts
│   ├── shopRoutes.ts
│   ├── ruleRoutes.ts
│   └── webhookRoutes.ts
│
├── controllers/
│   ├── shopController.ts
│   ├── ruleController.ts
│   └── webhookController.ts
│
├── services/
│   ├── shopService.ts
│   ├── ruleService.ts
│   └── shopifyService.ts
│
├── validators/
│   ├── shopValidator.ts
│   └── ruleValidator.ts
│
├── middleware/
│   ├── errorHandler.ts
│   └── ...
│
└── utils/
```

---

# 44. Testing

## Shop

Phải test:

- Create shop.
- Get shop.
- Update shop.
- Duplicate shop không được xảy ra.
- Shop không tồn tại.

## Rule

Phải test:

- Create rule.
- Get rules.
- Get rule detail.
- Update rule.
- Duplicate rule.
- Delete rule.
- Rule không tồn tại.
- Rule không thuộc shop.

## Validation

Test:

- Empty name.
- Invalid status.
- Invalid apply type.
- Empty tags khi apply type là tags.
- Invalid price type.
- Negative price.
- Percentage > 100.
- Percentage <= 0.
- Invalid shop ID.

---

# 45. API Testing

Có thể sử dụng:

```text
Postman
Insomnia
curl
```

Ví dụ:

```bash
curl http://localhost:<PORT>/api/rules
```

---

# 46. Acceptance Criteria — Backend hiện tại

Backend phase được coi là hoàn thành khi:

- [ ] Koa server chạy được.
- [ ] Không sử dụng Express.
- [ ] Koa Router hoạt động.
- [ ] Body Parser hoạt động.
- [ ] MySQL connection hoạt động.
- [ ] Sequelize connection hoạt động.
- [ ] Shop model hoạt động.
- [ ] Rule model hoạt động.
- [ ] Migration hoạt động.
- [ ] Shop → Rule relationship hoạt động.
- [ ] Create Shop hoạt động.
- [ ] Read Shop hoạt động.
- [ ] Update Shop hoạt động.
- [ ] Create Rule hoạt động.
- [ ] Read Rules hoạt động.
- [ ] Read Rule Detail hoạt động.
- [ ] Update Rule hoạt động.
- [ ] Duplicate Rule hoạt động.
- [ ] Remove Rule hoạt động.
- [ ] Validation hoạt động.
- [ ] Error handling hoạt động.
- [ ] API response thống nhất.
- [ ] Frontend không còn phụ thuộc mock data cho các chức năng đã hoàn thành.
- [ ] Sender email lưu được vào MySQL.
- [ ] Access token không bị expose.
- [ ] TypeScript type-safe.
- [ ] Code có separation of concerns.

---

# 47. Acceptance Criteria — Shopify Admin API

- [ ] Có thể lấy Shop information.
- [ ] Có thể lấy Product.
- [ ] Có thể lấy Customer.
- [ ] Ưu tiên GraphQL Admin API.
- [ ] Không expose access token.
- [ ] Product data có thể dùng cho Product Pricing Details.
- [ ] Shop data có thể đồng bộ với database.

---

# 48. Acceptance Criteria — Webhook

- [ ] `/shop/update` hoạt động.
- [ ] Shop email được update vào DB.
- [ ] `/app/uninstalled` hoạt động.
- [ ] Shop status được update khi uninstall.
- [ ] Webhook không làm crash server khi payload không hợp lệ.

---

# 49. Acceptance Criteria — Storefront

- [ ] Theme App Extension được tạo.
- [ ] App Embed Block hoạt động.
- [ ] Console hiển thị `Hello from [DEV NAME]`.
- [ ] Có thể lấy current product bằng Liquid.
- [ ] Pricing rules có thể được truyền xuống storefront.
- [ ] Ưu tiên Metafields.
- [ ] Có thể xác định product có match rule.
- [ ] Có thể tính modified price.
- [ ] PDP hiển thị modified price.
- [ ] Giá được format theo money format của shop.

---

# 50. Development Priority

Vì frontend đã hoàn thành, **không làm lại frontend từ đầu**.

Thứ tự triển khai:

## Phase 1 — Analyze project

- [ ] Đọc toàn bộ cấu trúc project.
- [ ] Đọc package.json.
- [ ] Xác định entry point backend.
- [ ] Xác định frontend API layer.
- [ ] Xác định Redux store.
- [ ] Xác định mock data.
- [ ] Xác định các type hiện tại.

## Phase 2 — Database

- [ ] Configure MySQL.
- [ ] Configure Sequelize.
- [ ] Create Shop model.
- [ ] Create Rule model.
- [ ] Relationship.
- [ ] Migration.
- [ ] Seed nếu cần.

## Phase 3 — Koa API

- [ ] Koa.
- [ ] Router.
- [ ] Body parser.
- [ ] Error handler.
- [ ] REST API.
- [ ] Validation.

## Phase 4 — Shop API

- [ ] Create.
- [ ] Read.
- [ ] Update.

## Phase 5 — Rule API

- [ ] Create.
- [ ] Read list.
- [ ] Read detail.
- [ ] Update.
- [ ] Duplicate.
- [ ] Delete.

## Phase 6 — Frontend Integration

- [ ] Rule List → API.
- [ ] Create Rule → API.
- [ ] Edit Rule → API.
- [ ] Duplicate Rule → API.
- [ ] Remove Rule → API.
- [ ] Shop → API.
- [ ] Sender Email → API.

## Phase 7 — Shopify Admin GraphQL

- [ ] Shop.
- [ ] Product.
- [ ] Customer.

## Phase 8 — Webhook

- [ ] `/shop/update`.
- [ ] `/app/uninstalled`.

## Phase 9 — Theme App Extension

- [ ] App Embed.
- [ ] Liquid product.
- [ ] Metafields.
- [ ] Pricing rule matching.
- [ ] Price calculation.
- [ ] PDP price update.
- [ ] Money formatting.

---

# 51. Yêu cầu Claude Code khi triển khai

Claude Code phải làm việc theo nguyên tắc:

## Bước 1 — Analyze trước

Không code ngay.

Trước tiên:

```text
Inspect project
↓
Understand architecture
↓
Identify existing code
↓
Identify missing pieces
↓
Propose implementation
```

## Bước 2 — Không phá code hiện tại

Không:

- Rewrite toàn bộ frontend.
- Xóa Redux hiện tại.
- Xóa custom hooks hiện tại.
- Thay đổi UI không cần thiết.
- Tạo project mới.

## Bước 3 — Implement từng phase

Sau mỗi phase:

```text
Run typecheck
Run tests nếu có
Run build
Fix errors
```

## Bước 4 — Không tự ý thêm dependency

Nếu cần dependency mới:

1. Kiểm tra package hiện tại.
2. Xác định dependency đã tồn tại chưa.
3. Chỉ cài thêm nếu thực sự cần.
4. Giải thích dependency được dùng cho mục đích gì.

## Bước 5 — TypeScript

Ưu tiên type rõ ràng.

Hạn chế:

```ts
any
```

Không dùng `any` để che lỗi TypeScript.

---

# 52. Definition of Done — Task hiện tại

Task hiện tại của developer:

> **Hoàn thiện Backend API + MySQL + Sequelize và kết nối với Frontend hiện tại.**

Flow cuối cùng phải hoạt động:

```text
┌─────────────────┐
│   React UI      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Custom Hook     │
│ / Redux         │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Koa Router    │
└────────┬────────┘
         ▼
┌─────────────────┐
│   Controller    │
└────────┬────────┘
         ▼
┌─────────────────┐
│    Service      │
└────────┬────────┘
         ▼
┌─────────────────┐
│   Sequelize     │
└────────┬────────┘
         ▼
┌─────────────────┐
│      MySQL      │
└─────────────────┘
```

Các flow bắt buộc:

### Create Rule

```text
Create Rule Form
→ POST /api/rules
→ Koa
→ Service
→ Sequelize
→ MySQL
→ Response
→ Update UI
```

### Edit Rule

```text
Edit Rule
→ PATCH /api/rules/:id
→ Koa
→ Service
→ Sequelize
→ MySQL
→ Response
→ Update UI
```

### Duplicate Rule

```text
Duplicate
→ POST /api/rules/:id/duplicate
→ Create new Rule
→ MySQL
→ Update List
```

### Remove Rule

```text
Remove
→ DELETE /api/rules/:id
→ MySQL
→ Update List
```

### Sender Email

```text
Sender Email
→ PATCH /api/shops/:id
→ Update sender_email
→ MySQL
→ Update Redux / UI
```

---

# 53. Tiêu chí đánh giá chất lượng

Không chỉ đánh giá việc API "chạy được".

Cần đảm bảo:

```text
Correctness
+
RESTful API
+
Clean Architecture
+
Type Safety
+
Validation
+
Error Handling
+
Security
+
Maintainability
+
Shopify Best Practices
```

Đặc biệt phải đảm bảo architecture có thể mở rộng cho phần:

```text
Pricing Rules
      ↓
Shopify Product
      ↓
Metafields
      ↓
Theme App Extension
      ↓
Storefront PDP
```

---

# 54. Tài liệu tham khảo

Shopify Admin REST API:

https://shopify.dev/docs/api/admin-rest

Shopify Money Formatting:

https://help.shopify.com/en/manual/international/pricing/currency-formatting

Shopify Admin GraphQL API:

https://shopify.dev/docs/api/admin-graphql

Shopify Theme App Extensions:

https://shopify.dev/docs/apps/online-store/theme-app-extensions

Shopify Metafields:

https://shopify.dev/docs/apps/build/custom-data

---

# 55. Tóm tắt yêu cầu

## Bài 1

```text
Shopify App
+
Access Scopes
+
AfterAuth
+
Protected Customer Data
+
Theme App Extension
```

## Bài 2

```text
React
+
Polaris
+
Rule UI
+
Shop UI
+
Redux Toolkit
+
Custom Hook
```

## Bài 3

```text
Koa
+
RESTful API
+
MySQL
+
Sequelize
+
Shop CRUD
+
Rule CRUD
+
Shopify GraphQL Admin API
```

## Bài 4

```text
Liquid
+
Metafields
+
Theme App Extension
+
Webhook
+
Storefront PDP
+
Dynamic Pricing
+
Money Formatting
```

## Task đang thực hiện

```text
Frontend đã hoàn thành
        ↓
ĐANG LÀM
        ↓
Backend API
        +
MySQL
        +
Sequelize
        ↓
Connect Frontend
        ↓
Sau đó mới làm
        ↓
Shopify GraphQL
        ↓
Webhook
        ↓
Metafields
        ↓
Theme App Extension
        ↓
Storefront Pricing
```
