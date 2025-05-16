-- Chuc nang
INSERT INTO [chuc_nang] ([ten], [ma], [id_cha], [loai], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Quản lý người dùng', 'QLND', NULL, 1, 1, 1, 1);

-- Nhom
INSERT INTO [nhom] ([ten], [mo_ta], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Quản trị hệ thống', N'Nhóm có tất cả quyền trong hệ thống', 1, 1, 1);

-- Nhom Chuc nang
INSERT INTO [nhom_chuc_nang] ([id_nhom], [id_chuc_nang], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, 1, 1);

-- Nguoi dung
INSERT INTO [nguoi_dung] ([ten_dang_nhap], [mat_khau], [vaitro], [loai], [xac_thuc], [trang_thai], [tong_chi_tieu], [cap_bac], [nguoi_tao], [nguoi_cap_nhat])
VALUES ('admin', '$2a$10$X5vY2JlM.3k4UqW1QdZs.e5jZJQ7tTk7n7G9VY9r6d5kL2vY6Q5X2', 'ADMIN', 'SYSTEM', 1, 'ACTIVE', 0, 'DIAMOND', 1, 1);

-- Thong tin ca nhan
INSERT INTO [thong_tin_ca_nhan] ([id_nguoi_dung], [ho_va_ten], [sdt], [avatar], [dia_chi], [gioi_tinh], [ngay_sinh], [cccd], [email], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, N'Nguyễn Văn Admin', '0987654321', 'avatar1.jpg', N'Hà Nội', 'Nam', '1990-01-01', '123456789', 'admin@example.com', 1, 1);

-- OTP
INSERT INTO [otp] ([code], [receiver], [type], [expired])
VALUES ('123456', 'admin@example.com', 'EMAIL', DATEADD(MINUTE, 5, GETDATE()));

-- OTP retry
INSERT INTO [otp_retry] ([id], [times], [expired])
VALUES ('admin@example.com', 0, DATEADD(MINUTE, 5, GETDATE()));

-- Dia chi giao hang
INSERT INTO [dia_chi_giao_hang] ([id_nguoi_dung], [ho_va_ten], [sdt], [dia_chi], [thanh_pho], [quoc_gia], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, N'Nguyễn Văn Admin', '0987654321', N'Số 1 Đại Cồ Việt, Hai Bà Trưng', N'Hà Nội', N'Việt Nam', 1, 1, 1);

-- Ho tro
INSERT INTO [ho_tro] ([id_nguoi_dung], [yeu_cau], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, N'Tôi cần hỗ trợ về đăng nhập', 1, 1, 1);

-- Lich su ho tro
INSERT INTO [lich_su_ho_tro] ([id_ho_tro], [id_nguoi_dung], [noi_dung], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, N'Đã giải quyết vấn đề đăng nhập', 1, 1, 1);

-- Phan hoi
INSERT INTO [phan_hoi] ([id_ho_tro], [nhan_xet], [diem], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, N'Hỗ trợ rất tốt', 5, 1, 1, 1);

-- Diem tich luy
INSERT INTO [diem_tich_luy] ([id_nguoi_dung], [diem], [ly_do], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 100, N'Đăng ký tài khoản', 1, 1, 1);

-- Phuong thuc thanh toan
INSERT INTO [phuong_thuc_thanh_toan] ([ten], [loai], [mo_ta], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Chuyển khoản ngân hàng', 'BANK', N'Thanh toán qua chuyển khoản ngân hàng', 1, 1, 1);

-- Phuong thuc van chuyen
INSERT INTO [phuong_thuc_van_chuyen] ([ten], [mo_ta], [phi_van_chuyen], [loai], [ghi_chu], [thoi_gian_giao_hang], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Giao hàng nhanh', N'Giao hàng trong 2h', 30000, 1, N'Áp dụng nội thành', '2 giờ', 1, 1, 1);

-- Hoa don
INSERT INTO [hoa_don] ([id_nguoi_dung], [ma], [id_dia_chi_giao_hang], [id_phuong_thuc_van_chuyen], [ngay_giao_hang], [tong_tien], [diem_su_dung], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 'HD001', 1, 1, DATEADD(DAY, 2, GETDATE()), 500000, 0, 1, 1, 1);

-- Chi tiet hoa don
INSERT INTO [chi_tiet_hoa_don] ([id_hoa_don], [id_san_pham_chi_tiet], [so_luong], [gia], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 2, 250000, 1, 1, 1);

-- Gio hang
INSERT INTO [gio_hang] ([id_nguoi_dung], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, 1);

-- Chi tiet gio hang
INSERT INTO [chi_tiet_gio_hang] ([id_gio_hang], [id_san_pham_chi_tiet], [so_luong], [gia], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, 250000, 1, 1, 1);

-- Size
INSERT INTO [size] ([ten], [id_danh_muc_cha], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'S', NULL, 1, 1, 1);

-- Mau sac
INSERT INTO [mau_sac] ([ten], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Đỏ', 1, 1, 1);

-- Chat lieu
INSERT INTO [chat_lieu] ([ten], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Cotton', 1, 1, 1);

-- Danh muc
INSERT INTO [danh_muc] ([id_danh_muc_cha], [ten], [mo_ta], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (NULL, N'Áo thun', N'Các loại áo thun', 1, 1, 1);

-- Thuong hieu
INSERT INTO [thuong_hieu] ([ten], [mo_ta], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Nike', N'Thương hiệu thể thao nổi tiếng', 1, 1, 1);

-- San pham (10 records)
INSERT INTO [san_pham] ([id_danh_muc], [id_thuong_hieu], [id_chat_lieu], [ten], [ma], [xuat_xu], [mo_ta], [gia], [anh], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES
    (1, 1, 1, N'Áo thun nam Nike cổ tròn', 'SP001', N'Việt Nam', N'Áo thun nam chất liệu cotton mềm mại', 250000, 'aothun1.jpg', 1, 1, 1),
    (1, 1, 1, N'Áo thun nữ Nike cổ tim', 'SP002', N'Việt Nam', N'Áo thun nữ dáng ôm body', 300000, 'aothun2.jpg', 1, 1, 1),
    (1, 1, 1, N'Áo khoác Nike Sport', 'SP003', N'Trung Quốc', N'Áo khoác thể thao chống nắng', 500000, 'aokhoac1.jpg', 1, 1, 1),
    (1, 1, 1, N'Quần short Nike', 'SP004', N'Việt Nam', N'Quần short thể thao thoáng mát', 350000, 'quanshort1.jpg', 1, 1, 1),
    (1, 1, 1, N'Giày Nike Air Max', 'SP005', N'Indonesia', N'Giày thể thao đế êm', 1200000, 'giay1.jpg', 1, 1, 1),
    (1, 1, 1, N'Mũ lưỡi trai Nike', 'SP006', N'Việt Nam', N'Mũ thời trang chống nắng', 200000, 'mu1.jpg', 1, 1, 1),
    (1, 1, 1, N'Túi đeo chéo Nike', 'SP007', N'Trung Quốc', N'Túi đeo chéo thể thao', 400000, 'tui1.jpg', 1, 1, 1),
    (1, 1, 1, N'Vớ Nike cao cổ', 'SP008', N'Việt Nam', N'Vớ thể thao thấm hút mồ hôi', 150000, 'vo1.jpg', 1, 1, 1),
    (1, 1, 1, N'Bộ đồ thể thao Nike', 'SP009', N'Thái Lan', N'Bộ đồ tập gym chất liệu co giãn', 800000, 'bodothethao1.jpg', 1, 1, 1),
    (1, 1, 1, N'Áo hoodie Nike', 'SP010', N'Malaysia', N'Áo hoodie giữ ấm mùa đông', 600000, 'aohoodie1.jpg', 1, 1, 1);

-- Chi tiet San pham
INSERT INTO [chi_tiet_san_pham] ([id_san_pham], [id_size], [id_mau_sac], [so_luong], [gia], [ghi_chu], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, 100, 250000, N'Còn hàng', 1, 1, 1);

-- San pham yeu thich
INSERT INTO [san_pham_yeu_thich] ([id_san_pham], [id_nguoi_dung], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, 1, 1);

-- Danh gia
INSERT INTO [danh_gia] ([id_san_pham_chi_tiet], [id_nguoi_dung], [id_hoa_don], [danh_gia], [nhan_xet], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, 5, N'Sản phẩm tốt, chất lượng đúng như mô tả', 1, 1, 1);

-- Khuyen mai
INSERT INTO [khuyen_mai] ([ten], [ma], [mo_ta], [loai], [gia_tri], [ngay_bat_dau], [ngay_ket_thuc], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Giảm giá 10%', 'KM001', N'Giảm 10% cho đơn hàng từ 500k', 1, 10, GETDATE(), DATEADD(MONTH, 1, GETDATE()), 1, 1, 1);

-- Ap dung khuyen mai
INSERT INTO [ap_dung_khuyen_mai] ([id_khuyen_mai], [id_san_pham], [id_nguoi_dung], [gia_tri_giam], [ngay_ap_dung], [da_su_dung], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, 10, GETDATE(), 0, 1, 1, 1);

-- Hinh anh
INSERT INTO [hinh_anh] ([id_san_pham], [anh], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 'aothun1_1.jpg', 1, 1, 1);

-- Yeu cau doi tra
INSERT INTO [yeu_cau_doi_tra] ([id_hoa_don], [id_nguoi_dung], [loai_yeu_cau], [ly_do], [trang_thai], [ngay_yeu_cau], [ngay_hoan_tat], [ghi_chu], [nguoi_tao], [nguoi_cap_nhat], [thong_tin_chuyen_khoan], [thong_tin_mat_hang_muon_doi])
VALUES (1, 1, N'Đổi hàng', N'Sản phẩm không vừa size', 1, GETDATE(), NULL, N'Đang xử lý', 1, 1, N'Techcombank - 19034955866018', N'Áo thun size M màu đen');

-- Yeu cau doi tra chi tiet
INSERT INTO [yeu_cau_doi_tra_chi_tiet] ([id_yeu_cau_doi_tra], [id_san_pham_chi_tiet], [so_luong], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, 1, 1, 1);

-- San pham doi tra
INSERT INTO [san_pham_doi_tra] ([id_san_pham_chi_tiet], [id_yeu_cau_doi_tra], [so_luong], [ly_do], [loai_yeu_cau], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, N'Sản phẩm không vừa size', N'Đổi hàng', 1, 1, 1);

-- Blog
INSERT INTO [blog] ([tac_gia], [tieu_de], [mo_ta], [hinh_anh], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (N'Admin', N'Xu hướng thời trang 2023', N'Các xu hướng thời trang nổi bật năm 2023', 'blog1.jpg', 1, 1, 1);

-- Blog chi tiet
INSERT INTO [blog_chi_tiet] ([id_blog], [thu_tu], [tieu_de], [noi_dung], [loai], [hinh_anh], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, N'Phần 1', N'Nội dung phần 1', 'TEXT', NULL, 1, 1, 1);

-- Binh luan
INSERT INTO [binh_luan] ([id_blog], [id_nguoi_dung], [content], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, N'Bài viết rất hay', 1, 1, 1);

-- Rep binh luan
INSERT INTO [rep_binh_luan] ([id_comment], [id_nguoi_dung], [content], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, N'Cảm ơn bạn đã quan tâm', 1, 1, 1);

-- Thanh toan
INSERT INTO [thanh_toan] ([id_hoa_don], [id_phuong_thuc_thanh_toan], [ma_giao_dich], [so_tien], [ghi_chu], [trang_thai], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 'GD001', 500000, N'Thanh toán đơn hàng HD001', 1, 1, 1);

-- Nhom nguoi dung
INSERT INTO [nhom_nguoi_dung] ([id_nhom], [id_nguoi_dung], [trang_thai], [ngay_tao], [ngay_cap_nhat], [nguoi_tao], [nguoi_cap_nhat])
VALUES (1, 1, 1, GETDATE(), GETDATE(), 1, 1);