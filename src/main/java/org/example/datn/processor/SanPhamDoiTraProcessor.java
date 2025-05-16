package org.example.datn.processor;

import org.example.datn.constants.SystemConstant;
import org.example.datn.entity.*;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.enums.SanPhamDoiTraStatus;
import org.example.datn.model.enums.StatusHoaDon;
import org.example.datn.model.request.CancelOrderRequest;
import org.example.datn.model.response.HoaDonChiTietModel;
import org.example.datn.model.response.SanPhamDoiTraModel;
import org.example.datn.model.response.SanPhamModel;
import org.example.datn.repository.SanPhamRepository;
import org.example.datn.service.*;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class SanPhamDoiTraProcessor {
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;
    @Autowired
    private YeuCauDoiTraService yeuCauDoiTraService;
    @Autowired
    private YeuCauDoiTraChiTietService yeuCauDoiTraChiTietService;
    @Autowired
    private SanPhamDoiTraService service;

    @Autowired
    SanPhamChiTietProcessor sanPhamChiTietprocessor;

    private SanPhamDoiTraModel toModel(SanPhamDoiTra hoaDon) {
        if (hoaDon == null) {
            return null;
        }

        SanPhamDoiTraModel model = new SanPhamDoiTraModel();
        model.setId(hoaDon.getId());
        model.setIdSPCT(hoaDon.getIdSPCT());
        model.setLoai(hoaDon.getLoai());
        model.setSoLuong(hoaDon.getSoLuong());
        model.setIdYeuCauDoiTra(hoaDon.getIdYeuCauDoiTra());
        model.setTrangThai(hoaDon.getTrangThai());
        model.setLyDo(hoaDon.getLyDo());
        return model;
    }

    public ServiceResult getAll() {
        var list = service.findAll();
        var models = list.stream().map(hoaDonChiTiet -> {
            var model = toModel(hoaDonChiTiet);
            var sanPhamChiTiet = sanPhamChiTietprocessor.findById(hoaDonChiTiet.getIdSPCT());
            model.setSanPhamChiTietModel(sanPhamChiTiet);
            model.setYeuCauDoiTra(yeuCauDoiTraService.findById(hoaDonChiTiet.getIdYeuCauDoiTra()).orElse(null));
            return model;
        }).collect(Collectors.toList());
        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult updateSanPhamDoiTra(Long id, UserAuthentication ua) {
        // Tìm hóa đơn theo ID
        SanPhamDoiTra sanPhamDoiTra = service.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại"));

        // Xác định trạng thái mới dựa trên trạng thái hiện tại
        Integer newTrangThai;
        switch (sanPhamDoiTra.getTrangThai()) {
            case 0:
                newTrangThai = SanPhamDoiTraStatus.HOAN_TAC.getValue();
                break;
            default:
                throw new IllegalArgumentException("Trạng thái không hợp lệ để cập nhật");
        }
        // Cập nhật trạng thái hóa đơn
        sanPhamDoiTra.setTrangThai(newTrangThai);
        sanPhamDoiTra.setNgayCapNhat(LocalDateTime.now());
        sanPhamDoiTra.setNguoiCapNhat(ua.getPrincipal());

        passSanPhamDoitra(sanPhamDoiTra);
        // Lưu hóa đơn
        service.save(sanPhamDoiTra);

        // Trả về kết quả thành công
        return new ServiceResult("Hóa đơn đã được cập nhật trạng thái thành công",
                SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    private void passSanPhamDoitra(SanPhamDoiTra sanPhamDoiTra) {
        List<YeuCauDoiTraChiTiet> yeuCauDoiTraChiTiets = yeuCauDoiTraChiTietService.findByIdYeuCauDoiTra(sanPhamDoiTra.getIdYeuCauDoiTra());
        yeuCauDoiTraChiTiets.forEach(yeuCauDoiTraChiTiet -> {
            yeuCauDoiTraChiTiet.setTrangThai(SanPhamDoiTraStatus.HOAN_TAC.getValue());
            Optional<SanPhamChiTiet> sanPhamChiTietOpt = sanPhamChiTietService.findById(yeuCauDoiTraChiTiet.getIdSPCT());
            sanPhamChiTietOpt.ifPresent(sanPhamChiTiet -> {
                sanPhamChiTiet.setSoLuong(sanPhamChiTiet.getSoLuong() + yeuCauDoiTraChiTiet.getSoLuong());
                sanPhamChiTietService.save(sanPhamChiTiet);
            });
        });
        yeuCauDoiTraChiTietService.saveAll(yeuCauDoiTraChiTiets);
    }

    @Transactional(rollbackOn = Exception.class)
    public ServiceResult sanPhamFail(Long id, CancelOrderRequest request, UserAuthentication ua) {
        // Tìm hóa đơn theo ID
        SanPhamDoiTra sanPhamDoiTra = service.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hóa đơn không tồn tại"));
        // Xác định trạng thái mới dựa trên trạng thái hiện tại
        Integer newTrangThai;
        switch (sanPhamDoiTra.getTrangThai()) {
            case 0:
                newTrangThai = SanPhamDoiTraStatus.HONG.getValue();
                break;
            default:
                throw new IllegalArgumentException("Trạng thái không hợp lệ để cập nhật");
        }
        // Cập nhật trạng thái hóa đơn
        sanPhamDoiTra.setTrangThai(newTrangThai);
        sanPhamDoiTra.setNgayCapNhat(LocalDateTime.now());
        sanPhamDoiTra.setNguoiCapNhat(ua.getPrincipal());
        sanPhamDoiTra.setLyDo(request.getOrderInfo()); // Ghi chú từ request
        // Lưu hóa đơn
        service.save(sanPhamDoiTra);

        // Trả về kết quả thành công
        return new ServiceResult("Hóa đơn đã được cập nhật trạng thái thành công",
                SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }
}
