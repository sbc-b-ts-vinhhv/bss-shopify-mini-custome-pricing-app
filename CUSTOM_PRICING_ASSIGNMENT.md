# Custom Pricing App — Bài tập 2, 3, 4

## 0. Mục tiêu tổng thể

Xây dựng một Shopify Custom Pricing App đơn giản nhưng có cấu trúc đủ tốt để thực hành:

- ReactJS + Shopify Polaris
- React Hooks + Client-side rendering
- Redux Toolkit
- RESTful API với KoaJS
- MySQL + Sequelize ORM
- Shopify Admin GraphQL API
- Theme App Extension
- Liquid objects
- Shopify App Metafields
- Shopify Webhooks
- Hiển thị Custom Pricing trên Storefront PDP
- Chuẩn hóa money format theo `shop.money_format`
- Security cho quá trình tạo Shop và xác thực request từ CMS

Ứng dụng cho phép merchant:

1. Tạo Custom Pricing Rule.
2. Chọn sản phẩm áp dụng rule.
3. Thiết lập giá cố định hoặc giảm giá theo số tiền/%.
4. Xem trước danh sách sản phẩm và modified price.
5. Quản lý danh sách rule.
6. Cấu hình sender email của shop.
7. Đồng bộ dữ liệu shop/product từ Shopify.
8. Đẩy rule xuống Storefront thông qua Theme App Extension + App Metafield.
9. Kiểm tra product hiện tại có được áp dụng rule hay không.
10. Hiển thị giá sau Custom Pricing trên Product Detail Page.

---

# 1. Phạm vi hiện tại

## Trạng thái project

Các phần sau đã hoàn thành:

- [x] Tạo Shopify App.
- [x] Cài đặt app vào Shopify Development Store.
- [x] Cấu hình và sử dụng Shopify Polaris React.
- [x] App đã chạy được trong Shopify Admin.
- [x] Theme App Extension đã được bật trên theme.

## Việc cần thực hiện

Tiếp tục triển khai:

- [ ] Bài tập 2 — Frontend / ReactJS / Polaris.
- [ ] Bài tập 3 — Backend / API / Database / Shopify Admin API.
- [ ] Bài tập 4 — Storefront / Liquid / Metafield / Webhook.

> Giai đoạn đầu có thể hoàn thiện Frontend bằng mock data/mock API.
> Backend sẽ được triển khai sau và thay thế mock API bằng API thật.

---

# 2. Business Concept

## 2.1. Custom Pricing Rule

Một Custom Pricing Rule gồm các thành phần chính:

```text
Rule
├── General Information
│   ├── Name
│   └── Status
│
├── Apply to Products
│   ├── All Products
│   └── Product Tags
│
├── Custom Price
│   ├── Apply Fixed Price
│   ├── Decrease Fixed Amount
│   └── Decrease Percentage
│
└── Product Pricing Preview
    ├── Product Title
    └── Modified Price
```

## 2.2. Ví dụ

Merchant tạo rule:

```text
Name:
VIP Customer Pricing

Status:
Enabled

Apply to:
Product Tags = vip

Custom Price:
Decrease percentage = 20%
```

Nếu store có:

```text
Product A
Tag: vip
Price: $100

Product B
Tag: normal
Price: $100

Product C
Tag: vip
Price: $50
```

Kết quả:

```text
Product A → $80
Product B → Không áp dụng
Product C → $40
```

---

# 3. BÀI TẬP 2 — FRONTEND / REACTJS / POLARIS

## 3.1. Mục tiêu

Xây dựng toàn bộ giao diện quản lý Custom Pricing bằng:

- ReactJS
- Shopify Polaris React
- React Hooks
- Client-side rendering
- Fetch API hoặc Axios
- Redux Toolkit
- Custom Hooks nếu phù hợp

Trong giai đoạn này chưa bắt buộc có Backend thật.

Có thể sử dụng:

- Mock data
- Mock API
- Local state
- Redux store

Mục tiêu là hoàn thiện UI và business flow trước.

---

# 4. Frontend Pages

Tối thiểu cần có:

```text
/app
├── Rules List
├── Create Rule
├── Edit Rule
└── Shop Settings
```

Có thể sáng tạo thêm:

```text
├── Dashboard
├── Rule Details
└── Product Preview
```

---

# 5. Rule List

## 5.1. Chức năng

Hiển thị danh sách Custom Pricing Rules đã tạo.

Ví dụ:

