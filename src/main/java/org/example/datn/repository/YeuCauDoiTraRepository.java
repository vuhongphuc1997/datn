package org.example.datn.repository;

import feign.Param;
import org.example.datn.entity.ChatLieu;
import org.example.datn.entity.HoaDon;
import org.example.datn.entity.SanPham;
import org.example.datn.entity.YeuCauDoiTra;
import org.example.datn.model.enums.LoaiYeuCau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YeuCauDoiTraRepository extends JpaRepository<YeuCauDoiTra, Long> {
    @Query("SELECT p FROM YeuCauDoiTra p WHERE p.id = ?1")
    List<YeuCauDoiTra> findByCateId(Long cid);
    List<YeuCauDoiTra> findByIdIn(List<Long> ids);

    List<YeuCauDoiTra> findByLoaiAndTrangThai(LoaiYeuCau loai, Integer trangThai);
    List<YeuCauDoiTra> findByLoai(LoaiYeuCau loai);

    List<YeuCauDoiTra> findByIdNguoiDung(Long idNguoiDung);

    @Query("SELECT y FROM YeuCauDoiTra y WHERE y.idHoaDon IN :hoaDonIds")
    List<YeuCauDoiTra> findByHoaDonIds(@Param("idHoaDon") List<Long> hoaDonIds);

    List<YeuCauDoiTra> findByIdHoaDon(Long idHoaDon);
    List<YeuCauDoiTra> findByIdHoaDonAndLoaiAndTrangThai(Long idHoaDon, LoaiYeuCau loai, Integer trangThai);

}
