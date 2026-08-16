# Mini App — Custom Pricing

App Shopify cho phép merchant tạo rule giảm giá theo tag sản phẩm, và hiển thị giá đã giảm trên Product Detail Page của storefront (chỉ ở trang details).

File này ghi lại **đã làm được gì** và **còn thiếu gì**.

---

## Kiến trúc

Đúng 3 thành phần như đề bài yêu cầu:

| Thành phần | Công nghệ | Thư mục |
|---|---|---|
| **App** | Shopify App Template (React Router) + Polaris + Redux Toolkit | `app/`, `extensions/` |
| **API** | KoaJS + Koa Router + Koa Bodyparser | `server/` |
| **Database** | MySQL + Sequelize (migration) | `server/models/`, `server/migrations/` |

### Vì sao có 2 tầng server

`app/` (React Router) chạy trên tunnel public,
`server/` (Koa) chạy ở `localhost:8080`. 
Browser không gọi thẳng Koa được (Chrome chặn theo Private Network Access), nên mọi request `/api/*` của frontend đi qua proxy [app/routes/api.$.tsx](app/routes/api.$.tsx), và shop domain lấy từ session Shopify.

Ranh giới đã chốt:

| Loại dữ liệu | Gọi Shopify ở đâu | Vì sao |
|---|---|---|
| Read-only cho UI (product, product tags) | **App layer** — `app/routes/api.*.tsx` dùng `authenticate.admin` | Luôn có session merchant, không lưu gì xuống DB |
| Không có session merchant (webhook, đẩy metafield, sync shop) | **Koa** — token đọc từ bảng `shops` | Webhook bắn vào lúc không ai mở app |

---

## Chạy local

```bash
npm install
npm run db:migrate        # tạo bảng shops, rules
npm run dev:server        # Koa, cổng API_PORT (mặc định 8080)
npm run dev               # Shopify CLI: tunnel + react-router + push extension
```

Biến môi trường cần có trong `.env`:

```
DB_HOST= DB_PORT= DB_NAME= DB_USER= DB_PASSWORD=   # MySQL cho Sequelize
DATABASE_URL=                                       # Prisma (session storage của Shopify)
API_PORT=8080
BACKEND_URL=http://localhost:8080                   # app layer gọi sang Koa
VITE_API_BASE_URL=                                  # frontend gọi proxy /api
SHOPIFY_API_VERSION=2026-07
```

`SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` / `SCOPES` / `SHOPIFY_APP_URL` do Shopify CLI quản lý.

---

## Bài tập 1 — Shopify App Development Start

| # | Yêu cầu | Trạng thái | Ở đâu |
|---|---|---|---|
| 1 | Dùng Shopify App Template Node | ✅ | Template React Router (bản kế nhiệm của Remix template) |
| 2 | Scopes `read_products, read_themes, read_customers, write_themes` | ✅ | [shopify.app.toml](shopify.app.toml) |
| 3 | AfterAuth — create shop (id, token, name) | ✅ | `hooks.afterAuth` → `installShop()` trong [app/shopify.server.ts](app/shopify.server.ts) → `POST /api/shops/install` → `createOrReactivateShop()` |
| 3b | Setup protected customer data | ⚠️ **Cần tự xác nhận** | Cấu hình ở Partner Dashboard, không nằm trong repo |
| 4 | Theme App Extension — app embed block log `"Hello from [DEV NAME]"` | ✅ | [blocks/hello_embed.liquid](extensions/vinhhv-app-embed/blocks/hello_embed.liquid) |

`afterAuth` là **hook thật**, không phải loader — trước đây việc tạo shop nằm trong loader của trang Home nên chạy lại mỗi lần merchant mở app; đã sửa.

---

## Bài tập 2 — Frontend (React + Polaris + Redux)

### Giao diện

| # | Yêu cầu | Trạng thái | Ở đâu |
|---|---|---|---|
| a | General information: Name (bắt buộc), Status enable/disable | ✅ | [RuleForm.tsx](app/components/RuleForm/RuleForm.tsx) |
| b | Apply to Products: All products / Product Tags (nhập tag + Enter) | ✅ | `productConditionType` = `ALL` \| `TAGS` |
| c | Custom Prices: 3 loại giảm giá | ✅ | `FIXED_PRICE`, `DECREASE_FIXED`, `DECREASE_PERCENTAGE` |
| d/e | Show product pricing details — bảng Title + Modified Price | ✅ | [usePricingPreview.ts](app/hooks/usePricingPreview.ts) + bảng trong RuleForm |
| f | Show change sender email | ❌ **Không làm** — xem mục "Còn thiếu" |
| g | List rule + edit / duplicate / remove | ✅ | [app.rules.tsx](app/routes/app.rules.tsx) — Polaris `IndexTable` |

### Kỹ thuật