| Name | Status | Apply To | Discount | Actions |
|---|---|---|---|---|
| VIP Pricing | Enabled | Product Tags | -20% | Edit / Duplicate / Remove |
| Summer Sale | Disabled | All Products | -$5 | Edit / Duplicate / Remove |

## 5.2. Actions

Mỗi rule phải hỗ trợ:

### Edit

Chuyển sang màn hình Edit Rule.

### Duplicate

Tạo một rule mới dựa trên rule hiện tại.

Ví dụ:

```text
VIP Pricing
↓ Duplicate
VIP Pricing Copy
```

Rule mới phải có ID mới.

### Remove

Xóa rule.

Nên có confirmation modal trước khi xóa:

```text
Are you sure you want to delete this rule?
```

---

# 6. Create / Edit Rule

Giao diện nên được xây dựng bằng Shopify Polaris.

Có thể sử dụng:

- Page
- Layout
- Card
- TextField
- Select
- RadioButton / ChoiceList
- Checkbox
- Tag
- DataTable
- Button
- ButtonGroup
- Modal
- Banner
- Badge
- FormLayout
- EmptyState

---

# 7. General Information

## Fields

### Name

Bắt buộc.

```text
Name: [_____________________]
```

Validation:

```text
Name is required.
```

Không cho phép submit nếu Name rỗng.

### Status

Có 2 trạng thái:

```text
Enabled
Disabled
```

Có thể dùng:

- Checkbox
- Select
- ChoiceList

Ví dụ:

```text
Status
(•) Enabled
( ) Disabled
```

---

# 8. Apply to Products

Rule phải hỗ trợ 2 loại:

## 8.1. All Products

Rule áp dụng cho tất cả sản phẩm.

```text
Apply to Products

(•) All products
( ) Product tags
```

Khi chọn All Products:

```text
Product Tags input
```

được disable/ẩn.

---

## 8.2. Product Tags

Cho phép merchant nhập nhiều tag.

Ví dụ:

```text
Product Tags

[vip] [wholesale] [premium]
```

Flow:

```text
Merchant nhập:
vip

Press Enter

→ tag "vip" được thêm vào danh sách
```

Các tag có thể remove.

Ví dụ:

```text
[vip ×] [wholesale ×] [premium ×]
```

Không nên cho phép:

- Tag rỗng.
- Tag trùng nhau.

---

# 9. Custom Prices

Có 3 loại pricing.

## 9.1. Apply a price to selected products

Áp dụng giá cố định.

Ví dụ:

```text
Original price: $100
Custom price:   $70
```

Rule:

```text
discount_type = APPLY_FIXED
discount_value = 70
```

---

## 9.2. Decrease a fixed amount

Giảm một số tiền cố định.

Ví dụ:

```text
Original price: $100
Decrease: $10

Modified price:
$90
```

Rule:

```text
discount_type = DECREASE_FIXED
discount_value = 10
```

Cần đảm bảo modified price không âm.

Ví dụ:

```text
Original: $5
Decrease: $10

Result:
$0
```

---

## 9.3. Decrease by percentage

Giảm theo %.

Ví dụ:

```text
Original price: $100
Discount: 20%

Modified price:
$80
```

Rule:

```text
discount_type = DECREASE_PERCENTAGE
discount_value = 20
```

Validation:

```text
0 <= percentage <= 100
```

---

# 10. Product Pricing Details

## 10.1. Mục tiêu

Hiển thị preview các sản phẩm tương ứng với rule.

Bảng tối thiểu:

| Title | Original Price | Modified Price |
|---|---:|---:|
| T-Shirt Basic | $100 | $80 |
| Hoodie Black | $200 | $160 |

Yêu cầu đề bài bắt buộc:

- Title
- Modified Price

Khuyến khích thêm:

- Product image
- Original Price
- Discount
- Product status
- Variant
- Tags

---

# 11. Product Selection

Để UX tốt hơn, có thể xây dựng Product Picker.

Ví dụ:

```text
[ Select products ]
```

Sau đó hiển thị:

```text
Product
├── Image
├── Title
├── Price
└── Tags
```

Nếu chọn:

```text
All Products
```

thì preview lấy product mock phù hợp.

Nếu chọn:

```text
Product Tags
```

thì filter product theo tag.

Logic:

```text
product.tags
      │
      ▼
Any tag matches selected tags?
      │
 ┌────┴────┐
Yes       No
 │         │
 ▼         ▼
Apply    Ignore
```

---

# 12. Sender Email

## 12.1. Requirement

