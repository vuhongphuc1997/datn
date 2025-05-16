package org.example.datn.processor;

import io.swagger.models.auth.In;
import org.example.datn.constants.SystemConstant;
import org.example.datn.entity.*;
import org.example.datn.exception.InputInvalidException;
import org.example.datn.exception.NotFoundEntityException;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.enums.StatusGioHang;
import org.example.datn.model.request.GioHangChiTietRequest;
import org.example.datn.model.response.GioHangChiTietModel;
import org.example.datn.model.response.SanPhamChiTietModel;
import org.example.datn.model.response.SanPhamModel;
import org.example.datn.service.*;
import org.example.datn.transformer.GioHangChiTietTranformer;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class GioHangChiTietProcessor {

    @Autowired
    private GioHangChiTietService service;

    @Autowired
    private GioHangService gioHangService;

    @Autowired
    private GioHangChiTietTranformer gioHangChiTietTranformer;

    @Autowired
    private SanPhamChiTietService spctService;

    @Autowired
    private SanPhamService sanPhamService;
    @Autowired
    private SizeService sizeService;
    @Autowired
    private MauSacService mauSacService;
    @Autowired
    private ApDungKhuyenMaiService apDungKhuyenMaiService;
    @Autowired
    private KhuyenMaiService khuyenMaiService;

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult save(GioHangChiTietRequest request, UserAuthentication ua) {

        var gioHang = gioHangService.findByIdNguoiDung(ua.getPrincipal()).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
        var sanPham = sanPhamService.findById(request.getIdSanPham()).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin sản phẩm"));
        var spct = spctService.findByIdSanPhamAndIdSizeAndIdMauSac(request.getIdSanPham(), request.getIdSize(), request.getIdMauSac())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin sản phẩm"));
        var soLuongConLai = spct.getSoLuong();
        if (request.getSoLuong() > soLuongConLai) {
            throw new IllegalArgumentException("Số lượng yêu cầu vượt quá số lượng tồn kho.");
        }
        service.findByIdGioHangAndIdSanPhamChiTietAndTrangThai(gioHang.getId(), spct.getId(), StatusGioHang.CHUA_DAT_HANG.getValue()).ifPresent(g -> {
            if (request.getSoLuong() + g.getSoLuong() > soLuongConLai) {
                throw new IllegalArgumentException("Số lượng yêu cầu vượt quá số lượng tồn kho.");
            }
        });
        var gioHangChiTiet = service.findByIdGioHangAndIdSanPhamChiTietAndTrangThai(gioHang.getId(), spct.getId(), StatusGioHang.CHUA_DAT_HANG.getValue());

        if (gioHangChiTiet.isPresent()) {
            var currentQuantity = gioHangChiTiet.get().getSoLuong();
            var newQuantity = currentQuantity + request.getSoLuong();

            gioHangChiTiet.get().setSoLuong(newQuantity);
            gioHangChiTiet.get().setNgayCapNhat(LocalDateTime.now());
            service.save(gioHangChiTiet.get());

        } else {
            GioHangChiTiet ghct = new GioHangChiTiet();
            BeanUtils.copyProperties(request, ghct);
            ghct.setIdGioHang(gioHang.getId());
            ghct.setIdSanPhamChiTiet(spct.getId());
            ghct.setGia(sanPham.getGia());
            ghct.setIdSanPhamChiTiet(spct.getId());
            ghct.setTrangThai(StatusGioHang.CHUA_DAT_HANG.getValue());
            ghct.setNguoiTao(ua.getPrincipal());
            ghct.setNgayTao(LocalDateTime.now());
            ghct.setNgayCapNhat(LocalDateTime.now());
            ghct.setNguoiCapNhat(ua.getPrincipal());
            service.save(ghct);
        }
        return new ServiceResult();
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult update(Long id, GioHangChiTietRequest request, UserAuthentication ua) {
        var gioHangChiTiet = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin chi tiết giỏ hàng"));

        var spct = spctService.findById(gioHangChiTiet.getIdSanPhamChiTiet()).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin chi tiết sản phẩm"));
        gioHangChiTiet.setSoLuong(request.getSoLuong());
        var currentQuantity = gioHangChiTiet.getSoLuong();
        var newQuantity = spct.getSoLuong() + currentQuantity - request.getSoLuong();
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Số lượng yêu cầu vượt quá số lượng tồn kho.");
        }

        spct.setSoLuong(newQuantity);

        var gia = spct.getGia().multiply(BigDecimal.valueOf(request.getSoLuong()));
        gioHangChiTiet.setGia(gia);

        service.save(gioHangChiTiet);
        spctService.save(spct);

        return new ServiceResult();
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult delete(Long id, UserAuthentication ua) throws NotFoundEntityException {
        var gioHangChiTiet = service.findById(id).orElseThrow(() -> NotFoundEntityException.of("gioHangChiTiet.not.found"));
        service.delete(gioHangChiTiet);

        return new ServiceResult();
    }

    public ServiceResult getList(UserAuthentication ua) {
        if (ua == null || ua.getPrincipal() == null) {
            return new ServiceResult(SystemConstant.STATUS_FAIL, SystemConstant.CODE_401);
        }

        var gioHang = gioHangService.findByIdNguoiDung(ua.getPrincipal())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giỏ hàng cho người dùng"));

        var list = service.findByIdGioHangAndTrangThai(gioHang.getId(), StatusGioHang.CHUA_DAT_HANG.getValue());
        if (list.isEmpty()) {
            return new ServiceResult(Collections.emptyList(), SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_204);
        }

        var models = list.stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());

        var spctIds = models.stream()
                .map(GioHangChiTietModel::getIdSanPhamChiTiet)
                .distinct()
                .collect(Collectors.toList());

        var spcts = spctService.findByIdIn(spctIds);
        List<SanPhamChiTietModel> sanPhamChiTietList = spcts.stream()
                .map(this::convertToSanPhamChiTietModel)
                .collect(Collectors.toList());
        var spIds = spcts.stream()
                .map(SanPhamChiTiet::getIdSanPham)
                .distinct()
                .collect(Collectors.toList());
        var sanPhams = sanPhamService.findByIdIn(spIds);

        List<SanPhamModel> sanPhamList = sanPhams.stream()
                .map(this::convertToSanPhamModel)
                .collect(Collectors.toList());

        for (GioHangChiTietModel model : models) {
            SanPhamChiTietModel spctModel = sanPhamChiTietList.stream()
                    .filter(spct -> spct.getId().equals(model.getIdSanPhamChiTiet()))
                    .findFirst().orElse(null);

            if (spctModel != null) {
                List<ApDungKhuyenMai> apDungKhuyenMais = apDungKhuyenMaiService.findByIdSanPham(spctModel.getIdSanPham());

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
                    model.setGiaSauKhuyenMai(spctModel.getGia().subtract(giaSauKhuyenMai).max(BigDecimal.ZERO));
                } else {
                    model.setGiaSauKhuyenMai(null);
                }
            }
        }

        mapSpctsToModels(models, sanPhamChiTietList, sanPhamList);

        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public ServiceResult getByIdIn(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ServiceResult(Collections.emptyList(), SystemConstant.STATUS_FAIL, SystemConstant.CODE_400);
        }

        var list = service.findByIdIn(ids);
        if (list.isEmpty()) {
            return new ServiceResult(Collections.emptyList(), SystemConstant.STATUS_FAIL, SystemConstant.CODE_404);
        }

        var models = list.stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());

        var spctIds = models.stream()
                .map(GioHangChiTietModel::getIdSanPhamChiTiet)
                .distinct()
                .collect(Collectors.toList());

        var spcts = spctService.findByIdIn(spctIds);
        List<SanPhamChiTietModel> sanPhamChiTietList = spcts.stream()
                .map(this::convertToSanPhamChiTietModel)
                .collect(Collectors.toList());
        var spIds = spcts.stream()
                .map(SanPhamChiTiet::getIdSanPham)
                .distinct()
                .collect(Collectors.toList());
        var sanPhams = sanPhamService.findByIdIn(spIds);

        List<SanPhamModel> sanPhamList = sanPhams.stream()
                .map(this::convertToSanPhamModel)
                .collect(Collectors.toList());

        for (GioHangChiTietModel model : models) {
            SanPhamChiTietModel spctModel = sanPhamChiTietList.stream()
                    .filter(spct -> spct.getId().equals(model.getIdSanPhamChiTiet()))
                    .findFirst().orElse(null);

            if (spctModel != null) {
                List<ApDungKhuyenMai> apDungKhuyenMais = apDungKhuyenMaiService.findByIdSanPham(spctModel.getIdSanPham());

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
                    model.setGiaSauKhuyenMai(spctModel.getGia().subtract(giaSauKhuyenMai).max(BigDecimal.ZERO));
                } else {
                    model.setGiaSauKhuyenMai(null);
                }
            }
        }

        mapSpctsToModels(models, sanPhamChiTietList, sanPhamList);

        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public GioHangChiTietModel mapToModel(GioHangChiTiet entity) {
        if (entity == null) {
            return null;
        }

        GioHangChiTietModel model = new GioHangChiTietModel();
        model.setId(entity.getId());
        model.setIdGioHang(entity.getIdGioHang());
        model.setIdSanPhamChiTiet(entity.getIdSanPhamChiTiet());
        model.setSoLuong(entity.getSoLuong());
        model.setGia(entity.getGia());
        model.setTrangThai(entity.getTrangThai());
        model.setNgayTao(entity.getNgayTao());
        model.setNgayCapNhat(entity.getNgayCapNhat());
        model.setNguoiTao(entity.getNguoiTao());
        model.setNguoiCapNhat(entity.getNguoiCapNhat());

        return model;
    }


    private void mapSpctsToModels(List<GioHangChiTietModel> models, List<SanPhamChiTietModel> spcts, List<SanPhamModel> sanPhamModels) {
        if (spcts.isEmpty()) {
            return;
        }
        Map<Long, SanPhamChiTietModel> spctMap = spcts.stream().collect(Collectors.toMap(SanPhamChiTietModel::getId, Function.identity(), (existing, replacement) -> existing));
        Map<Long, SanPhamModel> sanPhamMap = sanPhamModels.stream().collect(Collectors.toMap(SanPhamModel::getId, Function.identity(), (existing, replacement) -> existing));
        models.forEach(model -> {
            SanPhamChiTietModel spct = spctMap.get(model.getIdSanPhamChiTiet());
            model.setSanPhamChiTiet(spct);
            model.setSanPham(sanPhamMap.get(spct.getIdSanPham()));
        });

    }

    private SanPhamModel convertToSanPhamModel(SanPham entity) {
        SanPhamModel model = new SanPhamModel();
        model.setId(entity.getId());
        model.setIdDanhMuc(entity.getIdDanhMuc());
        model.setIdThuongHieu(entity.getIdThuongHieu());
        model.setIdChatLieu(entity.getIdChatLieu());
        model.setTen(entity.getTen());
        model.setMa(entity.getMa());
        model.setXuatXu(entity.getXuatXu());
        model.setMoTa(entity.getMoTa());
        model.setGia(entity.getGia());
        model.setAnh(entity.getAnh());
        model.setTrangThai(entity.getTrangThai());
        return model;
    }

    private SanPhamChiTietModel convertToSanPhamChiTietModel(SanPhamChiTiet entity) {
        SanPhamChiTietModel model = new SanPhamChiTietModel();
        model.setId(entity.getId());
        model.setIdSanPham(entity.getIdSanPham());
        model.setIdSize(entity.getIdSize());
        model.setIdMauSac(entity.getIdMauSac());
        model.setSoLuong(entity.getSoLuong());
        model.setGia(entity.getGia());
        model.setGhiChu(entity.getGhiChu());
        model.setTrangThai(entity.getTrangThai());
        var size = sizeService.findById(model.getIdSize()).orElse(null);
        model.setSize(size);
        var mauSac = mauSacService.findById(model.getIdMauSac()).orElse(null);
        model.setMauSac(mauSac);
        return model;
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult changeSoLuong(Long id, Integer soLuong, UserAuthentication ua) throws InputInvalidException {
        var g = service.findById(id).orElseThrow(() -> new EntityNotFoundException("gioHangChiTiet.not.found"));
        var spct = spctService.findById(g.getIdSanPhamChiTiet()).orElseThrow(() -> new EntityNotFoundException("sanPhamChiTiet.not.found"));
        if (soLuong > spct.getSoLuong()) {
            throw InputInvalidException.of("quantity.not.enough");
        }
        g.setSoLuong(soLuong);
        g.setNguoiCapNhat(ua.getPrincipal());
        service.save(g);
        return new ServiceResult();
    }

}
