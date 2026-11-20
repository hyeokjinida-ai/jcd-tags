/* 제철담 비회원 주문서 — 이메일 칸 숨김 (2026-11-20 형님 「이메일 없애줘」)
   - 주문서에서 이메일이 비어 있으면 order@jecheoldam.com 을 넣고 그 줄을 숨김 (회원은 이메일이 이미 차 있어서 그대로 보임)
   - 「배송지 정보로 간편 회원가입」을 체크하면 이메일 칸을 다시 보이고 비움 (가입엔 진짜 이메일이 필요)
   - 결제하기 등 어떤 클릭이든 직전에 한 번 더 확인 → 숨긴 칸이 비어서 막히는 일 방지 */
(function () {
  if (!/\/order\/orderform\.html/.test(location.pathname)) return;
  var ADDR = 'order@jecheoldam.com';
  function set(inp, v) {
    inp.value = v;
    try { inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
  }
  function apply() {
    var inp = document.getElementById('oemail1'); if (!inp) return false;
    var row = inp.closest ? inp.closest('tr') : null; if (!row) return false;
    var join = document.getElementById('simple_join_is_check');
    if (join && join.checked) { if (inp.value === ADDR) set(inp, ''); row.style.display = ''; }
    else { if (!inp.value) set(inp, ADDR); if (inp.value === ADDR) row.style.display = 'none'; }
    if (join && !join.__jcd) { join.__jcd = 1; join.addEventListener('change', apply); }
    return true;
  }
  document.addEventListener('click', apply, true);
  var n = 0, t = setInterval(function () { if (apply() || ++n > 40) clearInterval(t); }, 250);
})();