Merchant có thể thay đổi sender email.

Ví dụ:

```text
Sender Email

[ sales@example.com ]

                [Save]
```

Email này sẽ được lưu vào bảng `Shop`.

## 12.2. UX

Nên có:

- Current sender email.
- TextField.
- Save button.
- Loading state.
- Success toast/banner.
- Validation email.

Ví dụ:

```text
Sender Email
The email address used to send notification emails.

[ sales@example.com ]

[Save]
```

---

# 13. Redux Toolkit

## 13.1. Bắt buộc

Sử dụng Redux để quản lý:

```text
shopData
```

Ít nhất phải hỗ trợ:

```text
GET shopData
UPDATE sender email
```

## 13.2. Gợi ý structure

```text
app/
├── store/
│   ├── store.ts
│   └── slices/
│       ├── shopSlice.ts
│       └── ruleSlice.ts
```

Có thể sáng tạo thêm:

```text
productSlice
uiSlice
```

---

# 14. Gợi ý Redux State

```ts
type ShopData = {
    id: string;
    name: string;
    email: string;
    senderEmail: string;
};
```

Ví dụ Redux state:

```ts
type ShopState = {
    data: ShopData | null;
    loading: boolean;
    error: string | null;
};
```

---

# 15. React Hooks

Nên sử dụng:

- `useState`
- `useEffect`
- `useMemo`
- `useCallback`

Khi phù hợp.

Ví dụ custom hooks:

```text
useRules()
useRule()
useShop()
useProducts()
useSenderEmail()
```

Một custom hook có thể quản lý:

```text
loading
data
error
fetch
create
update
remove
```

Ví dụ concept:

```ts
const {
    rules,
    loading,
    createRule,
    updateRule,
    duplicateRule,
    removeRule,
} = useRules();
```

---

# 16. Mock API

Trước khi Backend hoàn thành, frontend có thể sử dụng:

```text
mockApi/
├── shop.ts
├── rules.ts
└── products.ts
```

Ví dụ:

```ts
getRules()
createRule()
updateRule()
duplicateRule()
removeRule()
getShop()
updateSenderEmail()
getProducts()
```

Khi Backend hoàn thiện, thay implementation bằng:

```text
fetch('/api/rules')
```

hoặc Axios.

Frontend component không nên phụ thuộc trực tiếp vào mock data.

Nên tạo abstraction:

```text
Component
   ↓
Custom Hook
   ↓
API Service
   ↓
Mock API / Real API
```

---

# 17. BÀI TẬP 3 — BACKEND / API / DATABASE

Sau khi Frontend hoàn thiện, triển khai Backend.

---

# 18. KoaJS

Không sử dụng Express có sẵn trong template.

Sử dụng:

- KoaJS
- Koa Router
- Koa Body Parser

Kiến trúc gợi ý:

```text
server/
├── app.ts
├── routes/
├── controllers/
├── services/
├── repositories/
├── middlewares/
├── validators/
└── utils/
```

---

# 19. RESTful API

## Shop

### GET

```http
GET /api/shop
```

Lấy shop hiện tại.

### POST

```http
POST /api/shop
```

Tạo shop.

### PATCH

```http
PATCH /api/shop
```

Update shop.

Có thể update:

```json
{
  "senderEmail": "new@example.com"
}
```

---

# 20. Rule API

## List

```http
GET /api/rules
```

## Detail

```http
GET /api/rules/:id
```

## Create

```http
POST /api/rules
```

## Update

```http
PATCH /api/rules/:id
```

## Duplicate

```http
POST /api/rules/:id/duplicate
```

## Remove

```http
DELETE /api/rules/:id
```

---

# 21. RESTful Convention

API cần thống nhất:

```text
GET       → Read
POST      → Create
PATCH     → Partial update
PUT       → Full update nếu cần
DELETE    → Delete
```

HTTP status code nên phù hợp:

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

# 22. Database — MySQL

Sử dụng:

- MySQL
- Sequelize ORM

Các bảng tối thiểu:

```text
shops
rules
```

Có thể mở rộng:

```text
rule_products
rule_tags
```

---

# 23. Shop Table

Gợi ý:

```text
shops
├── id
├── shopify_shop_id
├── shop_domain
├── name
├── email
├── sender_email
├── status
├── access_token
├── created_at
└── updated_at
```

> Access token phải được bảo mật và không được expose ra frontend.

---

# 24. Rule Table

Gợi ý:

