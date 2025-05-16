package org.example.datn.service;

import org.example.datn.entity.HoaDonChiTiet;
import org.example.datn.entity.SanPham;
import org.example.datn.entity.SanPhamChiTiet;
import org.example.datn.repository.HoaDonChiTietRepository;
import org.example.datn.repository.SanPhamChiTietRepository;
import org.example.datn.repository.SanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class SanPhamService {
    @Autowired
    private SanPhamRepository repo;
    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;
    @Autowired
    private SanPhamRepository sanPhamRepository;
    @Autowired
    private HoaDonChiTietRepository hoaDonChiTietRepository;
    @Autowired
    private SanPhamChiTietService sanPhamChiTietService;
    public Optional<SanPham> findById(Long id) {
        return repo.findById(id);
    }

    public List<SanPham> findByIdIn(List<Long> ids) {
        return repo.findByIdIn(ids);
    }

    public List<SanPham> findAll() {
        return repo.findAll();
    }

    public void save(SanPham sanPham) {
        repo.save(sanPham);
    }

    public void update(SanPham sanPham) {
        repo.save(sanPham); // save() sẽ tự động cập nhật nếu đã có id
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<SanPham> searchProductsByName(String ten) {
        return repo.findByTenContaining(ten);
    }
    public List<SanPham> searchSanPham(String keyword, Long idChatLieu, Long idThuongHieu, Long idDanhMuc, BigDecimal giaMin, BigDecimal giaMax) {
        return repo.searchSanPham(keyword, idChatLieu, idThuongHieu, idDanhMuc, giaMin, giaMax);
    }

    public List<Map<String, Object>> getTopSellingProducts() {
        // Lấy tất cả chi tiết hóa đơn có trang thái là 4 (đã thanh toán)
        List<HoaDonChiTiet> hoaDonChiTiets = hoaDonChiTietRepository.findByTrangThai(4);

        Map<Long, Double> productSalesMap = new HashMap<>();

        // Tính tổng số lượng bán cho mỗi sản phẩm
        for (HoaDonChiTiet hdct : hoaDonChiTiets) {
            Long sanPhamChiTietId = hdct.getIdSanPhamChiTiet();  // Lấy id sản phẩm chi tiết
            SanPhamChiTiet sanPhamChiTiet = sanPhamChiTietRepository.findById(sanPhamChiTietId).orElse(null);

            if (sanPhamChiTiet != null) {
                Long productId = sanPhamChiTiet.getIdSanPham();  // Lấy id sản phẩm từ SanPhamChiTiet
                Integer quantity = hdct.getSoLuong();

                // Cộng dồn số lượng bán của sản phẩm này
                productSalesMap.put(productId, productSalesMap.getOrDefault(productId, 0.0) + quantity);
            }
        }

        // Lấy danh sách sản phẩm từ database
        List<SanPham> allSanPham = sanPhamRepository.findAll();

        List<Map<String, Object>> topSellingProducts = new ArrayList<>();

        // Chuyển dữ liệu sang dạng dễ xử lý để trả về
        for (Map.Entry<Long, Double> entry : productSalesMap.entrySet()) {
            SanPham sanPham = allSanPham.stream()
                    .filter(sp -> sp.getId().equals(entry.getKey()))
                    .findFirst()
                    .orElse(null);

            if (sanPham != null) {
                Map<String, Object> productData = new HashMap<>();
                productData.put("id", sanPham.getId());
                productData.put("ten", sanPham.getTen());
                productData.put("anh", sanPham.getAnh());
                productData.put("ma", sanPham.getMa());
                productData.put("gia", sanPham.getGia());
                productData.put("totalSales", entry.getValue());
                productData.put("trangThai", sanPham.getTrangThai());

                topSellingProducts.add(productData);
            }
        }

        // Sắp xếp theo số lượng bán giảm dần
        topSellingProducts.sort((p1, p2) -> Double.compare((Double) p2.get("totalSales"), (Double) p1.get("totalSales")));

        // Trả về top 10 sản phẩm bán chạy
        return topSellingProducts.subList(0, Math.min(topSellingProducts.size(), 8));
    }

    public SanPham ById(Long id) {
        return sanPhamRepository.findById(id).orElse(null); // Nếu không tìm thấy trả về null
    }

    // Hàm lấy tổng số sản phẩm, nhóm theo idSanPham và cộng dồn số lượng
    public List<Map<String, Object>> getTongSanPham() {
        // Lấy tất cả sản phẩm chi tiết
        List<SanPhamChiTiet> sanPhamChiTietList = sanPhamChiTietRepository.findAll();

        // Tạo một map để nhóm sản phẩm chi tiết theo idSanPham
        Map<Long, Integer> tongSanPhamMap = new HashMap<>();

        // Duyệt qua tất cả sản phẩm chi tiết và cộng dồn số lượng
        for (SanPhamChiTiet sanPhamChiTiet : sanPhamChiTietList) {
            Long idSanPham = sanPhamChiTiet.getIdSanPham();
            Integer soLuong = sanPhamChiTiet.getSoLuong();

            // Cộng dồn số lượng cho mỗi sản phẩm
            tongSanPhamMap.put(idSanPham, tongSanPhamMap.getOrDefault(idSanPham, 0) + soLuong);
        }

        // Tạo một danh sách để trả về kết quả
        List<Map<String, Object>> result = new ArrayList<>();

        // Duyệt qua các idSanPham và lấy thông tin sản phẩm từ bảng SanPham
        for (Map.Entry<Long, Integer> entry : tongSanPhamMap.entrySet()) {
            Long idSanPham = entry.getKey();
            Integer tongSoLuong = entry.getValue();

            // Lấy thông tin sản phẩm từ idSanPham
            SanPham sanPham = sanPhamRepository.findById(idSanPham).orElse(null);
            if (sanPham != null) {
                // Tạo một Map chứa thông tin sản phẩm và số lượng
                Map<String, Object> sanPhamData = new HashMap<>();
                sanPhamData.put("id", sanPham.getId());
                sanPhamData.put("ten", sanPham.getTen());
                sanPhamData.put("ma", sanPham.getMa());
                sanPhamData.put("gia", sanPham.getGia());
                sanPhamData.put("tongSoLuong", tongSoLuong);

                // Thêm vào danh sách kết quả
                result.add(sanPhamData);
            }
        }

        return result;
    }
}
