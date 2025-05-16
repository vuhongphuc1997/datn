package org.example.datn.service;

import org.example.datn.constants.SystemConstant;
import org.example.datn.entity.DanhMuc;
import org.example.datn.entity.SanPham;
import org.example.datn.entity.SanPhamDoiTra;
import org.example.datn.repository.DanhMucRepository;
import org.example.datn.repository.SanPhamDoiTraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SanPhamDoiTraService {
    @Autowired
    private SanPhamDoiTraRepository repo;
    public List<SanPhamDoiTra> findAll() {
        return repo.findAll();
    }
    public Optional<SanPhamDoiTra> findById(Long id) {
        return repo.findById(id);
    }

    public void delete(SanPhamDoiTra danhMuc) {
        repo.delete(danhMuc);
    }

    @Autowired
    private SanPhamDoiTraRepository sanPhamDoiTraRepository;

    public SanPhamDoiTra save(SanPhamDoiTra sanPhamDoiTra) {
        return sanPhamDoiTraRepository.save(sanPhamDoiTra);
    }
}
