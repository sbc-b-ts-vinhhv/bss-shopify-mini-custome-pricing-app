# Bài tập 4 — Shopify API / Webhook / Storefront (PDP)

> File này để lưu roadmap + tiến độ, dùng để tiếp tục công việc ở session Claude Code khác.
> Đề bài gốc đầy đủ: xem `CLAUDE_TASK.md` mục 33–36. Bài 3: xem `BAI_TAP_3_PROGRESS.md`.
> Cách làm việc: Claude đưa code từng task, người dùng tự copy-paste vào file rồi chạy thử (không để Claude tự động sửa file).
>
> **Cập nhật lần cuối:** 2026-08-16 (khảo sát code thực tế trước khi chia task).

## Roadmap — 11 task

| # | Task | Nội dung | Trạng thái |
|---|------|----------|------------|
| 0 | Dọn nợ Bài 3 | Gỡ 2 script chết trong `package.json`; thống nhất `api_version` trong `shopify.app.toml` với `SHOPIFY_API_VERSION=2026-07` | ✅ Done |
| 1 | Sửa route webhook Koa | `server/routes/webhook.routes.ts` đang là `router.post("/app-uninstalled")` — **thiếu handler**, route chết. Wire `appUninstalledController` vào | ✅ Done |
| 2 | Webhook `app/uninstalled` | `app/routes/webhooks.app.uninstalled.tsx` forward sang Koa → `uninstallShop()` đổi `shops.status = uninstalled` | ✅ Done |
| 3 | Webhook `shop/update` | Khai topic trong `shopify.app.toml` + route `app/routes/webhooks.shop.update.tsx` + endpoint Koa gọi `syncShopFromShopify()` (update email/name/ownerName) | ✅ Done |
| 4 | Service đẩy Metafield | `server/services/metafield.service.ts`: query `currentAppInstallation.id` → `metafieldsSet` JSON rules lên app-data metafield | ✅ Done |
| 5 | Nối sync vào vòng đời rule | Gọi sync sau create/update/delete/duplicate + endpoint thủ công `POST /api/rules/sync-metafield` để backfill/test | ⏳ |
| 6 | Block PDP (Liquid) | Block mới trong `extensions/vinhhv-app-embed/blocks/`: chỉ chạy trên PDP, dump `product` + `app.metafields` + `shop.money_format` ra JSON | ⏳ |
| 7 | Matching + tính giá (JS) | Port `app/utils/pricing.ts` sang vanilla JS trong extension: lọc rule enabled/chưa hết hạn → match tag → chọn theo `priority` → tính giá | ⏳ |
| 8 | Money format | Hàm `formatMoney` theo `shop.money_format` (4 placeholder của Shopify) thay cho `Intl.NumberFormat` hardcode USD | ⏳ |
| 9 | Render giá lên PDP | Setting `price_selector` trong schema block, thay text giá, giữ giá gốc gạch ngang, xử lý đổi variant | ⏳ |
| 10 | Test end-to-end | Checklist ở cuối file | ⏳ |

Thứ tự bắt buộc: 1 → 2 → 3 (webhook), rồi 4 → 5 (metafield), rồi 6 → 7 → 8 → 9 (storefront). Task 0 làm lúc nào cũng được.

---

## Hiện trạng đã khảo sát (không cần đọc lại code)

