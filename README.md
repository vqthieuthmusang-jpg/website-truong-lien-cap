# Website Trường PTDTBT TH&THCS Sin Suối Hồ

Website tĩnh (HTML + CSS + JavaScript thuần), chạy được trên GitHub Pages, tên miền riêng hoặc mở trực tiếp `index.html` trên máy.

## Cấu trúc

```
index.html          Trang chủ
gioi-thieu.html     Giới thiệu (thông điệp HT, sứ mạng, lịch sử, tổ chức, BGH, CSVC, thành tích)
tin-tuc.html        Danh sách tin + thư viện ảnh
bai-viet.html       Trang đọc từng tin (bai-viet.html?id=...)
tuyen-sinh.html     Tuyển sinh lớp 1 / lớp 6
phu-huynh.html      Phụ huynh – Học sinh (chương trình, TKB, lịch năm học)
ban-tru.html        Bán trú (thực đơn, bếp ăn, vườn rau, nội quy, chế độ)
cong-khai.html      Công khai theo Thông tư 09/2024/TT-BGDĐT
van-ban.html        Văn bản
lien-he.html        Liên hệ + bản đồ
404.html            Trang báo lỗi
data/               ← NỘI DUNG: chỉ cần sửa các tệp trong thư mục này
assets/img/         Ảnh (WebP, đã nén)
assets/docs/        Tệp PDF công khai, văn bản
assets/video/       Video
```

## Trang Quản trị (đăng nhập Admin)

Địa chỉ: `<địa-chỉ-website>/admin.html` (có liên kết “Quản trị” ở chân trang).

- **Đăng nhập** bằng mã truy cập GitHub (fine-grained token) của tài khoản quản lý kho. Cách tạo mã có hướng dẫn ngay trên trang đăng nhập: chỉ chọn kho website, quyền **Contents: Read and write**.
- Các mục quản trị: Tin tức (viết, sửa, xóa, tải ảnh, album), Thông báo (tải PDF), Thực đơn tuần, Công khai TT 09/2024 (tải PDF từng mục theo năm học), Thư viện ảnh, Thông tin trường (liên hệ, Ban giám hiệu, số liệu, lịch sử, thành tích).
- Ảnh tải lên được tự thu nhỏ và nén sang WebP. Tệp PDF tối đa 25 MB.
- Bấm **Lưu** → nội dung được ghi vào kho GitHub → website tự cập nhật sau 1–2 phút.
- Không có mật khẩu nào lưu trong mã nguồn. Người khác muốn quản trị: thêm tài khoản GitHub của họ vào kho (Settings → Collaborators), họ tự tạo mã riêng. Mã bị lộ: vào GitHub xóa mã đó (Settings → Developer settings → Personal access tokens).
- Kho đích khai báo trong `data/cau-hinh.js`.

## Cập nhật nội dung bằng tay (khi không dùng trang Quản trị)

| Việc cần làm | Sửa tệp |
|---|---|
| Tên, địa chỉ, điện thoại, email, Zalo, BGH, sứ mạng, lịch sử, số liệu | `data/thong-tin.js` |
| Thêm tin tức | `data/tin-tuc.js` – chép một khối `{ ... }`, dán lên đầu, sửa nội dung; ảnh bỏ vào `assets/img/` |
| Thêm thông báo | `data/thong-bao.js` |
| Thực đơn tuần (trước thứ Bảy hằng tuần) | `data/thuc-don.js` |
| Tài liệu công khai | chép PDF vào `assets/docs/<năm-học>/`, khai báo trong `data/cong-khai.js` theo mã mục |
| Thư viện ảnh | `data/thu-vien.js` |

Quy ước: ô để trống `""` hoặc `null` sẽ tự hiện **[Đang cập nhật]**. Ngày viết dạng `"2026-11-24"`.

**Ảnh mới:** nên là ảnh ngang, cạnh dài khoảng 1000–1600 px, dưới 300 KB, tên không dấu (ví dụ `hoi-thi-van-nghe-2026.webp`). Không đăng ảnh có thông tin cá nhân của học sinh (sổ điểm, giấy tờ).

## Xem thử trên máy

Mở thẳng `index.html` bằng trình duyệt, hoặc VS Code → tiện ích **Live Server** → **Go Live**.

## Đưa lên mạng (GitHub Pages)

1. Sửa xong → VS Code → **Source Control** → nhập nội dung thay đổi → **Commit** → **Sync/Push**.
2. 1–2 phút sau website tự cập nhật.
3. Lần đầu: kho trên GitHub → **Settings → Pages** → Source: *Deploy from a branch* → `main`, `/ (root)` → **Save**.

## Gắn tên miền riêng

1. Tạo tệp `CNAME` (một dòng, ghi tên miền, ví dụ `www.tentruong.edu.vn`).
2. Người quản lý DNS tạo bản ghi:
   - Tên miền có `www`: bản ghi **CNAME** → `<tài-khoản>.github.io`
   - Tên miền gốc: 4 bản ghi **A** → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Sau khi DNS có hiệu lực: Settings → Pages → tích **Enforce HTTPS**.
4. Khi đã có tên miền, sửa thẻ `og:image` trong các trang thành đường dẫn đầy đủ (`https://.../assets/img/og-image.jpg`) để ảnh hiện đúng khi chia sẻ Zalo/Facebook.

## Căn cứ

Thông tư 09/2024/TT-BGDĐT (công khai); Thông tư 37/2020/TT-BGDĐT (cổng thông tin điện tử ngành giáo dục).
