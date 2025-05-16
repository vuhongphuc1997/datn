package org.example.datn.processor;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSerializer;
import org.apache.commons.lang3.StringEscapeUtils;
import org.example.datn.constants.SystemConstant;
import org.example.datn.entity.*;
import org.example.datn.exception.InputInvalidException;
import org.example.datn.exception.NotFoundEntityException;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.enums.LoaiYeuCau;
import org.example.datn.model.enums.StatusHoaDon;
import org.example.datn.model.enums.StatusYeuCauDoiTra;
import org.example.datn.model.enums.TrangThaiDoiTra;
import org.example.datn.model.request.*;
import org.example.datn.model.response.HoaDonModel;
import org.example.datn.model.response.SanPhamModel;
import org.example.datn.model.response.YeuCauDoiTraModel;
import org.example.datn.model.response.YeuCauDoiTraResponse;
import org.example.datn.repository.SanPhamRepository;
import org.example.datn.service.*;
import org.example.datn.transformer.YeuCauDoiTraChiTietTransformer;
import org.example.datn.transformer.YeuCauDoiTraTransformer;
import org.example.datn.utils.VNPayUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class YeuCauDoiTraProcessor {
    @Autowired
    private SanPhamDoiTraService sanPhamDoiTraService;
    @Autowired
    private YeuCauDoiTraService service;
    @Autowired
    private YeuCauDoiTraChiTietService yeuCauDoiTraChiTietService;
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;
    @Autowired
    private HoaDonService hoaDonService;
    @Autowired
    private HoaDonProcessor hoaDonProcessor;
    @Autowired
    private UserService userService;
    @Autowired
    private UserProcessor userProcessor;
    @Autowired
    private YeuCauDoiTraTransformer yeuCauDoiTraTransformer;
    @Autowired
    private HoaDonChiTietService hoaDonChiTietService;
    @Autowired
    private HinhAnhService hinhAnhService;
    @Autowired
    private HinhAnhServices hinhAnhServices;
    @Autowired
    private YeuCauDoiTraChiTietTransformer yeuCauDoiTraChiTietTransformer;

    public ServiceResult getById(Long id) {
        var sp = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin sản phẩm"));
        var hoadon = hoaDonService.findById(sp.getIdHoaDon()).orElse(null);
        var user = userProcessor.findById(sp.getIdNguoiDung());
        YeuCauDoiTraModel model = new YeuCauDoiTraModel();
        BeanUtils.copyProperties(sp, model);
        model.setHoaDon(hoadon);
        model.setUser(user);
        return new ServiceResult(model, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult getAll() {
        List<YeuCauDoiTraModel> models = service.findAll().stream().map(sp -> {
            YeuCauDoiTraModel model = new YeuCauDoiTraModel();
            BeanUtils.copyProperties(sp, model);
            model.setHoaDon(hoaDonService.findById(sp.getIdHoaDon()).orElse(null));
            model.setUser(userProcessor.findById(sp.getIdNguoiDung()));
            return model;
        }).collect(Collectors.toList());

        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult save(YeuCauDoiTra yeuCauDoiTra) {
        service.save(yeuCauDoiTra);
        return new ServiceResult(yeuCauDoiTra, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult update(Long id, YeuCauDoiTra request) {
        var p = service.findById(id).orElseThrow(() -> new EntityNotFoundException("yeuCau.not.found"));
        BeanUtils.copyProperties(request, p);
        service.save(p);
        return new ServiceResult();
    }

    public ServiceResult delete(Long id) {
        service.delete(id);
        return new ServiceResult("Sản phẩm đã được xóa thành công", SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult getByLoaiAndTrangThai(LoaiYeuCau loai, Integer trangThai) {
        List<YeuCauDoiTraModel> models = service.findByLoaiAndTrangThai(loai, trangThai).stream().map(sp -> {
            YeuCauDoiTraModel model = new YeuCauDoiTraModel();
            BeanUtils.copyProperties(sp, model);
            model.setHoaDon(hoaDonService.findById(sp.getIdHoaDon()).orElse(null));
            model.setUser(userProcessor.findById(sp.getIdNguoiDung()));
            return model;
        }).collect(Collectors.toList());

        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult getByLoai(LoaiYeuCau loai) {
        List<YeuCauDoiTraModel> models = service.findByLoai(loai).stream().map(sp -> {
            YeuCauDoiTraModel model = new YeuCauDoiTraModel();
            BeanUtils.copyProperties(sp, model);
            model.setHoaDon(hoaDonService.findById(sp.getIdHoaDon()).orElse(null));
            model.setUser(userProcessor.findById(sp.getIdNguoiDung()));
            return model;
        }).collect(Collectors.toList());

        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    private void updateYeuCauDoiTraChiTiet(Long idDoiTra, Integer trangThai) {
        var yeuCauDoiTraChiTiet = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(idDoiTra);
        yeuCauDoiTraChiTiet.forEach(e -> e.setTrangThai(trangThai));
        yeuCauDoiTraChiTietService.saveAll(yeuCauDoiTraChiTiet);
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult cancelOrder(Long id, CancelOrderRequest request, UserAuthentication ua) throws IOException, InterruptedException {
        // Tìm yêu cầu đổi trả theo ID
        YeuCauDoiTra yeuCauDoiTra = service.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Yêu cầu đổi trả không tồn tại với ID: " + id));

        // Kiểm tra trạng thái hợp lệ trước khi hủy
        if (yeuCauDoiTra.getTrangThai() != StatusYeuCauDoiTra.CHO_XU_LY.getValue() &&
                yeuCauDoiTra.getTrangThai() != StatusYeuCauDoiTra.DANG_XU_LY.getValue()) {
            throw new IllegalArgumentException("Không thể hủy yêu cầu vì trạng thái hiện tại không hợp lệ.");
        }

        // Xác định trạng thái hủy
        Integer newTrangThai = StatusYeuCauDoiTra.TU_CHOI.getValue();

        // Cập nhật yêu cầu đổi trả
        yeuCauDoiTra.setTrangThai(newTrangThai);
        yeuCauDoiTra.setGhiChu(request.getOrderInfo());
        yeuCauDoiTra.setNgayCapNhat(LocalDateTime.now());
        yeuCauDoiTra.setNgayHoanTat(LocalDateTime.now());
        yeuCauDoiTra.setNguoiCapNhat(ua.getPrincipal());
        service.save(yeuCauDoiTra);

        List<YeuCauDoiTraChiTiet> chiTietList = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(id);
        if (chiTietList == null || chiTietList.isEmpty()) {
            throw new IllegalStateException("Không tìm thấy chi tiết nào cho yêu cầu đổi trả với ID: " + id);
        }

        // Lấy danh sách ID sản phẩm chi tiết từ danh sách chi tiết
        List<Long> idSanPhamChiTiets = chiTietList.stream()
                .map(YeuCauDoiTraChiTiet::getIdSPCT)
                .collect(Collectors.toList());

        // Cập nhật trạng thái chi tiết yêu cầu đổi trả
        updateYeuCauDoiTraChiTiet(id, newTrangThai);

        // Lấy ID hóa đơn từ yêu cầu đổi trả
        Long idHoaDon = yeuCauDoiTra.getIdHoaDon();

        // Cập nhật trạng thái đổi trả trong hóa đơn và hóa đơn chi tiết
        updateTrangThaiDoiTraInHoaDon(idHoaDon, newTrangThai, idSanPhamChiTiets);

        return new ServiceResult("Yêu cầu đổi trả đã được hủy thành công.");
    }

    private void updateTrangThaiDoiTraInHoaDon(Long idHoaDon, Integer trangThai, List<Long> idSanPhamChiTiets) {
        // Lấy hóa đơn dựa trên ID
        HoaDon hoaDon = hoaDonService.findById(idHoaDon)
                .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại với ID: " + idHoaDon));

        // Cập nhật trạng thái đổi trả cho hóa đơn
        hoaDon.setTrangThaiDoiTra(trangThai);
        hoaDonService.save(hoaDon);

        // Lấy danh sách chi tiết hóa đơn dựa vào idHoaDon và idSanPhamChiTiets
        List<HoaDonChiTiet> hoaDonChiTietList = hoaDonChiTietService.getHoaDonChiTietByHoaDonAndSanPhamChiTiet(idHoaDon, idSanPhamChiTiets);

        // Cập nhật trạng thái đổi trả cho từng chi tiết hóa đơn
        for (HoaDonChiTiet hoaDonChiTiet : hoaDonChiTietList) {
            hoaDonChiTiet.setTrangThaiDoiTra(trangThai);
            hoaDonChiTietService.save(hoaDonChiTiet);
        }
    }

    private void updateTrangThaiDoiTraHDCT(Long idHoaDon, Integer trangThai, List<Long> idSanPhamChiTiets) {
        // Lấy hóa đơn dựa trên ID
        HoaDon hoaDon = hoaDonService.findById(idHoaDon)
                .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại với ID: " + idHoaDon));

        // Lấy danh sách chi tiết hóa đơn dựa vào idHoaDon và idSanPhamChiTiets
        List<HoaDonChiTiet> hoaDonChiTietList = hoaDonChiTietService.getHoaDonChiTietByHoaDonAndSanPhamChiTiet(idHoaDon, idSanPhamChiTiets);

        // Cập nhật trạng thái đổi trả cho từng chi tiết hóa đơn
        for (HoaDonChiTiet hoaDonChiTiet : hoaDonChiTietList) {
            hoaDonChiTiet.setTrangThaiDoiTra(trangThai);
            hoaDonChiTietService.save(hoaDonChiTiet);
        }
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult updateStatusYeuCauChiTietHoanThanh(Long id, UserAuthentication ua) {
        // Tìm hóa đơn theo ID
        YeuCauDoiTraChiTiet yeuCauDoiTraChiTiet = yeuCauDoiTraChiTietService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại"));

        // Xác định trạng thái mới dựa trên trạng thái hiện tại
        Integer newTrangThai;
        switch (yeuCauDoiTraChiTiet.getTrangThai()) {
            case 0:
                newTrangThai = StatusYeuCauDoiTra.DANG_XU_LY.getValue();
                break;
            case 1:
                newTrangThai = StatusYeuCauDoiTra.HOAN_THANH.getValue();
                break;
            default:
                throw new IllegalArgumentException("Trạng thái không hợp lệ để cập nhật");
        }

        // Cập nhật trạng thái hóa đơn
        yeuCauDoiTraChiTiet.setTrangThai(newTrangThai);
        yeuCauDoiTraChiTiet.setNgayCapNhat(LocalDateTime.now());
        yeuCauDoiTraChiTiet.setNguoiCapNhat(ua.getPrincipal());
        yeuCauDoiTraChiTietService.save(yeuCauDoiTraChiTiet);

        // Tìm yêu cầu đổi trả để lấy ID hóa đơn
        YeuCauDoiTra yeuCauDoiTra = service.findById(yeuCauDoiTraChiTiet.getIdYeuCauDoiTra())
                .orElseThrow(() -> new EntityNotFoundException("Yêu cầu đổi trả không tồn tại"));

        Long idHoaDon = yeuCauDoiTra.getIdHoaDon(); // Lấy idHóaDon từ yêu cầu đổi trả
        if (idHoaDon == null) {
            throw new IllegalStateException("Hóa đơn không tồn tại cho yêu cầu đổi trả.");
        }

        Long idSanPhamChiTiet = yeuCauDoiTraChiTiet.getIdSPCT();
        if (idSanPhamChiTiet == null) {
            throw new IllegalStateException("Yêu cầu đổi trả không có sản phẩm chi tiết.");
        }

        // Tìm hóa đơn chi tiết theo hóa đơn và sản phẩm chi tiết
        HoaDonChiTiet hoaDonChiTiet = hoaDonChiTietService.getHoaDonChiTietByHoaDonAndSanPhamChiTiet(
                        idHoaDon, idSanPhamChiTiet)
                .orElseThrow(() -> new EntityNotFoundException("Hóa đơn chi tiết không tồn tại"));

        // Cập nhật trạng thái đổi trả của hóa đơn chi tiết
        hoaDonChiTiet.setTrangThaiDoiTra(newTrangThai);
        hoaDonChiTietService.save(hoaDonChiTiet);

        return new ServiceResult("Hóa đơn đã được cập nhật trạng thái thành công",
                SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult updateStatusYeuCauChiTietHuy(Long id, UserAuthentication ua) {
        // Tìm hóa đơn theo ID
        YeuCauDoiTraChiTiet yeuCauDoiTraChiTiet = yeuCauDoiTraChiTietService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại"));

        // Xác định trạng thái mới dựa trên trạng thái hiện tại
        Integer newTrangThai;
        switch (yeuCauDoiTraChiTiet.getTrangThai()) {
            case 0:
                newTrangThai = StatusYeuCauDoiTra.DANG_XU_LY.getValue();
                break;
            case 1:
                newTrangThai = StatusYeuCauDoiTra.TU_CHOI.getValue();
                break;
            default:
                throw new IllegalArgumentException("Trạng thái không hợp lệ để cập nhật");
        }

        // Cập nhật trạng thái hóa đơn
        yeuCauDoiTraChiTiet.setTrangThai(newTrangThai);
        yeuCauDoiTraChiTiet.setNgayCapNhat(LocalDateTime.now());
        yeuCauDoiTraChiTiet.setNguoiCapNhat(ua.getPrincipal());
        yeuCauDoiTraChiTietService.save(yeuCauDoiTraChiTiet);

        // Tìm yêu cầu đổi trả để lấy ID hóa đơn
        YeuCauDoiTra yeuCauDoiTra = service.findById(yeuCauDoiTraChiTiet.getIdYeuCauDoiTra())
                .orElseThrow(() -> new EntityNotFoundException("Yêu cầu đổi trả không tồn tại"));

        Long idHoaDon = yeuCauDoiTra.getIdHoaDon(); // Lấy idHóaDon từ yêu cầu đổi trả
        if (idHoaDon == null) {
            throw new IllegalStateException("Hóa đơn không tồn tại cho yêu cầu đổi trả.");
        }

        Long idSanPhamChiTiet = yeuCauDoiTraChiTiet.getIdSPCT();
        if (idSanPhamChiTiet == null) {
            throw new IllegalStateException("Yêu cầu đổi trả không có sản phẩm chi tiết.");
        }

        // Tìm hóa đơn chi tiết theo hóa đơn và sản phẩm chi tiết
        HoaDonChiTiet hoaDonChiTiet = hoaDonChiTietService.getHoaDonChiTietByHoaDonAndSanPhamChiTiet(
                        idHoaDon, idSanPhamChiTiet)
                .orElseThrow(() -> new EntityNotFoundException("Hóa đơn chi tiết không tồn tại"));

        // Cập nhật trạng thái đổi trả của hóa đơn chi tiết
        hoaDonChiTiet.setTrangThaiDoiTra(newTrangThai);
        hoaDonChiTietService.save(hoaDonChiTiet);

        return new ServiceResult("Hóa đơn đã được cập nhật trạng thái thành công",
                SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult updateStatus(Long id, UserAuthentication ua) {
        YeuCauDoiTra yeuCauDoiTra = service.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Yêu cầu đổi trả không tồn tại"));

        Integer trangThaiYeuCau = yeuCauDoiTra.getTrangThai();

        List<YeuCauDoiTraChiTiet> chiTietList = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(id);
        if (chiTietList == null || chiTietList.isEmpty()) {
            throw new IllegalStateException("Không tìm thấy chi tiết nào cho yêu cầu đổi trả với ID: " + id);
        }

        List<Long> idSanPhamChiTiets = chiTietList.stream()
                .map(YeuCauDoiTraChiTiet::getIdSPCT)
                .collect(Collectors.toList());

        if (trangThaiYeuCau == StatusYeuCauDoiTra.CHO_XU_LY.getValue()) {
            yeuCauDoiTra.setTrangThai(StatusYeuCauDoiTra.DANG_XU_LY.getValue()); // Trạng thái đang xử lý
            updateYeuCauDoiTraChiTiet(id, StatusYeuCauDoiTra.DANG_XU_LY.getValue()); // Cập nhật trạng thái chi tiết

            Long idHoaDon = yeuCauDoiTra.getIdHoaDon();
            HoaDon hoaDon = hoaDonService.findById(idHoaDon)
                    .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại"));

            hoaDon.setTrangThaiDoiTra(StatusYeuCauDoiTra.DANG_XU_LY.getValue()); // Trạng thái đổi trả của hóa đơn
            hoaDonService.save(hoaDon);

            updateTrangThaiDoiTraHDCT(idHoaDon, StatusYeuCauDoiTra.DANG_XU_LY.getValue(), idSanPhamChiTiets);
            service.save(yeuCauDoiTra);

            return new ServiceResult("Cập nhật trạng thái yêu cầu thành công",
                    SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
        }

        if (trangThaiYeuCau == StatusYeuCauDoiTra.DANG_XU_LY.getValue()) {
            boolean hasPendingOrRejected = false;  // Kiểm tra có chi tiết bị từ chối hoặc đang xử lý
            boolean allDone = true;  // Kiểm tra tất cả các yêu cầu chi tiết có trạng thái 3

            for (YeuCauDoiTraChiTiet chiTiet : chiTietList) {
                if (chiTiet.getTrangThai() == 1 || chiTiet.getTrangThai() == 0) {
                    hasPendingOrRejected = true;
                    break;
                }
                if (chiTiet.getTrangThai() != 3) {
                    allDone = false;
                }
            }

            if (hasPendingOrRejected) {
                return new ServiceResult("Không thể cập nhật trạng thái do có yêu cầu chi tiết chưa hoàn thành hoặc bị từ chối",
                        SystemConstant.STATUS_FAIL, SystemConstant.CODE_400);
            }

            if (allDone) {
                yeuCauDoiTra.setTrangThai(StatusYeuCauDoiTra.TU_CHOI.getValue()); // Hoàn tất
                Long idHoaDon = yeuCauDoiTra.getIdHoaDon();
                HoaDon hoaDon = hoaDonService.findById(idHoaDon)
                        .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại"));
                hoaDon.setTrangThaiDoiTra(StatusYeuCauDoiTra.TU_CHOI.getValue());

                updateYeuCauDoiTraChiTiet(id, StatusYeuCauDoiTra.TU_CHOI.getValue());

                updateTrangThaiDoiTraInHoaDon(idHoaDon, StatusYeuCauDoiTra.TU_CHOI.getValue(), idSanPhamChiTiets);
                hoaDonService.save(hoaDon);
            } else {
                boolean hasRejected = chiTietList.stream()
                        .anyMatch(chiTiet -> chiTiet.getTrangThai() == 2);
                if (hasRejected) {
                    yeuCauDoiTra.setTrangThai(StatusYeuCauDoiTra.HOAN_THANH.getValue()); // Từ chối
                    Long idHoaDon = yeuCauDoiTra.getIdHoaDon();
                    HoaDon hoaDon = hoaDonService.findById(idHoaDon)
                            .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại"));
                    hoaDon.setTrangThaiDoiTra(StatusYeuCauDoiTra.HOAN_THANH.getValue());

                    // Lọc chi tiết yêu cầu có trangThai = 2 và thuộc yêu cầu đổi trả hiện tại
                    List<YeuCauDoiTraChiTiet> rejectedChiTietList = chiTietList.stream()
                            .filter(chiTiet -> chiTiet.getTrangThai() == 2 && chiTiet.getIdYeuCauDoiTra().equals(id)) // Chỉ lấy chi tiết của yêu cầu này
                            .collect(Collectors.toList());

                    // Duyệt qua các chi tiết bị từ chối và lưu sản phẩm đổi trả
                    rejectedChiTietList.forEach(chiTiet -> {
                        saveSanPhamDoiTraFromChiTiet(yeuCauDoiTra, ua, chiTiet); // Lưu sản phẩm đổi trả từ chi tiết yêu cầu
                    });

                    hoaDonService.save(hoaDon);
                }
            }

            service.save(yeuCauDoiTra);
            return new ServiceResult("Cập nhật trạng thái yêu cầu thành công",
                    SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
        }

        return new ServiceResult("Trạng thái yêu cầu không hợp lệ",
                SystemConstant.STATUS_FAIL, SystemConstant.CODE_400);
    }

    private void saveSanPhamDoiTraFromChiTiet(YeuCauDoiTra yeuCauDoiTra, UserAuthentication ua, YeuCauDoiTraChiTiet chiTiet) {
        // Kiểm tra xem chi tiết có trạng thái = 2 (từ chối) hay không
        if (chiTiet.getTrangThai() == 2) {
            SanPhamDoiTra sanPhamDoiTra = new SanPhamDoiTra();

            // Lấy thông tin từ chi tiết yêu cầu đổi trả và lưu vào bảng SanPhamDoiTra
            sanPhamDoiTra.setIdYeuCauDoiTra(yeuCauDoiTra.getId());
            sanPhamDoiTra.setIdSPCT(chiTiet.getIdSPCT());
            sanPhamDoiTra.setSoLuong(chiTiet.getSoLuong());
            sanPhamDoiTra.setLoai(String.valueOf(yeuCauDoiTra.getLoai()));

            // Lấy thông tin người tạo và người cập nhật từ UserAuthentication
            sanPhamDoiTra.setNguoiCapNhat(ua.getPrincipal());
            sanPhamDoiTra.setNgayTao(LocalDateTime.now());
            sanPhamDoiTra.setNgayCapNhat(LocalDateTime.now());
            sanPhamDoiTra.setNguoiTao(ua.getPrincipal());
            sanPhamDoiTra.setTrangThai(0);  // Trạng thái mặc định là 0 (chưa xử lý)

            // Lưu vào bảng SanPhamDoiTra thông qua service
            sanPhamDoiTraService.save(sanPhamDoiTra);  // Giả sử có service sanPhamDoiTraService
        }
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult create(String request, MultipartFile[] files, UserAuthentication ua) throws NotFoundEntityException, InputInvalidException {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

        JsonSerializer<LocalDate> serializer = (src, typeOfSrc, context) ->
                context.serialize(src.format(formatter));

        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, serializer)
                .create();
        YeuCauDoiTraRequest target = gson.fromJson(removeQuotesAndUnescape(request), YeuCauDoiTraRequest.class);
        YeuCauDoiTra yeuCauDoiTra = yeuCauDoiTraTransformer.toEntity(target);
        yeuCauDoiTra.setIdNguoiDung(ua.getPrincipal());
        yeuCauDoiTra.setTrangThai(StatusYeuCauDoiTra.CHO_XU_LY.getValue());
        yeuCauDoiTra.setNgayYeuCau(LocalDateTime.now());
        yeuCauDoiTra.setNgayTao(LocalDateTime.now());
        yeuCauDoiTra.setNgayCapNhat(LocalDateTime.now());
        yeuCauDoiTra.setNguoiTao(ua.getPrincipal());
        yeuCauDoiTra.setNguoiCapNhat(ua.getPrincipal());
        service.save(yeuCauDoiTra);

        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                String fileName = saveImage(file);
                HinhAnh hinhAnh = new HinhAnh();
                hinhAnh.setIdYeuCauDoiTra(yeuCauDoiTra.getId());
                hinhAnh.setAnh(fileName);
                hinhAnh.setNgayTao(LocalDateTime.now());
                hinhAnh.setNgayCapNhat(LocalDateTime.now());
                hinhAnh.setNguoiTao(ua.getPrincipal());
                hinhAnh.setNguoiCapNhat(ua.getPrincipal());
                hinhAnhServices.save(hinhAnh);
            }
        }

        for (SanPhamDoiTraRequest sanPhamRequest : target.getSanPhamChiTiets()) {
            Long idSPCT = sanPhamRequest.getIdSanPhamChiTiet();
            Integer soLuong = sanPhamRequest.getSoLuong();

            YeuCauDoiTraChiTiet yeuCauChiTiet = new YeuCauDoiTraChiTiet();
            yeuCauChiTiet.setIdYeuCauDoiTra(yeuCauDoiTra.getId());
            yeuCauChiTiet.setIdSPCT(idSPCT);

            List<HoaDonChiTiet> hoaDonChiTiets = hoaDonChiTietService.getHoaDonChiTietByHoaDonAndSanPhamChiTiet(target.getIdHoaDon(), List.of(idSPCT));
            if (hoaDonChiTiets.isEmpty()) {
                throw NotFoundEntityException.of("Sản phẩm chi tiết không tồn tại trong hóa đơn");
            }
            HoaDonChiTiet hoaDonChiTiet = hoaDonChiTiets.get(0);

            if (soLuong > hoaDonChiTiet.getSoLuong()) {
                throw InputInvalidException.of("Số lượng đổi/trả không hợp lệ");
            }

            yeuCauChiTiet.setSoLuong(soLuong); // Cập nhật số lượng muốn đổi trả
            yeuCauChiTiet.setTrangThai(StatusYeuCauDoiTra.CHO_XU_LY.getValue());
            yeuCauChiTiet.setNgayTao(LocalDateTime.now());
            yeuCauChiTiet.setNgayCapNhat(LocalDateTime.now());
            yeuCauChiTiet.setNguoiTao(ua.getPrincipal());
            yeuCauChiTiet.setNguoiCapNhat(ua.getPrincipal());
            yeuCauDoiTraChiTietService.save(yeuCauChiTiet);
        }
        HoaDon hoaDon = hoaDonService.findById(target.getIdHoaDon()).orElseThrow(() -> NotFoundEntityException.of("Hóa đơn không tồn tại"));
        hoaDon.setTrangThaiDoiTra(TrangThaiDoiTra.CHO_XU_LY.getValue());
        hoaDon.setNgayCapNhat(LocalDateTime.now());
        hoaDonService.save(hoaDon);
        hoaDonChiTietService.saveAll(
                hoaDonChiTietService.getHoaDonChiTietByHoaDonAndSanPhamChiTiet(target.getIdHoaDon(),
                                target.getSanPhamChiTiets().stream()
                                        .map(SanPhamDoiTraRequest::getIdSanPhamChiTiet)
                                        .collect(Collectors.toList()))
                        .stream()
                        .peek(e -> e.setTrangThaiDoiTra(TrangThaiDoiTra.CHO_XU_LY.getValue()))
                        .collect(Collectors.toList())
        );


        return new ServiceResult();

    }

    private static final String UPLOAD_DIR = "images";

    private String saveImage(MultipartFile image) {
        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        String imagePath = UPLOAD_DIR + File.separator + fileName;

        try {
            // Kiểm tra và tạo thư mục UPLOAD_DIR nếu nó chưa tồn tại
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            // Lưu hình ảnh
            byte[] bytes = image.getBytes();
            Path path = Paths.get(imagePath);
            Files.write(path, bytes);

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Không thể lưu hình ảnh!");
        }

        return imagePath;
    }

    public String removeQuotesAndUnescape(String uncleanJson) {
        String noQuotes = uncleanJson.replaceAll("^\"|\"$", "");
        return StringEscapeUtils.unescapeJava(noQuotes);
    }

    public ServiceResult getList(UserAuthentication ua) {
        List<YeuCauDoiTraResponse> models = service.findByIdNguoiDung(ua.getPrincipal()).stream()
                .sorted((y1, y2) -> y2.getNgayTao().compareTo(y1.getNgayTao()))
                .map(sp -> {
                    YeuCauDoiTraResponse model = yeuCauDoiTraTransformer.toResponse(sp);
                    model.setHoaDonModel(hoaDonProcessor.getModelById(sp.getIdHoaDon()));
                    var yeuCauDoiTraChiTietModels = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(sp.getId()).stream().map(yeuCauDoiTraChiTietTransformer::toModel).collect(Collectors.toList());
                    model.setYeuCauDoiTraChiTietModel(yeuCauDoiTraChiTietModels);
                    return model;
                })
                .collect(Collectors.toList());

        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }


}