| Thứ | Trạng thái thực tế |
|---|---|
| `shopify.app.toml` | Chỉ khai 2 topic: `app/uninstalled` (uri `/webhooks/app/uninstalled`), `app/scopes_update`. **Chưa có `shop/update`.** `api_version = "2026-10"` — lệch với `SHOPIFY_API_VERSION=2026-07` ở `.env` và `ApiVersion.July26` ở `app/shopify.server.ts`. |
| `app/routes/webhooks.app.uninstalled.tsx` | Có, dùng `authenticate.webhook` (SDK tự verify HMAC), nhưng **chỉ xoá session Prisma** — không đụng bảng `shops`. |
| `server/routes/webhook.routes.ts` | `router.post("/app-uninstalled");` — **không truyền handler**, route đăng ký rỗng. |
| `server/controllers/webhook.controller.ts` | `appUninstalledController` đã viết xong, đọc `X-Shopify-Shop-Domain`, gọi `uninstallShop()`. Chưa ai gọi tới. |
| `server/services/shopify.service.ts` | Đã có `fetchShopInfo()` (token đọc từ DB) và `syncShopFromShopify()` — **dùng được ngay cho `shop/update`, không phải viết mới.** |
| `server/config/shopify.ts` | `shopifyGraphql(shopDomain, accessToken, query, variables)` — client GraphQL server-side, dùng cho metafieldsSet ở Task 4. |
| `extensions/vinhhv-app-embed/` | `blocks/hello_embed.liquid` mới chỉ `console.log("Hello from Vinh")` (đủ cho Bài 1). Chưa có gì cho Bài 4. |
| `app/utils/pricing.ts` | Đã có `calculateModifiedPrice()` + `getApplicableProducts()` — logic chuẩn để port sang JS ở Task 7. `formatMoney()` đang hardcode USD, Task 8 thay bằng `money_format`. |
| Scopes | `read_products,read_themes,read_customers,write_themes`. **App-data metafield không cần thêm scope** (xem mục quyết định bên dưới). |

---

## Các quyết định đã chốt (đừng làm ngược lại ở session sau)

### 1. Webhook đi qua react-router rồi mới forward sang Koa

Shopify chỉ gọi được vào **app URL công khai** (server react-router qua tunnel). Koa chạy ở `API_PORT=8080` **không expose ra internet** → không thể trỏ `uri` thẳng vào Koa.

Luồng chốt:

```
Shopify → app/routes/webhooks.*.tsx  (authenticate.webhook: verify HMAC sẵn)
        → fetch BACKEND_URL/api/webhooks/...  (header X-Shopify-Shop-Domain)
        → Koa controller → service → MySQL
```

Ưu điểm: **không phải tự verify HMAC** ở Koa. Nếu trỏ thẳng vào Koa thì phải giữ raw body (mà `koa-bodyparser` đã nuốt mất) rồi tự `crypto.createHmac("sha256", API_SECRET)` — thừa việc.
Nghiệp vụ + ghi DB **vẫn nằm ở Koa**, đúng tinh thần đề bài. Đây cũng đúng pattern `installShop()` trong `app/shopify.server.ts` đang dùng.

> Nếu muốn cộng điểm: thêm header shared-secret (`X-Internal-Token`) vào request nội bộ và check ở Koa, vì `/api/webhooks/*` hiện tin tuyệt đối vào header `X-Shopify-Shop-Domain`.

### 2. Metafield: dùng **app-data metafield** trên `AppInstallation`

Xác nhận từ docs Shopify:

- App-data metafield gắn với **app installation**, ẩn hoàn toàn khỏi Shopify admin, **chỉ app sở hữu đọc được** — qua GraphQL hoặc qua **object `app` trong Liquid** (chính xác cái Theme App Extension cần).
- **Không khai được trong `shopify.app.toml`** và **không cần namespace `$app`** (owner `AppInstallation` đã đủ isolation).
- Không cần thêm access scope.

Cách làm:

```graphql
query { currentAppInstallation { id } }

mutation SetRules($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id namespace key }
    userErrors { field message }
  }
}
# ownerId: gid://shopify/AppInstallation/xxx
# namespace: "custom_pricing", key: "rules", type: "json"
```

Đọc ở Liquid trong Theme App Extension: `app.metafields.custom_pricing.rules`.

Chốt: `namespace = "custom_pricing"`, `key = "rules"`, `type = "json"`.

> **Không làm mục 2.1** (đẩy rule lên theme bằng `write_themes`) — đề bài ghi rõ giải pháp đó **bị trừ 1 điểm**. Scope `write_themes` giữ nguyên vì Bài 1 yêu cầu, không dùng tới.

### 3. Shape JSON đẩy lên metafield

Đẩy **cả danh sách rule của shop**, đã lọc `status = enabled`, sort theo `priority` giảm dần. Giữ tên field khớp `app/types/rule.ts` để JS ở extension dùng lại logic của `app/utils/pricing.ts` không phải map lại:

