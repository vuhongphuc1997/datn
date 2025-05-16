package org.example.datn.service;

import feign.Param;
import org.example.datn.entity.ApDungKhuyenMai;
import org.example.datn.entity.ChatLieu;
import org.example.datn.repository.ApDungKhuyenMaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ApDungKhuyenMaiService {
    @Autowired
    private ApDungKhuyenMaiRepository repo;

    public void save(ApDungKhuyenMai entity) {
        repo.save(entity);
    }

    public void deleteByIdKhuyenMaiAndIdIn(Long idKhuyenMai, List<Long> idList){
        repo.deleteByIdKhuyenMaiAndIdIn(idKhuyenMai,idList);
    }

    public List<ApDungKhuyenMai> findByIdKhuyenMai(Long idKhuyenMai){
        return repo.findByIdKhuyenMai(idKhuyenMai);
    }
    public void delete(ApDungKhuyenMai apDungKhuyenMai){
        repo.delete(apDungKhuyenMai);
    }

    public List<ApDungKhuyenMai> findByIdNguoiDungAndDaSuDung(Long idNguoiDung, Boolean daSuDung){
        return repo.findByIdNguoiDungAndDaSuDung(idNguoiDung, daSuDung);
    }
    public Optional<ApDungKhuyenMai> findByIdKhuyenMaiAndIdNguoiDung(Long idKhuyenMai, Long idNguoiDung){
        return repo.findByIdKhuyenMaiAndIdNguoiDung(idKhuyenMai, idNguoiDung);
    }

    public List<ApDungKhuyenMai> findAll() {
        return repo.findAll();
    }

    public Optional<ApDungKhuyenMai> findByIdSanPhamAndTrangThai(Long idSanPham, Integer trangThai){
        return repo.findByIdSanPhamAndTrangThai(idSanPham, trangThai);
    }

    public List<ApDungKhuyenMai> findByIdSanPham(Long idSanPham){
        return repo.findByIdSanPham(idSanPham);
    }


    @Transactional
    public void updateGiaTriByKhuyenMaiId(Long khuyenMaiId, BigDecimal newGiaTri) {
        List<ApDungKhuyenMai> apDungKhuyenMais = repo.findByIdKhuyenMai(khuyenMaiId);
        apDungKhuyenMais.forEach(apDungKhuyenMai -> apDungKhuyenMai.setGiaTriGiam(newGiaTri));
        repo.saveAll(apDungKhuyenMais);
    }

}
