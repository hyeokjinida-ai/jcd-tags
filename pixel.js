/* 제철담 메타 픽셀 (카페24 스크립트 삽입 API로 전 페이지에 로드)
 * 픽셀: 제철담 픽셀 1146904244374731 — 모렐르 픽셀 넣지 말 것
 * 이벤트: PageView(전체) · ViewContent(상품상세) · AddToCart(장바구니 담기)
 *        · InitiateCheckout(주문서 진입 / 네이버페이 버튼) · Purchase(주문완료 페이지)
 */
(function () {
  if (window.top !== window || window.__jcdPixel) return;
  window.__jcdPixel = 1;
  var PID = '1146904244374731';

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PID);
  fbq('trackSingle', PID, 'PageView');

  function num(v) { v = parseFloat(String(v == null ? '' : v).replace(/[^0-9.]/g, '')); return isNaN(v) ? 0 : v; }
  function track(ev, data, eventId) {
    try { fbq('trackSingle', PID, ev, data || {}, eventId ? { eventID: eventId } : undefined); } catch (e) {}
  }
  var path = location.pathname;

  // 상품 상세: ViewContent
  function isDetail() { return typeof window.iProductNo !== 'undefined' && /\/product\/|detail\.html/.test(path); }
  function viewContent() {
    if (!isDetail()) return;
    track('ViewContent', {
      content_ids: [String(window.iProductNo)],
      content_type: 'product_group',
      content_name: window.product_name || document.title,
      value: num(window.product_price),
      currency: 'KRW'
    });
  }

  // 장바구니 담기: 카페24가 body에 쏘는 EC_PRODUCT_ACTION_BASKET 이벤트
  function bindBasket() {
    var $ = window.EC$ || window.jQuery;
    if (!$) return false;
    $('body').on('EC_PRODUCT_ACTION_BASKET', function (e, p) {
      try {
        if (!p || !p.product_no) return;
        var c = (p.contents || []).map(function (v) {
          return { id: String(p.product_no), quantity: parseInt(v.quantity, 10) || 1, item_price: num(v.price) };
        });
        track('AddToCart', {
          content_ids: [String(p.product_no)],
          content_type: 'product_group',
          contents: c,
          value: num(p.total_price),
          currency: p.currency || 'KRW'
        });
      } catch (err) {}
    });
    return true;
  }

  // 네이버페이 버튼(공식 버튼·큰 초록 버튼 모두 결국 .npay_btn_pay 클릭): InitiateCheckout
  var npayDone = false;
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('.npay_btn_pay, #NaverChk_Button a, .jcd-npay-big');
    if (!t || npayDone) return;
    npayDone = true;
    var d = { currency: 'KRW', payment_method: 'naverpay' };
    if (isDetail()) { d.content_ids = [String(window.iProductNo)]; d.content_type = 'product_group'; }
    track('InitiateCheckout', d);
  }, true);

  // 주문서 진입: InitiateCheckout
  function orderForm() {
    if (!/\/order\/orderform\.html/.test(path)) return;
    track('InitiateCheckout', { currency: 'KRW' });
  }

  // 주문완료: Purchase (같은 주문 새로고침 중복 방지)
  function purchase() {
    if (!/\/order\/order_result\.html/.test(path)) return;
    var D = window.EC_FRONT_EXTERNAL_SCRIPT_VARIABLE_DATA || {};
    var oid = D.order_id || (location.search.match(/order_id=([^&]+)/) || [])[1] || '';
    var val = num(D.payed_amount || D.total_order_price || D.order_price_amount);
    var key = 'jcd_px_purchase_' + oid;
    try { if (oid && localStorage.getItem(key)) return; } catch (e) {}
    var ids = [];
    try { (D.order_product || []).forEach(function (o) { if (o.product_no) ids.push(String(o.product_no)); }); } catch (e) {}
    var data = { value: val, currency: 'KRW' };
    if (ids.length) { data.content_ids = ids; data.content_type = 'product_group'; }
    track('Purchase', data, oid ? 'order_' + oid : undefined);
    try { if (oid) localStorage.setItem(key, '1'); } catch (e) {}
  }

  function ready() {
    viewContent(); orderForm(); purchase();
    if (!bindBasket()) { var n = 0, iv = setInterval(function () { if (bindBasket() || ++n > 40) clearInterval(iv); }, 250); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