```json
{
  "updatedAt": "2026-08-16T10:00:00.000Z",
  "rules": [
    {
      "id": "1",
      "name": "Summer sale",
      "priority": 10,
      "endAt": null,
      "productCondition": { "type": "TAGS", "tags": ["sale", "summer"] },
      "discount": { "type": "DECREASE_PERCENTAGE", "value": 20 }
    }
  ]
}
```

Bỏ `status` (đã lọc), bỏ `createdAt`/`updatedAt` từng rule, bỏ `shopId`.
Giới hạn metafield `json` là 64KB → với vài chục rule thì thoải mái, nhưng Task 4 vẫn nên chặn/cảnh báo khi payload vượt ngưỡng.

### 4. Storefront chỉ chạy trên PDP

App embed block `target = "body"` chạy trên **mọi trang**. Phải tự chặn:

```liquid
{% if template.name == 'product' and product %}
```

Không tạo app embed block thứ hai chỉ để bật/tắt — thêm block riêng cho pricing để tách bạch với `hello_embed` (Bài 1 vẫn phải giữ nguyên `console.log("Hello from Vinh")`).

### 5. Truyền data sang JS bằng thẻ `<script type="application/json">`

Không nhét Liquid vào giữa JS bằng string nối. Dump một cục JSON rồi `JSON.parse(document.getElementById(...).textContent)` — tránh lỗi escape khi tag/tên sản phẩm có dấu nháy.

Data cần dump ở Task 6:

| Field | Nguồn Liquid |
|---|---|
| `productId` | `{{ product.id }}` |
| `tags` | `{{ product.tags | json }}` |
| `moneyFormat` | `{{ shop.money_format | json }}` |
| `variants` | `{{ product.variants | map: 'id' }}` + `price` (đơn vị **cent**) |
| `rules` | `{{ app.metafields.custom_pricing.rules.value | json }}` |

> ⚠️ Giá trong Liquid là **integer cent** (`product.price` = 1999 ⇒ $19.99). Rule lưu trong MySQL là **đơn vị tiền** (19.99). Task 7 phải quy về cùng đơn vị — chốt: **tính toán bằng cent**, nhân `discountValue` với 100 khi type là `FIXED_PRICE` / `DECREASE_FIXED`.

---

## Chi tiết từng task

### Task 0 — Dọn nợ Bài 3 ✅

- ~~Gỡ `dev:server:sync-db`, `dev:server:test-db` trong `package.json`~~ — đã gỡ từ trước, ghi chú ở `BAI_TAP_3_PROGRESS.md` bị lỗi thời.
- `shopify.app.toml`: `[webhooks] api_version` đổi `2026-10` → `2026-07`.
  > **Không nâng lên 2026-10 được**: enum `ApiVersion` trong `@shopify/shopify-api` đang cài dừng ở `July26 = '2026-07'` (xem `node_modules/@shopify/shopify-api/lib/types.ts`). Muốn dùng 2026-10 phải bump dependency trước. Giờ cả 3 chỗ (`toml`, `.env`, `app/shopify.server.ts`) đều là 2026-07.
  > Config chỉ có hiệu lực phía Shopify sau khi `shopify app deploy` / `npm run dev` — gộp luôn với Task 3.

### Task 1 — Sửa route webhook Koa

`server/routes/webhook.routes.ts` hiện đăng ký route rỗng. Wire `appUninstalledController` và chuẩn bị chỗ cho `shopUpdateController`:

- `POST /api/webhooks/app-uninstalled`
- `POST /api/webhooks/shop-update`

### Task 2 — `app/uninstalled` → đổi `shops.status`

Sửa `app/routes/webhooks.app.uninstalled.tsx`: sau khi xoá session Prisma, `fetch` sang `${BACKEND_URL}/api/webhooks/app-uninstalled`.

Lưu ý:
- Webhook có thể bắn nhiều lần → `uninstallShop()` phải idempotent (shop không tồn tại / đã uninstalled thì trả 200, không throw).
- **Luôn trả `new Response()` (200)** cho Shopify kể cả khi Koa lỗi — nếu không Shopify sẽ retry và cuối cùng huỷ đăng ký webhook. Log lỗi rồi nuốt.
- Token trong bảng `shops` sau uninstall là token chết → mọi luồng gọi Shopify bằng token DB phải check `status === "uninstalled"` (`fetchShopInfo()` đã làm rồi).