```text
rules
├── id
├── shop_id
├── name
├── status
├── product_condition_type
├── discount_type
├── discount_value
├── created_at
└── updated_at
```

Nếu thiết kế quan hệ riêng:

```text
rules
    │
    ├── rule_products
    │
    └── rule_tags
```

---

# 25. Rule Data Model

Một rule có thể được biểu diễn:

```json
{
  "name": "VIP Pricing",
  "status": 1,
  "productConditionType": 3,
  "productTags": [
    "vip",
    "wholesale"
  ],
  "discountType": 2,
  "discountValue": "20"
}
```

Trong đó:

```text
status:
0 = disabled
1 = enabled

productConditionType:
0 = all products
3 = product tags

discountType:
0 = fixed price
1 = decrease fixed
2 = decrease percentage
```

---

# 26. Shopify Admin GraphQL API

Backend sử dụng Shopify Admin GraphQL API để lấy dữ liệu Shopify.

Không ưu tiên REST Admin API cho phần mới.

Cần lấy:

```text
Shop
├── email
├── name / shop information
└── other required shop data

Products
├── id
├── title
├── handle
├── featured image
├── tags
└── variants / price

Customers
├── id
├── name
├── email
└── tags
```

---

# 27. Product API

Frontend cần dữ liệu product để:

- Hiển thị product list.
- Filter theo tag.
- Preview pricing.
- Hiển thị modified price.

Gợi ý endpoint nội bộ:

```http
GET /api/products
```

Backend gọi Shopify GraphQL API.

Flow:

```text
React
  ↓
GET /api/products
  ↓
Koa Controller
  ↓
Shopify Service
  ↓
Shopify Admin GraphQL API
  ↓
Products
  ↓
React
```

---

# 28. Shopify Shop Data

Backend lấy thông tin shop từ Shopify:

```text
Shop name
Shop email
Shop domain
```

Sau đó lưu/update vào:

```text
shops
```

Sender email do merchant cấu hình:

```text
sender_email
```

---

# 29. BÀI TẬP 4 — SHOPIFY STOREFRONT

Mục tiêu:

> Custom Pricing được hiển thị trực tiếp trên Storefront Product Detail Page.

Flow tổng thể:

```text
Shopify Admin
     │
     ▼
Custom Pricing Rule
     │
     ▼
Database
     │
     ▼
App Metafield
     │
     ▼
Theme App Extension
     │
     ▼
Liquid / JavaScript
     │
     ▼
Product
     │
     ▼
Check Rule
     │
     ▼
Calculate Discount
     │
     ▼
Display Modified Price
```

---

# 30. Liquid Object

Sử dụng Liquid object:

```liquid
{{ product }}
```

để lấy thông tin product hiện tại.

Các thông tin có thể cần:

```text
product.id
product.title
product.tags
product.price
product.selected_or_first_available_variant
```

Mục tiêu:

```text
Current Product
      ↓
Product ID / Tags
      ↓
Compare with Custom Pricing Rules
      ↓
Rule matched?
      ↓
Calculate modified price
```

---

# 31. App Metafield

## Mục tiêu

Đẩy danh sách Custom Pricing Rules xuống Shopify App Metafield.

Ví dụ dữ liệu:

```json
[
  {
    "id": 1,
    "name": "VIP Pricing",
    "status": 1,
    "productConditionType": 3,
    "productTags": ["vip"],
    "discountType": 2,
    "discountValue": 20
  }
]
```

Storefront có thể đọc dữ liệu này thông qua Theme App Extension.

---

# 32. Theme App Extension

Dữ liệu cần được đưa vào Theme App Extension.

Flow:

```text
Backend
   ↓
Shopify Admin GraphQL
   ↓
App-owned Metafield
   ↓
Theme App Extension
   ↓
Liquid
   ↓
JavaScript
```

Không hard-code rule trực tiếp vào theme.

---

# 33. Kiểm tra Product có được áp dụng Rule

Logic:

```text
Current product
       │
       ▼
Read product.id / product.tags
       │
       ▼
Read pricing rules
       │
       ▼
Filter active rules
       │
       ▼
Check product condition
       │
       ├── All products
       │
       └── Product tags
       │
       ▼
Rule matched
       │
       ▼
Calculate price
```

Product Tags rule:

```text
Rule tags:
["vip", "wholesale"]

Product tags:
["summer", "vip", "shirt"]

Intersection:
["vip"]

→ Rule applies
```

---

# 34. Custom Pricing Calculation

## Fixed Price

