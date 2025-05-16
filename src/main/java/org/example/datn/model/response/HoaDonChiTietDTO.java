package org.example.datn.model.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.datn.entity.HoaDonChiTiet;
import org.example.datn.entity.SanPham;
import org.example.datn.entity.SanPhamChiTiet;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoaDonChiTietDTO {
    String ten;
    String anh;
    String size;
    String mauSac;
    Integer soLuong;
    BigDecimal gia;

}