### Task 3 — `shop/update` → đồng bộ email

1. `shopify.app.toml`: thêm subscription topic `shop/update`, uri `/webhooks/shop/update`.
2. Tạo `app/routes/webhooks.shop.update.tsx` (`authenticate.webhook` → forward sang Koa).
3. Koa: `shopUpdateController` gọi `syncShopFromShopify(shopDomain)` — hàm này **đã có sẵn**, tự đọc token từ DB rồi update `email`, `name`, `ownerName`, `shopifyId`.
   > Payload webhook đã chứa sẵn `email`/`name`, nhưng gọi lại GraphQL vẫn tốt hơn: một nguồn sự thật, không phải map payload REST-shape.
4. `shopify app deploy` (hoặc restart `npm run dev`) để Shopify đăng ký topic mới. **Không deploy thì webhook không bao giờ bắn.**
5. Test: Shopify Admin → Settings → Store details → đổi email → xem `shops.email` trong MySQL.

### Task 4 — Service đẩy metafield ✅

File mới `server/services/metafield.service.ts`:

- `getAppInstallationId(shopDomain, token)` — query `currentAppInstallation { id }`.
- `buildRulesPayload(shopId)` — lấy rule enabled của shop, sort `priority` desc, map về shape ở mục 3 trên.
- `syncRulesToMetafield(shopDomain)` — ghép 2 cái trên + `metafieldsSet`, check `userErrors`.

Dùng `shopifyGraphql()` của `server/config/shopify.ts` (token từ DB). Không gọi từ app layer — đây là luồng có thể chạy khi không có session merchant.

Đã verify: metafield `gid://shopify/Metafield/46791206076473`, `type: json`, đọc lại ra đúng shape.

Hai bẫy đã xử lý (đừng refactor mất):
- `discountValue` là `DECIMAL(10,2)` ⇒ Sequelize trả **string** `"20.00"` ⇒ phải `Number()` trong `buildRulesPayload`, không thì JS storefront ra `NaN`.
- `value` truyền cho `metafieldsSet` phải là **string** ⇒ `JSON.stringify(payload)`, không đưa object.

Thêm `server/scripts/sync-metafield.ts` để chạy tay: `npx tsx server/scripts/sync-metafield.ts <shop>.myshopify.com`.

> Tên file service trong repo là **số ít**: `rule.service.ts`, `shop.service.ts`, `shopify.service.ts`. Import bằng đường **relative** (`./shop.service.js`), đừng dùng `server/...` — nó chỉ chạy nhờ `baseUrl` trong `tsconfig.json`.

### Task 5 — Nối sync vào vòng đời rule

Trong `server/services/rule.services.ts`, sau mỗi `create` / `update` / `delete` / `duplicate` thành công → gọi `syncRulesToMetafield(shopDomain)`.

- Sync **không được làm hỏng request chính**: bọc try/catch, log lỗi, vẫn trả 200 cho frontend. Rule đã lưu MySQL rồi, metafield lệch thì backfill sau.
- Thêm `POST /api/rules/sync-metafield` để backfill thủ công + test bằng curl.

### Task 6 — Block Liquid trên PDP

File mới `extensions/vinhhv-app-embed/blocks/custom_pricing.liquid`:

```liquid
{% if template.name == 'product' and product %}
  <script type="application/json" id="cp-data">
    { "productId": {{ product.id | json }}, ... }
  </script>
  <script src="{{ 'custom-pricing.js' | asset_url }}" defer></script>
{% endif %}

{% schema %}
{
  "name": "Custom Pricing",
  "target": "body",
  "settings": [
    { "type": "text", "id": "price_selector", "label": "Price selector", "default": ".price" }
  ]
}
{% endschema %}
```

JS để trong `extensions/vinhhv-app-embed/assets/custom-pricing.js` (không viết inline) — dễ đọc, dễ debug.

