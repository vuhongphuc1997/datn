package org.example.datn.processor;

import org.example.datn.constants.SystemConstant;
import org.example.datn.entity.*;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.request.SanPhamRequest;
import org.example.datn.model.response.SanPhamModel;
import org.example.datn.repository.SanPhamRepository;
import org.example.datn.service.*;
import org.example.datn.transformer.SanPhamTransformer;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Component
public class SanPhamProcessor {
    @Autowired
    private SanPhamService service;
    @Autowired
    private SanPhamRepository repository;
    @Autowired
    private DanhMucService danhMucService;

    @Autowired
    private ThuongHieuService thuongHieuService;

    @Autowired
    private ChatLieuService chatLieuService;
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;
    @Autowired
    private MauSacService mauSacService;
    @Autowired
    private SizeService sizeService;
    @Autowired
    private HinhAnhServices hinhAnhServices;
    @Autowired
    private SanPhamTransformer sanPhamTransformer;
    @Autowired
    private ApDungKhuyenMaiService apDungKhuyenMaiService;
    @Autowired
    private KhuyenMaiService khuyenMaiService;
    @Autowired
    private GioHangChiTietService gioHangChiTietService;

    public ServiceResult getById(Long id) {
        var sp = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin sản phẩm"));
        var danhMuc = danhMucService.findById(sp.getIdDanhMuc()).orElse(null);
        var thuongHieu = thuongHieuService.findById(sp.getIdThuongHieu()).orElse(null);
        var chatLieu = chatLieuService.findById(sp.getIdChatLieu()).orElse(null);

        SanPhamModel model = new SanPhamModel();
        BeanUtils.copyProperties(sp, model);
        model.setDanhMuc(danhMuc);
        model.setThuonghieu(thuongHieu);
        model.setChatLieu(chatLieu);

        var spctList = sanPhamChiTietService.findByIdSanPham(id);
        var idSizes = spctList.stream().map(SanPhamChiTiet::getIdSize).collect(Collectors.toList());
        var idMauSacs = spctList.stream().map(SanPhamChiTiet::getIdMauSac).collect(Collectors.toList());
        var sizes = sizeService.findByIdIn(idSizes);
        var mauSac = mauSacService.findByIdIn(idMauSacs);

        model.setListSanPhamChiTiet(spctList);
        model.setListSize(sizes);
        model.setListMauSac(mauSac);

        var hinhAnhs = hinhAnhServices.getImagesByProductId(id); // Lấy hình ảnh từ bảng hinh_anh

        model.setHinhAnhList(hinhAnhs);

        List<ApDungKhuyenMai> apDungKhuyenMais = apDungKhuyenMaiService.findByIdSanPham(id);
        BigDecimal giaSauKhuyenMai = BigDecimal.ZERO;
        boolean hasValidPromotion = false;

        for (ApDungKhuyenMai apDungKhuyenMai : apDungKhuyenMais) {
            KhuyenMai khuyenMai = khuyenMaiService.findById(apDungKhuyenMai.getIdKhuyenMai()).orElse(null);

            if (khuyenMai != null) {
                if (LocalDateTime.now().isAfter(khuyenMai.getNgayBatDau()) &&
                        LocalDateTime.now().isBefore(khuyenMai.getNgayKetThuc()) &&
                        khuyenMai.getTrangThai() == 1) {

                    if (apDungKhuyenMai.getGiaTriGiam() != null) {
                        giaSauKhuyenMai = giaSauKhuyenMai.add(apDungKhuyenMai.getGiaTriGiam());
                    }
                    hasValidPromotion = true;
                }
            }
        }

        if (hasValidPromotion) {
            model.setGiaSauKhuyenMai(sp.getGia().subtract(giaSauKhuyenMai).max(BigDecimal.ZERO));
        } else {
            model.setGiaSauKhuyenMai(null);
        }
        return new ServiceResult(model, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult getAll() {
        List<SanPhamModel> models = service.findAll().stream().map(sp -> {
            SanPhamModel model = new SanPhamModel();
            BeanUtils.copyProperties(sp, model);
            model.setDanhMuc(danhMucService.findById(sp.getIdDanhMuc()).orElse(null));
            model.setThuonghieu(thuongHieuService.findById(sp.getIdThuongHieu()).orElse(null));
            model.setChatLieu(chatLieuService.findById(sp.getIdChatLieu()).orElse(null));
            return model;
        }).collect(Collectors.toList());

        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    // Lưu ảnh vào thư mục và trả về tên file
    public String saveImage(MultipartFile image) throws IOException {
        // Lấy thư mục gốc của dự án
        String projectDir = System.getProperty("user.dir");

        // Đường dẫn thư mục lưu ảnh
        String uploadDir = projectDir + "/images";  // Thư mục images nằm trong thư mục gốc của dự án

        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();  // Tạo thư mục nếu không tồn tại
        }

        // Tạo tên file duy nhất bằng UUID
        String fileName = UUID.randomUUID().toString() + "-" + image.getOriginalFilename();
        String filePath = uploadDir + "/" + fileName;

        try {
            // Lưu file vào thư mục
            image.transferTo(new File(filePath));
        } catch (IOException e) {
            e.printStackTrace();  // In chi tiết lỗi ra console
            throw new IOException("Lỗi khi lưu ảnh: " + e.getMessage());
        }

        // Trả về tên file để lưu vào database
        return fileName;
    }


    // Thêm mới sản phẩm
    public ServiceResult save(SanPhamModel model, MultipartFile file, UserAuthentication ua) {
        SanPham sanPham = new SanPham();
        BeanUtils.copyProperties(model, sanPham);

        // Nếu có ảnh, gọi phương thức saveImage và lưu tên file
        if (file != null && !file.isEmpty()) {
            try {
                String fileName = saveImage(file);
                sanPham.setAnh(fileName);  // Lưu tên file vào thuộc tính `anh`
            } catch (IOException e) {
                return new ServiceResult("Lỗi khi lưu ảnh", SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_400);
            }
        }
        sanPham.setNguoiTao(ua.getPrincipal());
        sanPham.setNgayTao(LocalDateTime.now());
        sanPham.setNguoiCapNhat(ua.getPrincipal());
        sanPham.setNgayCapNhat(LocalDateTime.now());
        service.save(sanPham);
        updateGiaSPCT(sanPham.getId(), sanPham.getGia());

        return new ServiceResult("Sản phẩm đã được thêm thành công", SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    // Cập nhật thông tin sản phẩm
    @Transactional(rollbackOn = Exception.class)
    public ServiceResult update(Long id, SanPhamModel model, MultipartFile file, UserAuthentication ua) {
        SanPham sanPham = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm để cập nhật"));

        // Lưu giá trị ban đầu của ngayTao và nguoiTao
        LocalDateTime ngayTao = sanPham.getNgayTao();
        Long nguoiTao = sanPham.getNguoiTao();

        // Sao chép thuộc tính, ngoại trừ ngayTao và nguoiTao
        BeanUtils.copyProperties(model, sanPham, "ngayTao", "nguoiTao");

        // Khôi phục giá trị ngayTao và nguoiTao
        sanPham.setNgayTao(ngayTao);
        sanPham.setNguoiTao(nguoiTao);

        // Xử lý ảnh nếu có
        if (file != null && !file.isEmpty()) {
            try {
                String fileName = saveImage(file);
                sanPham.setAnh(fileName);
            } catch (IOException e) {
                return new ServiceResult("Lỗi khi lưu ảnh", SystemConstant.STATUS_FAIL, SystemConstant.CODE_400);
            }
        }

        // Cập nhật thông tin khác
        sanPham.setNguoiCapNhat(ua.getPrincipal());
        sanPham.setNgayCapNhat(LocalDateTime.now());
        service.update(sanPham);
        updateGiaSPCT(sanPham.getId(), sanPham.getGia());

        return new ServiceResult("Sản phẩm đã được cập nhật thành công", SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }


//    // Cập nhật nếu không có ảnh mới
//    public ServiceResult update(Long id, SanPhamModel model, UserAuthentication ua) {
//        SanPham sanPham = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm để cập nhật"));
//        LocalDateTime ngayTao = sanPham.getNgayTao();
//        Long nguoiTao = sanPham.getNguoiTao();
//
//        // Sao chép thuộc tính, ngoại trừ ngayTao và nguoiTao
//        BeanUtils.copyProperties(model, sanPham, "ngayTao", "nguoiTao");
//
//        // Khôi phục giá trị ngayTao và nguoiTao
//        sanPham.setNgayTao(ngayTao);
//        sanPham.setNguoiTao(nguoiTao);
//
//        sanPham.setNguoiCapNhat(ua.getPrincipal());
//        sanPham.setNgayCapNhat(LocalDateTime.now());
//
//
//        // Không thay đổi ảnh nếu không có ảnh mới
//        service.update(sanPham);
//        updateGiaSPCT(sanPham.getId(), sanPham.getGia());
//
//        return new ServiceResult("Sản phẩm đã được cập nhật thành công", SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
//    }


    public ServiceResult delete(Long id) {
        service.delete(id);
        return new ServiceResult("Sản phẩm đã được xóa thành công", SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }


    public ServiceResult updateStatus(Long id, Integer trangThai, UserAuthentication ua) {
        SanPham sanPham = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm để cập nhật trạng thái"));

        LocalDateTime ngayTao = sanPham.getNgayTao();
        Long nguoiTao = sanPham.getNguoiTao();
        // Khôi phục giá trị ngayTao và nguoiTao
        sanPham.setNgayTao(ngayTao);
        sanPham.setNguoiTao(nguoiTao);
        sanPham.setTrangThai(trangThai); // Cập nhật trạng thái
        sanPham.setNguoiCapNhat(ua.getPrincipal());
        sanPham.setNgayCapNhat(LocalDateTime.now());

        service.update(sanPham); // Lưu thay đổi vào database
        return new ServiceResult("Trạng thái sản phẩm đã được cập nhật thành công", SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    private void updateGiaSPCT(Long idSanPham, BigDecimal gia) {
        var sanPhamChiTiets = sanPhamChiTietService.findByIdSanPham(idSanPham);
        if (sanPhamChiTiets.isEmpty()) {
            return;
        }

        sanPhamChiTiets.forEach(spct -> spct.setGia(gia));
        sanPhamChiTietService.saveAll(sanPhamChiTiets);

        List<Long> idSanPhamChiTietList = sanPhamChiTiets.stream()
                .map(SanPhamChiTiet::getId)
                .collect(Collectors.toList());

        var gioHangChiTiets = gioHangChiTietService.findByIdSanPhamChiTietInAndTrangThai(idSanPhamChiTietList, 0);
        if (!gioHangChiTiets.isEmpty()) {
            gioHangChiTiets.forEach(gioHangChiTiet -> gioHangChiTiet.setGia(gia));
            gioHangChiTietService.saveAll(gioHangChiTiets);
        }
    }


//    public ServiceResult searchProducts(SanPhamRequest request) {
//        List<SanPham> list = service.searchSanPham(request.getKeyword(), request.getIdChatLieu(), request.getIdThuongHieu(), request.getIdDanhMuc(), request.getGiaMin(), request.getGiaMax());
//
//        var models = list.stream().map(sanPham -> {
//            var model = sanPhamTransformer.toModel(sanPham);
//
//            List<ApDungKhuyenMai> apDungKhuyenMais = apDungKhuyenMaiService.findByIdSanPham(sanPham.getId());
//
//            BigDecimal giaSauKhuyenMai = BigDecimal.ZERO;
//            boolean hasValidPromotion = false;
//
//            for (ApDungKhuyenMai apDungKhuyenMai : apDungKhuyenMais) {
//                KhuyenMai khuyenMai = khuyenMaiService.findById(apDungKhuyenMai.getIdKhuyenMai()).orElse(null);
//
//                if (khuyenMai != null) {
//                    if (LocalDateTime.now().isAfter(khuyenMai.getNgayBatDau()) &&
//                            LocalDateTime.now().isBefore(khuyenMai.getNgayKetThuc()) &&
//                            khuyenMai.getTrangThai() == 1) {
//
//                        if (apDungKhuyenMai.getGiaTriGiam() != null) {
//                            giaSauKhuyenMai = giaSauKhuyenMai.add(apDungKhuyenMai.getGiaTriGiam());
//                        }
//                        hasValidPromotion = true;
//                    }
//                }
//            }
//
//            if (hasValidPromotion) {
//                model.setGiaSauKhuyenMai(sanPham.getGia().subtract(giaSauKhuyenMai).max(BigDecimal.ZERO));
//            } else {
//                model.setGiaSauKhuyenMai(null);
//            }
//
//            return model;
//        }).collect(Collectors.toList());
//
//        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
//    }

    public ServiceResult searchProducts(SanPhamRequest request) {
        // Tìm kiếm sản phẩm dựa trên từ khóa và các tiêu chí
        List<SanPham> list = service.searchSanPham(request.getKeyword(), request.getIdChatLieu(),
                request.getIdThuongHieu(), request.getIdDanhMuc(),
                request.getGiaMin(), request.getGiaMax());

        // Lấy danh sách sản phẩm bán chạy
        List<Map<String, Object>> topSellingProducts = service.getTopSellingProducts();
        List<Long> topSellingProductIds = topSellingProducts.stream()
                .map(product -> (Long) product.get("id"))
                .collect(Collectors.toList());

        // Biến đổi danh sách sản phẩm sang model kèm thông tin bán chạy
        var models = list.stream().map(sanPham -> {
            var model = sanPhamTransformer.toModel(sanPham);

            // Kiểm tra nếu sản phẩm là sản phẩm bán chạy
            boolean isTopSelling = topSellingProductIds.contains(sanPham.getId());
            model.setIsTopSelling(isTopSelling);

            // Tính giá sau khuyến mãi
            List<ApDungKhuyenMai> apDungKhuyenMais = apDungKhuyenMaiService.findByIdSanPham(sanPham.getId());
            BigDecimal giaSauKhuyenMai = BigDecimal.ZERO;
            boolean hasValidPromotion = false;

            for (ApDungKhuyenMai apDungKhuyenMai : apDungKhuyenMais) {
                KhuyenMai khuyenMai = khuyenMaiService.findById(apDungKhuyenMai.getIdKhuyenMai()).orElse(null);

                if (khuyenMai != null) {
                    if (LocalDateTime.now().isAfter(khuyenMai.getNgayBatDau()) &&
                            LocalDateTime.now().isBefore(khuyenMai.getNgayKetThuc()) &&
                            khuyenMai.getTrangThai() == 1) {

                        if (apDungKhuyenMai.getGiaTriGiam() != null) {
                            giaSauKhuyenMai = giaSauKhuyenMai.add(apDungKhuyenMai.getGiaTriGiam());
                        }
                        hasValidPromotion = true;
                    }
                }
            }

            if (hasValidPromotion) {
                model.setGiaSauKhuyenMai(sanPham.getGia().subtract(giaSauKhuyenMai).max(BigDecimal.ZERO));
            } else {
                model.setGiaSauKhuyenMai(null);
            }

            return model;
        }).collect(Collectors.toList());

        // Trả về danh sách sản phẩm với thông tin bán chạy
        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    //////////////////thống kê ////////////////
    @Autowired
    private HoaDonChiTietService hoaDonChiTietService;

    @Autowired
    private SanPhamService sanPhamService;
    // Thống kê sản phẩm bán ra theo thời gian
//    public ServiceResult getProductsSoldByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
//        List<HoaDonChiTiet> list = hoaDonChiTietService.findByDateRange(startDate, endDate);
//        Map<Long, Integer> productSales = new HashMap<>();
//
//        for (HoaDonChiTiet hoaDonChiTiet : list) {
//            Long productId = hoaDonChiTiet.getSanPhamChiTiet().getSanPham().getId();
//            int quantity = hoaDonChiTiet.getSoLuong();
//            productSales.put(productId, productSales.getOrDefault(productId, 0) + quantity);
//        }
//
//        List<ProductSalesModel> salesModels = productSales.entrySet().stream()
//                .map(entry -> {
//                    ProductSalesModel model = new ProductSalesModel();
//                    model.setProductId(entry.getKey());
//                    model.setSoldQuantity(entry.getValue());
//                    return model;
//                }).collect(Collectors.toList());
//
//        return new ServiceResult(salesModels, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
//    }
}
