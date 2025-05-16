package org.example.datn.processor;

import org.example.datn.constants.SystemConstant;
import org.example.datn.entity.*;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.enums.LoaiYeuCau;
import org.example.datn.model.request.HoaDonChiTietRequest;
import org.example.datn.model.response.HoaDonChiTietModel;
import org.example.datn.model.response.HoaDonModel;
import org.example.datn.model.response.SanPhamChiTietModel;
import org.example.datn.model.response.SanPhamModel;
import org.example.datn.repository.HoaDonChiTietRepository;
import org.example.datn.repository.SanPhamChiTietRepository;
import org.example.datn.service.*;
import org.example.datn.transformer.HoaDonChiTietTransformer;
import org.example.datn.transformer.HoaDonTransformer;
import org.example.datn.transformer.SanPhamChiTietTransformer;
import org.example.datn.transformer.SanPhamTransformer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import javax.persistence.EntityNotFoundException;
import java.util.stream.Collectors;

/**
 * @author hoangKhong
 */
@Component
public class HoaDonChiTietProcessor {

    @Autowired
    HoaDonChiTietService service;
    @Autowired
    HoaDonTransformer hoaDonTransformer;
    @Autowired
    HoaDonService hoaDonService;
    @Autowired
    HoaDonChiTietTransformer hoaDonChiTietTransformer;
    @Autowired
    SanPhamChiTietService sanPhamChiTietService;
    @Autowired
    SanPhamChiTietTransformer sanPhamChiTietTransformer;
    @Autowired
    private SanPhamService sanPhamService;
    @Autowired
    private SanPhamTransformer sanPhamTransformer;
    @Autowired
    private SizeService sizeService;
    @Autowired
    private MauSacService mauSacService;

    @Autowired
    private UserService userService;
    @Autowired
    private ProfileService profileService;
    @Autowired
    SanPhamChiTietProcessor sanPhamChiTietprocessor;

