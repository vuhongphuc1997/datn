package org.example.datn.controller;

import org.example.datn.entity.SanPham;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.request.CancelOrderRequest;
import org.example.datn.model.response.SanPhamModel;
import org.example.datn.processor.SanPhamDoiTraProcessor;
import org.example.datn.processor.SanPhamProcessor;
import org.example.datn.service.SanPhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/doi-tra")
public class SanPhamDoiTraController {

    @Autowired
    SanPhamDoiTraProcessor processor;

    @PostMapping("/{id}")
    public ResponseEntity<ServiceResult> cancelOrder(@PathVariable Long id, UserAuthentication ua) throws IOException, InterruptedException {
        return ResponseEntity.ok(processor.updateSanPhamDoiTra(id, ua));
    }
    @PostMapping("/fail/{id}")
    public ResponseEntity<ServiceResult> sanPhamFail(@PathVariable Long id, @RequestBody CancelOrderRequest request, UserAuthentication ua) throws IOException, InterruptedException {
        return ResponseEntity.ok(processor.sanPhamFail(id, request, ua));
    }
    @GetMapping
    public ResponseEntity<ServiceResult> findAll() {
        ServiceResult result = processor.getAll();
        return ResponseEntity.ok(result);
    }
}
