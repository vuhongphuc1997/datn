package org.example.datn.transformer;

import org.example.datn.entity.YeuCauDoiTraChiTiet;
import org.example.datn.model.response.YeuCauDoiTraChiTietModel;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
@Component
public interface YeuCauDoiTraChiTietTransformer {
    YeuCauDoiTraChiTietModel toModel(YeuCauDoiTraChiTiet entity);
}
