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
| 9 | Shopify GraphQL Admin API | Shop info + sync (Koa), Product + Product tags (app layer) | ✅ Done — chờ verify bằng `npm run dev` |

## Phạm vi đã chốt cho Bài 3

Backend chỉ cần: **lưu shop + rule của shop, và lấy product + product tags qua GraphQL để hiển thị trong RuleForm.** Không làm gì ngoài phạm vi này.

Đã xoá vì không phục vụ phạm vi trên:

- `app/routes/api.customers.tsx` — model `rules` không có chiều customer nào, `utils/pricing.ts` chỉ match theo product tags. Customer chỉ là móng cho pricing theo segment (mục 31.3) và cái cớ để đi qua quy trình Protected Customer Data (mục 6). Khi nào rule thật sự cần điều kiện customer thì dựng lại.
- `GET /api/shops/by-shopify-id` (route + controller + `getShopByShopifyId`) — không có trong đề bài, frontend không gọi.
- `app/mocks/mock-data.ts`, `app/services/delay.ts` — frontend đã chạy hoàn toàn trên API thật.
- **Toàn bộ Sender Email** — không làm tính năng này. Đã gỡ: cột `sender_email` (migration `20260816000001-remove-shops-sender-email.ts`), field trong model/mapper/validator/service, `ShopFormValues`, `updateSenderEmail` ở service + Redux thunk, `saveSenderEmail` trong `useShopSettings`, và route `PATCH /api/shops/current` (route này sinh ra chỉ để phục vụ sender email).
  > ⚠️ Đây là **quyết định có ý thức, chấp nhận mất điểm**: đề bài yêu cầu sender email ở mục 12, checklist mục 46 ("Sender email lưu được vào MySQL") và mục 52. Đừng "sửa lại" ở session sau nếu không có yêu cầu mới.

**Không dùng nhưng cố ý giữ:**

| Code | Vì sao giữ |
|---|---|
| `POST /api/shops`, `GET /api/shops/:id` | Đề bài mục 18 + checklist mục 46 ("Create Shop hoạt động", "Read Shop hoạt động") yêu cầu đúng 2 endpoint này. Frontend không gọi, test bằng curl. |
| `server/config/shopify.ts`, `server/services/shopify.service.ts`, `POST /api/shops/current/sync` | Webhook `shop/update` và việc đẩy rules lên Metafields ở Bài 4 chạy khi không có session merchant → bắt buộc đọc token từ bảng `shops`. |
| `server/routes/webhook.routes.ts`, `webhook.controller.ts`, `uninstallShop()` | Khung cho Bài 4. Lưu ý: hiện **chưa được Shopify gọi** — xem mục Bài 4 bên dưới. |

## ⚠️ Ranh giới: gọi Shopify ở Koa hay ở app layer?

Quy ước đã chốt, **đừng làm ngược lại ở session sau**:

| Loại dữ liệu | Gọi ở đâu | Vì sao |
|---|---|---|
| Read-only cho UI (product, product tags, customer) | **App layer** — resource route `app/routes/api.*.tsx` dùng `authenticate.admin` | Luôn có session merchant, không lưu gì xuống DB. Đi qua Koa chỉ thêm 1 hop và một đống mapper/controller vô ích. |
| Không có session merchant (webhook, đẩy metafields, sync shop) | **Koa** — `server/config/shopify.ts` + `server/services/shopify.service.ts`, token đọc từ bảng `shops` | Webhook Shopify bắn vào lúc không ai mở app, bắt buộc lấy token từ DB. |

Route static (`/api/products`, `/api/customers`, `/api/product-tags`) luôn thắng splat `api.$.tsx`;
mọi path khác (`/api/rules`, `/api/shops/*`) vẫn được proxy sang Koa như cũ.

**Thêm route resource mới thì phải restart `npm run dev`** — `app/routes.ts` dùng `flatRoutes()`, danh sách route sinh ở thời điểm config nên Vite không hot-reload được.

## Việc còn thiếu / cần sửa (đối chiếu code ngày 2026-08-16)

### Bài 3 — còn lại

- ~~**`package.json` còn 2 script chết**: `dev:server:sync-db`, `dev:server:test-db` trỏ tới file đã xoá.~~ ✅ Đã gỡ (Task 0 của Bài 4).