Bước verify: bật app embed → mở PDP → `console.log` ra được rules từ metafield. Nếu rules rỗng thì quay lại Task 5 backfill.

### Task 7 — Matching + tính giá

Port từ `app/utils/pricing.ts`, thêm phần Bài 3 chưa có:

1. Lọc rule còn hạn: `endAt == null || new Date(endAt) > now`.
2. Match: `type === "ALL"` → luôn khớp; `type === "TAGS"` → `tags.some(t => productTags.includes(t))`.
3. Nhiều rule khớp → lấy rule `priority` cao nhất (payload đã sort sẵn ⇒ lấy phần tử đầu).
4. Tính giá theo `discount.type`, làm việc bằng **cent**, clamp `>= 0`, `Math.round()` cuối cùng.

> So sánh tag: Liquid `product.tags` giữ nguyên hoa/thường. Chốt so sánh **case-insensitive** (`toLowerCase()`) cho khớp trải nghiệm merchant — nhưng nhớ áp cùng quy tắc ở `app/utils/pricing.ts` để bảng "Show product pricing details" ở admin và giá ngoài storefront **không lệch nhau**.

### Task 8 — Money format

`shop.money_format` là template Liquid, ví dụ `${{amount}}`, `{{amount_with_comma_separator}} €`. Cần hỗ trợ 4 placeholder:

| Placeholder | Ví dụ với 1234567 cent |
|---|---|
| `amount` | `12,345.67` |
| `amount_no_decimals` | `12,346` |
| `amount_with_comma_separator` | `12.345,67` |
| `amount_no_decimals_with_comma_separator` | `12.346` |

Thay `formatMoney()` hardcode USD ở `app/utils/pricing.ts` là **tuỳ chọn** (admin có thể giữ `Intl`), nhưng ngoài storefront **bắt buộc** dùng `money_format` — đề bài mục 36 yêu cầu.
Tài liệu: https://help.shopify.com/en/manual/international/pricing/currency-formatting

### Task 9 — Render lên PDP

- Đọc `price_selector` từ `block.settings` (dump kèm vào JSON ở Task 6).
- Thay text trong element khớp selector; giá gốc để `<s>` bên cạnh cho rõ có giảm giá.
- **Đổi variant**: theme render lại giá khi đổi variant → mất giá đã ghi đè. Xử lý bằng `MutationObserver` trên vùng giá, hoặc lắng nghe `variant:change` / thay đổi `?variant=` trên URL. Mỗi variant có giá gốc riêng ⇒ tính lại từ `variants[i].price`.
- Không có rule khớp → **không đụng gì vào DOM**.

### Task 10 — Test end-to-end

- [ ] Uninstall app từ Shopify admin → `shops.status = "uninstalled"` trong MySQL.
- [ ] Cài lại app → `afterAuth` chạy → `status` về `active`, token mới.
- [ ] Đổi store email trong Shopify admin → `shops.email` đổi theo (webhook `shop/update`).
- [ ] Tạo rule mới ở admin app → app-data metafield có rule đó (query `currentAppInstallation { metafield(namespace:"custom_pricing", key:"rules") { jsonValue } }`).
- [ ] Xoá/disable rule → metafield cập nhật theo.
- [ ] PDP sản phẩm có tag khớp → hiện giá đã giảm, đúng công thức của cả 3 `discountType`.
- [ ] PDP sản phẩm **không** khớp tag → giá giữ nguyên, DOM không bị đụng.
- [ ] Rule `type = ALL` → mọi PDP đều giảm.
- [ ] 2 rule cùng khớp → rule `priority` cao thắng.
- [ ] Đổi variant → giá discount tính lại đúng theo giá gốc của variant đó.
- [ ] Đổi currency format của shop → giá hiển thị đổi format theo.
- [ ] Tắt app embed block → PDP trở lại bình thường.

---

## Cách dùng file này ở session mới

Yêu cầu Claude đọc `BAI_TAP_4_PROGRESS.md` (và `BAI_TAP_3_PROGRESS.md` nếu cần bối cảnh backend) rồi nói: "tiếp Task N". Claude sẽ đưa code copy-paste theo đúng mạch đã thiết kế ở trên.
