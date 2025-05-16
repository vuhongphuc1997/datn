package org.example.datn.transformer;

import org.example.datn.entity.YeuCauDoiTra;
import org.example.datn.model.request.YeuCauDoiTraRequest;
import org.example.datn.model.response.YeuCauDoiTraResponse;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
@Component
public interface YeuCauDoiTraTransformer {
    YeuCauDoiTra toEntity(YeuCauDoiTraRequest request);

    YeuCauDoiTraResponse toResponse(YeuCauDoiTra entity);
}
