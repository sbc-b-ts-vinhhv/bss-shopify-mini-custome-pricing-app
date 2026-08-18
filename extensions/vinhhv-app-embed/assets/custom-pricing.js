(function () {
  "use strict";

  var el = document.getElementById("cp-data");

  // Block chỉ render trên PDP, nên không có thẻ này nghĩa là trang khác — thoát im lặng.
  if (!el) {
    return;
  }

  var data;

  try {
    data = JSON.parse(el.textContent);
  } catch (error) {
    console.error("[custom-pricing] payload không parse được:", error);
    return;
  }

  // Metafield chứa cả object { updatedAt, rules }, danh sách nằm một tầng sâu hơn.
  var rules = (data.rules && data.rules.rules) || [];

  /**
   * Liquid giữ nguyên hoa/thường của tag ("Winter"), còn merchant gõ trong admin
   * thì tuỳ hứng. So sánh case-insensitive — app/utils/pricing.ts phải chuẩn hoá
   * y hệt, không thì bảng ở admin và giá ngoài storefront lệch nhau.
   */
  function normalizeTags(list) {
    return (list || []).map(function (tag) {
      return String(tag).trim().toLowerCase();
    });
  }

  function matches(rule, productTags) {
    var condition = rule.productCondition || {};

    if (condition.type === "ALL") {
      return true;
    }

    if (condition.type !== "TAGS") {
      return false;
    }

    var ruleTags = normalizeTags(condition.tags);

    if (!ruleTags.length) {
      return false;
    }

    return ruleTags.some(function (tag) {
      return productTags.indexOf(tag) !== -1;
    });
  }

  /**
   * Server đã sort priority giảm dần trước khi đẩy lên metafield, nên rule khớp
   * đầu tiên là rule thắng. Không sort lại ở đây.
   */
  function findRule(list, productTags) {
    for (var i = 0; i < list.length; i++) {
      if (matches(list[i], productTags)) {
        return list[i];
      }
    }

    return null;
  }

  /**
   * Mọi tính toán bằng CENT.
   *
   * Giá từ Liquid là cent (1999 = $19.99), còn discountValue lưu trong MySQL là
   * đơn vị tiền (19.99) ⇒ nhân 100 cho FIXED_PRICE và DECREASE_FIXED.
   * Percentage thì không, vì nó là tỉ lệ.
   */
  function applyDiscount(priceCents, rule) {
    var discount = rule.discount || {};
    var value = Number(discount.value);

    if (!isFinite(value)) {
      return priceCents;
    }

    var result;

    if (discount.type === "FIXED_PRICE") {
      result = value * 100;
    } else if (discount.type === "DECREASE_FIXED") {
      result = priceCents - value * 100;
    } else if (discount.type === "DECREASE_PERCENTAGE") {
      var percent = Math.min(100, Math.max(0, value));

      result = priceCents - (priceCents * percent) / 100;
    } else {
      // discountType lạ (schema đổi mà extension chưa cập nhật) — không đoán, giữ giá gốc.
      return priceCents;
    }

    // Làm tròn một lần duy nhất, ở cuối, sau khi đã clamp về >= 0.
    return Math.max(0, Math.round(result));
  }

  /**
   * shop.money_format là template Liquid, ví dụ "${{amount}}" hoặc
   * "{{amount_with_comma_separator}} €". Mỗi placeholder quy định số chữ số lẻ
   * và cặp dấu phân cách — không suy ra được từ currency code, phải tra bảng.
   */
  var MONEY_FORMATS = {
    amount: { decimals: 2, thousands: ",", decimal: "." },
    amount_no_decimals: { decimals: 0, thousands: ",", decimal: "." },
    amount_with_comma_separator: { decimals: 2, thousands: ".", decimal: "," },
    amount_no_decimals_with_comma_separator: {
      decimals: 0,
      thousands: ".",
      decimal: ",",
    },
  };

  function groupThousands(digits, separator) {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  function formatAmount(cents, spec) {
    // toFixed tự làm tròn, nên amount_no_decimals với 1599 cent ra "16" chứ không phải "15".
    var parts = (cents / 100).toFixed(spec.decimals).split(".");
    var result = groupThousands(parts[0], spec.thousands);

    if (parts[1]) {
      result += spec.decimal + parts[1];
    }

    return result;
  }

  /**
   * Giữ nguyên phần chữ/ký hiệu của template, chỉ thay placeholder. Nhờ vậy
   * "{{amount}} kr" hay "CHF {{amount}}" đều đúng mà không cần biết trước.
   */
  function formatMoney(cents, moneyFormat) {
    var format = moneyFormat || "${{amount}}";

    return format.replace(/\{\{\s*(\w+)\s*\}\}/g, function (_match, name) {
      // Placeholder lạ (Shopify thêm biến thể mới) — rơi về "amount" còn hơn
      // in nguyên chuỗi {{...}} ra mặt khách hàng.
      return formatAmount(cents, MONEY_FORMATS[name] || MONEY_FORMATS.amount);
    });
  }

  var productTags = normalizeTags(data.tags);
  var rule = findRule(rules, productTags);

  // Task 9 sẽ dùng lại — đồng thời cho phép gõ tay trong console để thử.
  window.CustomPricing = {
    data: data,
    rule: rule,
    findRule: findRule,
    applyDiscount: applyDiscount,
    normalizeTags: normalizeTags,
    formatMoney: formatMoney,
  };

  if (!rule) {
    return;
  }

  /**
   * Thứ tự từ hẹp tới rộng: theme nào cũng có vài class chung chung như .price,
   * nên phải thử cái đặc trưng trước rồi mới hạ dần độ chính xác.
   *
   * Merchant để trống setting thì chạy danh sách này — app dùng được ngay trên
   * theme phổ biến mà không bắt họ đi tra CSS.
   */
  var DEFAULT_SELECTORS = [
    ".price__container",
    ".product__price",
    ".product-single__price",
    ".product-price",
    "[data-product-price]",
    ".price",
  ];

  function selectorList() {
    var configured = String(data.priceSelector || "")
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);

    return configured.length ? configured : DEFAULT_SELECTORS;
  }

  var matchedSelector = null;

  /**
   * Trả về element khớp selector đầu tiên tìm thấy. querySelector lấy match đầu
   * theo thứ tự DOM, mà khối sản phẩm chính luôn đứng trước related products —
   * nên không cần khoanh vùng thêm.
   */
  function findPriceElement() {
    var list = selectorList();

    for (var i = 0; i < list.length; i++) {
      var el;

      try {
        el = document.querySelector(list[i]);
      } catch (error) {
        // Merchant gõ sai cú pháp CSS — bỏ qua cái đó, thử tiếp cái sau.
        console.warn('[custom-pricing] selector không hợp lệ: "' + list[i] + '"');
        continue;
      }

      if (el) {
        if (matchedSelector !== list[i]) {
          matchedSelector = list[i];
        }

        return el;
      }
    }

    return null;
  }

  function findVariant(id) {
    for (var i = 0; i < data.variants.length; i++) {
      if (data.variants[i].id === id) {
        return data.variants[i];
      }
    }

    return null;
  }

  /**
   * Ba nguồn, theo độ tin cậy giảm dần:
   *  1. input [name="id"] trong form add-to-cart — theme luôn giữ nó đúng vì
   *     đó là thứ được POST lên /cart/add.
   *  2. ?variant= trên URL — đúng nhưng vài theme cập nhật sau khi đã render giá.
   *  3. variant Liquid render lúc tải trang.
   */
  function currentVariant() {
    var input = document.querySelector('form[action*="/cart/add"] [name="id"]');
    var fromForm = input && Number(input.value);

    if (fromForm) {
      var matched = findVariant(fromForm);

      if (matched) {
        return matched;
      }
    }

    var fromUrl = Number(new URLSearchParams(window.location.search).get("variant"));

    return findVariant(fromUrl) || findVariant(data.currentVariantId) || data.variants[0] || null;
  }

  var warnedMissingSelector = false;

  function renderPrice() {
    var el = findPriceElement();

    if (!el) {
      if (!warnedMissingSelector) {
        warnedMissingSelector = true;
        console.warn(
          "[custom-pricing] không selector nào trúng: " +
            selectorList().join(", ") +
            '. Điền selector của theme vào setting "Price selector" trong theme editor.',
        );
      }

      return;
    }

    var variant = currentVariant();

    if (!variant) {
      return;
    }

    var discounted = applyDiscount(variant.price, rule);

    // Rule không làm đổi giá variant này → để nguyên markup của theme.
    if (discounted === variant.price) {
      return;
    }

    // Chặn vòng lặp với MutationObserver: lần ghi của chính mình sẽ rơi vào đây.
    if (el.getAttribute("data-cp-variant") === String(variant.id)) {
      return;
    }

    var discountedHtml = formatMoney(discounted, data.moneyFormat);

    // money_format là "money without currency in HTML" — merchant được phép để
    // markup trong đó, nên phải dùng innerHTML chứ không textContent.
    el.innerHTML =
      discounted < variant.price
        ? '<s style="opacity:.6;margin-right:.4em">' +
          formatMoney(variant.price, data.moneyFormat) +
          "</s>" +
          discountedHtml
        : discountedHtml;

    el.setAttribute("data-cp-variant", String(variant.id));

    console.log(
      "[custom-pricing] variant " + variant.id + ": " +
        formatMoney(variant.price, data.moneyFormat) + " → " + discountedHtml,
    );
  }

  window.CustomPricing.renderPrice = renderPrice;

  renderPrice();

  /**
   * Đổi variant: theme render lại vùng giá và xoá sạch markup của mình. Không có
   * event chuẩn nào cho việc này (mỗi theme một kiểu), nên bám vào chính thay đổi
   * DOM. Quan sát parent chứ không quan sát element giá, vì nhiều theme thay cả
   * node đó chứ không chỉ sửa text bên trong.
   */
  var priceEl = findPriceElement();
  var observed = (priceEl && priceEl.parentNode) || document.body;

  new MutationObserver(function () {
    renderPrice();
  }).observe(observed, { childList: true, subtree: true, characterData: true });

  // Nút back/forward đổi ?variant= mà không nhất thiết làm đổi DOM.
  window.addEventListener("popstate", renderPrice);
})();
