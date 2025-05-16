package org.example.datn.controller;

import org.example.datn.entity.SanPham;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.request.SanPhamRequest;
import org.example.datn.model.response.SanPhamModel;
import org.example.datn.processor.SanPhamProcessor;
import org.example.datn.service.SanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController("SanPhamApi")
@RequestMapping("/san-pham")
public class SanPhamController {

    @Autowired
    SanPhamProcessor processor;

    @Autowired
    SanPhamService service;

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResult> getById(@PathVariable Long id) {
        return ResponseEntity.ok(processor.getById(id));
    }

    @GetMapping
    public ResponseEntity<ServiceResult> getAll() {
        return ResponseEntity.ok(processor.getAll());
    }

    @PostMapping
    public ResponseEntity<ServiceResult> add(@RequestParam("file") MultipartFile file, @ModelAttribute SanPhamModel model, UserAuthentication ua) {
        return ResponseEntity.ok(processor.save(model, file, ua));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResult> update(@PathVariable Long id,
                                                @RequestParam(value = "file", required = false) MultipartFile file,
                                                @ModelAttribute SanPhamModel model,
                                                UserAuthentication ua) {
            return ResponseEntity.ok(processor.update(id, model, file, ua));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceResult> updateStatus(@PathVariable Long id, @RequestParam("status") int status, UserAuthentication ua) {
        return ResponseEntity.ok(processor.updateStatus(id, status, ua));
    }

    @GetMapping("/search")
    public List<SanPham> searchProducts(@RequestParam String ten) {
        return service.searchProductsByName(ten);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ServiceResult> delete(@PathVariable Long id) {
        return ResponseEntity.ok(processor.delete(id));
    }

    @PostMapping("/search")
    public ResponseEntity<ServiceResult> searchProducts(@RequestBody SanPhamRequest request) {
        return ResponseEntity.ok(processor.searchProducts(request));
    }

    @Autowired
    private SanPhamService sanPhamService;

    // Các phương thức khác...

    @GetMapping("/san-pham-ban-chay")
    public List<Map<String, Object>> getTopSellingProducts() {
        return sanPhamService.getTopSellingProducts();
    }

    @GetMapping("/san-pham-trong-kho")
    public List<Map<String, Object>> getTongSanPham() {
        return sanPhamService.getTongSanPham();
    }

}
