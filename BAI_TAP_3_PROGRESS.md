# Bài tập 3 — Backend API (Koa + MySQL/Sequelize + Shopify Resources)

> File này để lưu lại roadmap + tiến độ, dùng để tiếp tục công việc ở session Claude Code khác.
> Đề bài gốc đầy đủ: xem `CLAUDE_TASK.md`.
> Cách làm việc: Claude đưa code từng task, người dùng tự copy-paste vào file rồi chạy thử (không để Claude tự động sửa file).
>
> **Cập nhật lần cuối:** 2026-08-16 (đã đối chiếu lại với code thực tế).

## Roadmap — 9 task

| # | Task | Nội dung | Trạng thái |
|---|------|----------|------------|
| 1 | Chuẩn hoá Model | Sửa `server/models/Shop.ts`, `server/models/Rule.ts` cho khớp `app/types/shop.ts`, `app/types/rule.ts` | ✅ Done |
| 2 | Migration | Thay `sync({alter:true})` bằng migration thật dùng `umzug` (`server/migrations/*.ts`, `server/migrate.ts`) | ✅ Done |
| 3 | Koa infra | Response format chuẩn `{success, data}` / `{success, error}` + centralized error handler middleware | ✅ Done |
| 4 | Shop API | `POST /api/shops`, `GET /api/shops/:id`, `PATCH /api/shops/:id` (không lộ token) | ✅ Done |
| 5 | Rule API | `POST/GET/GET :id/PATCH/DELETE /api/rules`, `POST /api/rules/:id/duplicate` | ✅ Done |
| 6 | Validation | Validator cho Rule (name, status, productConditionType, tags, discountType, discountValue) và Shop | ✅ Done — `server/validators/{rule,shop}.validator.ts`, đã wire vào cả 2 controller |
| 7 | Kết nối Frontend | `app/services/rules.service.ts`, `app/services/shop.service.ts` gọi API thật thay vì mock | ✅ Done (còn `products.service.ts` chưa xong — xem Task 9) |
| 8 | Test bằng curl/Postman | Theo checklist mục 44-45 trong `CLAUDE_TASK.md` | ✅ Done (test thủ công; **chưa có test tự động**, `package.json` không có script `test`) |
| 9 | Shopify GraphQL Admin API | Service lấy Shop info (email, name), Product (title, tags, price), Customer — dùng cho pricing & sync | ⏳ **Todo** |

## Việc còn thiếu / cần sửa (đối chiếu code ngày 2026-08-16)

### Bài 3 — còn lại

- **Task 9 — GraphQL Admin API (chưa làm).** Chưa có `server/services/shopify.service.ts`. Hiện chỉ có đúng 1 query inline `shop { id name }` trong loader `app/routes/app._index.tsx`. Chưa có Product, chưa có Customer.
- **Product vẫn dùng mock.** `app/services/products.service.ts` và `app/components/RuleForm/RuleForm.tsx` vẫn import `mockProducts` từ `app/mocks/mock-data`. → Tiêu chí mục 46 "Frontend không còn phụ thuộc mock data" chưa đạt cho phần Product Pricing Details. Phải làm sau khi có Task 9.
- **Bug hard-code shop id.** `app/services/shop.service.ts` PATCH thẳng vào `/api/shops/1`. Nếu shop có id khác thì update sender email sẽ ghi sai shop. Cách sửa: dùng id trả về từ `getShop()`, hoặc thêm route `PATCH /api/shops/current` (nhận `X-Shopify-Shop-Domain` giống `GET /api/shops/current`).
- **AfterAuth chưa đúng chỗ.** Việc tạo shop đang nằm trong `loader` của `app/routes/app._index.tsx` (gọi `POST /api/shops/install`), nghĩa là chạy lại mỗi lần merchant mở trang Home, không phải hook afterAuth. Chạy được nhưng lệch yêu cầu mục 5 của đề bài.
- **Chưa có test tự động** cho checklist mục 44 (Shop CRUD, Rule CRUD, các case validation).

### Bài 4 — gần như chưa bắt đầu