| # | Yêu cầu | Trạng thái | Ghi chú |
|---|---|---|---|
| 2 | Shopify Polaris cho list + create/edit rule | ✅ | Toàn bộ UI dùng Polaris v13 |
| 3 | React hook, client-side rendering, fetch API | ✅ | Gọi API qua [api-client.ts](app/services/api-client.ts) |
| 3+ | **Custom hook (điểm cộng)** | ✅ | `useRules`, `useRule`, `useProducts`, `useProductTags`, `useShopSettings`, `usePricingPreview` |
| 4 | Redux Toolkit quản lý shopData: get, update sender email | ⚠️ **Một nửa** | [shopSlice.ts](app/store/slices/shopSlice.ts) chỉ có `get` |
| 4+ | Áp dụng redux cho data khác | ✅ | [ruleSlice.ts](app/store/slices/ruleSlice.ts) — fetch/create/update/duplicate/remove |

Mock data đã bị xoá sau khi API thật chạy — frontend hiện chạy 100% trên API thật.

---

## Bài tập 3 — Backend (Koa + MySQL + Shopify GraphQL)

### 1. KoaJS — RESTful endpoints

Không dùng Express của template. Koa Router + Koa Bodyparser + centralized error handler ([errorHandler.ts](server/middleware/errorHandler.ts)), response format thống nhất `{success, data}` / `{success, error}`.

**Shop** — [shop.routes.ts](server/routes/shop.routes.ts)

| Method | Path | Dùng ở đâu |
|---|---|---|
| `POST` | `/api/shops` | Đề bài mục 18 (create). Frontend không gọi, test bằng curl |
| `GET` | `/api/shops/:id` | Đề bài mục 18 (read) |
| `PATCH` | `/api/shops/:id` | Đề bài mục 18 (update) |
| `GET` | `/api/shops/current` | Frontend đọc shop theo session, không truyền id |
| `POST` | `/api/shops/current/sync` | Đồng bộ lại từ Shopify |
| `POST` | `/api/shops/install` | `afterAuth` gọi |

**Rule** — [rule.routes.ts](server/routes/rule.routes.ts)

| Method | Path |
|---|---|
| `POST` | `/api/rules` |
| `GET` | `/api/rules` |
| `GET` | `/api/rules/:id` |
| `PATCH` | `/api/rules/:id` |
| `DELETE` | `/api/rules/:id` |
| `POST` | `/api/rules/:id/duplicate` |
| `POST` | `/api/rules/sync-metafield` (Bài 4 — backfill thủ công) |

Mọi truy vấn rule đi qua `getRuleById(id, shopId)` nên **không có đường nào đọc/sửa được rule của shop khác**, kể cả khi client đoán đúng id. Access token không bao giờ được serialize ra API ([shop.mapper.ts](server/mappers/shop.mapper.ts)).

### 2. MySQL + Sequelize

Migration bằng `umzug` là nguồn chuẩn duy nhất cho schema — không dùng `sequelize.sync()`.

```bash
npm run db:migrate         # up
npm run db:migrate:undo    # down
```

Field của `Rule` cố tình đặt tên khớp 1-1 với `app/types/rule.ts`, nên response trả về đúng shape `CPRule` và frontend không phải map lại.

### 3. Shopify resources qua GraphQL Admin API

Dùng GraphQL (không dùng REST legacy). Mọi query đã validate với schema `2026-07`.

| Data | Ở đâu |
|---|---|
| Shop info (name, email, owner name) | [shopify.service.ts](server/services/shopify.service.ts) |
| Products (title, tags, giá) | [api.products.tsx](app/routes/api.products.tsx) |
| Product tags | [api.product-tags.tsx](app/routes/api.product-tags.tsx) |
| Customers | ❌ **Không làm** — xem mục "Còn thiếu" |

---

## Bài tập 4 — Storefront (Liquid + Metafield + Webhook)

Chi tiết đầy đủ + checklist test end-to-end: [BAI_TAP_4_PROGRESS.md](BAI_TAP_4_PROGRESS.md).

| # | Yêu cầu | Trạng thái | Ở đâu |
|---|---|---|---|
| 1 | Liquid object lấy thông tin product | ✅ | [custom_pricing.liquid](extensions/vinhhv-app-embed/blocks/custom_pricing.liquid) — dump `product.id`, `product.tags`, `product.variants`, `shop.money_format` |
| 2 | Metafield — đẩy danh sách rule lên app metafield | ✅ | [metafield.service.ts](server/services/metafield.service.ts) |
| 2.1 | Giải pháp thay thế bằng `write_themes` | ✅ **Không dùng** (dùng sẽ bị trừ 1 điểm) | Làm đúng hướng metafield |
| 3 | Webhook `shop/update` → update email | ✅ | [webhooks.shop.update.tsx](app/routes/webhooks.shop.update.tsx) → `POST /api/webhooks/shop-update` → `syncShopFromShopify()` |
| 3 | Webhook `app/uninstalled` → update status | ✅ | [webhooks.app.uninstalled.tsx](app/routes/webhooks.app.uninstalled.tsx) → `uninstallShop()` → `status = "uninstalled"` |
| 4 | Hiển thị giá discount trên PDP | ✅ | [custom-pricing.js](extensions/vinhhv-app-embed/assets/custom-pricing.js) |
| 4 | Price selector (tránh hard-code 1 selector) | ✅ | Setting nhận **danh sách** selector cách nhau bằng dấu phẩy; để trống thì tự dò theo danh sách theme phổ biến |
| 4 | Format money theo `shop.money_format` | ✅ | Hỗ trợ 4 placeholder của Shopify |