```text
Original = $100
Fixed = $70

Modified = $70
```

Formula:

```text
modifiedPrice = discountValue
```

---

## Decrease Fixed

```text
Original = $100
Decrease = $10

Modified = $90
```

Formula:

```text
modifiedPrice = originalPrice - discountValue
```

Nên đảm bảo:

```text
modifiedPrice >= 0
```

---

## Percentage

```text
Original = $100
Discount = 20%

Modified = $80
```

Formula:

```text
modifiedPrice =
    originalPrice * (1 - discountValue / 100)
```

---

# 35. Hiển thị giá trên PDP

Chỉ cần xử lý:

```text
Product Detail Page
```

Không bắt buộc xử lý:

- Collection page
- Cart
- Checkout

trong scope cơ bản của bài tập.

---

# 36. Price Selector

Theme App Extension cần tìm price element hiện tại của theme.

Ví dụ concept:

```text
Theme
  ↓
Find main product price element
  ↓
Replace / update displayed price
```

Cần tránh hard-code một selector duy nhất nếu có thể.

Có thể xây dựng:

```text
Price selector configuration
```

hoặc:

```text
Theme-specific selector handling
```

---

# 37. Format Money

Giá phải được format theo `money_format` của Shopify.

Liquid:

```liquid
{{ shop.money_format | json }}
```

Ví dụ:

```text
money_format = "${{amount}}"
```

Giá:

```text
80
```

Hiển thị:

```text
$80.00
```

Cần hỗ trợ format phù hợp với `shop.money_format`.

Tài liệu tham khảo:

https://help.shopify.com/en/manual/international/pricing/currency-formatting

---

# 38. Webhook — Shop Update

Đăng ký webhook:

```text
/shop/update
```

Mục tiêu:

> Khi thông tin shop thay đổi, backend cập nhật thông tin tương ứng trong bảng `shops`.

Ví dụ:

```text
Shopify
   │
   │ shop/update
   ▼
Webhook endpoint
   │
   ▼
Validate webhook
   │
   ▼
Update shops
```

Đặc biệt cập nhật:

```text
email
name
```

nếu cần.

---

# 39. Webhook — App Uninstalled

Đăng ký:

```text
/app/uninstalled
```

Khi merchant uninstall app:

```text
Shopify
   │
   ▼
/app/uninstalled
   │
   ▼
Find shop
   │
   ▼
Update status
   │
   ▼
status = inactive/uninstalled
```

Không nhất thiết xóa toàn bộ dữ liệu ngay lập tức.

---

# 40. Security — Advanced

## 40.1. Create Shop Security

Có yêu cầu:

> Thêm security cho phần create shop ở `afterAuth`.

Không cho phép client tự ý gửi shop data để tạo một shop bất kỳ.

Flow nên là:

```text
Shopify OAuth
     ↓
afterAuth
     ↓
Verified session
     ↓
Get shop information
     ↓
Create / update Shop
```

Không nên:

```text
Frontend
   ↓
POST /api/shop
{
    "shopifyShopId": "..."
}
```

và tin tưởng hoàn toàn dữ liệu client.

---

# 41. Security — CMS Requests

Các request từ CMS cần được xác thực bằng access token/session hợp lệ.

Flow:

```text
CMS Request
    │
    ▼
Authentication Middleware
    │
    ▼
Validate Access Token
    │
    ├── Invalid → 401
    │
    └── Valid
          │
          ▼
      Controller
```

Không expose Shopify Admin access token ra browser.

---

# 42. Advanced — Theme Selector

Khuyến khích:

> Đưa ra bộ selector theo Theme.

Không cần xây dựng hệ thống tổng hợp selector phức tạp.

Chỉ cần thể hiện được cách xử lý:

```text
Theme A
→ selector A

Theme B
→ selector B

Theme C
→ selector C
```

Có thể tạo configuration:

```ts
const themeSelectors = {
    default: ".price",
    dawn: ".price__container",
    custom: ".product-price"
};
```

Mục tiêu là chứng minh khả năng xử lý khác biệt giữa các theme.

---

# 43. Error Handling

Frontend cần xử lý:

```text
Loading
Empty
Success
Error
```

Ví dụ:

```text
Loading rules...

No rules found.

Failed to load rules.

Rule created successfully.
```

Backend cần trả lỗi rõ ràng:

```json
{
  "error": {
    "code": "RULE_NOT_FOUND",
    "message": "Rule not found"
  }
}
```

---

# 44. Validation

## Rule