- ❌ **Webhook `shop/update`**: không có ở cả `shopify.app.toml` lẫn `server/`. Email shop chưa được sync về DB.
- ⚠️ **Webhook `app/uninstalled` — đang có 2 bản và bản Koa đang chết.** `shopify.app.toml` khai `uri = "/webhooks/app/uninstalled"` → Shopify gọi vào `app/routes/webhooks.app.uninstalled.tsx` (chỉ xoá session Prisma). Endpoint Koa `POST /api/webhooks/app-uninstalled` có logic `uninstallShop()` nhưng **không ai gọi** → `shops.status` không bao giờ đổi thành uninstalled. Cần nối 2 bên lại (route react-router gọi sang Koa, hoặc trỏ webhook uri thẳng vào Koa).
- ❌ **Webhook chưa verify HMAC** ở phía Koa (`webhook.controller.ts` chỉ đọc header `X-Shopify-Shop-Domain`).
- ❌ **Metafields**: chưa push pricing rules lên Shopify.
- ❌ **Theme App Extension pricing**: `extensions/vinhhv-app-embed/blocks/hello_embed.liquid` mới chỉ `console.log("Hello from Vinh")` (đủ cho Bài 1). Chưa có Liquid `product`, chưa match rule, chưa tính/replace giá trên PDP, chưa dùng `shop.money_format`.

### Thứ tự đề xuất làm tiếp

1. Task 9 — `server/services/shopify.service.ts` (GraphQL: shop / products / customers).
2. Thay mock trong `products.service.ts` + `RuleForm.tsx` bằng API thật.
3. Fix hard-code `/api/shops/1`.
4. Bài 4 — nối webhook `app/uninstalled` về Koa + thêm `shop/update` + verify HMAC.
5. Bài 4 — Metafields + Theme App Extension pricing trên PDP + money format.

## Bối cảnh quan trọng đã xác nhận (không cần phân tích lại)

- Dependencies cho Koa/MySQL đã có sẵn trong `package.json`: `koa`, `@koa/router`, `koa-bodyparser`, `@koa/cors`, `sequelize`, `mysql2`, `umzug` (dev, dùng cho migration). Không cần cài thêm cho các task đã làm.
- Field của Rule cố tình đặt tên khớp 1-1 với `app/types/rule.ts` (`productConditionType: ALL|TAGS`, `productTags`, `discountType: FIXED_PRICE|DECREASE_FIXED|DECREASE_PERCENTAGE`, `status: enabled|disabled`, `priority`) → response trả về đúng shape `CPRule`, **frontend không phải sửa type nào**.
- `Shop.token` (access token Shopify) không bao giờ được serialize ra API — xử lý ở `server/mappers/shop.mapper.ts`.
- **Migration (`npm run db:migrate`) là nguồn chuẩn duy nhất cho schema.** `sync-db.ts` / `test-db.ts` đã bị xoá, không dùng `sequelize.sync()` nữa.
- Cấu trúc `server/` hiện tại:
  ```
  server/
  ├── app.ts                  (Koa + cors + errorHandler + bodyParser + routes, cổng API_PORT mặc định 8080)
  ├── migrate.ts
  ├── config/database.ts
  ├── models/{Shop,Rule}.ts
  ├── migrations/2026081300000{1,2}-create-{shops,rules}.ts
  ├── routes/{shop,rule,webhook}.routes.ts
  ├── controllers/{shop,rule,webhook}.controller.ts
  ├── services/{shop,rule}.services.ts
  ├── validators/{shop,rule}.validator.ts
  ├── mappers/{shop,rule}.mapper.ts
  ├── middleware/errorHandler.ts
  └── utils/{AppError,response}.ts
  ```
- Route Shop hiện có: `GET /api/shops/current`, `GET /api/shops/by-shopify-id`, `POST /api/shops`, `GET /api/shops/:id`, `PATCH /api/shops/:id`, `POST /api/shops/install`.
- Frontend gọi API qua `app/services/api-client.ts` (`apiRequest`), base URL lấy từ env `VITE_API_BASE_URL`; backend URL phía server dùng `process.env.BACKEND_URL`.

## Cách dùng file này ở session mới

Yêu cầu Claude đọc file `BAI_TAP_3_PROGRESS.md` rồi nói: "tiếp Task 9" (hoặc task đang ⏳ tiếp theo). Claude sẽ đưa code copy-paste theo đúng mạch đã thiết kế ở trên.