### Metafield: app-data metafield trên `AppInstallation`

- Namespace `custom_pricing`, key `rules`, type `json`.
- Ẩn hoàn toàn khỏi Shopify admin, chỉ app sở hữu đọc được — qua GraphQL hoặc qua object `app` trong Liquid (`app.metafields.custom_pricing.rules`).
- Không cần thêm access scope.

Payload chỉ chứa rule `status = enabled`, đã sort `priority` giảm dần, nên JS ngoài storefront lấy phần tử khớp đầu tiên là xong.

Sync được gọi tự động sau mỗi `create` / `update` / `delete` / `duplicate` rule, **và sau khi cài lại app** — vì cài lại tạo `AppInstallation` mới, metafield của lần cài trước bị xoá trong khi rules vẫn còn trong MySQL.

Sync không bao giờ làm hỏng request chính: `safeSyncRulesToMetafield()` nuốt lỗi và log ra `[metafield] sync failed`. Rule đã nằm trong MySQL rồi, lệch thì backfill bằng `POST /api/rules/sync-metafield`.

### Webhook đi qua react-router rồi mới sang Koa

```
Shopify → app/routes/webhooks.*.tsx   (authenticate.webhook: verify HMAC sẵn)
        → fetch BACKEND_URL/api/webhooks/...
        → Koa controller → service → MySQL
```

Shopify chỉ gọi được vào app URL công khai; Koa không expose ra internet nên không trỏ `uri` thẳng vào được. Đi đường này thì **không phải tự verify HMAC** ở Koa (`koa-bodyparser` đã nuốt mất raw body). Nghiệp vụ + ghi DB vẫn nằm ở Koa.

Webhook được thiết kế **idempotent**: shop không tồn tại / đã uninstalled vẫn trả 200, để Shopify không retry rồi huỷ đăng ký.

### Tính giá trên storefront

- Toàn bộ tính toán bằng **cent**: giá từ Liquid là integer cent (`1999`), `discountValue` trong MySQL là đơn vị tiền (`19.99`) ⇒ nhân 100 cho `FIXED_PRICE` và `DECREASE_FIXED`.
- So sánh tag **case-insensitive**, áp cùng quy tắc ở `app/utils/pricing.ts` để bảng preview trong admin và giá ngoài storefront không lệch nhau.
- Rule hết hạn được lọc lại **ở thời điểm render**q1
- Đổi variant: bám `MutationObserver` trên vùng giá (không có event chuẩn, mỗi theme một kiểu); variant hiện tại đọc từ `form[action*="/cart/add"] [name="id"]`.
- Không rule nào khớp → **không đụng gì vào DOM**.

---

## Còn thiếu 

**3. Collection page / Cart / Checkout**
giá hiển thị là **display-only**. Khách bấm mua vẫn bị tính giá gốc ở checkout.

**5. react-router và Koa**

`/api/webhooks/*`  header `X-Shopify-Shop-Domain`. HMAC đã được `authenticate.webhook` verify ở tầng react-router, nhưng nếu ai đó gọi thẳng được vào Koa thì fake được shop domain. Cách vá: thêm shared-secret header `X-Internal-Token` và check ở Koa.

---

## Cấu trúc thư mục

```
app/                            Shopify App (React Router)
├── components/RuleForm/        Form tạo/sửa rule (Polaris)
├── hooks/                      Custom hooks
├── routes/
│   ├── api.$.tsx               Proxy /api/* → Koa
│   ├── api.products.tsx        GraphQL: products
│   ├── api.product-tags.tsx    GraphQL: product tags
│   ├── app.rules*.tsx          List / create / edit rule
│   └── webhooks.*.tsx          Nhận webhook, forward sang Koa
├── services/                   Client gọi API
├── store/                      Redux Toolkit (shopSlice, ruleSlice)
└── utils/pricing.ts            Logic tính giá cho preview ở admin

server/                         API (KoaJS)
├── config/                     database.ts (Sequelize), shopify.ts (GraphQL client)
├── controllers/                shop, rule, webhook
├── services/                   shop, rule, shopify, metafield
├── models/                     Shop, Rule (Sequelize)
├── migrations/                 umzug
├── validators/ mappers/ middleware/ utils/
└── scripts/sync-metafield.ts   Backfill metafield thủ công

extensions/vinhhv-app-embed/        Theme App Extension
├── blocks/hello_embed.liquid       Bài 1 — console.log
├── blocks/custom_pricing.liquid    Bài 4 — dump data trên PDP
└── assets/custom-pricing.js        Bài 4 — match rule, tính giá, render
```