    public ServiceResult getListByStatus(HoaDonChiTietRequest request, UserAuthentication ua) {
        var idHoaDons = hoaDonService.findByIdNguoiDung(ua.getPrincipal()).stream()
                .map(HoaDon::getId)
                .collect(Collectors.toList());
        var hoaDonChiTiets = service.findByIdHoaDonInAndTrangThai(idHoaDons, request.getStatus());
        var models = hoaDonChiTiets.stream()
                .map(hoaDonChiTiet -> {
                    var model = hoaDonChiTietTransformer.toModel(hoaDonChiTiet);
                    sanPhamChiTietService.findById(hoaDonChiTiet.getIdSanPhamChiTiet())
                            .ifPresent(sanPhamChiTiet -> {
                                var spctModel = sanPhamChiTietTransformer.toModel(sanPhamChiTiet);
                                sanPhamService.findById(sanPhamChiTiet.getIdSanPham())
                                        .ifPresent(sanPham -> {
                                            var sanPhamModel = sanPhamTransformer.toModel(sanPham);
                                            spctModel.setSanPhamModel(sanPhamModel);
                                        });
                                var size = sizeService.findById(sanPhamChiTiet.getIdSize()).orElse(null);
                                var mauSac = mauSacService.findById(sanPhamChiTiet.getIdMauSac()).orElse(null);
                                spctModel.setSize(size);
                                spctModel.setMauSac(mauSac);
                                model.setSanPhamChiTietModel(spctModel);

                            });
                    return model;
                })
                .collect(Collectors.toList());
        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    private HoaDonChiTietModel toModel(HoaDonChiTiet hoaDon) {
        if (hoaDon == null) {
            return null;
        }

        HoaDonChiTietModel model = new HoaDonChiTietModel();
        model.setId(hoaDon.getId());
        model.setIdHoaDon(hoaDon.getIdHoaDon());
        model.setGia(hoaDon.getGia());
        model.setSoLuong(hoaDon.getSoLuong());
        model.setIdSanPhamChiTiet(hoaDon.getIdSanPhamChiTiet());
        model.setTrangThai(hoaDon.getTrangThai());
        return model;
    }

    public ServiceResult getAll() {
        var list = service.findAll();
        var models = list.stream().map(hoaDonChiTiet -> {
            var model = toModel(hoaDonChiTiet);
            var sanPhamChiTiet = sanPhamChiTietprocessor.findById(hoaDonChiTiet.getIdSanPhamChiTiet());
            model.setSanPhamChiTietModel(sanPhamChiTiet);
            return model;
        }).collect(Collectors.toList());
        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult getByIdHoaDon(Long idHoaDon) {
        // Tìm các hóa đơn chi tiết dựa trên idHoaDon
        List<HoaDonChiTiet> hoaDonChiTiets = service.findByIdHoaDon(idHoaDon);

        // Kiểm tra nếu không có dữ liệu
        if (hoaDonChiTiets == null || hoaDonChiTiets.isEmpty()) {
            return new ServiceResult(null, SystemConstant.STATUS_FAIL, "Không tìm thấy hóa đơn chi tiết");
        }

        // Chuyển các hóa đơn chi tiết thành mô hình
        List<HoaDonChiTietModel> models = hoaDonChiTiets.stream()
                .map(hoaDonChiTiet -> {
                    HoaDonChiTietModel model = hoaDonChiTietTransformer.toModel(hoaDonChiTiet);

                    // Tìm sản phẩm chi tiết và thêm vào mô hình
                    sanPhamChiTietService.findById(hoaDonChiTiet.getIdSanPhamChiTiet())
                            .ifPresent(sanPhamChiTiet -> {
                                // Chuyển đổi sản phẩm chi tiết
                                SanPhamChiTietModel spctModel = sanPhamChiTietTransformer.toModel(sanPhamChiTiet);

                                // Lấy thông tin sản phẩm từ sản phẩm chi tiết
                                sanPhamService.findById(sanPhamChiTiet.getIdSanPham())
                                        .ifPresent(sanPham -> {
                                            SanPhamModel sanPhamModel = sanPhamTransformer.toModel(sanPham);
                                            spctModel.setSanPhamModel(sanPhamModel);
                                        });

                                // Thêm thông tin về size và màu sắc của sản phẩm chi tiết
                                Size size = sizeService.findById(sanPhamChiTiet.getIdSize()).orElse(null);
                                MauSac mauSac = mauSacService.findById(sanPhamChiTiet.getIdMauSac()).orElse(null);
                                spctModel.setSize(size);
                                spctModel.setMauSac(mauSac);

                                // Gán vào model hóa đơn chi tiết
                                model.setSanPhamChiTietModel(spctModel);
                            });

                    return model;
                })
                .collect(Collectors.toList());

        // Trả kết quả với danh sách hóa đơn chi tiết
        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult getById(Long id) {
        var model = service.findById(id)
                .map(hoaDonChiTiet -> {
                    var m = toModel(hoaDonChiTiet);
                    var sanPhamChiTiet = sanPhamChiTietprocessor.findById(hoaDonChiTiet.getIdSanPhamChiTiet());
                    m.setSanPhamChiTietModel(sanPhamChiTiet);
                    return m;
                })
                .orElseThrow(() -> new EntityNotFoundException("hoaDonChiTiet.not.found"));
        return new ServiceResult(model, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    ///////////////////////////// THỐNG KÊ ///////////////////

    @Autowired
    YeuCauDoiTraService yeuCauDoiTraService;
    @Autowired
    YeuCauDoiTraChiTietService yeuCauDoiTraChiTietService;
    @Autowired
    SanPhamChiTietRepository sanPhamChiTietRepository;
    @Autowired
    HoaDonChiTietRepository hoaDonChiTietRepository;

    private ServiceResult thongKe(LocalDateTime startDate, LocalDateTime endDate, int status) {
        List<HoaDon> hoaDonList = hoaDonService.findByDateRangeAndStatusAndReturnStatus(startDate, endDate, status);

        // Lấy danh sách yêu cầu đổi trả liên quan đến các hóa đơn
        List<YeuCauDoiTra> yeuCauDoiTraList = yeuCauDoiTraService.findByHoaDonIds(
                hoaDonList.stream().map(HoaDon::getId).collect(Collectors.toList())
        );

        // Khởi tạo các biến để tính toán doanh thu
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalInvoices = 0;
        int totalQuantity = 0;
        BigDecimal totalDiemDung = BigDecimal.ZERO;

        // Duyệt qua từng hóa đơn
        for (HoaDon hoaDon : hoaDonList) {
            // Lấy danh sách chi tiết hóa đơn
            List<HoaDonChiTiet> chiTietList = hoaDonChiTietRepository.findByIdHoaDon(hoaDon.getId());
            // Tính tổng giá trị trước giảm giá
            BigDecimal totalValueBeforeDiscount = BigDecimal.ZERO;
            for (HoaDonChiTiet chiTiet : chiTietList) {
                BigDecimal productTotal = chiTiet.getGia().multiply(BigDecimal.valueOf(chiTiet.getSoLuong()));
                totalValueBeforeDiscount = totalValueBeforeDiscount.add(productTotal);
            }

            // Kiểm tra tổng giá trị trước giảm giá
            System.out.println("Total value before discount: " + totalValueBeforeDiscount);

            // Tính tỷ lệ giảm giá (không tính phí vận chuyển)
            BigDecimal totalPaid = hoaDon.getTongTien(); // Tổng tiền khách trả
            BigDecimal discountRate = BigDecimal.ONE.subtract(
                    totalPaid.divide(totalValueBeforeDiscount, MathContext.DECIMAL64)
            );

            // Kiểm tra tỷ lệ giảm giá trước khi áp dụng quy tắc giảm giá
            System.out.println("Calculated discount rate: " + discountRate);

            // Kiểm tra tỷ lệ giảm giá và áp dụng quy tắc giảm giá
            if (discountRate.compareTo(new BigDecimal("0.20")) >= 0) {
                discountRate = new BigDecimal("0.20"); // Áp dụng giảm giá tối đa 20%
            } else if (discountRate.compareTo(new BigDecimal("0.10")) >= 0) {
                discountRate = new BigDecimal("0.10"); // Áp dụng giảm giá 10%
            } else {
                discountRate = BigDecimal.ZERO; // Không áp dụng giảm giá
            }


            // Kiểm tra tỷ lệ giảm giá sau khi áp dụng quy tắc
            System.out.println("Applied discount rate: " + discountRate);

            // Kiểm tra yêu cầu đổi trả
            YeuCauDoiTra yeuCau = yeuCauDoiTraList.stream()
                    .filter(y -> y.getIdHoaDon().equals(hoaDon.getId()))
                    .findFirst()
                    .orElse(null);

            // Xử lý yêu cầu đổi trả nếu có
            if (yeuCau != null) {
                if (yeuCau.getLoai() == LoaiYeuCau.DOI_HANG) {
                    totalRevenue = totalRevenue.add(totalPaid);
                } else if (yeuCau.getLoai() == LoaiYeuCau.TRA_HANG) {
                    if (yeuCau.getTrangThai() == 2) { // Đã hoàn tất trả hàng
                        List<YeuCauDoiTraChiTiet> chiTietTraHang = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(yeuCau.getId());
                        BigDecimal refundAmount = BigDecimal.ZERO;
                        for (YeuCauDoiTraChiTiet traChiTiet : chiTietTraHang) {
                            SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(traChiTiet.getIdSPCT()).orElse(null);
                            if (sanPhamChiTiet != null) {
                                // Tính số tiền hoàn lại cho từng sản phẩm chi tiết
                                BigDecimal productRefund = sanPhamChiTiet.getGia()
                                        .multiply(BigDecimal.ONE.subtract(discountRate)) // Áp dụng tỷ lệ giảm giá
                                        .multiply(BigDecimal.valueOf(traChiTiet.getSoLuong()));
                                refundAmount = refundAmount.add(productRefund);
                            }
                        }
                        totalRevenue = totalRevenue.add(totalPaid.subtract(refundAmount));
                    } else {
                        totalRevenue = totalRevenue.add(totalPaid);
                    }
                }
            } else {
                totalRevenue = totalRevenue.add(totalPaid);
            }

            // Tăng tổng hóa đơn và điểm sử dụng
            totalInvoices++;
            if (hoaDon.getDiemSuDung() != null) {
                totalDiemDung = totalDiemDung.add(BigDecimal.valueOf(hoaDon.getDiemSuDung()));
            }
        }

//////////////////////////////////////////////////////////////////////////////////////////////////////

        // Lấy chi tiết hóa đơn theo khoảng thời gian và trạng thái
        List<HoaDonChiTiet> hoaDonChiTietList = service.findByDateRange(startDate, endDate, status);

        // Map để lưu trữ doanh thu và số lượng sản phẩm theo id sản phẩm
        Map<Long, BigDecimal> productRevenueMap = new HashMap<>();
        Map<Long, Integer> productQuantityMap = new HashMap<>();

        // Duyệt qua chi tiết hóa đơn để tính doanh thu và số lượng của từng sản phẩm
        for (HoaDonChiTiet hoaDonChiTiet : hoaDonChiTietList) {
//            totalQuantity += hoaDonChiTiet.getSoLuong();  // Cộng số lượng sản phẩm vào tổng
            Long productDetailId = hoaDonChiTiet.getIdSanPhamChiTiet();
            SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietService.ById(productDetailId);  // Lấy thông tin sản phẩm chi tiết
            Long productId = sanPhamChiTiet.getIdSanPham();  // Lấy id sản phẩm từ sản phẩm chi tiết

            // Lấy yêu cầu đổi trả theo id hóa đơn (idHoaDon)
            List<YeuCauDoiTra> yeuCauDoiTraLists = yeuCauDoiTraService.findByHoaDonId(hoaDonChiTiet.getIdHoaDon());

            int adjustedQuantity = hoaDonChiTiet.getSoLuong();  // Biến lưu số lượng đã điều chỉnh sau khi trừ số lượng trả hàng

            for (YeuCauDoiTra yeuCau : yeuCauDoiTraLists) {
                if (yeuCau.getLoai() == LoaiYeuCau.TRA_HANG) {
                    // Nếu yêu cầu đổi trả là TRẢ HÀNG
                    if (yeuCau.getTrangThai() == 2) { // Đã hoàn tất trả hàng
                        // Lấy chi tiết trả hàng từ yêu cầu đổi trả
                        List<YeuCauDoiTraChiTiet> chiTietTraHang = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(yeuCau.getId());
                        for (YeuCauDoiTraChiTiet chiTiet : chiTietTraHang) {
                            if (chiTiet.getIdSPCT().equals(productDetailId)) {
                                // Trừ số lượng sản phẩm đã trả lại
                                adjustedQuantity -= chiTiet.getSoLuong();
                            }
                        }
                    }
                } else {
                    // Nếu yêu cầu đổi trả là ĐỔI HÀNG, không thay đổi số lượng
                    adjustedQuantity = hoaDonChiTiet.getSoLuong();
                }
            }

            // Cập nhật số lượng sản phẩm vào map
            productQuantityMap.put(productId, productQuantityMap.getOrDefault(productId, 0) + adjustedQuantity);

            // Tính doanh thu: productRevenue = adjustedQuantity * giaSPCT
            BigDecimal productRevenue = new BigDecimal(adjustedQuantity).multiply(sanPhamChiTiet.getGia());
            productRevenueMap.put(productId, productRevenueMap.getOrDefault(productId, BigDecimal.ZERO).add(productRevenue));
            // Cộng tổng số lượng đã điều chỉnh vào totalQuantity
            totalQuantity += adjustedQuantity;
        }

        // Tạo danh sách chi tiết doanh thu và số lượng của các sản phẩm
        List<Map<String, Object>> revenueAndQuantityModels = new ArrayList<>();
        for (Long productId : productRevenueMap.keySet()) {
            BigDecimal productRevenue = productRevenueMap.get(productId);
            int productQuantity = productQuantityMap.get(productId);
            SanPham sanPham = sanPhamService.ById(productId);  // Lấy thông tin sản phẩm

            // Tạo dữ liệu cho sản phẩm
            Map<String, Object> productData = new HashMap<>();
            productData.put("productId", productId);
            productData.put("ten", sanPham.getTen());
            productData.put("ma", sanPham.getMa());
            productData.put("doanhThu", productRevenue);
            productData.put("soLuong", productQuantity);

            revenueAndQuantityModels.add(productData);
        }


///////////////////////////////////////////////////////////////////////////////////////////
        // Map để lưu trữ doanh thu và số hóa đơn của người dùng
        Map<Long, BigDecimal> userRevenueMap = new HashMap<>();
        Map<Long, Integer> userInvoiceCountMap = new HashMap<>();
        Map<Long, Integer> userPointsMap = new HashMap<>(); // Map lưu trữ điểm thưởng của người dùng

        for (HoaDon hoaDon : hoaDonList) {
            Long userId = hoaDon.getIdNguoiDung();
            BigDecimal tongTienGoc = BigDecimal.ZERO; // Tổng tiền trước giảm giá

            // Lấy danh sách chi tiết hóa đơn
            List<HoaDonChiTiet> chiTietList = service.findByIdHoaDon(hoaDon.getId());

            // Tính tổng tiền gốc
            for (HoaDonChiTiet chiTiet : chiTietList) {
                // Lấy sản phẩm chi tiết qua idSPCT
                SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(chiTiet.getIdSanPhamChiTiet()).orElse(null);
                if (sanPhamChiTiet != null) {
                    BigDecimal giaSanPham = sanPhamChiTiet.getGia(); // Giá sản phẩm
                    BigDecimal soLuong = BigDecimal.valueOf(chiTiet.getSoLuong());
                    tongTienGoc = tongTienGoc.add(giaSanPham.multiply(soLuong)); // Tính tổng tiền gốc
                }
            }

            BigDecimal tongTienSauGiam = hoaDon.getTongTien(); // Tổng tiền sau giảm giá
            BigDecimal tongTienGiam = tongTienGoc.subtract(tongTienSauGiam); // Tổng số tiền giảm
            BigDecimal tyLeGiamGiaThucTe = tongTienGiam.divide(tongTienGoc, 2, RoundingMode.HALF_UP); // Tỷ lệ giảm giá thực tế

            BigDecimal refundAmount = BigDecimal.ZERO; // Giá trị hoàn trả

            // Kiểm tra nếu có yêu cầu đổi trả liên quan đến hóa đơn này
            YeuCauDoiTra yeuCau = yeuCauDoiTraList.stream()
                    .filter(y -> y.getIdHoaDon().equals(hoaDon.getId()))
                    .findFirst()
                    .orElse(null);

            if (yeuCau != null && yeuCau.getLoai() == LoaiYeuCau.TRA_HANG && yeuCau.getTrangThai() != null && yeuCau.getTrangThai() == 2) {
                // Lấy danh sách chi tiết đổi trả
                List<YeuCauDoiTraChiTiet> chiTietTraHang = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(yeuCau.getId());

                for (YeuCauDoiTraChiTiet traChiTiet : chiTietTraHang) {
                    // Lấy sản phẩm chi tiết qua idSPCT
                    SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(traChiTiet.getIdSPCT()).orElse(null);
                    if (sanPhamChiTiet != null) {
                        BigDecimal giaSanPham = sanPhamChiTiet.getGia(); // Giá sản phẩm
                        BigDecimal soLuong = BigDecimal.valueOf(traChiTiet.getSoLuong());

                        // Tính tiền hoàn lại cho từng sản phẩm trả
                        BigDecimal tienHoanTra = giaSanPham.multiply(soLuong)
                                .multiply(BigDecimal.ONE.subtract(tyLeGiamGiaThucTe)); // Áp dụng tỷ lệ giảm giá

                        refundAmount = refundAmount.add(tienHoanTra);
                    }
                }

                // Đảm bảo giá trị hoàn trả không vượt quá tổng tiền sau giảm giá
                if (refundAmount.compareTo(tongTienSauGiam) > 0) {
                    refundAmount = tongTienSauGiam;
                }

                // Cập nhật doanh thu
                tongTienSauGiam = tongTienSauGiam.subtract(refundAmount);
            }

            // Cộng doanh thu vào map doanh thu của người dùng
            userRevenueMap.put(userId, userRevenueMap.getOrDefault(userId, BigDecimal.ZERO).add(tongTienSauGiam));
            userInvoiceCountMap.put(userId, userInvoiceCountMap.getOrDefault(userId, 0) + 1);
            Integer currentPoints = hoaDon.getDiemSuDung() != null ? hoaDon.getDiemSuDung() : 0;
            userPointsMap.put(userId, userPointsMap.getOrDefault(userId, 0) + currentPoints);
        }


        // Map để lưu trữ doanh thu theo cấp bậc
        Map<String, BigDecimal> revenueByCapBacTotal = new HashMap<>();
        revenueByCapBacTotal.put("BAC", BigDecimal.ZERO);
        revenueByCapBacTotal.put("VANG", BigDecimal.ZERO);
        revenueByCapBacTotal.put("KIM_CUONG", BigDecimal.ZERO);

        // Map để lưu trữ danh sách người dùng theo cấp bậc
        Map<String, List<Map<String, Object>>> revenueByCapBac = new HashMap<>();
        revenueByCapBac.put("BAC", new ArrayList<>());
        revenueByCapBac.put("VANG", new ArrayList<>());
        revenueByCapBac.put("KIM_CUONG", new ArrayList<>());

        // Tạo danh sách doanh thu người dùng
        List<Map<String, Object>> userRevenueList = new ArrayList<>();
        for (Long userId : userRevenueMap.keySet()) {
            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", userId);
            userData.put("doanhThu", userRevenueMap.get(userId));
            userData.put("soLuongHoaDon", userInvoiceCountMap.get(userId));
            userData.put("diemDung", userPointsMap.get(userId));

            User user = userService.ById(userId);  // Lấy thông tin người dùng
            Profile profile = profileService.ById(userId);  // Lấy thông tin hồ sơ người dùng

            userData.put("tenDangNhap", user.getUserName());
            userData.put("hoVaTen", profile.getHoVaTen());
            userData.put("email", profile.getEmail());
            userData.put("sdt", profile.getPhone());
            userData.put("capBac", user.getCapBac().name());

            // Thêm người dùng vào danh sách theo cấp bậc
            revenueByCapBac.get(user.getCapBac().name()).add(userData);
            revenueByCapBacTotal.put(user.getCapBac().name(),
                    revenueByCapBacTotal.get(user.getCapBac().name()).add(userRevenueMap.get(userId)));

            userRevenueList.add(userData);
        }
////////////////////////////////////////////////////////////////////////////////////////////////

        // Danh sách sản phẩm đổi trả loại DOI_HANG và trạng thái 2
        List<Map<String, Object>> dsSanPhamDoiHang = new ArrayList<>();

        // Danh sách sản phẩm đổi trả loại TRA_HANG và trạng thái 2
        List<Map<String, Object>> dsSanPhamTraHang = new ArrayList<>();

        // Duyệt qua các hóa đơn
        for (HoaDon hoaDon : hoaDonList) {
            // Lấy các yêu cầu đổi trả từ hóa đơn (sử dụng idHoaDon thay vì hoaDon trực tiếp)
            List<YeuCauDoiTra> yeuCauDoiTraListDT = yeuCauDoiTraService.findByHoaDonIdAndLoaiAndTrangThai(hoaDon.getId(), LoaiYeuCau.DOI_HANG, 2);
            yeuCauDoiTraListDT.addAll(yeuCauDoiTraService.findByHoaDonIdAndLoaiAndTrangThai(hoaDon.getId(), LoaiYeuCau.TRA_HANG, 2));

            // Duyệt qua các yêu cầu đổi trả của hóa đơn
            for (YeuCauDoiTra yeuCau : yeuCauDoiTraListDT) {
                // Lấy danh sách chi tiết yêu cầu đổi trả từ yêu cầu đổi trả
                List<YeuCauDoiTraChiTiet> chiTietDoiTraList = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(yeuCau.getId());

                // Duyệt qua từng chi tiết yêu cầu đổi trả
                for (YeuCauDoiTraChiTiet chiTiet : chiTietDoiTraList) {
                    // Lấy id sản phẩm chi tiết (SPCT) từ chi tiết đổi trả
                    Long idSPCT = chiTiet.getIdSPCT();

                    // Lấy thông tin sản phẩm chi tiết từ idSPCT
                    SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(idSPCT).orElse(null);
                    if (sanPhamChiTiet != null) {
                        // Lấy id sản phẩm từ sản phẩm chi tiết
                        Long idSanPham = sanPhamChiTiet.getIdSanPham();

                        // Lấy thông tin sản phẩm từ idSanPham
                        SanPham sanPham = sanPhamService.findById(idSanPham).orElse(null);
                        if (sanPham != null) {
                            // Tạo đối tượng chứa thông tin sản phẩm đổi trả
                            Map<String, Object> sanPhamData = new HashMap<>();
                            sanPhamData.put("idSPCT", sanPhamChiTiet.getId());
                            sanPhamData.put("idSanPham", sanPham.getId());
                            sanPhamData.put("ma", sanPham.getMa());
                            sanPhamData.put("tenSanPham", sanPham.getTen()); // Lấy tên sản phẩm từ bảng sản phẩm
                            sanPhamData.put("gia", sanPhamChiTiet.getGia());
                            sanPhamData.put("soLuong", chiTiet.getSoLuong()); // Số lượng từ chi tiết đổi trả
                            sanPhamData.put("idYeuCau", yeuCau.getId()); // idYeuCau của yêu cầu

                            // Kiểm tra loại yêu cầu
                            if (yeuCau.getLoai() == LoaiYeuCau.DOI_HANG) {
                                dsSanPhamDoiHang.add(sanPhamData); // Thêm vào danh sách sản phẩm đổi hàng
                            } else if (yeuCau.getLoai() == LoaiYeuCau.TRA_HANG) {
                                dsSanPhamTraHang.add(sanPhamData); // Thêm vào danh sách sản phẩm trả hàng
                            }
                        }
                    }
                }
            }
        }


        // Sắp xếp danh sách người dùng theo doanh thu giảm dần
        userRevenueList.sort((a, b) -> ((BigDecimal) b.get("doanhThu")).compareTo((BigDecimal) a.get("doanhThu")));

        // Tạo kết quả trả về
        Map<String, Object> result = new HashMap<>();
        result.put("doanhThu", totalRevenue);
        result.put("soLuongBanRa", totalQuantity);
        result.put("soLuongHoaDon", totalInvoices);
        result.put("diemDung", totalDiemDung);
        result.put("chiTietSanPham", revenueAndQuantityModels);
        result.put("tongHopKhachHang", userRevenueList);
        result.put("thongKeTheoCapBac", revenueByCapBac);
        result.put("tongDoanhThuTheoCapBac", revenueByCapBacTotal);
        result.put("sanPhamDoiHang", dsSanPhamDoiHang);
        result.put("sanPhamTraHang", dsSanPhamTraHang);
        // Trả kết quả
        return new ServiceResult(result, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult thongKeOffline(LocalDateTime startDate, LocalDateTime endDate) {
        return thongKe(startDate, endDate, 7);  // Gọi phương thức thongKe với trạng thái offline
    }

    public ServiceResult thongKeOnline(LocalDateTime startDate, LocalDateTime endDate) {
        return thongKe(startDate, endDate, 4);  // Gọi phương thức thongKe với trạng thái online
    }

    public ServiceResult thongKeDonHang(LocalDateTime startDate, LocalDateTime endDate) {
        // Lấy danh sách hóa đơn trong phạm vi ngày
        List<HoaDon> invoices = hoaDonService.findByDateRange(startDate, endDate);
        List<HoaDon> invoicesDoiTra = hoaDonService.findByDateRangeDoiTra(startDate, endDate);

        // Khởi tạo biến đếm cho các trạng thái
        long choXacNhan = invoicesDoiTra.stream().filter(hoaDon -> hoaDon.getTrangThai() == 0).count();
        long choGiaoHang = invoicesDoiTra.stream().filter(hoaDon -> hoaDon.getTrangThai() == 2).count();
        long dangGiaoHang = invoicesDoiTra.stream().filter(hoaDon -> hoaDon.getTrangThai() == 3).count();
        long daGiao = invoicesDoiTra.stream().filter(hoaDon -> hoaDon.getTrangThai() == 4).count();
        long daHuy = invoicesDoiTra.stream().filter(hoaDon -> hoaDon.getTrangThai() == 5).count();
        long taiQuay = invoicesDoiTra.stream().filter(hoaDon -> hoaDon.getTrangThai() == 7).count();

        // Khởi tạo biến đếm cho trạng thái đổi trả
        long YeuCauDoiTraChoXacNhan = invoicesDoiTra.stream()
                .filter(hoaDon -> hoaDon.getTrangThaiDoiTra() != null && hoaDon.getTrangThaiDoiTra() == 0)
                .count();

        long YeuCauDoiTraDangXuLy = invoicesDoiTra.stream()
                .filter(hoaDon -> hoaDon.getTrangThaiDoiTra() != null && hoaDon.getTrangThaiDoiTra() == 1)
                .count();

        long YeuCauDoiTraXacNhan = invoicesDoiTra.stream()
                .filter(hoaDon -> hoaDon.getTrangThaiDoiTra() != null && hoaDon.getTrangThaiDoiTra() == 2)
                .count();

        long YeuCauDoiTraHuy = invoicesDoiTra.stream()
                .filter(hoaDon -> hoaDon.getTrangThaiDoiTra() != null && hoaDon.getTrangThaiDoiTra() == 3)
                .count();

        // Đưa kết quả vào map
        Map<String, Object> result = new HashMap<>();
        result.put("choXacNhan", choXacNhan);
        result.put("choGiaoHang", choGiaoHang);
        result.put("dangGiaoHang", dangGiaoHang);
        result.put("daGiao", daGiao);
        result.put("daHuy", daHuy);
        result.put("taiQuay", taiQuay);
        result.put("YeuCauDoiTraChoXacNhan", YeuCauDoiTraChoXacNhan);
        result.put("YeuCauDoiTraHuy", YeuCauDoiTraHuy);
        result.put("YeuCauDoiTraXacNhan", YeuCauDoiTraXacNhan);
        result.put("YeuCauDoiTraDangXuLy", YeuCauDoiTraDangXuLy);

        // Trả về kết quả
        return new ServiceResult(result, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult thongKeKhachHang(LocalDateTime startDate, LocalDateTime endDate) {
        // Lấy danh sách hóa đơn trong khoảng thời gian và trạng thái là 7
        List<HoaDon> hoaDonList = hoaDonService.findByDateRangeAndStatusAndReturnStatus(startDate, endDate, 7);

        // Bản đồ lưu doanh thu và số lượng hóa đơn theo người dùng
        Map<Long, BigDecimal> userRevenueMap = new HashMap<>();
        Map<Long, Integer> userInvoiceCountMap = new HashMap<>();

        // Tính doanh thu theo từng người dùng
        for (HoaDon hoaDon : hoaDonList) {
            Long userId = hoaDon.getIdNguoiDung();
            userRevenueMap.put(userId, userRevenueMap.getOrDefault(userId, BigDecimal.ZERO).add(hoaDon.getTongTien()));
            userInvoiceCountMap.put(userId, userInvoiceCountMap.getOrDefault(userId, 0) + 1);
        }

        // Tạo danh sách thông tin doanh thu theo khách hàng
        List<Map<String, Object>> userRevenueList = new ArrayList<>();
        Map<String, List<Map<String, Object>>> revenueByCapBac = new HashMap<>();
        revenueByCapBac.put("BAC", new ArrayList<>());
        revenueByCapBac.put("VANG", new ArrayList<>());
        revenueByCapBac.put("KIM_CUONG", new ArrayList<>());

        for (Long userId : userRevenueMap.keySet()) {
            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", userId);
            userData.put("doanhThu", userRevenueMap.get(userId));
            userData.put("soLuongHoaDon", userInvoiceCountMap.get(userId));

            // Lấy thông tin người dùng từ User và Profile
            User user = userService.ById(userId);
            Profile profile = profileService.ById(userId);

            userData.put("tenDangNhap", user.getUserName());
            userData.put("hoVaTen", profile.getHoVaTen());
            userData.put("email", profile.getEmail());
            userData.put("capBac", user.getCapBac().name()); // Lấy cấp bậc của người dùng

            // Phân loại theo cấp bậc
            revenueByCapBac.get(user.getCapBac().name()).add(userData);

            userRevenueList.add(userData);
        }

        // Tạo kết quả trả về
        Map<String, Object> result = new HashMap<>();
        result.put("tongHopKhachHang", userRevenueList);
        result.put("thongKeTheoCapBac", revenueByCapBac);

        return new ServiceResult(result, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    //     Thống kê doanh thu theo sản phẩm theo thời gian

}
