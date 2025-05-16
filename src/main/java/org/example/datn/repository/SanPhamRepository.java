package org.example.datn.repository;

import org.example.datn.entity.ChatLieu;
import org.example.datn.entity.HinhAnh;
import org.example.datn.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Long> {

    List<SanPham> findByIdIn(List<Long> ids);

    @Query("SELECT sp FROM SanPham sp WHERE sp.ten LIKE %:ten%")
    List<SanPham> findByTenContaining(@Param("ten") String ten);

    // Lấy sản phẩm sắp xếp theo giá tăng dần
    List<SanPham> findAllByOrderByGiaAsc();

    // Lấy sản phẩm sắp xếp theo giá giảm dần
    List<SanPham> findAllByOrderByGiaDesc();

    @Query("SELECT s FROM SanPham s WHERE " +
            "(:keyword IS NULL OR (LOWER(s.ten) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.ma) LIKE LOWER(CONCAT('%', :keyword, '%')))) AND " +
            "(:idChatLieu IS NULL OR s.idChatLieu = :idChatLieu) AND " +
            "(:idThuongHieu IS NULL OR s.idThuongHieu = :idThuongHieu) AND " +
            "(:idDanhMuc IS NULL OR s.idDanhMuc = :idDanhMuc) AND " +
            "(:giaMin IS NULL OR s.gia >= :giaMin) AND " +
            "(:giaMax IS NULL OR s.gia <= :giaMax)")
    List<SanPham> searchSanPham(
            @Param("keyword") String keyword,
            @Param("idChatLieu") Long idChatLieu,
            @Param("idThuongHieu") Long idThuongHieu,
            @Param("idDanhMuc") Long idDanhMuc,
            @Param("giaMin") BigDecimal giaMin,
            @Param("giaMax") BigDecimal giaMax);

}