```text
Name:
Required

Discount type:
Required

Discount value:
Required
```

## Percentage

```text
0 <= value <= 100
```

## Fixed price

```text
value >= 0
```

## Fixed decrease

```text
value >= 0
```

## Product tags

```text
No empty tags
No duplicate tags
Trim whitespace
```

## Sender email

```text
Valid email format
```

---

# 45. UX Requirements

Nên có:

- Loading state.
- Empty state.
- Error state.
- Confirmation modal.
- Toast/banner khi thành công.
- Disable button khi đang submit.
- Validation message ngay gần field.
- Unsaved changes warning nếu phù hợp.
- Responsive layout.
- Polaris components nhất quán.
- Không reload page không cần thiết.
- Optimistic UI nếu phù hợp.

---

# 46. Gợi ý UI Structure

## Rule List

```text
Page
│
├── Header
│   ├── Custom Pricing
│   └── Create rule
│
├── Filters
│
└── Card
    └── IndexTable
        ├── Rule name
        ├── Status
        ├── Apply to
        ├── Discount
        └── Actions
```

## Rule Form

```text
Page
│
├── General Information
│
├── Apply to Products
│
├── Custom Prices
│
├── Product Pricing Details
│
└── Actions
    ├── Cancel
    └── Save
```

## Settings

```text
Page
└── Sender Email
    ├── TextField
    └── Save
```

---

# 47. Suggested Frontend Architecture

```text
app/
├── components/
│   ├── RuleForm/
│   ├── RuleList/
│   ├── ProductPricingTable/
│   ├── ProductTagInput/
│   └── SenderEmailForm/
│
├── hooks/
│   ├── useRules.ts
│   ├── useProducts.ts
│   └── useShop.ts
│
├── services/
│   ├── ruleService.ts
│   ├── productService.ts
│   └── shopService.ts
│
├── store/
│   ├── store.ts
│   └── slices/
│       ├── shopSlice.ts
│       └── ruleSlice.ts
│
├── types/
│   ├── rule.ts
│   ├── product.ts
│   └── shop.ts
│
└── routes/
    ├── rules.tsx
    ├── rules.new.tsx
    ├── rules.$id.tsx
    └── settings.tsx
```

Có thể thay đổi structure theo Shopify React Router template đang sử dụng.

---

# 48. Suggested Backend Architecture

```text
server/
├── config/
├── controllers/
│   ├── shopController.ts
│   └── ruleController.ts
│
├── routes/
│   ├── shopRoutes.ts
│   ├── ruleRoutes.ts
│   └── webhookRoutes.ts
│
├── services/
│   ├── shopService.ts
│   ├── ruleService.ts
│   └── shopifyService.ts
│
├── models/
│   ├── Shop.ts
│   └── Rule.ts
│
├── middlewares/
│   ├── auth.ts
│   └── errorHandler.ts
│
├── validators/
│
└── app.ts
```

---

# 49. Suggested Development Order

Không làm tất cả cùng lúc.

## Phase 1 — Frontend Foundation

- [ ] Define TypeScript types.
- [ ] Setup Redux Toolkit.
- [ ] Setup mock data.
- [ ] Setup API service abstraction.
- [ ] Setup custom hooks.

## Phase 2 — Rule List

- [ ] Rule list UI.
- [ ] Status badge.
- [ ] Edit.
- [ ] Duplicate.
- [ ] Remove.
- [ ] Confirmation modal.

## Phase 3 — Create Rule

- [ ] General Information.
- [ ] Product condition.
- [ ] Product tag input.
- [ ] Discount type.
- [ ] Discount value.
- [ ] Validation.
- [ ] Product pricing preview.
- [ ] Save mock rule.

## Phase 4 — Edit Rule

- [ ] Load existing rule.
- [ ] Populate form.
- [ ] Update rule.

## Phase 5 — Shop Settings

- [ ] Redux shop state.
- [ ] Load shop.
- [ ] Update sender email.

## Phase 6 — Backend

- [ ] Koa setup.
- [ ] Router.
- [ ] Body parser.
- [ ] REST API.
- [ ] Validation.
- [ ] Error handling.

## Phase 7 — Database

- [ ] MySQL.
- [ ] Sequelize.
- [ ] Shop model.
- [ ] Rule model.
- [ ] Associations.
- [ ] Migration.

## Phase 8 — Shopify Admin API

- [ ] Shopify GraphQL client.
- [ ] Get shop.
- [ ] Get products.
- [ ] Get customers if needed.
- [ ] Replace mock APIs.

