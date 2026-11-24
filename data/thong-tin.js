/* =========================================================
   THÔNG TIN CHUNG CỦA NHÀ TRƯỜNG
   Sửa trực tiếp giá trị trong dấu "...". Ô để trống "" sẽ hiện "[Đang cập nhật]".
   Số liệu để null nếu chưa có (không điền số ước lượng).
   ========================================================= */
window.TRUONG = {
  ten: "Trường PTDTBT TH&THCS Sin Suối Hồ",
  tenDayDu: "Trường Phổ thông dân tộc bán trú Tiểu học và Trung học cơ sở Sin Suối Hồ",
  tenTiengAnh: "",
  coQuanQuanLy: "Ủy ban nhân dân xã Sin Suối Hồ",
  diaChi: "Xã Sin Suối Hồ, tỉnh Lai Châu",
  dienThoai: "",          // định dạng: "0xxx xxx xxx"
  email: "",              // địa chỉ thư điện tử chính thức của trường
  zalo: "",               // số Zalo hoặc link https://zalo.me/...
  fanpage: "",            // link Fanpage Facebook của trường
  nguoiLienHe: "",        // họ tên, chức vụ
  // Link nhúng bản đồ: Google Maps → Chia sẻ → Nhúng bản đồ → chép phần src="..."
  banDoNhung: "https://www.google.com/maps?q=Sin+Su%E1%BB%91i+H%E1%BB%93,+Lai+Ch%C3%A2u&z=13&output=embed",
  banDoLink: "https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+PTDTBT+TH%26THCS+Sin+Su%E1%BB%91i+H%E1%BB%93+Lai+Ch%C3%A2u",
  website: "https://vqthieuthmusang-jpg.github.io/website-truong-lien-cap/",
  truongBanBienTap: "",

  khauHieu: "Dạy tốt – Học tốt",
  suMang: "",
  tamNhin: "",
  giaTriCotLoi: [],        // ví dụ: ["Trách nhiệm", "Yêu thương", "Sáng tạo"]

  // Lịch sử: mỗi mốc { nam: "2010", noiDung: "..." }
  lichSu: [],

  // Ban giám hiệu: điền họ tên, phụ trách; ảnh để trong assets/img/ (ảnh vuông ~400px)
  banGiamHieu: [
    { hoTen: "", chucVu: "Hiệu trưởng", phuTrach: "", anh: "" },
    { hoTen: "", chucVu: "Phó Hiệu trưởng", phuTrach: "", anh: "" },
    { hoTen: "", chucVu: "Phó Hiệu trưởng", phuTrach: "", anh: "" }
  ],

  thongDiepHieuTruong: "",  // 150–250 chữ

  // Số liệu năm học hiện tại
  namHoc: "2026 – 2027",
  soLieu: {
    hocSinhTieuHoc: null,
    hocSinhTHCS: null,
    soLop: null,
    canBoGiaoVien: null,
    diemTruong: null,
    tyLeDTTS: null,       // ví dụ: "99%"
    hocSinhBanTru: 806,
    hocSinhAnTruaND339: 266,  // học sinh được hỗ trợ ăn trưa theo Nghị định 339
    chuanQuocGia: ""
  },

  thanhTich: [],           // mỗi mục: { nam: "2025 – 2026", noiDung: "..." }

  // Tổ chức – đoàn thể
  toChuc: [
    { ten: "Đảng bộ Trường", moTa: "Đảng bộ Trường PTDTBT TH&THCS Sin Suối Hồ, gồm các chi bộ trực thuộc." },
    { ten: "Ban giám hiệu", moTa: "Hiệu trưởng và các Phó Hiệu trưởng." },
    { ten: "Hội đồng trường", moTa: "" },
    { ten: "Công đoàn cơ sở", moTa: "" },
    { ten: "Chi đoàn – Liên đội", moTa: "Đoàn Thanh niên Cộng sản Hồ Chí Minh, Đội Thiếu niên Tiền phong Hồ Chí Minh." },
    { ten: "Tổ chuyên môn", moTa: "" },
    { ten: "Tổ Văn phòng", moTa: "" }
  ]
};
