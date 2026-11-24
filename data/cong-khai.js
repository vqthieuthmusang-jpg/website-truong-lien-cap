/* =========================================================
   CÔNG KHAI THEO THÔNG TƯ 09/2024/TT-BGDĐT
   1) DANH MỤC (CONG_KHAI_MAU): khung cố định theo Thông tư – thường KHÔNG cần sửa.
   2) TỆP THEO NĂM HỌC (CONG_KHAI): khi có tệp PDF, chép vào assets/docs/
      rồi khai báo theo MÃ mục, ví dụ:
        "2026-2027": {
          "tc-01": { ngay: "2026-06-28", file: "assets/docs/2026-2027/thong-tin-chung.pdf" }
        }
   Mục chưa có tệp sẽ tự hiện "[Đang cập nhật]".
   ========================================================= */
window.CONG_KHAI_MAU = [
  {
    nhom: "Thông tin chung về cơ sở giáo dục", canCu: "Điều 4",
    muc: [
      { ma: "tc-01", ten: "Tên, địa chỉ trụ sở và các điểm trường; điện thoại, thư điện tử, cổng thông tin điện tử" },
      { ma: "tc-02", ten: "Loại hình; cơ quan quản lý trực tiếp" },
      { ma: "tc-03", ten: "Sứ mạng, tầm nhìn, mục tiêu của nhà trường" },
      { ma: "tc-04", ten: "Tóm tắt quá trình hình thành và phát triển" },
      { ma: "tc-05", ten: "Thông tin người đại diện theo pháp luật, người phát ngôn, người liên hệ" },
      { ma: "tc-06", ten: "Quyết định thành lập, sáp nhập, đổi tên nhà trường" },
      { ma: "tc-07", ten: "Quyết định công nhận Hội đồng trường, Chủ tịch và danh sách thành viên" },
      { ma: "tc-08", ten: "Quyết định bổ nhiệm, công nhận Hiệu trưởng, Phó Hiệu trưởng" },
      { ma: "tc-09", ten: "Quy chế tổ chức và hoạt động; sơ đồ tổ chức bộ máy" },
      { ma: "tc-10", ten: "Chiến lược phát triển; quy chế thực hiện dân chủ ở cơ sở; các quy chế nội bộ khác" }
    ]
  },
  {
    nhom: "Thu, chi tài chính", canCu: "Điều 5",
    muc: [
      { ma: "tc5-01", ten: "Tình hình tài chính năm tài chính trước liền kề (các khoản thu, chi theo nguồn và theo nhóm)" },
      { ma: "tc5-02", ten: "Các khoản thu và mức thu đối với người học trong năm học" },
      { ma: "tc5-03", ten: "Chính sách và kết quả thực hiện miễn, giảm, hỗ trợ; chế độ hỗ trợ học sinh bán trú" },
      { ma: "tc5-04", ten: "Số dư các quỹ theo quy định" }
    ]
  },
  {
    nhom: "Điều kiện bảo đảm chất lượng giáo dục", canCu: "Điều 8",
    muc: [
      { ma: "cl-01", ten: "Đội ngũ giáo viên, cán bộ quản lý, nhân viên (số lượng, trình độ, chuẩn nghề nghiệp, bồi dưỡng)" },
      { ma: "cl-02", ten: "Cơ sở vật chất: diện tích, các khối phòng, thiết bị dạy học – đối sánh với yêu cầu tối thiểu" },
      { ma: "cl-03", ten: "Danh mục sách giáo khoa đã được phê duyệt; xuất bản phẩm tham khảo" },
      { ma: "cl-04", ten: "Kết quả tự đánh giá, đánh giá ngoài, kiểm định chất lượng, chuẩn quốc gia; kế hoạch cải tiến" }
    ]
  },
  {
    nhom: "Kế hoạch và kết quả hoạt động giáo dục", canCu: "Điều 9",
    muc: [
      { ma: "kh-01", ten: "Kế hoạch tuyển sinh (đối tượng, chỉ tiêu, phương thức, thời gian)" },
      { ma: "kh-02", ten: "Kế hoạch giáo dục của nhà trường năm học" },
      { ma: "kh-03", ten: "Quy chế phối hợp giữa nhà trường, gia đình và xã hội" },
      { ma: "kh-04", ten: "Chương trình, hoạt động hỗ trợ học tập, rèn luyện, sinh hoạt cho học sinh" },
      { ma: "kh-05", ten: "Thực đơn hằng ngày/tuần của học sinh bán trú" },
      { ma: "kh-06", ten: "Kết quả giáo dục năm học trước theo khối lớp (tuyển sinh, sĩ số, kết quả đánh giá, lên lớp, hoàn thành chương trình)" }
    ]
  },
  {
    nhom: "Báo cáo thường niên", canCu: "Điều 14, Phụ lục I",
    muc: [
      { ma: "bc-01", ten: "Báo cáo thường niên (PDF, số liệu tính đến 31/12, có chữ ký và dấu)" }
    ]
  }
];

// Các năm học hiển thị trong bộ chọn (mới nhất đứng đầu, giữ tối thiểu 5 năm)
window.CONG_KHAI_NAM = ["2026-2027", "2025-2026", "2024-2025", "2023-2024", "2022-2023"];

window.CONG_KHAI = {
  "2026-2027": {},
  "2025-2026": {},
  "2024-2025": {},
  "2023-2024": {},
  "2022-2023": {}
};
