package org.example.datn.model.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SanPhamRequest extends CommonQuery{
    private Long idChatLieu;
    private Long idThuongHieu;
    private Long idDanhMuc;
    private BigDecimal giaMin;
    private BigDecimal giaMax;
}
