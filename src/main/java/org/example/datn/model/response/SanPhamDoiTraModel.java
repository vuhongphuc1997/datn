package org.example.datn.model.response;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.datn.entity.*;
import org.example.datn.model.CommonModel;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SanPhamDoiTraModel extends CommonModel {

    private Long id;
    private Long idSPCT;
    private Long idYeuCauDoiTra;
    private Integer soLuong;
    private String lyDo;
    private String loai;
    private Integer trangThai;

    SanPhamChiTiet sanPhamChiTiet;
    YeuCauDoiTra yeuCauDoiTra;
    SanPhamChiTietModel sanPhamChiTietModel;

}