> `app/mocks/mock-data.ts` và `app/services/delay.ts` đã được xoá sau Task 9 — toàn bộ frontend đã chạy trên API thật, `npx tsc --noEmit` sạch 0 lỗi.
- **AfterAuth chưa đúng chỗ.** Việc tạo shop đang nằm trong `loader` của `app/routes/app._index.tsx` (gọi `POST /api/shops/install`), nghĩa là chạy lại mỗi lần merchant mở trang Home, không phải hook afterAuth. Chạy được nhưng lệch yêu cầu mục 5 của đề bài.
- **Chưa có test tự động** cho checklist mục 44 (Shop CRUD, Rule CRUD, các case validation).

### Bài 4 — gần như chưa bắt đầu

- ❌ **Webhook `shop/update`**: không có ở cả `shopify.app.toml` lẫn `server/`. Email shop chưa được sync về DB.
- ⚠️ **Webhook `app/uninstalled` — đang có 2 bản và bản Koa đang chết.** `shopify.app.toml` khai `uri = "/webhooks/app/uninstalled"` → Shopify gọi vào `app/routes/webhooks.app.uninstalled.tsx` (chỉ xoá session Prisma). Endpoint Koa `POST /api/webhooks/app-uninstalled` có logic `uninstallShop()` nhưng **không ai gọi** → `shops.status` không bao giờ đổi thành uninstalled. Cần nối 2 bên lại (route react-router gọi sang Koa, hoặc trỏ webhook uri thẳng vào Koa).
- ❌ **Webhook chưa verify HMAC** ở phía Koa (`webhook.controller.ts` chỉ đọc header `X-Shopify-Shop-Domain`).
- ❌ **Metafields**: chưa push pricing rules lên Shopify.
- ❌ **Theme App Extension pricing**: `extensions/vinhhv-app-embed/blocks/hello_embed.liquid` mới chỉ `console.log("Hello from Vinh")` (đủ cho Bài 1). Chưa có Liquid `product`, chưa match rule, chưa tính/replace giá trên PDP, chưa dùng `shop.money_format`.

### Thứ tự đề xuất làm tiếp

1. Chạy `npm run db:migrate` để drop cột `sender_email`.
2. Gỡ 2 script chết trong `package.json`.
3. Bài 4 — nối webhook `app/uninstalled` về Koa + thêm `shop/update` (gọi `syncShopFromShopify`) + verify HMAC.
4. Bài 4 — Metafields + Theme App Extension pricing trên PDP + money format.

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
  ├── config/{database,shopify}.ts
  ├── models/{Shop,Rule}.ts
  ├── migrations/2026081300000{1,2}-create-{shops,rules}.ts
  ├── routes/{shop,rule,webhook}.routes.ts
  ├── controllers/{shop,rule,webhook}.controller.ts
  ├── services/{shop,rule}.services.ts + shopify.service.ts
  ├── validators/{shop,rule}.validator.ts
  ├── mappers/{shop,rule}.mapper.ts
  ├── middleware/errorHandler.ts
  └── utils/{AppError,response,request}.ts
  ```
- Route Shop hiện có: `GET /api/shops/current`, `POST /api/shops/current/sync`, `POST /api/shops`, `GET /api/shops/:id`, `PATCH /api/shops/:id`, `POST /api/shops/install`.
- **Frontend chỉ đọc shop qua `GET /api/shops/current`**, không truyền shop id. Shop được xác định từ session Shopify (proxy `api.$.tsx` gắn header `X-Shopify-Shop-Domain`). Nhóm `/:id` không được frontend gọi, chỉ giữ để thoả mục 18 + checklist mục 46 và test bằng curl.
- Resource route ở app layer: `app/routes/api.products.tsx`, `api.product-tags.tsx` — dùng `authenticate.admin` + `admin.graphql`, trả về cùng format `{success, data}` để `apiRequest` bóc vỏ như API của Koa.
- `SHOPIFY_API_VERSION=2026-07` trong `.env` (khớp `ApiVersion.July26` ở `app/shopify.server.ts`). Query GraphQL đã được validate với schema version này.
- Frontend gọi API qua `app/services/api-client.ts` (`apiRequest`), base URL lấy từ env `VITE_API_BASE_URL`; backend URL phía server dùng `process.env.BACKEND_URL`.

## Cách dùng file này ở session mới

Yêu cầu Claude đọc file `BAI_TAP_3_PROGRESS.md` rồi nói: "tiếp Task 9" (hoặc task đang ⏳ tiếp theo). Claude sẽ đưa code copy-paste theo đúng mạch đã thiết kế ở trên.