## Phase 9 — Webhook

- [ ] `/shop/update`.
- [ ] `/app/uninstalled`.
- [ ] Verify webhook.
- [ ] Update database.

## Phase 10 — Storefront

- [ ] Theme App Extension.
- [ ] Read Liquid product.
- [ ] Read App Metafield.
- [ ] Match rule.
- [ ] Calculate price.
- [ ] Find price selector.
- [ ] Update PDP price.
- [ ] Format money.

## Phase 11 — Security

- [ ] Secure shop creation in afterAuth.
- [ ] Validate authenticated CMS requests.
- [ ] Protect access token.
- [ ] Validate webhook authenticity.

---

# 50. Definition of Done

## Bài 2

- [ ] Polaris được sử dụng cho UI.
- [ ] Rule List hoàn chỉnh.
- [ ] Create Rule hoàn chỉnh.
- [ ] Edit Rule hoàn chỉnh.
- [ ] Duplicate Rule hoàn chỉnh.
- [ ] Remove Rule hoàn chỉnh.
- [ ] Product Tags input hỗ trợ Enter.
- [ ] Có product pricing preview.
- [ ] Có sender email setting.
- [ ] Redux Toolkit quản lý shopData.
- [ ] Có React Hooks.
- [ ] Có fetch/axios abstraction.
- [ ] Có mock API khi backend chưa hoàn thành.
- [ ] UI có loading/error/empty/success state.
- [ ] UX tốt và nhất quán với Polaris.

## Bài 3

- [ ] KoaJS.
- [ ] Koa Router.
- [ ] Koa Body Parser.
- [ ] RESTful API.
- [ ] Shop CRUD cần thiết.
- [ ] Rule CRUD.
- [ ] Duplicate Rule.
- [ ] Remove Rule.
- [ ] MySQL.
- [ ] Sequelize.
- [ ] Migration.
- [ ] Shopify Admin GraphQL API.
- [ ] Product data.
- [ ] Customer data.
- [ ] Shop data.
- [ ] Frontend sử dụng API thật.

## Bài 4

- [ ] Liquid `product`.
- [ ] Theme App Extension.
- [ ] App Metafield.
- [ ] Push pricing rules vào metafield.
- [ ] Check product có matching rule.
- [ ] Calculate custom price.
- [ ] Display modified price trên PDP.
- [ ] Format money theo `shop.money_format`.
- [ ] `/shop/update` webhook.
- [ ] `/app/uninstalled` webhook.
- [ ] Update shop status.
- [ ] Update shop email.

## Advanced

- [ ] Theme-specific price selectors.
- [ ] Security khi create Shop trong afterAuth.
- [ ] Authentication cho CMS requests.
- [ ] Access token không expose frontend.
- [ ] RESTful convention chuẩn.
- [ ] UI có tính sáng tạo/usability cao.

---

# 51. Điểm cộng / đánh giá sáng tạo

Có thể phát triển thêm:

### Rule priority

Cho phép rule có:

```text
Priority: 1
```

Nếu nhiều rule cùng match thì rule priority cao hơn được ưu tiên.

### Rule search/filter

```text
Search by name
Filter by status
Filter by discount type
```

### Product preview

Hiển thị:

```text
Original Price
Discount
Modified Price
```

### Unsaved changes

Cảnh báo merchant nếu rời trang khi chưa save.

### Rule statistics

Ví dụ:

```text
12 products affected
20% average discount
```

### Better pricing preview

```text
Product
Original
Discount
Modified
```

### Conflict detection

Nếu nhiều rule cùng áp dụng một product:

```text
This product is affected by 2 pricing rules.
```

### Rule priority

Cho phép merchant quyết định rule nào được áp dụng trước.

---

# 52. Tham khảo BSS B2B Code

Có thể tham khảo kiến trúc type/business logic từ code Custom Pricing của BSS B2B, đặc biệt:

```text
CpRule
DiscountType
CustomerCondition
ProductCondition
ExcludeProductCondition
DateTimeCondition
B2BLineItem
B2BDiscount
```

Tuy nhiên không copy nguyên business logic.

Mục tiêu của bài tập là xây dựng một phiên bản Custom Pricing đơn giản, dễ hiểu và phù hợp với scope bài tập.

Có thể rút gọn thành:

```text
Custom Pricing Rule
├── General Information
├── Product Condition
└── Discount
```

---

# 53. Simplified TypeScript Model

