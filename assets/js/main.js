/* =========================================================
   main.js – khung chung (header, footer) và hiển thị dữ liệu
   Không cần sửa tệp này khi cập nhật nội dung; hãy sửa các tệp trong thư mục data/.
   ========================================================= */
(function () {
  "use strict";
  var T = window.TRUONG || {};
  var CHO = '<span class="pending">[Đang cập nhật]</span>';

  /* ---------- Biểu tượng SVG ---------- */
  var P = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M7 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M17 7c0-1.5 1-2 1-3.5"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    gov: '<path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M12 2 2 8h20z"/>'
  };
  function ico(n, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || '') + '</svg>';
  }
  window.ICO = ico;

  /* ---------- Tiện ích ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function val(v) { return (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) ? CHO : esc(v); }
  function fmtDate(iso) { if (!iso) return ''; var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function newsDate(n) { return n.ngayHienThi ? esc(n.ngayHienThi) : fmtDate(n.ngay); }
  function isNew(iso) { var d = new Date(iso + 'T00:00:00'); var diff = (Date.now() - d.getTime()) / 864e5; return diff >= -1 && diff <= 7; }
  function telHref(p) { return 'tel:' + String(p).replace(/[^0-9+]/g, ''); }
  function zaloHref(z) { return /^https?:/.test(z) ? z : 'https://zalo.me/' + String(z).replace(/[^0-9]/g, ''); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var news = (window.TIN_TUC || []).slice().sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; });

  /* ---------- Header ---------- */
  var MENU = [
    ['index.html', 'Trang chủ'],
    ['gioi-thieu.html', 'Giới thiệu'],
    ['tin-tuc.html', 'Tin tức'],
    ['tuyen-sinh.html', 'Tuyển sinh'],
    ['phu-huynh.html', 'Phụ huynh – Học sinh'],
    ['ban-tru.html', 'Bán trú'],
    ['cong-khai.html', 'Công khai'],
    ['lien-he.html', 'Liên hệ']
  ];
  var page = document.body.getAttribute('data-page') || (location.pathname.split('/').pop() || 'index.html').replace('.html', '');

  function header() {
    var tb = '<div class="topbar"><div class="wrap"><div class="tb-left">' +
      (T.dienThoai ? '<a href="' + telHref(T.dienThoai) + '">' + ico('phone') + esc(T.dienThoai) + '</a>' : '<span>' + ico('pin') + esc(T.diaChi) + '</span>') +
      (T.email ? '<a class="tb-hide-sm" href="mailto:' + esc(T.email) + '">' + ico('mail') + esc(T.email) + '</a>' : '') +
      '</div><div class="tb-right">' +
      '<a class="tb-hide-sm" href="van-ban.html">Văn bản</a>' +
      '<a href="lien-he.html">Liên hệ</a>' +
      '</div></div></div>';
    var items = MENU.map(function (m) {
      return '<li><a href="' + m[0] + '"' + (m[0].replace('.html', '') === page ? ' aria-current="page"' : '') + '>' + m[1] + '</a></li>';
    }).join('');
    var h = '<header class="site-header" id="top"><div class="wrap">' +
      '<a class="brand" href="index.html" aria-label="' + esc(T.ten) + ' – Trang chủ">' +
      '<img class="brand-logo" src="assets/img/logo.png" alt="Logo ' + esc(T.ten) + '" width="54" height="54">' +
      '<span class="brand-text"><span class="brand-sub">' + esc(T.coQuanQuanLy) + '</span>' +
      '<span class="brand-name">' + esc(T.ten) + '</span></span></a>' +
      '<button class="nav-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="Mở menu">' + ico('menu') + '</button>' +
      '<nav class="nav" id="main-nav" aria-label="Menu chính">' +
      '<button class="nav-toggle nav-close" type="button" aria-label="Đóng menu">' + ico('close') + '</button>' +
      '<ul>' + items + '</ul></nav><div class="nav-backdrop"></div></div></header>' +
      '<div class="tho-cam thin" role="presentation"></div>';
    var slot = $('#site-header');
    if (slot) slot.outerHTML = '<a class="skip" href="#main">Bỏ qua, đến nội dung chính</a>' + tb + h;
  }

  function footer() {
    var y = new Date().getFullYear();
    var f = '<div class="tho-cam" role="presentation"></div><footer class="site-footer">' +
      '<div class="ck-band"><div class="wrap"><div><b>Công khai thông tin theo Thông tư 09/2024/TT-BGDĐT</b>' +
      '<span>Thông tin chung · Thu, chi tài chính · Điều kiện bảo đảm chất lượng · Kế hoạch và kết quả giáo dục · Báo cáo thường niên</span></div>' +
      '<a class="btn btn-accent" href="cong-khai.html">Xem Công khai TT 09/2024</a></div></div>' +
      '<div class="wrap footer-grid">' +
      '<div><div class="f-brand"><img src="assets/img/logo.png" alt="" width="56" height="56" loading="lazy"><b>' + esc(T.ten) + '</b></div>' +
      '<p style="margin:0 0 6px">' + esc(T.tenDayDu) + '</p>' +
      '<p style="margin:0">Cơ quan quản lý: ' + esc(T.coQuanQuanLy) + '</p></div>' +
      '<div><h3>Liên hệ</h3><ul>' +
      '<li>' + ico('pin', 'fi') + ' ' + esc(T.diaChi) + '</li>' +
      '<li>Điện thoại: ' + (T.dienThoai ? '<a href="' + telHref(T.dienThoai) + '">' + esc(T.dienThoai) + '</a>' : '[Đang cập nhật]') + '</li>' +
      '<li>Email: ' + (T.email ? '<a href="mailto:' + esc(T.email) + '">' + esc(T.email) + '</a>' : '[Đang cập nhật]') + '</li>' +
      (T.fanpage ? '<li><a href="' + esc(T.fanpage) + '" target="_blank" rel="noopener">Fanpage Facebook</a></li>' : '') +
      '</ul></div>' +
      '<div><h3>Truy cập nhanh</h3><ul>' +
      '<li><a href="gioi-thieu.html">Giới thiệu</a></li><li><a href="tin-tuc.html">Tin tức – Hoạt động</a></li>' +
      '<li><a href="cong-khai.html">Công khai</a></li><li><a href="van-ban.html">Văn bản</a></li>' +
      '<li><a href="ban-tru.html">Bán trú</a></li><li><a href="lien-he.html">Liên hệ</a></li></ul></div>' +
      '<div><h3>Bản đồ</h3><iframe class="f-map" title="Bản đồ vị trí nhà trường" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="' + esc(T.banDoNhung) + '"></iframe>' +
      '<p style="margin:8px 0 0"><a href="' + esc(T.banDoLink) + '" target="_blank" rel="noopener">Mở Google Maps ↗</a></p></div>' +
      '</div><div class="footer-bottom"><div class="wrap">' +
      '<span>© ' + y + ' ' + esc(T.ten) + '. Trưởng ban biên tập: ' + (T.truongBanBienTap ? esc(T.truongBanBienTap) : '[Đang cập nhật]') + '.</span>' +
      '<span><a href="cong-khai.html">Công khai TT 09/2024</a> · <a href="admin.html" rel="nofollow">Quản trị</a></span>' +
      '</div></div></footer>';
    var fab = '<div class="fab">' +
      (T.zalo ? '<a class="f-zalo" href="' + esc(zaloHref(T.zalo)) + '" target="_blank" rel="noopener" aria-label="Nhắn Zalo cho nhà trường">Zalo</a>' : '') +
      (T.dienThoai ? '<a class="f-call" href="' + telHref(T.dienThoai) + '" aria-label="Gọi điện cho nhà trường">' + ico('phone') + '</a>' : '') +
      '<button class="f-top" type="button" aria-label="Lên đầu trang">' + ico('up') + '</button></div>';
    var slot = $('#site-footer');
    if (slot) slot.outerHTML = f + fab;
  }

  /* ---------- Điền thông tin [data-t] ---------- */
  function bind() {
    $$('[data-t]').forEach(function (el) {
      var k = el.getAttribute('data-t'), v = k.split('.').reduce(function (o, p) { return o == null ? o : o[p]; }, T);
      el.innerHTML = val(v);
    });
    var mf = $('#map-frame'); if (mf && T.banDoNhung) mf.src = T.banDoNhung;
    var ml = $('#map-link'); if (ml && T.banDoLink) ml.href = T.banDoLink;
  }

  /* ---------- Trang chủ: tin nổi bật ---------- */
  function newsBig(n) {
    return '<a class="news-big reveal" href="bai-viet.html?id=' + n.id + '"><div class="nb-img"><img src="' + n.anh + '" alt="' + esc(n.tieuDe) + '" loading="lazy" width="1000" height="563"></div>' +
      '<div class="nb-body"><div class="meta"><span class="chip">' + esc(n.chuyenMuc) + '</span><time>' + newsDate(n) + '</time></div>' +
      '<h3>' + esc(n.tieuDe) + '</h3><p>' + esc(n.tomTat) + '</p></div></a>';
  }
  function newsItem(n) {
    return '<a class="news-item reveal" href="bai-viet.html?id=' + n.id + '"><img src="' + n.anh + '" alt="" loading="lazy" width="128" height="92">' +
      '<div><div class="meta"><span class="chip">' + esc(n.chuyenMuc) + '</span><time>' + newsDate(n) + '</time></div><h3>' + esc(n.tieuDe) + '</h3></div></a>';
  }
  function newsCard(n) {
    return '<a class="news-card reveal" href="bai-viet.html?id=' + n.id + '"><img src="' + n.anh + '" alt="' + esc(n.tieuDe) + '" loading="lazy" width="600" height="375">' +
      '<div class="nc-body"><div class="meta"><span class="chip">' + esc(n.chuyenMuc) + '</span><time>' + newsDate(n) + '</time></div>' +
      '<h3>' + esc(n.tieuDe) + '</h3><p>' + esc(n.tomTat) + '</p></div></a>';
  }
  function homeNews() {
    var el = $('#home-news'); if (!el || !news.length) return;
    var big = news.filter(function (n) { return n.noiBat; })[0] || news[0];
    var rest = news.filter(function (n) { return n !== big; }).slice(0, 4);
    el.innerHTML = newsBig(big) + '<div class="news-list">' + rest.map(newsItem).join('') + '</div>';
    var hc = $('#hero-card');
    if (hc) {
      var latest = news.filter(function (n) { return n !== big; })[0] || big;
      hc.href = 'bai-viet.html?id=' + latest.id;
      hc.innerHTML = '<img src="' + latest.anh + '" alt="" width="440" height="248"><div class="hc-body"><span class="hc-label">Tin mới nhất</span><h2>' + esc(latest.tieuDe) + '</h2><time>' + newsDate(latest) + '</time></div>';
    }
  }

  /* ---------- Thông báo ---------- */
  function notices() {
    $$('[data-notices]').forEach(function (el) {
      var lim = +el.getAttribute('data-notices') || 99, list = (window.THONG_BAO || []).slice(0, lim);
      if (!list.length) { el.innerHTML = '<li class="pending">Chưa có thông báo mới.</li>'; return; }
      el.innerHTML = list.map(function (t) {
        var p = t.ngay.split('-');
        var inner = '<span class="date-box"><b>' + p[2] + '</b><small>Th' + (+p[1]) + '/' + p[0] + '</small></span><span><h3>' + esc(t.tieuDe) + (isNew(t.ngay) ? '<span class="badge-new">Mới</span>' : '') + '</h3></span>';
        return '<li>' + (t.link ? '<a href="' + esc(t.link) + '">' + inner + '</a>' : '<div class="nl-row">' + inner + '</div>') + '</li>';
      }).join('');
    });
  }

  /* ---------- Thư viện ảnh + xem lớn ---------- */
  var lbList = [], lbIdx = 0, lb;
  function gallery() {
    $$('[data-gallery]').forEach(function (el) {
      var lim = +el.getAttribute('data-gallery') || 999, list = (window.THU_VIEN || []).slice(0, lim);
      el.innerHTML = list.map(function (g, i) {
        return '<button type="button" data-lb="' + i + '" aria-label="Xem ảnh lớn: ' + esc(g.chuThich) + '"><img src="' + g.anh + '" alt="' + esc(g.chuThich) + '" loading="lazy" width="' + (g.w || 400) + '" height="' + (g.h || 400) + '"><span>' + esc(g.chuThich) + '</span></button>';
      }).join('');
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-lb]'); if (!b) return;
        openLb(list.map(function (g) { return { src: g.anh, cap: g.chuThich }; }), +b.getAttribute('data-lb'));
      });
    });
    $$('[data-album]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-lb]'); if (!b) return;
        var list = $$('[data-lb] img', el).map(function (im) { return { src: im.getAttribute('src'), cap: im.alt }; });
        openLb(list, +b.getAttribute('data-lb'));
      });
    });
  }
  function openLb(list, i) {
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Xem ảnh');
      lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button class="lb-btn lb-close" type="button" aria-label="Đóng">×</button><button class="lb-btn lb-prev" type="button" aria-label="Ảnh trước">‹</button><button class="lb-btn lb-next" type="button" aria-label="Ảnh sau">›</button>';
      document.body.appendChild(lb);
      lb.addEventListener('click', function (e) {
        if (e.target.classList.contains('lb-close') || e.target === lb) closeLb();
        else if (e.target.classList.contains('lb-prev')) showLb(lbIdx - 1);
        else if (e.target.classList.contains('lb-next')) showLb(lbIdx + 1);
      });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') showLb(lbIdx - 1); if (e.key === 'ArrowRight') showLb(lbIdx + 1);
      });
    }
    lbList = list; lb._ret = document.activeElement; showLb(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus();
  }
  function showLb(i) { lbIdx = (i + lbList.length) % lbList.length; var it = lbList[lbIdx]; $('img', lb).src = it.src; $('img', lb).alt = it.cap; $('figcaption', lb).textContent = it.cap + '  (' + (lbIdx + 1) + '/' + lbList.length + ')'; }
  function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lb._ret) lb._ret.focus(); }

  /* ---------- Trang tin tức ---------- */
  function newsPage() {
    var grid = $('#news-grid'); if (!grid) return;
    var cats = ['Tất cả'].concat(news.map(function (n) { return n.chuyenMuc; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    var fl = $('#news-filters');
    var q = new URLSearchParams(location.search).get('muc');
    fl.innerHTML = cats.map(function (c) { return '<button type="button" aria-pressed="' + ((q ? c === q : c === 'Tất cả') ? 'true' : 'false') + '">' + esc(c) + '</button>'; }).join('');
    function draw(c) { grid.innerHTML = news.filter(function (n) { return c === 'Tất cả' || n.chuyenMuc === c; }).map(newsCard).join(''); reveal(); }
    fl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', fl).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      draw(b.textContent);
    });
    draw(q && cats.indexOf(q) > -1 ? q : 'Tất cả');
  }

  /* ---------- Trang bài viết ---------- */
  function article() {
    var el = $('#article'); if (!el) return;
    var id = new URLSearchParams(location.search).get('id');
    var n = news.filter(function (x) { return x.id === id; })[0] || news[0];
    if (!n) return;
    document.title = n.tieuDe + ' – ' + T.ten;
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', n.tomTat);
    $('#article-title').textContent = n.tieuDe;
    $('#article-crumb').textContent = n.chuyenMuc;
    var pics = [n.anh].concat(n.album || []);
    var html = '<div class="meta"><span class="chip">' + esc(n.chuyenMuc) + '</span><time>' + newsDate(n) + '</time></div>' +
      '<img class="article-cover" src="' + n.anh + '" alt="' + esc(n.tieuDe) + '" width="1000" height="563">' +
      '<div class="article-body">' + n.noiDung + '</div>';
    if (n.video) html += '<h2 style="margin-top:28px;font-size:1.3rem">Video</h2><video controls preload="none" playsinline poster="' + n.video.replace('.mp4', '.jpg') + '" style="max-height:620px;border-radius:12px;margin:0 auto;background:#000" width="480" height="854"><source src="' + n.video + '" type="video/mp4">Trình duyệt không hỗ trợ video.</video>';
    if (pics.length > 1) html += '<h2 style="margin-top:28px;font-size:1.3rem">Hình ảnh</h2><div class="gallery" data-album>' + pics.map(function (p, i) { return '<button type="button" data-lb="' + i + '" aria-label="Xem ảnh lớn"><img src="' + p + '" alt="' + esc(n.tieuDe) + ' – ảnh ' + (i + 1) + '" loading="lazy" width="400" height="400"></button>'; }).join('') + '</div>';
    var url = location.href;
    html += '<div class="share"><b>Chia sẻ:</b><a class="btn btn-outline" style="padding:8px 16px" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '" target="_blank" rel="noopener">Facebook</a>' +
      '<button class="btn btn-outline" style="padding:8px 16px" type="button" id="copy-link">Sao chép liên kết</button><a class="link-more" style="margin-left:auto" href="tin-tuc.html">Tất cả tin tức</a></div>';
    var rel = news.filter(function (x) { return x !== n; }).slice(0, 3);
    html += '<h2 style="font-size:1.3rem">Tin khác</h2><div class="news-grid">' + rel.map(newsCard).join('') + '</div>';
    el.innerHTML = html;
    var cp = $('#copy-link');
    if (cp) cp.addEventListener('click', function () {
      try { navigator.clipboard.writeText(url).then(function () { cp.textContent = 'Đã sao chép ✓'; }); } catch (e) { cp.textContent = url; }
    });
  }

  /* ---------- Trang công khai ---------- */
  function congKhai() {
    var el = $('#cong-khai'); if (!el) return;
    var MAU = window.CONG_KHAI_MAU || [], NAM = window.CONG_KHAI_NAM || [], DATA = window.CONG_KHAI || {};
    var sel = $('#ck-year');
    sel.innerHTML = NAM.map(function (y) { return '<option value="' + y + '">Năm học ' + y.replace('-', ' – ') + '</option>'; }).join('');
    function draw() {
      var y = sel.value, d = DATA[y] || {}, total = 0, have = 0;
      el.innerHTML = MAU.map(function (g, gi) {
        var rows = g.muc.map(function (m) {
          total++; var f = d[m.ma] || {};
          if (f.file) have++;
          return '<div class="ck-row"><div class="ck-name">' + esc(m.ten) + '</div>' +
            '<div class="ck-date">' + (f.ngay ? fmtDate(f.ngay) : '—') + '</div>' +
            '<div class="ck-act">' + (f.file ? '<a href="' + esc(f.file) + '" target="_blank" rel="noopener">Xem</a><a class="dl" href="' + esc(f.file) + '" download>Tải PDF</a>' : CHO) + '</div></div>';
        }).join('');
        return '<details class="ck-group"' + (gi < 2 ? ' open' : '') + '><summary><span class="ck-num">' + (gi + 1) + '</span><span>' + esc(g.nhom) + '<br><span class="ck-basis">Căn cứ: ' + esc(g.canCu) + ' Thông tư 09/2024/TT-BGDĐT</span></span></summary>' + rows + '</details>';
      }).join('');
      $('#ck-count').textContent = 'Đã công bố ' + have + '/' + total + ' mục';
    }
    sel.addEventListener('change', draw); draw();
  }

  /* ---------- Thực đơn tuần ---------- */
  function thucDon() {
    var tb = $('#td-table'), D = window.THUC_DON; if (!tb || !D) return;
    var days = Object.keys(D.ngay || {});
    tb.innerHTML = '<caption class="sr-only">Thực đơn tuần của học sinh bán trú</caption><thead><tr><th scope="col">Bữa</th>' + days.map(function (d) { return '<th scope="col">' + esc(d) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      D.bua.map(function (b, i) { return '<tr><th scope="row">' + esc(b) + '</th>' + days.map(function (d) { return '<td>' + val((D.ngay[d] || [])[i]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
    var m = $('#td-meta');
    if (m) m.innerHTML = (D.tuan ? '<b>' + esc(D.tuan) + '</b>' : '<span class="pending">Tuần: [Đang cập nhật]</span>') + (D.ngayDang ? ' · Ngày đăng: ' + fmtDate(D.ngayDang) : '');
  }

  /* ---------- Giới thiệu ---------- */
  function about() {
    var b = $('#bgh');
    if (b) b.innerHTML = (T.banGiamHieu || []).map(function (p) {
      return '<div class="person"><div class="portrait">' + (p.anh ? '<img src="' + esc(p.anh) + '" alt="' + esc(p.hoTen) + '" loading="lazy" width="400" height="400">' : ico('person')) + '</div>' +
        '<div class="p-body"><h3>' + (p.hoTen ? esc(p.hoTen) : CHO) + '</h3><div class="role">' + esc(p.chucVu) + '</div><p>' + (p.phuTrach ? esc(p.phuTrach) : 'Phụ trách: [Đang cập nhật]') + '</p></div></div>';
    }).join('');
    var ls = $('#lich-su');
    if (ls) ls.innerHTML = (T.lichSu && T.lichSu.length) ? '<ol class="timeline">' + T.lichSu.map(function (m) { return '<li><span class="tl-year">' + esc(m.nam) + '</span><p>' + esc(m.noiDung) + '</p></li>'; }).join('') + '</ol>'
      : '<div class="pending-box">[Đang cập nhật] Năm thành lập, các mốc phát triển và quá trình sáp nhập thành Trường PTDTBT TH&amp;THCS Sin Suối Hồ.</div>';
    var gt = $('#gia-tri');
    if (gt) gt.innerHTML = (T.giaTriCotLoi && T.giaTriCotLoi.length) ? T.giaTriCotLoi.map(esc).join(' · ') : CHO;
    var tc = $('#to-chuc');
    if (tc) tc.innerHTML = (T.toChuc || []).map(function (o) { return '<div class="card"><div class="card-body"><h3><span class="dot"></span>' + esc(o.ten) + '</h3><p>' + (o.moTa ? esc(o.moTa) : '[Đang cập nhật]') + '</p></div></div>'; }).join('');
    var th = $('#thanh-tich');
    if (th) th.innerHTML = (T.thanhTich && T.thanhTich.length) ? '<ol class="timeline">' + T.thanhTich.map(function (m) { return '<li><span class="tl-year">' + esc(m.nam) + '</span><p>' + esc(m.noiDung) + '</p></li>'; }).join('') + '</ol>'
      : '<div class="pending-box">[Đang cập nhật] Thành tích tiêu biểu 3 năm học gần nhất của tập thể và cá nhân.</div>';
    var td = $('[data-thong-diep]');
    if (td) td.innerHTML = T.thongDiepHieuTruong ? T.thongDiepHieuTruong.split(/\n+/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') : '<div class="pending-box">[Đang cập nhật] Thông điệp của Hiệu trưởng (150–250 chữ).</div>';
  }

  /* ---------- Số liệu ---------- */
  function stats() {
    $$('[data-stat]').forEach(function (el) {
      var k = el.getAttribute('data-stat'), v = k.charAt(0) === '=' ? k.slice(1) : (T.soLieu || {})[k];
      if (v === null || v === undefined || v === '') { el.classList.add('na'); el.textContent = 'Đang cập nhật'; return; }
      var num = parseInt(v, 10), suffix = String(v).replace(/^[0-9.]+/, '');
      if (reduce || isNaN(num) || !('IntersectionObserver' in window)) { el.textContent = v; return; }
      el.textContent = '0' + suffix;
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io.disconnect();
        var t0 = null; (function step(t) { t0 = t0 || t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(num * (1 - Math.pow(1 - p, 3))) + suffix; if (p < 1) requestAnimationFrame(step); })(performance.now());
      });
      io.observe(el);
    });
  }

  /* ---------- Tabs ---------- */
  function tabs() {
    $$('.tabs').forEach(function (box) {
      var ts = $$('[role="tab"]', box);
      function sel(t) {
        ts.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
      }
      ts.forEach(function (t, i) {
        t.addEventListener('click', function () { sel(t); });
        t.addEventListener('keydown', function (e) {
          var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null; if (j === null) return;
          var n = ts[(j + ts.length) % ts.length]; n.focus(); sel(n);
        });
      });
      var h = location.hash.replace('#', ''); var pre = ts.filter(function (t) { return t.getAttribute('data-key') === h; })[0];
      sel(pre || ts[0]);
    });
  }

  /* ---------- Menu, cuộn, hiệu ứng ---------- */
  function ui() {
    var nav = $('#main-nav'), bd = $('.nav-backdrop'), tg = $('.nav-toggle:not(.nav-close)');
    function setNav(o) { if (!nav) return; nav.classList.toggle('open', o); bd.classList.toggle('show', o); tg.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; if (o) { var a = $('a', nav); if (a) a.focus(); } else tg.focus(); }
    if (tg) tg.addEventListener('click', function () { setNav(true); });
    var cl = $('.nav-close'); if (cl) cl.addEventListener('click', function () { setNav(false); });
    if (bd) bd.addEventListener('click', function () { setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav && nav.classList.contains('open')) setNav(false); });
    var hd = $('.site-header'), top = $('.f-top');
    function onScroll() { var y = window.scrollY; if (hd) hd.classList.toggle('scrolled', y > 10); if (top) top.classList.toggle('show', y > 600); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    // Mục lục: tô sáng mục đang xem
    var toc = $$('.toc a');
    if (toc.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) toc.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); }); }, { rootMargin: '-30% 0px -60% 0px' });
      toc.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) io.observe(s); });
    }
  }
  function reveal() {
    var els = $$('.reveal:not(.in)');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  header(); footer(); bind(); homeNews(); notices(); newsPage(); article(); gallery(); congKhai(); thucDon(); about(); stats(); tabs(); ui(); reveal();
})();
