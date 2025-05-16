package org.example.datn.service;

import org.example.datn.entity.HoaDon;
import org.example.datn.repository.HoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class HoaDonService {

    @Autowired
    private HoaDonRepository repo;

    public List<HoaDon> getAll() {
        return repo.findAll();
    }

    public void save(HoaDon hoaDon) {
        repo.save(hoaDon);
    }

    public Optional<HoaDon> findById(Long id) {
        return repo.findById(id);
    }

    public void delete(HoaDon hoaDon) {
        repo.delete(hoaDon);
    }

    public HoaDon findTopByOrderByNgayTaoDesc() {
        return repo.findTopByOrderByNgayTaoDesc();
    }

    public List<HoaDon> findByIdNguoiDung(Long idNguoiDung) {
        return repo.findByIdNguoiDung(idNguoiDung);
    }

    public Optional<HoaDon> findByMa(String ma) {
        return repo.findByMa(ma);
    }

    public List<HoaDon> finByTrangThai(Integer trangThai) {
        return repo.findByTrangThai(trangThai);
    }

    public List<HoaDon> findByIdNguoiDungAndTrangThai(Long idNguoiDung, Integer trangThai) {
        return repo.findByIdNguoiDungAndTrangThai(idNguoiDung, trangThai);
    }

    public List<HoaDon> getHoaDonsByIdNguoiDungAndTrangThaiDoiTraNotNull(Long idNguoiDung) {
        return repo.findAllByIdNguoiDungAndTrangThaiDoiTraIsNotNull(idNguoiDung);
    }
    //////////////// thống kê ////////
    // Lấy danh sách hóa đơn theo thời gian
    public List<HoaDon> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return repo.findByNgayTaoBetween(startDate, endDate);
    }
    public List<HoaDon> findByDateRangeDoiTra(LocalDateTime startDate, LocalDateTime endDate) {
        return repo.findByNgayTaoBetweenDoiTra(startDate, endDate);
    }
    public List<HoaDon> findByDateRangeAndStatusAndReturnStatus(LocalDateTime startDate, LocalDateTime endDate, Integer trangThai) {
        return repo.findByDateRangeAndStatusAndReturnStatus(startDate, endDate, trangThai);
    }

}
