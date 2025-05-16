package org.example.datn.repository;

import feign.Param;
import org.example.datn.entity.ChatLieu;
import org.example.datn.entity.HoaDon;
import org.example.datn.entity.HoaDonChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    HoaDon findTopByOrderByNgayTaoDesc();

    List<HoaDon> findByIdNguoiDung(Long idNguoiDung);

    Optional<HoaDon> findByMa(String ma);

    List<HoaDon> findByTrangThai(Integer trangThai);

    @Query("SELECT h FROM HoaDon h WHERE h.idNguoiDung IN :idNguoiDung" +
            " AND (:trangThai IS NULL OR h.trangThai = :trangThai) " +
            "ORDER BY h.ngayCapNhat DESC")
    List<HoaDon> findByIdNguoiDungAndTrangThai(@Param("idNguoiDung") Long idNguoiDung,
                                               @Param("trangThai") Integer trangThai);

    @Query("SELECT h FROM HoaDon h WHERE h.idNguoiDung = :idNguoiDung AND h.trangThaiDoiTra IS NOT NULL")
    List<HoaDon> findAllByIdNguoiDungAndTrangThaiDoiTraIsNotNull(@Param("idNguoiDung") Long idNguoiDung);

    @Query("SELECT h FROM HoaDon h WHERE h.ngayThanhToan BETWEEN :startDate AND :endDate")
    List<HoaDon> findByNgayTaoBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT h FROM HoaDon h WHERE h.ngayCapNhat BETWEEN :startDate AND :endDate")
    List<HoaDon> findByNgayTaoBetweenDoiTra(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT h FROM HoaDon h WHERE h.ngayThanhToan BETWEEN :startDate AND :endDate AND h.trangThai = :trangThai")
    List<HoaDon> findByDateRangeAndStatusAndReturnStatus(@Param("startDate") LocalDateTime startDate,
                                                         @Param("endDate") LocalDateTime endDate,
                                                         @Param("trangThai") Integer trangThai);


}
