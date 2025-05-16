package org.example.datn.processor;

import org.example.datn.constants.SystemConstant;
import org.example.datn.entity.DanhMuc;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.request.DanhMucRequest;
import org.example.datn.model.response.DanhMucModel;
import org.example.datn.service.DanhMucService;
import org.example.datn.transformer.DanhMucTransformer;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class DanhMucProcessor {

    @Autowired
    private DanhMucService service;

    @Autowired
    private DanhMucTransformer danhMucTransformer;

    public ServiceResult save(DanhMuc request, UserAuthentication ua) {
        request.setNguoiTao(ua.getPrincipal());
        request.setNgayTao(LocalDateTime.now());
        request.setNguoiCapNhat(ua.getPrincipal());
        request.setNgayCapNhat(LocalDateTime.now());
        service.save(request);
        return new ServiceResult();
    }

    public ServiceResult update(Long id, DanhMucRequest request, UserAuthentication ua) {
        DanhMuc danhMuc = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại"));
        BeanUtils.copyProperties(request, danhMuc);
        danhMuc.setNguoiCapNhat(ua.getPrincipal());
        danhMuc.setNgayCapNhat(LocalDateTime.now());
        service.save(danhMuc);
        return new ServiceResult();
    }

    public ServiceResult delete(Long id) {
        DanhMuc danhMuc = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại"));
        service.delete(danhMuc);
        return new ServiceResult();
    }

    public ServiceResult findAll() {
        var list = service.getAll();
        var models = list.stream().map(danhMuc -> {
            // Chuyển đối tượng DanhMuc thành DanhMucModel
            DanhMucModel model = danhMucTransformer.toModel(danhMuc);

            // Kiểm tra nếu idCha không phải null trước khi gọi findById
            if (danhMuc.getIdCha() != null) {
                service.findById(danhMuc.getIdCha()).ifPresent(model::setDanhMucCha);
            }

            // Trả về model sau khi đã gán danh mục cha
            return model;
        }).collect(Collectors.toList());

        return new ServiceResult(models, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }


    public ServiceResult getById(Long id) {
        DanhMuc danhMuc = service.findById(id).orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại"));
        DanhMucModel model = danhMucTransformer.toModel(danhMuc);
        if (danhMuc.getIdCha() != null) {
            service.findById(danhMuc.getIdCha()).ifPresent(model::setDanhMucCha);
        }
        return new ServiceResult(model, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    public DanhMucModel findById(Long id) {
        return service.findById(id)
                .map(danhMucTransformer::toModel)
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại"));
    }

    public ServiceResult getCategoryChildren() {
        List<DanhMuc> danhMucList = service.findByIdChaIsNull();

        List<DanhMucModel> danhMucModelList = danhMucList.stream()
                .map(danhMucTransformer::toModel)
                .collect(Collectors.toList());

        for (DanhMucModel danhMucModel : danhMucModelList) {
            List<DanhMucModel> children = getCategoryChildren(danhMucModel.getId());

            danhMucModel.setChildren(children);
        }

        return new ServiceResult(danhMucModelList, SystemConstant.STATUS_SUCCESS, SystemConstant.CODE_200);
    }

    private List<DanhMucModel> getCategoryChildren(Long parentId) {
        List<DanhMuc> danhMucConList = service.findByIdCha(parentId);

        List<DanhMucModel> children = danhMucConList.stream()
                .map(danhMucTransformer::toModel)
                .collect(Collectors.toList());

        for (DanhMucModel child : children) {
            List<DanhMucModel> subChildren = getCategoryChildren(child.getId());
            child.setChildren(subChildren);
        }

        return children;
    }

}
