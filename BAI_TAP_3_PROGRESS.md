# Bài tập 3 — Backend API (Koa + MySQL/Sequelize + Shopify Resources)

> File này để lưu lại roadmap + tiến độ, dùng để tiếp tục công việc ở session Claude Code khác.
> Đề bài gốc đầy đủ: xem `CLAUDE_TASK.md`.
> Cách làm việc: Claude đưa code từng task, người dùng tự copy-paste vào file rồi chạy thử (không để Claude tự động sửa file).

## Roadmap — 9 task

| # | Task | Nội dung | Trạng thái |
|---|------|----------|------------|
| 1 | Chuẩn hoá Model | Sửa `server/models/Shop.ts`, `server/models/Rule.ts` cho khớp `app/types/shop.ts`, `app/types/rule.ts` | ✅ Done |
| 2 | Migration | Thay `sync({alter:true})` bằng migration thật dùng `umzug` (`server/migrations/*.ts`, `server/migrate.ts`) | ✅ Done (đã paste code, đang chờ xác nhận chạy `npm run db:migrate` thành công) |
| 3 | Koa infra | Response format chuẩn `{success, data}` / `{success, error}` + centralized error handler middleware | ✅ Done |
| 4 | Shop API | Hoàn thiện `POST /api/shops`, `GET /api/shops/:id`, `PATCH /api/shops/:id` (không lộ token) | ✅ Done |
| 5 | Rule API | `POST/GET/GET :id/PATCH/DELETE /api/rules`, `POST /api/rules/:id/duplicate` | ✅ Done |
| 6 | Validation | Validator cho Rule (name, status, applyType, tags, discountType, discountValue) và Shop | ⏳ Todo |
| 7 | Kết nối Frontend | Thay `app/services/rules.service.ts`, `app/services/shop.service.ts` gọi API thật thay vì mock, giữ nguyên hook/Redux | ⏳ Todo |
| 8 | Test bằng curl/Postman | Theo checklist mục 44-45 trong `CLAUDE_TASK.md` | ⏳ Todo |
| 9 | Shopify GraphQL Admin API | Service lấy Shop info (email, name), Product (title, tags, price), Customer — dùng cho pricing & sync | ⏳ Todo |

## Bối cảnh quan trọng đã xác nhận (không cần phân tích lại)

- Dependencies cần thiết cho Koa/MySQL đã có sẵn trong `package.json`: `koa`, `@koa/router`, `koa-bodyparser`, `sequelize`, `mysql2`. Không cần cài thêm cho các task này (trừ `umzug` — devDependency mới thêm ở Task 2 để chạy migration).
- Model server ban đầu (`shopifyShopId/shopifyDomain/firstName/currency` cho Shop; `type/value/status(active|inactive)` cho Rule) **lệch với type frontend** (`CPRule`, `Shop` trong `app/types/`) — đã sửa ở Task 1.
- Thiết kế field Rule cố tình đặt tên khớp 1-1 với `app/types/rule.ts` (`productConditionType`, `productTags`, `discountType`, `discountValue`, `status: enabled|disabled`, `priority`) để khi viết mapper ở Task 5, response trả về đúng shape `CPRule` — **frontend không cần sửa type nào**.
- `Shop.token` (access token Shopify) không bao giờ được serialize ra API — sẽ xử lý ở mapper của Task 4.
- Trước đó có dùng `npm run dev:server:sync-db` (`sequelize.sync({alter:true})`) để test nhanh — từ Task 2 trở đi, **migration (`npm run db:migrate`) là nguồn chuẩn cho schema**, không chạy song song với sync-db nữa để tránh lệch schema.
- Route Shop hiện tại dùng `PUT` cho update — đề bài yêu cầu `PATCH` (`/api/shops/:id`) — cần sửa lại ở Task 4.
- Cấu trúc thư mục `server/` hiện có: `app.ts`, `config/database.ts`, `models/{index,Shop,Rule}.ts`, `migrations/*.ts`, `migrate.ts`, `routes/shop.routes.ts`, `controllers/shop.controller.ts`, `services/shop.services.ts`, `sync-db.ts`, `test-db.ts`.

## Cách dùng file này ở session mới

Dán nội dung file này (hoặc yêu cầu Claude đọc file `BAI_TAP_3_PROGRESS.md`) rồi nói: "tiếp Task 3" (hoặc task đang ⏳ tiếp theo). Claude sẽ đưa code copy-paste theo đúng mạch đã thiết kế ở trên.