Gợi ý model cho bài tập:

```ts
export const DiscountType = {
  APPLY_FIXED: 0,
  DECREASE_FIXED: 1,
  DECREASE_PERCENTAGE: 2,
} as const;

export const ProductConditionType = {
  ALL: 0,
  BY_TAGS: 1,
} as const;

export type DiscountType =
  (typeof DiscountType)[keyof typeof DiscountType];

export type ProductConditionType =
  (typeof ProductConditionType)[keyof typeof ProductConditionType];

export interface PricingRule {
  id: number;
  name: string;
  status: boolean;

  productConditionType: ProductConditionType;
  productTags: string[];

  discountType: DiscountType;
  discountValue: number;

  createdAt: string;
  updatedAt: string;
}
```

Không cần đưa toàn bộ BSS B2B model vào bài tập nếu không cần thiết.

---

# 54. Recommended Rule Calculation Function

Nên tách business logic khỏi React component.

```ts
function calculateModifiedPrice(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number
): number {
  // implementation
}
```

Logic:

```text
APPLY_FIXED
→ discountValue

DECREASE_FIXED
→ originalPrice - discountValue

DECREASE_PERCENTAGE
→ originalPrice * (1 - discountValue / 100)
```

Sau đó clamp:

```text
Math.max(0, modifiedPrice)
```

Điều này giúp dùng chung cho:

```text
Frontend preview
Backend validation/calculation
Storefront calculation
```

---

# 55. Important Engineering Principles

## Không đặt business logic quá nhiều trong UI

Không nên:

```text
React Component
├── Fetch
├── Validation
├── Calculate price
├── Filter products
├── Save API
└── Redux
```

Nên:

```text
Component
   ↓
Hook
   ↓
Service
   ↓
Business logic
   ↓
API
```

## TypeScript first

Các object chính nên có type:

```text
Shop
Product
PricingRule
Discount
```

## API abstraction

Không để component gọi trực tiếp mọi endpoint.

Ví dụ:

```ts
ruleService.getRules()
ruleService.createRule()
ruleService.updateRule()
```

## Backend validation

Không tin dữ liệu từ frontend.

Frontend validation chỉ giúp UX.

Backend phải validate lại.

---

# 56. Prompt gợi ý để dùng với Codex

Có thể đưa file này vào root project và yêu cầu Codex làm từng phase.

Không nên yêu cầu Codex:

```text
"Implement bài tập 2, 3, 4 toàn bộ"
```

nếu muốn kiểm soát kiến trúc và hiểu code.

Nên làm từng bước.

Ví dụ prompt đầu tiên:

```text
Đọc file CUSTOM_PRICING_ASSIGNMENT.md ở root project.

Hiện tại project đã:
- tạo Shopify App bằng Shopify App Template React Router
- cài và sử dụng Shopify Polaris
- app đã install vào development store
- Theme App Extension đã được bật

Chỉ tập trung vào PHASE 1 của BÀI TẬP 2.

Hãy:
1. Inspect cấu trúc project hiện tại.
2. Không tự ý thay đổi architecture lớn.
3. Xác định nơi phù hợp để đặt types, services, hooks và Redux store.
4. Đề xuất implementation plan trước.
5. Chưa code ngay.
6. Nếu có vấn đề với architecture hiện tại, giải thích rõ lý do.

Sau khi tôi đồng ý plan mới bắt đầu implement.
```

Sau đó làm từng phase:

```text
Implement Phase 2 — Rule List.
```

```text
Implement Phase 3 — Create Rule.
```

```text
Implement Phase 4 — Edit Rule.
```

v.v.

---

# 57. Thứ tự ưu tiên hiện tại

**Không làm Backend ngay.**

Thứ tự nên là:

```text
BÀI 2
  │
  ├── Types
  ├── Mock data
  ├── Redux
  ├── API abstraction
  ├── Rule List
  ├── Create
  ├── Edit
  ├── Duplicate
  ├── Remove
  ├── Product Preview
  └── Sender Email
          │
          ▼
       HOÀN THÀNH
          │
          ▼
BÀI 3
  │
  ├── Koa
  ├── REST API
  ├── MySQL
  ├── Sequelize
  └── Shopify GraphQL
          │
          ▼
BÀI 4
  │
  ├── Metafield
  ├── Theme App Extension
  ├── Liquid
  ├── Webhook
  ├── PDP pricing
  └── Money format
```

Đây là cách triển khai giúp từng bài có thể chạy độc lập và dễ debug.
