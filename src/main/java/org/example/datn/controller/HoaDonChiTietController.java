package org.example.datn.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.datn.model.ServiceResult;
import org.example.datn.model.UserAuthentication;
import org.example.datn.model.request.HoaDonChiTietRequest;
import org.example.datn.processor.HoaDonChiTietProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController("HoaDonChiTietApi")
@RequestMapping("/hoa-don-chi-tiet")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HoaDonChiTietController {

    @Autowired
    HoaDonChiTietProcessor processor;

    @PostMapping("/get-list-by-status")
    public ResponseEntity<ServiceResult> getListByStatus(@RequestBody HoaDonChiTietRequest request, UserAuthentication ua) {
        return ResponseEntity.ok(processor.getListByStatus(request, ua));
    }

    @GetMapping
    public ResponseEntity<ServiceResult> getAll() {
        return ResponseEntity.ok(processor.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResult> getById(@PathVariable Long id) {
        return ResponseEntity.ok(processor.getById(id));
    }

    @GetMapping("/get-id-hoa-don")
    public ServiceResult getByIdHoaDon(@RequestParam Long idHoaDon) {
        return processor.getByIdHoaDon(idHoaDon);
    }

    /////////////////// THỐNG KÊ //////////////////////

    @GetMapping("/thong-ke-online")
    public ResponseEntity<ServiceResult> thongKeOnline(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime endDate) {
        return ResponseEntity.ok(processor.thongKeOnline(startDate, endDate));
    }

    @GetMapping("/thong-ke-offline")
    public ResponseEntity<ServiceResult> thongKeOffline(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime endDate) {
        return ResponseEntity.ok(processor.thongKeOffline(startDate, endDate));
    }

    // Thống kê số lượng hóa đơn theo thời gian
    @GetMapping("/thong-ke-don-hang")
    public ResponseEntity<ServiceResult> getTotalInvoices(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime endDate) {
        return ResponseEntity.ok(processor.thongKeDonHang(startDate, endDate));
    }

    @GetMapping("/thong-ke-khach-hang")
    public ResponseEntity<ServiceResult> thongKeKhachHang(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime endDate) {
        return ResponseEntity.ok(processor.thongKeKhachHang(startDate, endDate));
    }
}
