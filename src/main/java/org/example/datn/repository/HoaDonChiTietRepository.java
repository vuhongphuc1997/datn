package org.example.datn.repository;

import feign.Param;
import org.example.datn.entity.HoaDon;
import org.example.datn.entity.HoaDonChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonChiTietRepository extends JpaRepository<HoaDonChiTiet, Long> {
    @Query("SELECT p FROM HoaDonChiTiet p WHERE p.id = ?1")
    List<HoaDonChiTiet> findByCateId(Long cid);

    @Query("SELECT h FROM HoaDonChiTiet h WHERE h.idHoaDon IN :idHoaDons" +
            " AND (:trangThai IS NULL OR h.trangThai = :trangThai)")
    List<HoaDonChiTiet> findByIdHoaDonInAndTrangThai(@Param("idHoaDons") List<Long> idHoaDons,
                                                     @Param("trangThai") Integer trangThai);

    List<HoaDonChiTiet> findByIdHoaDon(Long idHoaDon);

    List<HoaDonChiTiet> findByIdHoaDonAndIdSanPhamChiTietIn(Long idHoaDon, List<Long> idSanPhamChiTiets);

    Optional<HoaDonChiTiet> findByIdHoaDonAndIdSanPhamChiTiet(Long idHoaDon, Long idSanPhamChiTiet);
    List<HoaDonChiTiet> findByTrangThai(Integer trangThai);

    @Query("SELECT h FROM HoaDonChiTiet h WHERE h.ngayCapNhat BETWEEN :startDate AND :endDate AND h.trangThai = :trangThai ")
    List<HoaDonChiTiet> findByNgayTaoBetween(@Param("startDate") LocalDateTime startDate,
                                                         @Param("endDate") LocalDateTime endDate,
                                                         @Param("trangThai") Integer trangThai);
//    AND (h.trangThaiDoiTra IS NULL OR h.trangThaiDoiTra = 1)

}
