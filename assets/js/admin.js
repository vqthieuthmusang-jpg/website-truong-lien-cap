/* =========================================================
   admin.js – Trang quản trị nội dung website
   Đăng nhập bằng mã truy cập GitHub (fine-grained token, quyền Contents: Read and write
   trên đúng kho website). Mọi thay đổi được ghi thẳng vào kho; GitHub Pages tự cập nhật
   website sau 1–2 phút. Không có máy chủ riêng, không lưu mật khẩu trong mã nguồn.
   ========================================================= */
(function () {
  'use strict';
  var C = window.CAU_HINH || {};
  var API = 'https://api.github.com';
  var REPO = '/repos/' + C.githubOwner + '/' + C.githubRepo;
  var BR = C.nhanh || 'main';
  var KEY = 'adm_gh_token';
  var TOKEN = null;
  var dirty = false;
  var previews = {}; // đường dẫn ảnh vừa tải lên → ảnh xem trước trên máy

  /* ---------- Tiện ích ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fmt(iso) { if (!iso) return ''; var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function slug(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'tep';
  }
  function stamp() { return Date.now().toString(36); }
  function src(p) { return previews[p] || p; }
  var toastT;
  function toast(msg, err) {
    var t = $('#toast'); t.textContent = msg; t.className = 'adm-toast' + (err ? ' err' : ''); t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, err ? 7000 : 4000);
  }
  var busyEl;
  function busy(on, text) {
    if (on) { busyEl = document.createElement('div'); busyEl.className = 'busy'; busyEl.textContent = text || 'Đang xử lý…'; document.body.appendChild(busyEl); }
    else if (busyEl) { busyEl.remove(); busyEl = null; }
  }
  function store(get, val) {
    try {
      if (get) return sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
      sessionStorage.removeItem(KEY); localStorage.removeItem(KEY);
      if (val) (val.remember ? localStorage : sessionStorage).setItem(KEY, val.token);
    } catch (e) { return null; }
  }

  /* ---------- GitHub API ---------- */
  function api(method, path, body) {
    return fetch(API + path, {
      method: method, cache: 'no-store',
      headers: { 'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      if (r.ok) return r.status === 204 ? null : r.json();
      return r.json().catch(function () { return {}; }).then(function (j) { var e = new Error(j.message || ('Lỗi ' + r.status)); e.status = r.status; throw e; });
    });
  }
  function encPath(p) { return p.split('/').map(encodeURIComponent).join('/'); }
  function b64Bytes(u8) { var s = '', ch = 0x8000; for (var i = 0; i < u8.length; i += ch) s += String.fromCharCode.apply(null, u8.subarray(i, i + ch)); return btoa(s); }
  function b64Text(t) { return b64Bytes(new TextEncoder().encode(t)); }
  function textB64(b) { var bin = atob(b.replace(/\s/g, '')), u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return new TextDecoder().decode(u8); }
  function getFile(path) { return api('GET', REPO + '/contents/' + encPath(path) + '?ref=' + BR).then(function (r) { return { sha: r.sha, text: textB64(r.content) }; }); }
  function putFile(path, b64, msg, sha) {
    var body = { message: msg, content: b64, branch: BR }; if (sha) body.sha = sha;
    return api('PUT', REPO + '/contents/' + encPath(path), body).then(function (r) { return r.content.sha; });
  }
  function errMsg(e) {
    if (e.status === 401) return 'Mã truy cập không đúng hoặc đã hết hạn. Hãy đăng nhập lại.';
    if (e.status === 403) return 'Mã truy cập chưa có quyền ghi (Contents: Read and write) hoặc đã vượt giới hạn.';
    if (e.status === 404) return 'Không tìm thấy kho/tệp, hoặc mã truy cập chưa được cấp quyền vào kho ' + C.githubRepo + '.';
    if (e.status === 409 || e.status === 422) return 'Tệp vừa được thay đổi ở nơi khác. Bấm “Tải lại” rồi làm lại.';
    if (e instanceof TypeError) return 'Không kết nối được GitHub. Kiểm tra mạng Internet.';
    return 'Lỗi: ' + e.message;
  }

  /* ---------- Tệp dữ liệu ---------- */
  var F = {
    tin: { path: 'data/tin-tuc.js', v: ['TIN_TUC'], head: 'TIN TỨC – HOẠT ĐỘNG' },
    tb: { path: 'data/thong-bao.js', v: ['THONG_BAO'], head: 'THÔNG BÁO' },
    td: { path: 'data/thuc-don.js', v: ['THUC_DON'], head: 'THỰC ĐƠN TUẦN CỦA HỌC SINH BÁN TRÚ (công khai trước thứ Bảy của tuần trước)' },
    ck: { path: 'data/cong-khai.js', v: ['CONG_KHAI_MAU', 'CONG_KHAI_NAM', 'CONG_KHAI'], head: 'CÔNG KHAI THEO THÔNG TƯ 09/2024/TT-BGDĐT' },
    tv: { path: 'data/thu-vien.js', v: ['THU_VIEN'], head: 'THƯ VIỆN ẢNH' },
    tt: { path: 'data/thong-tin.js', v: ['TRUONG'], head: 'THÔNG TIN CHUNG CỦA NHÀ TRƯỜNG. Ô để trống "" hoặc null sẽ hiện "[Đang cập nhật]".' }
  };
  function load(k, force) {
    var f = F[k];
    if (f.w && !force) return Promise.resolve(f.w);
    return getFile(f.path).then(function (r) { var w = {}; new Function('window', r.text)(w); f.sha = r.sha; f.w = w; return w; });
  }
  function serialize(k) {
    var f = F[k], out = '/* =========================================================\n   ' + f.head +
      '\n   Tệp được ghi bởi trang Quản trị (admin.html) lúc ' + new Date().toLocaleString('vi-VN') +
      '.\n   Có thể sửa trực tiếp; giữ đúng cú pháp JavaScript.\n   ========================================================= */\n';
    f.v.forEach(function (v) { out += 'window.' + v + ' = ' + JSON.stringify(f.w[v], null, 2) + ';\n\n'; });
    return out;
  }
  function save(k, msg) {
    var f = F[k]; busy(true, 'Đang lưu lên website…');
    return putFile(f.path, b64Text(serialize(k)), msg, f.sha).then(function (sha) {
      f.sha = sha; dirty = false; toast('Đã lưu. Website sẽ cập nhật sau 1–2 phút.');
    }).catch(function (e) { toast(errMsg(e), true); throw e; }).finally(function () { busy(false); });
  }

  /* ---------- Tải ảnh / tệp ---------- */
  function readImage(file) {
    return new Promise(function (ok, no) { var u = URL.createObjectURL(file), im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { no(new Error('Không đọc được ảnh ' + file.name)); }; im.src = u; });
  }
  function uploadImage(file, base, maxEdge) {
    maxEdge = maxEdge || 1600;
    return readImage(file).then(function (im) {
      var s = Math.min(1, maxEdge / Math.max(im.naturalWidth, im.naturalHeight));
      var w = Math.round(im.naturalWidth * s), h = Math.round(im.naturalHeight * s);
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(im, 0, 0, w, h);
      return new Promise(function (ok) { cv.toBlob(function (b) { ok(b); }, 'image/webp', 0.8); }).then(function (b) {
        if (!b || b.type !== 'image/webp') return new Promise(function (ok) { cv.toBlob(ok, 'image/jpeg', 0.82); });
        return b;
      }).then(function (b) {
        var ext = b.type === 'image/webp' ? '.webp' : '.jpg';
        var path = 'assets/img/' + slug(base || file.name.replace(/\.[^.]+$/, '')) + '-' + stamp() + ext;
        return b.arrayBuffer().then(function (ab) { return putFile(path, b64Bytes(new Uint8Array(ab)), 'Tải ảnh ' + path); })
          .then(function () { previews[path] = URL.createObjectURL(b); return { path: path, w: w, h: h }; });
      });
    });
  }
  function uploadDoc(file, dir, base) {
    if (file.size > 25 * 1024 * 1024) return Promise.reject(new Error('Tệp lớn hơn 25 MB, hãy nén lại trước khi tải.'));
    var ext = (file.name.match(/\.[a-z0-9]+$/i) || ['.pdf'])[0].toLowerCase();
    var path = dir + '/' + slug(base || file.name.replace(/\.[^.]+$/, '')) + '-' + stamp() + ext;
    return file.arrayBuffer().then(function (ab) { return putFile(path, b64Bytes(new Uint8Array(ab)), 'Tải tệp ' + path); }).then(function () { return path; });
  }
  function withBusy(p, text) { busy(true, text); return p.finally(function () { busy(false); }); }
  function uplBtn(label, accept, multiple) {
    return '<label class="upl">' + label + '<input type="file" accept="' + accept + '"' + (multiple ? ' multiple' : '') + '></label>';
  }

  /* ---------- Trình sửa danh sách dòng ---------- */
  function rows(box, arr, cols, make, title) {
    function draw() {
      box.innerHTML = arr.map(function (o, i) {
        return '<div class="row-edit" style="--cols:' + cols.length + '">' + cols.map(function (c) {
          var v = o[c.k] == null ? '' : o[c.k];
          if (c.t === 'img') return '<label>' + c.l + '<span class="pick">' + (v ? '<img src="' + esc(src(v)) + '" alt="">' : '') + uplBtn(v ? 'Đổi ảnh' : 'Tải ảnh', 'image/*') + '</span></label>';
          if (c.t === 'area') return '<label>' + c.l + '<textarea data-i="' + i + '" data-k="' + c.k + '" rows="2">' + esc(v) + '</textarea></label>';
          return '<label>' + c.l + '<input type="' + (c.t || 'text') + '" data-i="' + i + '" data-k="' + c.k + '" value="' + esc(v) + '"></label>';
        }).join('') +
          '<div class="acts"><button type="button" class="ibtn" data-up="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="Đưa lên">↑</button>' +
          '<button type="button" class="ibtn" data-dn="' + i + '"' + (i < arr.length - 1 ? '' : ' disabled') + ' aria-label="Đưa xuống">↓</button>' +
          '<button type="button" class="ibtn del" data-rm="' + i + '" aria-label="Xóa dòng">✕</button></div></div>';
      }).join('') + '<button type="button" class="btn btn-outline btn-sm" data-add>+ Thêm ' + (title || 'dòng') + '</button>';
      cols.forEach(function (c, ci) {
        if (c.t !== 'img') return;
        Array.prototype.forEach.call(box.querySelectorAll('.row-edit'), function (row, i) {
          var inp = row.querySelectorAll('label')[ci].querySelector('input[type=file]');
          inp.addEventListener('change', function () {
            if (!inp.files[0]) return;
            withBusy(uploadImage(inp.files[0], c.base || 'anh', c.max || 800), 'Đang tải ảnh…').then(function (r) { arr[i][c.k] = r.path; dirty = true; draw(); })
              .catch(function (e) { toast(e.status ? errMsg(e) : e.message, true); });
          });
        });
      });
    }
    box.addEventListener('input', function (e) {
      var t = e.target; if (t.dataset.k == null) return;
      var c = cols.filter(function (x) { return x.k === t.dataset.k; })[0];
      arr[+t.dataset.i][t.dataset.k] = c && c.t === 'number' ? (t.value === '' ? null : +t.value) : t.value; dirty = true;
    });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-add')) { arr.push(make()); }
      else if (b.dataset.rm != null) { if (!confirm('Xóa dòng này?')) return; arr.splice(+b.dataset.rm, 1); }
      else if (b.dataset.up != null) { var i = +b.dataset.up; arr.splice(i - 1, 0, arr.splice(i, 1)[0]); }
      else if (b.dataset.dn != null) { var j = +b.dataset.dn; arr.splice(j + 1, 0, arr.splice(j, 1)[0]); }
      else return;
      dirty = true; draw();
    });
    draw();
  }
  function actions(saveLabel) {
    return '<div class="adm-actions"><button type="button" class="btn btn-accent" data-save>' + saveLabel + '</button>' +
      '<button type="button" class="btn btn-outline" data-reload>Tải lại (bỏ thay đổi chưa lưu)</button></div>';
  }

  /* ---------- Mục: Tin tức ---------- */
  function pTin() {
    return load('tin').then(function (w) {
      var list = w.TIN_TUC = w.TIN_TUC || [];
      var P = panel();
      var sorted = list.slice().sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; });
      P.innerHTML = '<div class="adm-bar"><div><h2>Tin tức – Hoạt động</h2><p class="meta">' + list.length + ' tin. Tin mới nhất hiện đầu trang chủ.</p></div>' +
        '<button type="button" class="btn btn-accent" id="tin-new">+ Viết tin mới</button></div>' +
        '<ul class="adm-list">' + sorted.map(function (n) {
          return '<li><img src="' + esc(src(n.anh)) + '" alt=""><div><b>' + esc(n.tieuDe) + (n.noiBat ? ' ★' : '') + '</b><span class="meta">' + esc(n.chuyenMuc) + ' · ' + (n.ngayHienThi ? esc(n.ngayHienThi) : fmt(n.ngay)) + '</span></div>' +
            '<div class="acts"><a class="ibtn" href="bai-viet.html?id=' + encodeURIComponent(n.id) + '" target="_blank" rel="noopener">Xem</a><button type="button" class="ibtn" data-edit="' + esc(n.id) + '">Sửa</button><button type="button" class="ibtn del" data-del="' + esc(n.id) + '">Xóa</button></div></li>';
        }).join('') + '</ul>';
      $('#tin-new').onclick = function () { tinForm(null); };
      P.querySelector('.adm-list').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var id = b.dataset.edit || b.dataset.del, n = list.filter(function (x) { return x.id === id; })[0];
        if (b.dataset.edit) tinForm(n);
        else if (confirm('Xóa tin “' + n.tieuDe + '”? Tin sẽ biến mất khỏi website.')) {
          list.splice(list.indexOf(n), 1);
          save('tin', 'Xóa tin: ' + n.tieuDe).then(pTin, function () { load('tin', true).then(pTin); });
        }
      });
    });
  }
  function htmlToText(h) { return String(h || '').replace(/<\/p>\s*<p>/g, '\n\n').replace(/^\s*<p>/, '').replace(/<\/p>\s*$/, '').replace(/<br\s*\/?>/g, '\n'); }
  function textToHtml(t) {
    return String(t || '').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean).map(function (p) {
      return /^<(p|ul|ol|h[2-4]|figure|blockquote|table|div)\b/i.test(p) ? p : '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  function tinForm(n) {
    var list = F.tin.w.TIN_TUC, isNew = !n;
    var d = isNew ? { id: '', tieuDe: '', ngay: today(), chuyenMuc: 'Hoạt động', anh: '', album: [], tomTat: '', noiDung: '', noiBat: false } : JSON.parse(JSON.stringify(n));
    d.album = d.album || [];
    var cats = list.map(function (x) { return x.chuyenMuc; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; });
    var P = panel();
    P.innerHTML = '<div class="adm-bar"><h2>' + (isNew ? 'Viết tin mới' : 'Sửa tin') + '</h2><button type="button" class="btn btn-outline btn-sm" id="back">← Danh sách tin</button></div>' +
      '<div class="grid-fields">' +
      '<label class="fld full"><span>Tiêu đề *</span><input id="f-tieuDe" value="' + esc(d.tieuDe) + '" required></label>' +
      '<label class="fld"><span>Ngày đăng *</span><input type="date" id="f-ngay" value="' + esc(d.ngay) + '"></label>' +
      '<label class="fld"><span>Chuyên mục</span><input id="f-chuyenMuc" list="cats" value="' + esc(d.chuyenMuc) + '"><datalist id="cats">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></label>' +
      '<label class="fld"><span>Chữ hiện thay ngày <small>(không bắt buộc, ví dụ “Tháng 11/2026”)</small></span><input id="f-ngayHienThi" value="' + esc(d.ngayHienThi || '') + '"></label>' +
      '<label class="fld chk" style="align-self:end"><input type="checkbox" id="f-noiBat"' + (d.noiBat ? ' checked' : '') + '> Tin nổi bật (ô lớn trên trang chủ)</label>' +
      '<label class="fld full"><span>Tóm tắt <small>(1–2 câu, hiện ở danh sách tin)</small></span><textarea id="f-tomTat">' + esc(d.tomTat) + '</textarea></label>' +
      '<label class="fld full"><span>Nội dung <small>(mỗi đoạn cách nhau một dòng trống; in đậm: &lt;strong&gt;chữ&lt;/strong&gt;)</small></span><textarea class="tall" id="f-noiDung">' + esc(htmlToText(d.noiDung)) + '</textarea></label>' +
      '</div>' +
      '<h3>Ảnh đại diện *</h3><div class="pick" id="pick-anh"></div>' +
      '<h3>Album ảnh <small class="meta">(không bắt buộc)</small></h3><div class="pick" id="pick-album"></div>' +
      '<div class="adm-actions"><button type="button" class="btn btn-accent" id="tin-save">' + (isNew ? 'Đăng tin' : 'Lưu thay đổi') + '</button><button type="button" class="btn btn-outline" id="tin-cancel">Hủy</button></div>';
    function drawPick() {
      $('#pick-anh').innerHTML = (d.anh ? '<img src="' + esc(src(d.anh)) + '" alt="Ảnh đại diện">' : '') + uplBtn(d.anh ? 'Đổi ảnh' : 'Chọn ảnh từ máy', 'image/*');
      $('#pick-album').innerHTML = '<div class="thumbs">' + d.album.map(function (a, i) { return '<figure><img src="' + esc(src(a)) + '" alt=""><button type="button" data-ra="' + i + '" aria-label="Bỏ ảnh">×</button></figure>'; }).join('') + '</div>' + uplBtn('+ Thêm ảnh (chọn nhiều)', 'image/*', true);
      $('#pick-anh input').onchange = function (e) {
        var f = e.target.files[0]; if (!f) return;
        withBusy(uploadImage(f, $('#f-tieuDe').value || 'tin'), 'Đang tải ảnh…').then(function (r) { d.anh = r.path; dirty = true; drawPick(); }).catch(function (er) { toast(er.status ? errMsg(er) : er.message, true); });
      };
      $('#pick-album input').onchange = function (e) {
        var fs = Array.prototype.slice.call(e.target.files), base = $('#f-tieuDe').value || 'tin', i = 0;
        busy(true, 'Đang tải ảnh 1/' + fs.length + '…');
        (function next() {
          if (i >= fs.length) { busy(false); drawPick(); return; }
          busyEl.textContent = 'Đang tải ảnh ' + (i + 1) + '/' + fs.length + '…';
          uploadImage(fs[i++], base).then(function (r) { d.album.push(r.path); dirty = true; next(); }).catch(function (er) { busy(false); drawPick(); toast(er.status ? errMsg(er) : er.message, true); });
        })();
      };
      $('#pick-album .thumbs').onclick = function (e) { var b = e.target.closest('[data-ra]'); if (b) { d.album.splice(+b.dataset.ra, 1); dirty = true; drawPick(); } };
    }
    drawPick();
    P.addEventListener('input', function () { dirty = true; });
    $('#back').onclick = $('#tin-cancel').onclick = function () { if (!dirty || confirm('Bỏ các thay đổi chưa lưu?')) { dirty = false; pTin(); } };
    $('#tin-save').onclick = function () {
      ['tieuDe', 'ngay', 'chuyenMuc', 'ngayHienThi', 'tomTat'].forEach(function (k) { d[k] = $('#f-' + k).value.trim(); });
      d.noiDung = textToHtml($('#f-noiDung').value); d.noiBat = $('#f-noiBat').checked;
      if (!d.ngayHienThi) delete d.ngayHienThi;
      if (!d.tieuDe || !d.ngay) return toast('Cần nhập Tiêu đề và Ngày đăng.', true);
      if (!d.anh) return toast('Cần chọn ảnh đại diện cho tin.', true);
      if (!d.tomTat) d.tomTat = $('#f-noiDung').value.trim().split(/\n/)[0].slice(0, 220);
      if (isNew) {
        var id = slug(d.tieuDe), base = id, k = 2;
        while (list.some(function (x) { return x.id === id; })) id = base + '-' + k++;
        d.id = id; list.unshift(d);
      } else list[list.indexOf(n)] = d;
      if (d.noiBat) list.forEach(function (x) { if (x !== d) x.noiBat = false; });
      save('tin', (isNew ? 'Đăng tin: ' : 'Sửa tin: ') + d.tieuDe).then(pTin, function () {});
    };
  }

  /* ---------- Mục: Thông báo ---------- */
  function pTb() {
    return load('tb').then(function (w) {
      var list = w.THONG_BAO = w.THONG_BAO || [];
      var P = panel();
      P.innerHTML = '<h2>Thông báo</h2><p class="meta">Thông báo trên cùng hiện đầu tiên. Trong 7 ngày gần nhất tự gắn nhãn “Mới”. Liên kết có thể là tệp PDF (bấm “Tải PDF”) hoặc trang trong website.</p><div id="tb-rows"></div>' + actions('Lưu thông báo');
      var cols = [{ k: 'tieuDe', l: 'Tiêu đề' }, { k: 'ngay', l: 'Ngày', t: 'date' }, { k: 'link', l: 'Liên kết (PDF hoặc trang)' }];
      rows($('#tb-rows'), list, cols, function () { return { tieuDe: '', ngay: today(), link: '' }; }, 'thông báo');
      // nút tải PDF cho từng dòng
      function addPdfButtons() {
        Array.prototype.forEach.call(P.querySelectorAll('#tb-rows .row-edit'), function (row, i) {
          if (row.querySelector('.upl')) return;
          var lab = row.querySelectorAll('label')[2]; lab.insertAdjacentHTML('beforeend', uplBtn('Tải PDF', '.pdf,application/pdf'));
          lab.querySelector('input[type=file]').onchange = function (e) {
            var f = e.target.files[0]; if (!f) return;
            withBusy(uploadDoc(f, 'assets/docs/thong-bao', list[i].tieuDe || 'thong-bao'), 'Đang tải tệp…').then(function (p) { list[i].link = p; dirty = true; lab.querySelector('input[data-k]').value = p; toast('Đã tải tệp. Bấm “Lưu thông báo” để đăng.'); })
              .catch(function (er) { toast(er.status ? errMsg(er) : er.message, true); });
          };
        });
      }
      addPdfButtons(); new MutationObserver(addPdfButtons).observe($('#tb-rows'), { childList: true });
      bindActions('tb', 'Cập nhật thông báo', pTb, function () { list.sort(function (a, b) { return a.ngay < b.ngay ? 1 : -1; }); });
    });
  }

  /* ---------- Mục: Thực đơn ---------- */
  function pTd() {
    return load('td').then(function (w) {
      var D = w.THUC_DON = w.THUC_DON || { tuan: '', ngayDang: '', bua: ['Bữa sáng', 'Bữa trưa', 'Bữa tối'], ngay: {} };
      var days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'].filter(function (x) { return D.ngay[x]; });
      if (!days.length) days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'];
      var P = panel();
      P.innerHTML = '<h2>Thực đơn tuần</h2><p class="meta">Công khai thực đơn dự kiến trước thứ Bảy của tuần trước (Điều 15, TT 09/2024/TT-BGDĐT).</p>' +
        '<div class="grid-fields"><label class="fld"><span>Tuần</span><input id="td-tuan" placeholder="Tuần từ 30/11/2026 đến 04/12/2026" value="' + esc(D.tuan) + '"></label>' +
        '<label class="fld"><span>Ngày đăng</span><input type="date" id="td-ngay" value="' + esc(D.ngayDang || today()) + '"></label>' +
        '<label class="fld full"><span>Các bữa <small>(cách nhau dấu phẩy)</small></span><input id="td-bua" value="' + esc(D.bua.join(', ')) + '"></label></div>' +
        '<div class="table-scroll"><table class="menu-edit"><thead><tr><th>Bữa</th>' + days.map(function (d) { return '<th>' + d + '</th>'; }).join('') + '</tr></thead><tbody>' +
        D.bua.map(function (b, i) { return '<tr><th>' + esc(b) + '</th>' + days.map(function (d) { return '<td><textarea data-d="' + d + '" data-i="' + i + '" aria-label="' + esc(b + ' ' + d) + '">' + esc((D.ngay[d] || [])[i] || '') + '</textarea></td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table></div>' +
        '<div class="adm-actions"><button type="button" class="btn btn-accent" data-save>Lưu thực đơn</button><button type="button" class="btn btn-outline" id="td-clear">Xóa trắng để nhập tuần mới</button><button type="button" class="btn btn-outline" data-reload>Tải lại</button></div>';
      P.addEventListener('input', function () { dirty = true; });
      $('#td-bua').onchange = function () {
        collect(); D.bua = $('#td-bua').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        days.forEach(function (d) { D.ngay[d] = D.bua.map(function (_, i) { return (D.ngay[d] || [])[i] || ''; }); }); pTd();
      };
      $('#td-clear').onclick = function () { if (!confirm('Xóa trắng toàn bộ thực đơn đang hiện?')) return; days.forEach(function (d) { D.ngay[d] = D.bua.map(function () { return ''; }); }); D.tuan = ''; dirty = true; pTd(); };
      function collect() {
        D.tuan = $('#td-tuan').value.trim(); D.ngayDang = $('#td-ngay').value;
        days.forEach(function (d) { D.ngay[d] = D.bua.map(function () { return ''; }); });
        Array.prototype.forEach.call(P.querySelectorAll('textarea[data-d]'), function (t) { D.ngay[t.dataset.d][+t.dataset.i] = t.value.trim(); });
      }
      bindActions('td', 'Cập nhật thực đơn tuần', pTd, collect);
    });
  }

  /* ---------- Mục: Công khai ---------- */
  var ckYear = null;
  function pCk() {
    return load('ck').then(function (w) {
      var NAM = w.CONG_KHAI_NAM = w.CONG_KHAI_NAM || [], DATA = w.CONG_KHAI = w.CONG_KHAI || {}, MAU = w.CONG_KHAI_MAU || [];
      ckYear = ckYear && NAM.indexOf(ckYear) > -1 ? ckYear : NAM[0];
      var d = DATA[ckYear] = DATA[ckYear] || {};
      var P = panel();
      P.innerHTML = '<div class="adm-bar"><div><h2>Công khai (TT 09/2024)</h2><p class="meta">Chọn năm học, tải tệp PDF cho từng mục rồi bấm Lưu.</p></div>' +
        '<div class="pick"><select id="ck-y" class="adm-input">' + NAM.map(function (y) { return '<option' + (y === ckYear ? ' selected' : '') + '>' + y + '</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn-outline btn-sm" id="ck-add">+ Năm học mới</button></div></div>' +
        MAU.map(function (g, gi) {
          return '<details class="ck-edit"' + (gi < 2 ? ' open' : '') + '><summary>' + (gi + 1) + '. ' + esc(g.nhom) + ' <span class="meta">(' + esc(g.canCu) + ')</span></summary>' +
            g.muc.map(function (m) {
              var f = d[m.ma] || {};
              return '<div class="ck-item" data-ma="' + m.ma + '"><div>' + esc(m.ten) + '</div>' +
                '<input type="date" aria-label="Ngày cập nhật" value="' + esc(f.ngay || '') + '">' +
                '<div class="ck-file">' + (f.file ? '<a href="' + esc(f.file) + '" target="_blank" rel="noopener">Xem tệp</a><button type="button" class="ibtn del" data-rmf>Gỡ</button>' : '<span class="meta">Chưa có tệp</span>') + uplBtn(f.file ? 'Thay PDF' : 'Tải PDF', '.pdf,application/pdf') + '</div></div>';
            }).join('') + '</details>';
        }).join('') + actions('Lưu công khai');
      $('#ck-y').onchange = function () { if (dirty && !confirm('Đổi năm học sẽ giữ thay đổi chưa lưu trong bộ nhớ. Tiếp tục?')) return; ckYear = this.value; pCk(); };
      $('#ck-add').onclick = function () {
        var y = (prompt('Nhập năm học mới, dạng 2027-2028:') || '').trim();
        if (!/^\d{4}-\d{4}$/.test(y)) { if (y) toast('Năm học phải có dạng 2027-2028.', true); return; }
        if (NAM.indexOf(y) < 0) { NAM.unshift(y); NAM.sort().reverse(); DATA[y] = DATA[y] || {}; dirty = true; }
        ckYear = y; pCk();
      };
      P.addEventListener('change', function (e) {
        var it = e.target.closest('.ck-item'); if (!it) return;
        var ma = it.dataset.ma; d[ma] = d[ma] || {};
        if (e.target.type === 'date') { d[ma].ngay = e.target.value; dirty = true; }
        if (e.target.type === 'file' && e.target.files[0]) {
          withBusy(uploadDoc(e.target.files[0], 'assets/docs/' + ckYear, ma), 'Đang tải tệp…').then(function (p) {
            d[ma].file = p; if (!d[ma].ngay) d[ma].ngay = today(); dirty = true; pCk(); toast('Đã tải tệp. Bấm “Lưu công khai” để đăng.');
          }).catch(function (er) { toast(er.status ? errMsg(er) : er.message, true); });
        }
      });
      P.addEventListener('click', function (e) {
        var b = e.target.closest('[data-rmf]'); if (!b) return;
        var ma = b.closest('.ck-item').dataset.ma; if (!confirm('Gỡ tệp khỏi mục này?')) return;
        delete d[ma].file; dirty = true; pCk();
      });
      bindActions('ck', 'Cập nhật công khai năm học ' + ckYear, pCk);
    });
  }

  /* ---------- Mục: Thư viện ảnh ---------- */
  function pTv() {
    return load('tv').then(function (w) {
      var list = w.THU_VIEN = w.THU_VIEN || [];
      var P = panel();
      P.innerHTML = '<div class="adm-bar"><div><h2>Thư viện ảnh</h2><p class="meta">8–9 ảnh đầu hiện trên trang chủ. Dùng ↑ ↓ để sắp xếp.</p></div>' + uplBtn('+ Thêm ảnh (chọn nhiều)', 'image/*', true) + '</div>' +
        '<ul class="adm-list">' + list.map(function (g, i) {
          return '<li><img src="' + esc(src(g.anh)) + '" alt=""><input class="adm-input" data-cap="' + i + '" value="' + esc(g.chuThich) + '" aria-label="Chú thích ảnh">' +
            '<div class="acts"><button type="button" class="ibtn" data-up="' + i + '"' + (i ? '' : ' disabled') + '>↑</button><button type="button" class="ibtn" data-dn="' + i + '"' + (i < list.length - 1 ? '' : ' disabled') + '>↓</button><button type="button" class="ibtn del" data-rm="' + i + '">Xóa</button></div></li>';
        }).join('') + '</ul>' + actions('Lưu thư viện');
      P.querySelector('.adm-bar input[type=file]').onchange = function (e) {
        var fs = Array.prototype.slice.call(e.target.files), i = 0; busy(true, 'Đang tải ảnh…');
        (function next() {
          if (i >= fs.length) { busy(false); pTv(); toast('Đã tải ảnh. Sửa chú thích rồi bấm “Lưu thư viện”.'); return; }
          busyEl.textContent = 'Đang tải ảnh ' + (i + 1) + '/' + fs.length + '…';
          var f = fs[i++];
          uploadImage(f, 'thu-vien', 1200).then(function (r) { list.unshift({ anh: r.path, chuThich: f.name.replace(/\.[^.]+$/, ''), w: r.w, h: r.h }); dirty = true; next(); })
            .catch(function (er) { busy(false); pTv(); toast(er.status ? errMsg(er) : er.message, true); });
        })();
      };
      P.addEventListener('input', function (e) { if (e.target.dataset.cap != null) { list[+e.target.dataset.cap].chuThich = e.target.value; dirty = true; } });
      P.querySelector('.adm-list').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.rm != null) { if (!confirm('Bỏ ảnh này khỏi thư viện?')) return; list.splice(+b.dataset.rm, 1); }
        else if (b.dataset.up != null) { var i = +b.dataset.up; list.splice(i - 1, 0, list.splice(i, 1)[0]); }
        else if (b.dataset.dn != null) { var j = +b.dataset.dn; list.splice(j + 1, 0, list.splice(j, 1)[0]); }
        dirty = true; pTv();
      });
      bindActions('tv', 'Cập nhật thư viện ảnh', pTv);
    });
  }

  /* ---------- Mục: Thông tin trường ---------- */
  function pTt() {
    return load('tt').then(function (w) {
      var T = w.TRUONG = w.TRUONG || {}; T.soLieu = T.soLieu || {};
      ['banGiamHieu', 'lichSu', 'thanhTich', 'toChuc', 'giaTriCotLoi'].forEach(function (k) { T[k] = T[k] || []; });
      var FIELDS = [['ten', 'Tên viết tắt'], ['tenDayDu', 'Tên đầy đủ (đúng quyết định)', 'full'], ['tenTiengAnh', 'Tên tiếng Anh'], ['coQuanQuanLy', 'Cơ quan quản lý trực tiếp'],
        ['diaChi', 'Địa chỉ', 'full'], ['dienThoai', 'Điện thoại (0xxx xxx xxx)'], ['email', 'Thư điện tử'], ['zalo', 'Zalo (số hoặc link)'], ['fanpage', 'Link Fanpage Facebook'],
        ['nguoiLienHe', 'Người liên hệ (họ tên, chức vụ)'], ['truongBanBienTap', 'Trưởng ban biên tập'], ['banDoLink', 'Link Google Maps (chỉ đường)', 'full'],
        ['banDoNhung', 'Link nhúng bản đồ (Google Maps → Chia sẻ → Nhúng bản đồ → phần src)', 'full'], ['khauHieu', 'Khẩu hiệu'], ['namHoc', 'Năm học hiện tại'],
        ['suMang', 'Sứ mạng', 'area'], ['tamNhin', 'Tầm nhìn', 'area'], ['thongDiepHieuTruong', 'Thông điệp Hiệu trưởng (150–250 chữ)', 'area']];
      var SL = [['hocSinhTieuHoc', 'Học sinh Tiểu học'], ['hocSinhTHCS', 'Học sinh THCS'], ['soLop', 'Số lớp'], ['canBoGiaoVien', 'Cán bộ, giáo viên, nhân viên'],
        ['hocSinhBanTru', 'Học sinh bán trú'], ['hocSinhAnTruaND339', 'Học sinh hỗ trợ ăn trưa theo NĐ 339'], ['diemTruong', 'Số điểm trường'], ['tyLeDTTS', 'Tỷ lệ học sinh DTTS (ví dụ 99%)'], ['chuanQuocGia', 'Chuẩn quốc gia / kiểm định']];
      var P = panel();
      P.innerHTML = '<h2>Thông tin trường</h2><p class="meta">Ô để trống sẽ hiện “[Đang cập nhật]” trên website.</p>' +
        '<h3>Thông tin chung</h3><div class="grid-fields">' + FIELDS.map(function (f) {
          var v = T[f[0]] == null ? '' : T[f[0]];
          return '<label class="fld' + (f[2] === 'full' || f[2] === 'area' ? ' full' : '') + '"><span>' + f[1] + '</span>' +
            (f[2] === 'area' ? '<textarea data-f="' + f[0] + '">' + esc(v) + '</textarea>' : '<input data-f="' + f[0] + '" value="' + esc(v) + '">') + '</label>';
        }).join('') +
        '<label class="fld full"><span>Giá trị cốt lõi <small>(cách nhau dấu phẩy)</small></span><input id="gt" value="' + esc(T.giaTriCotLoi.join(', ')) + '"></label></div>' +
        '<h3>Số liệu năm học</h3><div class="grid-fields">' + SL.map(function (f) {
          var v = T.soLieu[f[0]] == null ? '' : T.soLieu[f[0]];
          return '<label class="fld"><span>' + f[1] + '</span><input data-sl="' + f[0] + '" value="' + esc(v) + '"></label>';
        }).join('') + '</div>' +
        '<h3>Ban giám hiệu</h3><div id="r-bgh"></div><h3>Lịch sử – các mốc</h3><div id="r-ls"></div>' +
        '<h3>Thành tích</h3><div id="r-tt"></div><h3>Tổ chức – đoàn thể</h3><div id="r-tc"></div>' + actions('Lưu thông tin trường');
      P.addEventListener('input', function (e) {
        var t = e.target;
        if (t.dataset.f) { T[t.dataset.f] = t.value; dirty = true; }
        if (t.dataset.sl) { var v = t.value.trim(); T.soLieu[t.dataset.sl] = v === '' ? null : (/^\d+$/.test(v) ? +v : v); dirty = true; }
        if (t.id === 'gt') { T.giaTriCotLoi = t.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean); dirty = true; }
      });
      rows($('#r-bgh'), T.banGiamHieu, [{ k: 'hoTen', l: 'Họ tên' }, { k: 'chucVu', l: 'Chức vụ' }, { k: 'phuTrach', l: 'Phụ trách' }, { k: 'anh', l: 'Ảnh chân dung', t: 'img', base: 'chan-dung', max: 500 }],
        function () { return { hoTen: '', chucVu: 'Phó Hiệu trưởng', phuTrach: '', anh: '' }; }, 'người');
      rows($('#r-ls'), T.lichSu, [{ k: 'nam', l: 'Năm' }, { k: 'noiDung', l: 'Nội dung', t: 'area' }], function () { return { nam: '', noiDung: '' }; }, 'mốc');
      rows($('#r-tt'), T.thanhTich, [{ k: 'nam', l: 'Năm học' }, { k: 'noiDung', l: 'Thành tích', t: 'area' }], function () { return { nam: '', noiDung: '' }; }, 'thành tích');
      rows($('#r-tc'), T.toChuc, [{ k: 'ten', l: 'Tên tổ chức' }, { k: 'moTa', l: 'Mô tả', t: 'area' }], function () { return { ten: '', moTa: '' }; }, 'tổ chức');
      bindActions('tt', 'Cập nhật thông tin trường', pTt);
    });
  }

  function panel() { var o = $('#panel'), n = o.cloneNode(false); o.parentNode.replaceChild(n, o); return n; }
  function bindActions(k, msg, redraw, before) {
    var P = $('#panel');
    var s = P.querySelector('[data-save]'), r = P.querySelector('[data-reload]');
    if (s) s.onclick = function () { if (before) before(); save(k, msg).then(redraw, function () {}); };
    if (r) r.onclick = function () { if (dirty && !confirm('Bỏ các thay đổi chưa lưu?')) return; dirty = false; withBusy(load(k, true), 'Đang tải…').then(redraw).catch(function (e) { toast(errMsg(e), true); }); };
  }

  /* ---------- Điều hướng ---------- */
  var TABS = { 'tin-tuc': pTin, 'thong-bao': pTb, 'thuc-don': pTd, 'cong-khai': pCk, 'thu-vien': pTv, 'thong-tin': pTt };
  function go(tab) {
    if (!TABS[tab]) tab = 'tin-tuc';
    if (dirty && !confirm('Có thay đổi chưa lưu. Rời mục này?')) return;
    dirty = false;
    Array.prototype.forEach.call(document.querySelectorAll('.adm-nav button'), function (b) { b.setAttribute('aria-current', b.dataset.tab === tab ? 'true' : 'false'); });
    $('#panel').innerHTML = '<p class="meta">Đang tải dữ liệu…</p>';
    try { history.replaceState(null, '', '#' + tab); } catch (e) { }
    TABS[tab]().catch(function (e) { $('#panel').innerHTML = '<p class="adm-err">' + esc(errMsg(e)) + '</p>'; if (e.status === 401) logout(); });
  }
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Đăng nhập ---------- */
  function verify(token, remember, persist) {
    TOKEN = token;
    return api('GET', REPO).then(function (repo) {
      if (!repo.permissions || !repo.permissions.push) { var e = new Error('no push'); e.status = 403; throw e; }
      if (persist) store(false, { token: token, remember: remember });
      return api('GET', '/user').catch(function () { return {}; });
    }).then(function (u) {
      $('#login').hidden = true; $('#app').hidden = false; $('#adm-user').hidden = false;
      $('#adm-who').textContent = 'Đăng nhập: ' + (u.login || 'quản trị viên');
      go(location.hash.replace('#', ''));
    });
  }
  function logout() { store(false, null); TOKEN = null; location.hash = ''; location.reload(); }

  $('#repo-name').textContent = C.githubOwner + '/' + C.githubRepo;
  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = $('#token').value.trim(), btn = $('#btn-login'); if (!t) return;
    btn.disabled = true; $('#login-err').textContent = '';
    verify(t, $('#remember').checked, true).catch(function (er) { TOKEN = null; $('#login-err').textContent = errMsg(er); }).finally(function () { btn.disabled = false; $('#token').value = ''; });
  });
  $('#btn-logout').onclick = function () { if (!dirty || confirm('Có thay đổi chưa lưu. Vẫn đăng xuất?')) { dirty = false; logout(); } };
  document.querySelector('.adm-nav').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) go(b.dataset.tab); });
  var saved = store(true);
  if (saved) verify(saved, false, false).catch(function (er) { store(false, null); TOKEN = null; $('#login-err').textContent = errMsg(er); });
})();
