app.controller("test-ctrl", function ($scope, $http, $rootScope, $location) {

    // Hàm lọc và tính số lượng hóa đơn có trạng thái = 4 cho ngày hôm nay
    $scope.ngay = function () {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const todayEnd = new Date().setHours(23, 59, 59, 999);

        const filteredItems = $scope.items.filter(item =>
            item.trangThai === 4 && new Date(item.ngayCapNhat).setHours(0, 0, 0, 0) === todayStart);

        const filteredItems1 = $scope.items.filter(item =>
            item.trangThai === 0 && new Date(item.ngayCapNhat).setHours(0, 0, 0, 0) === todayStart);

        const filteredItems2 = $scope.items.filter(item =>
            item.trangThai === 5 && new Date(item.ngayCapNhat).setHours(0, 0, 0, 0) === todayStart);

        const filteredItems5 = $scope.items.filter(item =>
            item.trangThai === 3 && new Date(item.ngayCapNhat).setHours(0, 0, 0, 0) === todayStart);

        const filteredItems4 = $scope.items.filter(item =>
            item.trangThai === 2 && new Date(item.ngayCapNhat).setHours(0, 0, 0, 0) === todayStart);


        $scope.donHangCho = filteredItems1.length;
        $scope.donHangHuy = filteredItems2.length;
        $scope.donHangNgay = filteredItems.length;
        $scope.choGiaoHang = filteredItems4.length;
        $scope.dangVanChuyen = filteredItems5.length;
        $scope.doanhThuNgay = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);

        const invoiceIds = filteredItems.map(item => item.id);

        $http.get('/san-pham')
            .then(sanPhamResponse => {
                const allSanPham = sanPhamResponse.data.data;

                $http.get('/spct').then(spctResponse => {
                    const allSanPhamChiTiet = spctResponse.data.data;

                    $http.get('/hoa-don-chi-tiet').then(hdctResponse => {
                        const allHoaDonChiTiet = hdctResponse.data.data;
                        const filteredHdctItems = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));

                        $scope.soLuongNgay = filteredHdctItems.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                        const productQuantityMap = filteredHdctItems.reduce((map, hdctItem) => {
                            const spct = allSanPhamChiTiet.find(spct => spct.id === hdctItem.idSanPhamChiTiet);
                            if (spct) {
                                map[spct.idSanPham] = (map[spct.idSanPham] || 0) + parseFloat(hdctItem.soLuong);
                            }
                            return map;
                        }, {});

                        $scope.topSanPhamBanChay = Object.entries(productQuantityMap)
                            .map(([productId, totalQuantity]) => {
                                const sanPham = allSanPham.find(sp => sp.id === parseInt(productId));
                                return { productId, totalQuantity, tenSanPham: sanPham?.ten || 'N/A', maSanPham: sanPham?.ma || 'N/A', giaSanPham: sanPham?.gia || 'N/A' };
                            })
                            .sort((a, b) => b.totalQuantity - a.totalQuantity)
                            .slice(0, 10);

                        $scope.renderTopProductsChart();

                        $scope.topSanPhamBanChayNhat = $scope.topSanPhamBanChay[0];

                        $scope.Size = 5;
                        $scope.Page = 1;
                        $scope.Pages = Math.ceil($scope.topSanPhamBanChay.length / $scope.Size);
                        $scope.getPageData1 = () => $scope.topSanPhamBanChay.slice(($scope.Page - 1) * $scope.Size, $scope.Page * $scope.Size);

                        console.log("Top 10 sản phẩm bán chạy nhất trong ngày:", $scope.topSanPhamBanChay);
                        console.log("Sản phẩm bán chạy nhất:", $scope.topSanPhamBanChayNhat);
                    });
                });
            });
    };

    // Hàm lọc và tính số lượng hóa đơn có trạng thái = 4 cho tuần này
    $scope.tuan = function () {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Chủ nhật là 0, thứ 2 là 1, ...

        // Tính ngày đầu tuần (Chủ nhật hoặc thứ hai tùy thuộc vào hệ thống)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek); // Lùi lại số ngày từ Chủ nhật

        startOfWeek.setHours(0, 0, 0, 0); // Đặt giờ về 0

        // Tính ngày cuối tuần (thường là thứ 7)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Thêm 6 ngày

        endOfWeek.setHours(23, 59, 59, 999); // Đặt giờ đến cuối ngày

        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 4;

            const ngayCapNhat = new Date(item.ngayCapNhat);
            ngayCapNhat.setHours(0, 0, 0, 0); // Bỏ qua giờ, phút, giây khi so sánh

            return statusMatches && ngayCapNhat >= startOfWeek && ngayCapNhat <= endOfWeek;
        });

        $scope.donHangTuan = filteredItems.length;
        $scope.doanhThuTuan = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);

        const invoiceIds = filteredItems.map(item => item.id);

        $http.get('/hoa-don-chi-tiet') // API lấy tất cả hóa đơn chi tiết
            .then(function (response) {
                const allHoaDonChiTiet = response.data.data;
                const filteredItems2 = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));
                $scope.soLuongTuan = filteredItems2.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                // Hiển thị thông tin
                console.log("Tổng số lượng của các hóa đơn chi tiết có trạng thái 4 trong tuần:", $scope.soLuongTuan);
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
            });
    };

    // Hàm lọc và tính số lượng hóa đơn có trạng thái = 4 cho tháng này
    $scope.thang = function () {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tháng
        firstDayOfMonth.setHours(0, 0, 0, 0); // Đặt giờ về 0

        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng
        lastDayOfMonth.setHours(23, 59, 59, 999); // Đặt giờ đến cuối ngày

        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 4;

            const ngayCapNhat = new Date(item.ngayCapNhat);
            ngayCapNhat.setHours(0, 0, 0, 0); // Bỏ qua giờ, phút, giây khi so sánh

            return statusMatches && ngayCapNhat >= firstDayOfMonth && ngayCapNhat <= lastDayOfMonth;
        });

        $scope.donHangThang = filteredItems.length;
        $scope.doanhThuThang = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);

        const invoiceIds = filteredItems.map(item => item.id);

        $http.get('/hoa-don-chi-tiet') // API lấy tất cả hóa đơn chi tiết
            .then(function (response) {
                const allHoaDonChiTiet = response.data.data;
                const filteredItems2 = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));
                $scope.soLuongThang = filteredItems2.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                // Hiển thị thông tin
                console.log("Tổng số lượng của các hóa đơn chi tiết có trạng thái 4 trong tháng:", $scope.soLuongThang);
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
            });
    };

    $scope.nam = function () {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // Ngày đầu năm
        firstDayOfYear.setHours(0, 0, 0, 0);

        const lastDayOfYear = new Date(today.getFullYear(), 11, 31); // Ngày cuối năm
        lastDayOfYear.setHours(23, 59, 59, 999);

        // Lọc các hóa đơn có trạng thái = 4 và ngày cập nhật trong năm hiện tại
        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 4;

            const ngayCapNhat = new Date(item.ngayCapNhat);
            ngayCapNhat.setHours(0, 0, 0, 0); // Bỏ qua giờ, phút, giây khi so sánh

            return statusMatches && ngayCapNhat >= firstDayOfYear && ngayCapNhat <= lastDayOfYear;
        });

        $scope.donHangNam = filteredItems.length;
        $scope.doanhThuNam = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);

        const invoiceIds = filteredItems.map(item => item.id);

        // Lấy tất cả hóa đơn chi tiết
        $http.get('/hoa-don-chi-tiet') // API lấy tất cả hóa đơn chi tiết
            .then(function (response) {
                const allHoaDonChiTiet = response.data.data;
                const filteredItems2 = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));

                // Tính tổng số lượng của các hóa đơn chi tiết có trạng thái = 4 trong năm
                $scope.soLuongNam = filteredItems2.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                // Hiển thị thông tin
                console.log("Tổng số lượng của các hóa đơn chi tiết có trạng thái 4 trong năm:", $scope.soLuongNam);
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
            });
    };

    $scope.dsSP = function () {
        // Lấy danh sách sản phẩm chi tiết
        $http.get('/spct')
            .then(function (spctResponse) {
                const allSanPhamChiTiet = spctResponse.data.data;

                // Tổng hợp số lượng của từng sản phẩm (tính tổng số lượng của tất cả sản phẩm chi tiết có chung id sản phẩm)
                const productQuantityMap = {};

                allSanPhamChiTiet.forEach(spct => {
                    const productId = spct.idSanPham;  // idSanPham trong sản phẩm chi tiết
                    const quantity = spct.soLuong || 0; // Số lượng tồn kho của sản phẩm chi tiết

                    // Cộng dồn số lượng của tất cả sản phẩm chi tiết có chung id sản phẩm
                    productQuantityMap[productId] = (productQuantityMap[productId] || 0) + quantity;
                });

                // Gọi API lấy danh sách sản phẩm để lấy tên sản phẩm
                $http.get('/san-pham')
                    .then(function (spResponse) {
                        const allSanPham = spResponse.data.data;

                        // Gắn tên sản phẩm vào mỗi sản phẩm trong danh sách
                        $scope.allSanPhamWithTotalQuantity = Object.entries(productQuantityMap)
                            .map(([productId, totalQuantity]) => {
                                // Tìm sản phẩm theo idSanPham
                                const product = allSanPham.find(sp => sp.id === parseInt(productId));
                                return {
                                    productId,
                                    productName: product ? product.ten : 'Không tìm thấy tên sản phẩm',
                                    productMa: product ? product.ma : 'Không tìm thấy tên mã phẩm',
                                    totalQuantity,
                                    productGia: product ? product.gia : 'Không tìm thấy tên mã phẩm',
                                };
                            });

                        // Tính tổng số lượng của tất cả sản phẩm
                        $scope.totalQuantityAllProducts = $scope.allSanPhamWithTotalQuantity
                            .reduce((sum, sp) => sum + sp.totalQuantity, 0);

                        // Cài đặt phân trang
                        $scope.pageSize = 5; // Số lượng sản phẩm mỗi trang
                        $scope.currentPage = 1; // Trang hiện tại

                        // Tính tổng số trang
                        $scope.totalPages = Math.ceil($scope.allSanPhamWithTotalQuantity.length / $scope.pageSize);

                        // Hàm lấy danh sách sản phẩm cho trang hiện tại
                        $scope.getPageData = function () {
                            const startIndex = ($scope.currentPage - 1) * $scope.pageSize;
                            const endIndex = startIndex + $scope.pageSize;
                            return $scope.allSanPhamWithTotalQuantity.slice(startIndex, endIndex);
                        };

                        console.log("Danh sách sản phẩm với tổng số lượng từ tất cả sản phẩm chi tiết:", $scope.allSanPhamWithTotalQuantity);
                    })
                    .catch(function (error) {
                        console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
                    });
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm chi tiết:', error);
            });

        $http.get('/rest/hoadon')
            .then(function (response) {
                const allInvoices = response.data.data;

                // Lọc hóa đơn có trangThai === 4
                const filteredInvoices = allInvoices.filter(invoice => invoice.trangThai === 4);

                // Tính tổng của trường tongTien
                $scope.tongDoanhThu = filteredInvoices.reduce((sum, invoice) => {
                    return sum + (parseFloat(invoice.tongTien) || 0);
                }, 0);

                console.log("Tổng tiền của các hóa đơn có trạng thái là 4:", $scope.tongDoanhThu);
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu hóa đơn:', error);
            });
    };

    $scope.loadData = function () {
        $http.get('/rest/hoadon') // API lấy danh sách hóa đơn
            .then(function (response) {
                $scope.items = response.data.data; // Giả sử dữ liệu trả về là trong `data.data`
                $scope.ngay(); // Gọi hàm cập nhật sau khi dữ liệu được tải về
                $scope.tuan(); // Gọi hàm cập nhật sau khi dữ liệu được tải về
                $scope.thang(); // Gọi hàm cập nhật sau khi dữ liệu được tải về
                $scope.nam(); // Gọi hàm cập nhật sau khi dữ liệu được tải về
                $scope.ngayTaiQuay(); // Gọi hàm cập nhật sau khi dữ liệu được tải về
                $scope.tuanTaiQuay(); // Gọi hàm cập nhật sau khi dữ liệu được tải về
                $scope.thangTaiQuay(); // Gọi hàm cập nhật sau khi dữ liệu được tải về
                $scope.namTaiQuay();
                $scope.dsSP(); // Gọi hàm cập nhật sau khi dữ liệu được tải về
                $scope.danhSachSanPhamBanChay();
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
            });

        $http.get("/yeu-cau").then(resp => {
            const todayStart = new Date().setHours(0, 0, 0, 0); // Thời gian bắt đầu ngày hôm nay
            const todayEnd = new Date().setHours(23, 59, 59, 999); // Thời gian kết thúc ngày hôm nay

            $scope.yeuCauDoiTra = resp.data.data.filter(item =>
                item.trangThai === 0 &&
                new Date(item.ngayTao).setHours(0, 0, 0, 0) === todayStart
            );

            // Tổng số yêu cầu có trangThai = 0 và ngàyTao là hôm nay
            $scope.totalYeuCauNgay = $scope.yeuCauDoiTra.length;
        });

    };

    // Hàm riêng để lấy danh sách sản phẩm bán chạy cho 'all'

    $scope.loadData();

    $scope.renderTopProductsChart = function () {
        const ctx = document.getElementById('topProductsChart').getContext('2d');

        // Dữ liệu từ topSanPhamBanChay
        const labels = $scope.topSanPhamBanChay.map(product => product.tenSanPham); // Tên sản phẩm
        const data = $scope.topSanPhamBanChay.map(product => product.totalQuantity); // Số lượng bán
        const totalQuantity = data.reduce((sum, quantity) => sum + quantity, 0); // Tổng số lượng bán

        // Tạo màu sắc ngẫu nhiên cho từng sản phẩm
        const colors = labels.map(() => {
            const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            return randomColor;
        });

        new Chart(ctx, {
            type: 'pie', // Loại biểu đồ
            data: {
                labels: labels, // Danh sách tên sản phẩm
                datasets: [{
                    label: 'Top Sản Phẩm Bán Chạy',
                    data: data, // Số lượng bán
                    backgroundColor: colors, // Màu nền ngẫu nhiên
                    borderColor: '#ffffff', // Đường viền màu trắng
                    borderWidth: 2, // Độ rộng đường viền
                    hoverOffset: 10 // Hiệu ứng phóng to khi hover
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top', // Vị trí của chú thích
                        labels: {
                            color: '#333', // Màu chữ
                            font: {
                                size: 14, // Cỡ chữ
                                family: 'Arial, sans-serif' // Font chữ
                            },
                            padding: 20, // Khoảng cách giữa các mục chú thích
                            usePointStyle: true, // Hiển thị dưới dạng dấu chấm
                        }
                    },
                    tooltip: {
                        backgroundColor: '#000', // Nền của tooltip
                        titleColor: '#fff', // Màu tiêu đề
                        bodyColor: '#ddd', // Màu nội dung
                        titleFont: {
                            size: 16, // Cỡ chữ tiêu đề
                            family: 'Arial, sans-serif'
                        },
                        bodyFont: {
                            size: 14 // Cỡ chữ nội dung
                        },
                        padding: 10, // Khoảng cách bên trong tooltip
                        callbacks: {
                            label: function (tooltipItem) {
                                const quantity = tooltipItem.raw; // Số lượng của sản phẩm
                                const percentage = ((quantity / totalQuantity) * 100).toFixed(2); // Tính % sản phẩm
                                const label = tooltipItem.label; // Tên sản phẩm
                                return `${label}: ${quantity} sản phẩm (${percentage}%)`;
                            },
                            afterBody: function () {
                                return `Tổng: ${totalQuantity} sản phẩm`; // Hiển thị tổng sản phẩm trong tooltip
                            }
                        }
                    }
                }
            }
        });
    };

    $scope.showDatePicker = false;
    $scope.startDate = null;
    $scope.endDate = null;

    $scope.toggleDatePicker = function() {
        $scope.showDatePicker = !$scope.showDatePicker;
    };

    $scope.selectCustomTimeFrame = function() {
        if ($scope.startDate && $scope.endDate) {
            const startDate = new Date($scope.startDate);
            const endDate = new Date($scope.endDate);

            // Gọi filterAndCalculate để lọc và tính toán doanh thu, số lượng
            $scope.filterAndCalculate(startDate, endDate);
        }
    };

    $scope.filterAndCalculate = function(startDate, endDate) {
        // Lọc các đơn hàng trong khoảng thời gian đã chọn
        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 4;
            const ngayCapNhat = new Date(item.ngayCapNhat);
            return statusMatches && ngayCapNhat >= startDate && ngayCapNhat <= endDate;
        });
        // Tính doanh thu và số lượng cho khoảng thời gian này
        $scope.doanhThu = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);
        $scope.soLuong = filteredItems.reduce((total, item) => total + parseFloat(item.soLuong), 0);

        // Lấy danh sách sản phẩm từ API /san-pham
        $http.get('/san-pham')
            .then(function(sanPhamResponse) {
                const SanPham = sanPhamResponse.data.data;

                // Lấy chi tiết sản phẩm từ API /spct
                $http.get('/spct')
                    .then(function(spctResponse) {
                        const SanPhamChiTiet = spctResponse.data.data;

                        // Lấy danh sách hóa đơn chi tiết từ API /hoa-don-chi-tiet
                        $http.get('/hoa-don-chi-tiet')
                            .then(function(hdctResponse) {
                                const HoaDonChiTiet = hdctResponse.data.data;
                                const invoiceIds = filteredItems.map(item => item.id);
                                const filteredHdct = HoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));

                                // Tính tổng số lượng các sản phẩm bán ra
                                $scope.soLuongNgay = filteredHdct.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                                const productQuantity = {};

                                // Tính tổng số lượng của các sản phẩm
                                filteredHdct.forEach(hdctItem => {
                                    const spct = SanPhamChiTiet.find(spct => spct.id === hdctItem.idSanPhamChiTiet);
                                    if (spct) {
                                        const productId = spct.idSanPham;
                                        const quantity = parseFloat(hdctItem.soLuong);
                                        productQuantity[productId] = (productQuantity[productId] || 0) + quantity;
                                    }
                                });

                                // Chuyển sang mảng, gán tên sản phẩm và sắp xếp để lấy top 10 sản phẩm bán chạy
                                $scope.SanPhamBanChay = Object.entries(productQuantity)
                                    .map(([productId, totalQuantity]) => {
                                        const sanPham = SanPham.find(sp => sp.id === parseInt(productId));
                                        return {
                                            productId,
                                            totalQuantity,
                                            tenSanPham: sanPham ? sanPham.ten : 'N/A',
                                            maSanPham: sanPham ? sanPham.ma : 'N/A'
                                        };
                                    })
                                    .sort((a, b) => b.totalQuantity - a.totalQuantity)
                                    .slice(0, 10); // Lấy top 10 sản phẩm bán chạy nhất

                                // Lấy sản phẩm bán chạy nhất
                                $scope.SanPhamBanChayNhat = $scope.SanPhamBanChay[0];
                                $scope.renderTopProductsChart2();

                                console.log("Top 10 sản phẩm bán chạy nhất trong khoảng thời gian:", $scope.SanPhamBanChay);
                                console.log("Sản phẩm bán chạy nhất:", $scope.SanPhamBanChayNhat);
                            })
                            .catch(function(error) {
                                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
                            });
                    })
                    .catch(function(error) {
                        console.error('Lỗi khi lấy dữ liệu sản phẩm chi tiết:', error);
                    });
            })
            .catch(function(error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
            });

    };

    $scope.selectTimeFrame = function(timeFrame) {
        const today = new Date();
        let startDate, endDate, startDonHang, endDonHang;

        // Lấy ngày bắt đầu và kết thúc của khoảng thời gian đã chọn
        if (timeFrame === 'today') {
            startDate = new Date(today.setHours(0, 0, 0, 0));
            endDate = new Date(today.setHours(23, 59, 59, 999));
            startDonHang = new Date(today.setHours(0, 0, 0, 0));
            endDonHang = new Date(today.setHours(23, 59, 59, 999));
        } else if (timeFrame === 'week') {
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Chủ nhật tuần này
            startOfWeek.setHours(0, 0, 0, 0);
            startDate = startOfWeek;
            endDate = new Date(startOfWeek);
            endDate.setDate(startOfWeek.getDate() + 6); // Cuối tuần
            endDate.setHours(23, 59, 59, 999);

            const startOfWeekDH = new Date(today.setDate(today.getDate() - today.getDay())); // Chủ nhật tuần này
            startOfWeekDH.setHours(0, 0, 0, 0);
            startDonHang = startOfWeekDH;
            endDonHang = new Date(startOfWeekDH);
            endDonHang.setDate(startOfWeekDH.getDate() + 6); // Cuối tuần
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'month') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tháng
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng
            endDate.setHours(23, 59, 59, 999);

            startDonHang = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tháng
            startDonHang.setHours(0, 0, 0, 0);
            endDonHang = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'year') {
            startDate = new Date(today.getFullYear(), 0, 1); // Ngày đầu năm
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today.getFullYear(), 11, 31); // Ngày cuối năm
            endDate.setHours(23, 59, 59, 999);

            startDonHang = new Date(today.getFullYear(), 0, 1); // Ngày đầu năm
            startDonHang.setHours(0, 0, 0, 0);
            endDonHang = new Date(today.getFullYear(), 11, 31); // Ngày cuối năm
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'all') {
            // startDate = new Date(0);  // Không giới hạn ngày bắt đầu (Epoch start)
            startDate = new Date(0);  // Ngày bắt đầu hợp lý hơn
            endDate = new Date();    // Không giới hạn ngày kết thúc (hiện tại)

            startDonHang = new Date(0);  // Ngày bắt đầu hợp lý hơn
            endDonHang = new Date();    // Không giới hạn ngày kết thúc (hiện tại)
        }

        // Gọi filterAndCalculate để lọc và tính toán doanh thu, số lượng và danh sách sản phẩm bán chạy
        $scope.filterAndCalculate(startDate, endDate);
        $scope.filterAndCalculate(startDonHang, endDonHang);

    };

    $scope.renderTopProductsChart2 = function() {
        // Kiểm tra nếu biểu đồ đã tồn tại, hủy nó trước khi vẽ mới
        if ($scope.topProductsChart) {
            $scope.topProductsChart.destroy(); // Hủy bỏ biểu đồ cũ
        }

        // Dữ liệu cho biểu đồ
        const labels = $scope.SanPhamBanChay.map(product => product.tenSanPham);
        const quantities = $scope.SanPhamBanChay.map(product => product.totalQuantity);

        // Cấu hình biểu đồ
        const ctx = document.getElementById('topProductsChart2').getContext('2d');
        $scope.topProductsChart = new Chart(ctx, {
            type: 'bar',  // Loại biểu đồ: bar (cột)
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sản phẩm bán chạy',
                    data: quantities,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Màu nền của các cột
                    borderColor: 'rgba(75, 192, 192, 1)', // Màu viền của các cột
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Đảm bảo trục y bắt đầu từ 0
                    }
                }
            }
        });
    };

    //////////////////ĐƠN HÀNG/////////////////

    $scope.filterDonhang = function(startDate, endDate) {
        $scope.filteredItemsForChart = $scope.items.filter(item => {
            const ngayCapNhat = new Date(item.ngayCapNhat);
            return ngayCapNhat >= startDate && ngayCapNhat <= endDate;
        });

        // Đếm số lượng đơn hàng theo trạng thái trong dữ liệu đã lọc
        $scope.donHangDaGiao = $scope.filteredItemsForChart.filter(item => item.trangThai === 4).length;
        $scope.donHangDaHuy = $scope.filteredItemsForChart.filter(item => item.trangThai === 5).length;
        $scope.tongDonHang = $scope.filteredItemsForChart.length;
    };


    $scope.selectTimeFrame1 = function(timeFrame) {
        const today = new Date();
        let startDonHang, endDonHang;

        if (timeFrame === 'today') {
            startDonHang = new Date(today.setHours(0, 0, 0, 0));
            endDonHang = new Date(today.setHours(23, 59, 59, 999));
        } else if (timeFrame === 'week') {
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            startDonHang = new Date(startOfWeek.setHours(0, 0, 0, 0));
            endDonHang = new Date(today.setDate(startOfWeek.getDate() + 6));
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'month') {
            startDonHang = new Date(today.getFullYear(), today.getMonth(), 1);
            endDonHang = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'year') {
            startDonHang = new Date(today.getFullYear(), 0, 1);
            endDonHang = new Date(today.getFullYear(), 11, 31);
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'all') {
            startDonHang = new Date(0);
            endDonHang = new Date();
        }

        $scope.filterDonhang(startDonHang, endDonHang);
        $scope.renderTopProductsChart3();
    };

    $scope.selectCustomTimeFrameDonHang = function() {
        if ($scope.startDonHang && $scope.endDonHang) {
            const startDonHang = new Date($scope.startDonHang);
            const endDonHang = new Date($scope.endDonHang);

            $scope.filterDonhang(startDonHang, endDonHang);
            $scope.renderTopProductsChart3();
        }
    };

    $scope.donHang = false;
    $scope.startDonHang = null;
    $scope.endDonHang = null;

    $scope.locDonHang = function() {
        $scope.donHang = !$scope.donHang;
    };




    $scope.renderTopProductsChart3 = function() {
        if (!$scope.filteredItemsForChart || $scope.filteredItemsForChart.length === 0) {
            console.log('Không có dữ liệu để vẽ biểu đồ.');
            return;
        }

        // Đếm số lượng đơn hàng theo trạng thái
        const countTrangThai4 = $scope.filteredItemsForChart.filter(item => item.trangThai === 4).length;
        const countTrangThai5 = $scope.filteredItemsForChart.filter(item => item.trangThai === 5).length;
        const countTrangThai0 = $scope.filteredItemsForChart.filter(item => item.trangThai === 0).length;
        const countTrangThai2 = $scope.filteredItemsForChart.filter(item => item.trangThai === 2).length;
        const countTrangThai3 = $scope.filteredItemsForChart.filter(item => item.trangThai === 3).length;
        const countTrangThai7 = $scope.filteredItemsForChart.filter(item => item.trangThai === 7).length;


        // Dữ liệu cho biểu đồ
        const labels = ['Đã giao', 'Đã hủy', 'Chờ xác nhận', 'Chờ vận chuyển', 'Đang vận chuyển', 'Tại quầy'];
        const data = [countTrangThai4, countTrangThai5, countTrangThai0, countTrangThai2, countTrangThai3 ,countTrangThai7];

        // Hủy biểu đồ cũ nếu tồn tại
        if ($scope.topProductsChart) {
            $scope.topProductsChart.destroy();
        }

        // Cấu hình và vẽ biểu đồ
        const ctx = document.getElementById('topProductsChart3').getContext('2d');
        $scope.topProductsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Số lượng đơn hàng',
                    data: data,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(220,18,18,0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(220,18,18,0.6)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    };

//////////////////// đơn hàng//////////////////////////
    $scope.danhSachSanPhamBanChay = function () {
        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 4;
            return statusMatches;
        });

        const filteredItems2 = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 7;
            return statusMatches;
        });

        const invoiceIds = filteredItems.map(item => item.id);
        const invoiceIds2 = filteredItems2.map(item => item.id);

        // Lấy danh sách sản phẩm từ API /san-pham
        $http.get('/san-pham')
            .then(function (sanPhamResponse) {
                const allSanPham = sanPhamResponse.data.data;

                $http.get('/spct')
                    .then(function (spctResponse) {
                        const allSanPhamChiTiet = spctResponse.data.data;

                        $http.get('/hoa-don-chi-tiet')
                            .then(function (hdctResponse) {
                                const allHoaDonChiTiet = hdctResponse.data.data;
                                const filteredHdctItems = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));
                                const filteredHdctItems2 = allHoaDonChiTiet.filter(item => invoiceIds2.includes(item.idHoaDon));

                                const productQuantityMap = {};
                                filteredHdctItems.forEach(hdctItem => {
                                    const spct = allSanPhamChiTiet.find(spct => spct.id === hdctItem.idSanPhamChiTiet);
                                    if (spct) {
                                        const productId = spct.idSanPham;
                                        const quantity = parseFloat(hdctItem.soLuong);
                                        productQuantityMap[productId] = (productQuantityMap[productId] || 0) + quantity;
                                    }
                                });

                                const productQuantityMap2 = {};
                                filteredHdctItems2.forEach(hdctItem => {
                                    const spct = allSanPhamChiTiet.find(spct => spct.id === hdctItem.idSanPhamChiTiet);
                                    if (spct) {
                                        const productId = spct.idSanPham;
                                        const quantity = parseFloat(hdctItem.soLuong);
                                        productQuantityMap2[productId] = (productQuantityMap2[productId] || 0) + quantity;
                                    }
                                });

                                // Chuyển sang mảng, gán tên sản phẩm và sắp xếp để lấy top 10 sản phẩm bán chạy
                                $scope.danhSachSanPhamBanChay = Object.entries(productQuantityMap)
                                    .map(([productId, totalQuantity]) => {
                                        const sanPham = allSanPham.find(sp => sp.id === parseInt(productId));
                                        return { productId, totalQuantity, tenSanPham: sanPham ? sanPham.ten : 'N/A', maSanPham: sanPham ? sanPham.ma : 'N/A' };
                                    })
                                    .sort((a, b) => b.totalQuantity - a.totalQuantity)
                                    .slice(0, 100);

                                $scope.danhSachSanPhamBanChayTaiQuay = Object.entries(productQuantityMap2)
                                    .map(([productId, totalQuantity]) => {
                                        const sanPham = allSanPham.find(sp => sp.id === parseInt(productId));
                                        return { productId, totalQuantity, tenSanPham: sanPham ? sanPham.ten : 'N/A', maSanPham: sanPham ? sanPham.ma : 'N/A' };
                                    })
                                    .sort((a, b) => b.totalQuantity - a.totalQuantity)
                                    .slice(0, 100);

                                // Phân trang cho top 10 sản phẩm bán chạy
                                $scope.sanPhamSize = 5; // Số lượng sản phẩm mỗi trang
                                $scope.sanPhamPage = 1; // Trang hiện tại

                                // Tính tổng số trang
                                $scope.SanPhamPages = Math.ceil($scope.danhSachSanPhamBanChay.length / $scope.sanPhamSize);

                                // Hàm lấy danh sách sản phẩm cho trang hiện tại
                                $scope.getPageData2 = function () {
                                    const startIndex = ($scope.sanPhamPage - 1) * $scope.sanPhamSize;
                                    const endIndex = startIndex + $scope.sanPhamSize;
                                    return $scope.danhSachSanPhamBanChay.slice(startIndex, endIndex);
                                };

                                $scope.sanPhamSize2 = 5; // Số lượng sản phẩm mỗi trang
                                $scope.sanPhamPage2 = 1; // Trang hiện tại

                                // Tính tổng số trang
                                $scope.SanPhamPages2 = Math.ceil($scope.danhSachSanPhamBanChayTaiQuay.length / $scope.sanPhamSize2);

                                // Hàm lấy danh sách sản phẩm cho trang hiện tại
                                $scope.getPageData5 = function () {
                                    const startIndex = ($scope.sanPhamPage2 - 1) * $scope.sanPhamSize2;
                                    const endIndex = startIndex + $scope.sanPhamSize2;
                                    return $scope.danhSachSanPhamBanChayTaiQuay.slice(startIndex, endIndex);
                                };
                            })
                            .catch(function (error) {
                                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
                            });
                    })
                    .catch(function (error) {
                        console.error('Lỗi khi lấy dữ liệu sản phẩm chi tiết:', error);
                    });
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
            });
    };

    $scope.exportExcel = function () {
        // Sheet 1: Dữ liệu doanh thu và đơn hàng
        const currentDateTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        const data1 = [
            { Loại: 'Đơn Hàng Đã Giao', Số_Lượng: $scope.donHangNgay },
            { Loại: 'Đơn Hàng Chờ', Số_Lượng: $scope.donHangCho },
            { Loại: 'Đơn Hàng Hủy', Số_Lượng: $scope.donHangHuy },
            {
                Loại: 'Doanh Thu',
                Tổng: $scope.doanhThuNgay.toLocaleString('vi-VN') + ' đ' // Định dạng với dấu chấm và thêm "đ"
            },
            { Loại: '', },
            { Loại: 'Thời gian xuất', currentDateTime },
        ];

        // Sheet 2: Top 10 Sản Phẩm Bán Chạy
        const data2 = $scope.topSanPhamBanChay.map((sp, index) => ({
            STT: index + 1,
            Tên_Sản_Phẩm: sp.tenSanPham,
            Mã_Sản_Phẩm: sp.maSanPham,
            Số_Lượng_Bán: sp.totalQuantity,
            Giá_Bán: sp.giaSanPham.toLocaleString('vi-VN') + ' đ',
        }));
        const data3 = $scope.allSanPhamWithTotalQuantity.map((sp, index) => ({
            STT: index + 1,
            Tên_Sản_Phẩm: sp.productName,
            Mã_Sản_Phẩm: sp.productMa,
            Số_Lượng_Còn: sp.totalQuantity,
            Giá_Bán: sp.productGia.toLocaleString('vi-VN') + ' đ',
        }));

        // Tạo workbook và các sheet
        const worksheet1 = XLSX.utils.json_to_sheet(data1); // Sheet Doanh Thu
        const worksheet2 = XLSX.utils.json_to_sheet(data2); // Sheet Top Sản Phẩm
        const worksheet3 = XLSX.utils.json_to_sheet(data3); // Sheet Top Sản Phẩm

        // Tạo workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet1, 'Báo Cáo Doanh Thu');
        XLSX.utils.book_append_sheet(workbook, worksheet2, 'Sản Phẩm Bán');
        XLSX.utils.book_append_sheet(workbook, worksheet3, 'Sản Phẩm Còn');

        // Xuất file Excel
        XLSX.writeFile(workbook, `bao_cao_doanh_thu_${currentDateTime}.xlsx`);
    };

    /////////////////////////// Tại quầy ////////////////////////
    $scope.ngayTaiQuay = function () {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 7;
            const ngayCapNhat = new Date(item.ngayCapNhat);
            ngayCapNhat.setHours(0, 0, 0, 0);
            return statusMatches && ngayCapNhat.getTime() === todayStart.getTime();
        });


        $scope.donHangNgayTaiQuay = filteredItems.length;
        $scope.doanhThuNgayTaiQuay = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);

        const invoiceIds = filteredItems.map(item => item.id);

        // Lấy danh sách sản phẩm từ API /san-pham
        $http.get('/san-pham')
            .then(function (sanPhamResponse) {
                const allSanPham = sanPhamResponse.data.data;


                $http.get('/spct')
                    .then(function (spctResponse) {
                        const allSanPhamChiTiet = spctResponse.data.data;

                        $http.get('/hoa-don-chi-tiet')
                            .then(function (hdctResponse) {
                                const allHoaDonChiTiet = hdctResponse.data.data;
                                const filteredHdctItems = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));
                                $scope.soLuongNgayTaiQuay = filteredHdctItems.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                                const productQuantityMap = {};
                                filteredHdctItems.forEach(hdctItem => {
                                    const spct = allSanPhamChiTiet.find(spct => spct.id === hdctItem.idSanPhamChiTiet);
                                    if (spct) {
                                        const productId = spct.idSanPham;
                                        const quantity = parseFloat(hdctItem.soLuong);
                                        productQuantityMap[productId] = (productQuantityMap[productId] || 0) + quantity;
                                    }
                                });

                                // Chuyển sang mảng, gán tên sản phẩm và sắp xếp để lấy top 10 sản phẩm bán chạy
                                $scope.topSanPhamBanChayTaiQuay = Object.entries(productQuantityMap)
                                    .map(([productId, totalQuantity]) => {
                                        const sanPham = allSanPham.find(sp => sp.id === parseInt(productId));
                                        return { productId, totalQuantity, tenSanPham: sanPham ? sanPham.ten : 'N/A', maSanPham: sanPham ? sanPham.ma : 'N/A'
                                            , giaSanPham: sanPham ? sanPham.gia : 'N/A'};
                                    })
                                    .sort((a, b) => b.totalQuantity - a.totalQuantity)
                                    .slice(0, 10);

                                $scope.renderTopProductsChart(); // Hiển thị biểu đồ sau khi tính toán xong

                                // Lấy sản phẩm bán chạy nhất
                                $scope.topSanPhamBanChayNhatTaiQuay = $scope.topSanPhamBanChayTaiQuay[0];

                                // Phân trang cho top 10 sản phẩm bán chạy
                                $scope.Size = 5; // Số lượng sản phẩm mỗi trang
                                $scope.Page = 1; // Trang hiện tại

                                // Tính tổng số trang
                                $scope.Pages = Math.ceil($scope.topSanPhamBanChayTaiQuay.length / $scope.Size);

                                // Hàm lấy danh sách sản phẩm cho trang hiện tại
                                $scope.getPageData3 = function () {
                                    const startIndex = ($scope.Page - 1) * $scope.Size;
                                    const endIndex = startIndex + $scope.Size;
                                    return $scope.topSanPhamBanChayTaiQuay.slice(startIndex, endIndex);
                                };

                                console.log("Top 10 sản phẩm bán chạy nhất trong ngày:", $scope.topSanPhamBanChayTaiQuay);
                                console.log("Sản phẩm bán chạy nhất:", $scope.topSanPhamBanChayNhatTaiQuay);
                            })
                            .catch(function (error) {
                                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
                            });
                    })
                    .catch(function (error) {
                        console.error('Lỗi khi lấy dữ liệu sản phẩm chi tiết:', error);
                    });
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
            });
    };

    // Hàm lọc và tính số lượng hóa đơn có trạng thái = 4 cho tuần này
    $scope.tuanTaiQuay = function () {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Chủ nhật là 0, thứ 2 là 1, ...

        // Tính ngày đầu tuần (Chủ nhật hoặc thứ hai tùy thuộc vào hệ thống)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek); // Lùi lại số ngày từ Chủ nhật

        startOfWeek.setHours(0, 0, 0, 0); // Đặt giờ về 0

        // Tính ngày cuối tuần (thường là thứ 7)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Thêm 6 ngày

        endOfWeek.setHours(23, 59, 59, 999); // Đặt giờ đến cuối ngày

        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 7 ;

            const ngayCapNhat = new Date(item.ngayCapNhat);
            ngayCapNhat.setHours(0, 0, 0, 0); // Bỏ qua giờ, phút, giây khi so sánh

            return statusMatches && ngayCapNhat >= startOfWeek && ngayCapNhat <= endOfWeek;
        });

        $scope.donHangTuanTaiQuay = filteredItems.length;
        $scope.doanhThuTuanTaiQuay = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);

        const invoiceIds = filteredItems.map(item => item.id);

        $http.get('/hoa-don-chi-tiet') // API lấy tất cả hóa đơn chi tiết
            .then(function (response) {
                const allHoaDonChiTiet = response.data.data;
                const filteredItems2 = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));
                $scope.soLuongTuanTaiQuay = filteredItems2.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                // Hiển thị thông tin
                console.log("Tổng số lượng của các hóa đơn chi tiết có trạng thái 4 trong tuần:", $scope.soLuongTuan);
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
            });
    };

    // Hàm lọc và tính số lượng hóa đơn có trạng thái =  cho tháng này
    $scope.thangTaiQuay = function () {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tháng
        firstDayOfMonth.setHours(0, 0, 0, 0); // Đặt giờ về 0

        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng
        lastDayOfMonth.setHours(23, 59, 59, 999); // Đặt giờ đến cuối ngày

        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 7 ;

            const ngayCapNhat = new Date(item.ngayCapNhat);
            ngayCapNhat.setHours(0, 0, 0, 0); // Bỏ qua giờ, phút, giây khi so sánh

            return statusMatches && ngayCapNhat >= firstDayOfMonth && ngayCapNhat <= lastDayOfMonth;
        });

        $scope.donHangThangTaiQuay = filteredItems.length;
        $scope.doanhThuThangTaiQuay = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);

        const invoiceIds = filteredItems.map(item => item.id);

        $http.get('/hoa-don-chi-tiet') // API lấy tất cả hóa đơn chi tiết
            .then(function (response) {
                const allHoaDonChiTiet = response.data.data;
                const filteredItems2 = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));
                $scope.soLuongThangTaiQuay = filteredItems2.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                // Hiển thị thông tin
                console.log("Tổng số lượng của các hóa đơn chi tiết có trạng thái 4 trong tháng:", $scope.soLuongThang);
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
            });
    };

    $scope.namTaiQuay = function () {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // Ngày đầu năm
        firstDayOfYear.setHours(0, 0, 0, 0);

        const lastDayOfYear = new Date(today.getFullYear(), 11, 31); // Ngày cuối năm
        lastDayOfYear.setHours(23, 59, 59, 999);

        // Lọc các hóa đơn có trạng thái =  và ngày cập nhật trong năm hiện tại
        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 7;

            const ngayCapNhat = new Date(item.ngayCapNhat);
            ngayCapNhat.setHours(0, 0, 0, 0); // Bỏ qua giờ, phút, giây khi so sánh

            return statusMatches && ngayCapNhat >= firstDayOfYear && ngayCapNhat <= lastDayOfYear;
        });

        $scope.donHangNamTaiQuay = filteredItems.length;
        $scope.doanhThuNamTaiQuay = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);

        const invoiceIds = filteredItems.map(item => item.id);

        // Lấy tất cả hóa đơn chi tiết
        $http.get('/hoa-don-chi-tiet') // API lấy tất cả hóa đơn chi tiết
            .then(function (response) {
                const allHoaDonChiTiet = response.data.data;
                const filteredItems2 = allHoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));

                // Tính tổng số lượng của các hóa đơn chi tiết có trạng thái = 4 trong năm
                $scope.soLuongNamTaiQuay = filteredItems2.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                // Hiển thị thông tin
                console.log("Tổng số lượng của các hóa đơn chi tiết có trạng thái 4 trong năm:", $scope.soLuongNam);
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
            });
    };

    $scope.selectTimeFrameTaiQuay = function(timeFrame) {
        const today = new Date();
        let startDate, endDate, startDonHang, endDonHang;

        // Lấy ngày bắt đầu và kết thúc của khoảng thời gian đã chọn
        if (timeFrame === 'today') {
            startDate = new Date(today.setHours(0, 0, 0, 0));
            endDate = new Date(today.setHours(23, 59, 59, 999));
            startDonHang = new Date(today.setHours(0, 0, 0, 0));
            endDonHang = new Date(today.setHours(23, 59, 59, 999));
        } else if (timeFrame === 'week') {
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Chủ nhật tuần này
            startOfWeek.setHours(0, 0, 0, 0);
            startDate = startOfWeek;
            endDate = new Date(startOfWeek);
            endDate.setDate(startOfWeek.getDate() + 6); // Cuối tuần
            endDate.setHours(23, 59, 59, 999);

            const startOfWeekDH = new Date(today.setDate(today.getDate() - today.getDay())); // Chủ nhật tuần này
            startOfWeekDH.setHours(0, 0, 0, 0);
            startDonHang = startOfWeekDH;
            endDonHang = new Date(startOfWeekDH);
            endDonHang.setDate(startOfWeekDH.getDate() + 6); // Cuối tuần
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'month') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tháng
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng
            endDate.setHours(23, 59, 59, 999);

            startDonHang = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày đầu tháng
            startDonHang.setHours(0, 0, 0, 0);
            endDonHang = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'year') {
            startDate = new Date(today.getFullYear(), 0, 1); // Ngày đầu năm
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today.getFullYear(), 11, 31); // Ngày cuối năm
            endDate.setHours(23, 59, 59, 999);

            startDonHang = new Date(today.getFullYear(), 0, 1); // Ngày đầu năm
            startDonHang.setHours(0, 0, 0, 0);
            endDonHang = new Date(today.getFullYear(), 11, 31); // Ngày cuối năm
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'all') {
            // startDate = new Date(0);  // Không giới hạn ngày bắt đầu (Epoch start)
            startDate = new Date(0);  // Ngày bắt đầu hợp lý hơn
            endDate = new Date();    // Không giới hạn ngày kết thúc (hiện tại)

            startDonHang = new Date(0);  // Ngày bắt đầu hợp lý hơn
            endDonHang = new Date();    // Không giới hạn ngày kết thúc (hiện tại)
        }

        // Gọi filterAndCalculate để lọc và tính toán doanh thu, số lượng và danh sách sản phẩm bán chạy
        $scope.filterAndCalculateTaiQuay(startDate, endDate);
        $scope.filterAndCalculateTaiQuay(startDonHang, endDonHang);

    };

    $scope.filterAndCalculateTaiQuay = function(startDate, endDate) {
        // Lọc các đơn hàng trong khoảng thời gian đã chọn
        const filteredItems = $scope.items.filter(item => {
            const statusMatches = item.trangThai === 7;
            const ngayCapNhat = new Date(item.ngayCapNhat);
            return statusMatches && ngayCapNhat >= startDate && ngayCapNhat <= endDate;
        });
        // Tính doanh thu và số lượng cho khoảng thời gian này
        $scope.doanhThuTaiQuay = filteredItems.reduce((total, item) => total + parseFloat(item.tongTien), 0);
        $scope.soLuongTaiQuay = filteredItems.reduce((total, item) => total + parseFloat(item.soLuong), 0);

        // Lấy danh sách sản phẩm từ API /san-pham
        $http.get('/san-pham')
            .then(function(sanPhamResponse) {
                const SanPham = sanPhamResponse.data.data;

                // Lấy chi tiết sản phẩm từ API /spct
                $http.get('/spct')
                    .then(function(spctResponse) {
                        const SanPhamChiTiet = spctResponse.data.data;

                        // Lấy danh sách hóa đơn chi tiết từ API /hoa-don-chi-tiet
                        $http.get('/hoa-don-chi-tiet')
                            .then(function(hdctResponse) {
                                const HoaDonChiTiet = hdctResponse.data.data;
                                const invoiceIds = filteredItems.map(item => item.id);
                                const filteredHdct = HoaDonChiTiet.filter(item => invoiceIds.includes(item.idHoaDon));

                                // Tính tổng số lượng các sản phẩm bán ra
                                $scope.soLuongNgayTaiQuay = filteredHdct.reduce((total, item) => total + parseFloat(item.soLuong), 0);

                                const productQuantity = {};

                                // Tính tổng số lượng của các sản phẩm
                                filteredHdct.forEach(hdctItem => {
                                    const spct = SanPhamChiTiet.find(spct => spct.id === hdctItem.idSanPhamChiTiet);
                                    if (spct) {
                                        const productId = spct.idSanPham;
                                        const quantity = parseFloat(hdctItem.soLuong);
                                        productQuantity[productId] = (productQuantity[productId] || 0) + quantity;
                                    }
                                });

                                // Chuyển sang mảng, gán tên sản phẩm và sắp xếp để lấy top 10 sản phẩm bán chạy
                                $scope.SanPhamBanChayTaiQuay = Object.entries(productQuantity)
                                    .map(([productId, totalQuantity]) => {
                                        const sanPham = SanPham.find(sp => sp.id === parseInt(productId));
                                        return {
                                            productId,
                                            totalQuantity,
                                            tenSanPham: sanPham ? sanPham.ten : 'N/A',
                                            maSanPham: sanPham ? sanPham.ma : 'N/A'
                                        };
                                    })
                                    .sort((a, b) => b.totalQuantity - a.totalQuantity)
                                    .slice(0, 10); // Lấy top 10 sản phẩm bán chạy nhất

                                // Lấy sản phẩm bán chạy nhất
                                $scope.SanPhamBanChayNhatTaiQuay = $scope.SanPhamBanChayTaiQuay[0];
                                $scope.renderTopProductsChart4();

                                console.log("Top 10 sản phẩm bán chạy nhất trong khoảng thời gian:", $scope.SanPhamBanChayTaiQuay);
                                console.log("Sản phẩm bán chạy nhất:", $scope.SanPhamBanChayNhatTaiQuay);
                            })
                            .catch(function(error) {
                                console.error('Lỗi khi lấy dữ liệu hóa đơn chi tiết:', error);
                            });
                    })
                    .catch(function(error) {
                        console.error('Lỗi khi lấy dữ liệu sản phẩm chi tiết:', error);
                    });
            })
            .catch(function(error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
            });

    };

    $scope.selectCustomTimeFrameTaiQuay = function() {
        if ($scope.startDate && $scope.endDate) {
            const startDate = new Date($scope.startDate);
            const endDate = new Date($scope.endDate);

            // Gọi filterAndCalculate để lọc và tính toán doanh thu, số lượng
            $scope.filterAndCalculateTaiQuay(startDate, endDate);
        }
    };

    $scope.renderTopProductsChart4 = function() {
        // Kiểm tra nếu biểu đồ đã tồn tại, hủy nó trước khi vẽ mới
        if ($scope.topProductsChart) {
            $scope.topProductsChart.destroy(); // Hủy bỏ biểu đồ cũ
        }

        // Dữ liệu cho biểu đồ
        const labels = $scope.SanPhamBanChayTaiQuay.map(product => product.tenSanPham);
        const quantities = $scope.SanPhamBanChayTaiQuay.map(product => product.totalQuantity);

        // Cấu hình biểu đồ
        const ctx = document.getElementById('topProductsChart4').getContext('2d');
        $scope.topProductsChart = new Chart(ctx, {
            type: 'bar',  // Loại biểu đồ: bar (cột)
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sản phẩm bán chạy',
                    data: quantities,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Màu nền của các cột
                    borderColor: 'rgba(75, 192, 192, 1)', // Màu viền của các cột
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Đảm bảo trục y bắt đầu từ 0
                    }
                }
            }
        });
    };

    $scope.selectTimeFrame1TaiQuay = function(timeFrame) {
        const today = new Date();
        let startDonHang, endDonHang;

        if (timeFrame === 'today') {
            startDonHang = new Date(today.setHours(0, 0, 0, 0));
            endDonHang = new Date(today.setHours(23, 59, 59, 999));
        } else if (timeFrame === 'week') {
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            startDonHang = new Date(startOfWeek.setHours(0, 0, 0, 0));
            endDonHang = new Date(today.setDate(startOfWeek.getDate() + 6));
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'month') {
            startDonHang = new Date(today.getFullYear(), today.getMonth(), 1);
            endDonHang = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'year') {
            startDonHang = new Date(today.getFullYear(), 0, 1);
            endDonHang = new Date(today.getFullYear(), 11, 31);
            endDonHang.setHours(23, 59, 59, 999);
        } else if (timeFrame === 'all') {
            startDonHang = new Date(0);
            endDonHang = new Date();
        }

        $scope.filterDonhangTaiQuay(startDonHang, endDonHang);
        $scope.renderTopProductsChart5();
    };

    $scope.filterDonhangTaiQuay = function(startDate, endDate) {
        $scope.filteredItemsForChartTaiQuay = $scope.items.filter(item => {
            const ngayCapNhat = new Date(item.ngayCapNhat);
            return ngayCapNhat >= startDate && ngayCapNhat <= endDate;
        });
        $scope.donHangThanhCongOnline = $scope.filteredItemsForChartTaiQuay.filter(item => item.trangThai === 5).length;
        // Đếm số lượng đơn hàng theo trạng thái trong dữ liệu đã lọc
        $scope.donHangThanhCongTaiQuay = $scope.filteredItemsForChartTaiQuay.filter(item => item.trangThai === 7).length;
    };

    $scope.renderTopProductsChart5 = function() {
        if (!$scope.filteredItemsForChartTaiQuay || $scope.filteredItemsForChartTaiQuay.length === 0) {
            console.log('Không có dữ liệu để vẽ biểu đồ.');
            return;
        }

        // Đếm số lượng đơn hàng theo trạng thái
        const countTrangThai5 = $scope.filteredItemsForChartTaiQuay.filter(item => item.trangThai === 5).length;
        const countTrangThai7 = $scope.filteredItemsForChartTaiQuay.filter(item => item.trangThai === 7).length;

        // Dữ liệu cho biểu đồ
        const labels = ['Tại quầy','Online'];
        const data = [ countTrangThai7, countTrangThai5];

        // Hủy biểu đồ cũ nếu tồn tại
        if ($scope.topProductsChart) {
            $scope.topProductsChart.destroy();
        }

        // Cấu hình và vẽ biểu đồ
        const ctx = document.getElementById('topProductsChart5').getContext('2d');
        $scope.topProductsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Số lượng đơn hàng',
                    data: data,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    };

    $scope.selectCustomTimeFrameDonHangTaiQuay = function() {
        if ($scope.startDonHang && $scope.endDonHang) {
            const startDonHang = new Date($scope.startDonHang);
            const endDonHang = new Date($scope.endDonHang);

            $scope.filterDonhangTaiQuay(startDonHang, endDonHang);
            $scope.renderTopProductsChart5();
        }
    };

    /////////////////////////// yêu câù đổi trả /////////////////////


});
