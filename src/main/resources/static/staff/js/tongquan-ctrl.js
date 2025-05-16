app.controller("tongquan-ctrl", function ($scope, $http, $filter) {
    // Lấy ngày bắt đầu và kết thúc của ngày hôm nay, tuần này, tháng này, năm nay
    let today = new Date();
    let startToday = $filter('date')(new Date(), "yyyy-MM-ddT00:00:00");
    let endToday = $filter('date')(new Date(), "yyyy-MM-ddT23:59:59");

    let startOfWeek = $filter('date')(new Date(today.setDate(today.getDate() - today.getDay())), "yyyy-MM-ddT00:00:00");
    let endOfWeek = $filter('date')(new Date(today.setDate(today.getDate() - today.getDay() + 6)), "yyyy-MM-ddT23:59:59");

    let startOfMonth = $filter('date')(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-ddT00:00:00");
    let endOfMonth = $filter('date')(new Date(today.getFullYear(), today.getMonth() + 1, 0), "yyyy-MM-ddT23:59:59");

    let startOfYear = $filter('date')(new Date(today.getFullYear(), 0, 1), "yyyy-MM-ddT00:00:00");
    let endOfYear = $filter('date')(new Date(today.getFullYear(), 11, 31), "yyyy-MM-ddT23:59:59");

    // Khởi tạo và tải dữ liệu
    $scope.initialize = function () {
        $http.get(`/hoa-don-chi-tiet/thong-ke-don-hang`, {
            params: {startDate: startToday, endDate: endToday}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.choXacNhan = result.data.choXacNhan || 0;
                $scope.choGiaoHang = result.data.choGiaoHang || 0;
                $scope.dangGiaoHang = result.data.dangGiaoHang || 0;
                $scope.daGiao = result.data.daGiao || 0;
                $scope.daHuy = result.data.daHuy || 0;
                $scope.taiQuay = result.data.taiQuay || 0;
                $scope.YeuCauDoiTraChoXacNhan = result.data.YeuCauDoiTraChoXacNhan || 0;
                $scope.YeuCauDoiTraHuy = result.data.YeuCauDoiTraHuy || 0;
                $scope.YeuCauDoiTraXacNhan = result.data.YeuCauDoiTraXacNhan || 0;

            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API thống kê đơn hàng: ", error);
        });

        // Tính toán tỷ lệ doanh thu online và offline
        $scope.calculatePercentage = function (onlineValue, offlineValue) {
            let total = onlineValue + offlineValue;
            if (total === 0) return {online: 0, offline: 0};
            return {
                online: ((onlineValue / total) * 100).toFixed(2),
                offline: ((offlineValue / total) * 100).toFixed(2)
            };
        };

        // Theo dõi các thay đổi trong doanh thu online và offline
        $scope.$watchGroup(['doanhThuTodayOnline1', 'doanhThuTodayOffline1'], function (newValues) {
            if (newValues[0] !== undefined && newValues[1] !== undefined) {
                $scope.doanhThuPercentage = $scope.calculatePercentage(newValues[0], newValues[1]);
                $scope.createChartOnline();  // Tạo biểu đồ sau khi tỷ lệ đã được tính toán
            }
        });

        $scope.$watchGroup(['soLuongBanRaTodayOnline1', 'soLuongBanRaTodayOffline1'], function (newValues) {
            if (newValues[0] !== undefined && newValues[1] !== undefined) {
                $scope.soLuongBanPercentage = $scope.calculatePercentage(newValues[0], newValues[1]);
                $scope.createChartOnline();  // Tạo biểu đồ sau khi tỷ lệ đã được tính toán
            }
        });

        $scope.$watchGroup(['soLuongHoaDonTodayOnline1', 'soLuongHoaDonTodayOffline1'], function (newValues) {
            if (newValues[0] !== undefined && newValues[1] !== undefined) {
                $scope.soLuongHoaDonPercentage = $scope.calculatePercentage(newValues[0], newValues[1]);
                $scope.createChartOnline();  // Tạo biểu đồ sau khi tỷ lệ đã được tính toán
            }
        });

        $scope.$watchGroup([
            'choXacNhan1',
            'choGiaoHang1',
            'dangGiaoHang1',
            'daGiao1',
            'daHuy1',
            'taiQuay1',
            'YeuCauDoiTraChoXacNhan1',
            'YeuCauDoiTraHuy1',
            'YeuCauDoiTraXacNhan1'
        ], function (newValues) {
            // Kiểm tra nếu tất cả giá trị đã được cập nhật
            if (newValues.every(value => value !== undefined)) {
                $scope.createChartOnline(); // Tạo biểu đồ khi dữ liệu thay đổi
            }
        });

        $scope.isDatePickerVisible = false;  // Ẩn/hiện ô chọn ngày

        // Hàm toggle để hiển thị/ẩn ô chọn ngày
        $scope.toggleDatePicker = function () {
            $scope.isDatePickerVisible = !$scope.isDatePickerVisible;
        };
        // Hàm gọi API để lấy dữ liệu thống kê
        $scope.itemsPerPageOnline1 = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageOnline1 = 1; // Trang hiện tại
        $scope.totalItemsOnline1 = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.chiTietSanPhamPageOnline1 = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataOnline1 = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPageOnline1 - 1) * $scope.itemsPerPageOnline1;
            const end = $scope.currentPageOnline1 * $scope.itemsPerPageOnline1;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.chiTietSanPhamPageOnline1 = $scope.chiTietSanPhamOnline1.slice(start, end);
        };

        $scope.itemsPerPageKHOnline1 = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageKHOnline1 = 1; // Trang hiện tại
        $scope.totalItemsKHOnline1 = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.chiTietKhachHangPageOnline1 = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataKHOnline1 = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPageKHOnline1 - 1) * $scope.itemsPerPageKHOnline1;
            const end = $scope.currentPageKHOnline1 * $scope.itemsPerPageKHOnline1;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.chiTietKhachHangPageOnline1 = $scope.chiTietKhachHangOnline1.slice(start, end);
        };

        $scope.itemsPerPage1 = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPage1 = 1; // Trang hiện tại
        $scope.totalItems1 = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.chiTietSanPhamPageOffline1 = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataOffline1 = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPage1 - 1) * $scope.itemsPerPage1;
            const end = $scope.currentPage1 * $scope.itemsPerPage1;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.chiTietSanPhamPageOffline1 = $scope.chiTietSanPhamOffline1.slice(start, end);
        };

        $scope.itemsPerPageKHOF1 = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageKHOF1 = 1; // Trang hiện tại
        $scope.totalItemsKHOF1 = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.chiTietKhachHangPageOffline1 = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataKHOffline1 = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPage1 - 1) * $scope.itemsPerPage1;
            const end = $scope.currentPage1 * $scope.itemsPerPage1;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.chiTietKhachHangPageOffline1 = $scope.chiTietKhachHangOffline1.slice(start, end);
        };

        $scope.itemsPerPageDH = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageDH = 1; // Trang hiện tại
        $scope.totalItemsDH = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.dsSanPhamDoiPage = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataDH = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPageDH - 1) * $scope.itemsPerPageDH;
            const end = $scope.currentPageDH * $scope.itemsPerPageDH;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.dsSanPhamDoiPage = $scope.dsSanPhamDoi.slice(start, end);
        };

        $scope.itemsPerPageTH = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageTH = 1; // Trang hiện tại
        $scope.totalItemsTH = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.dsSanPhamTraPage = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataTH = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPageTH - 1) * $scope.itemsPerPageTH;
            const end = $scope.currentPageTH * $scope.itemsPerPageTH;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.dsSanPhamTraPage = $scope.dsSanPhamTra.slice(start, end);
        };

        $scope.fetchData = function () {
            let startDate = $scope.startDate ? $filter('date')($scope.startDate, "yyyy-MM-dd'T'HH:mm:ss") : $filter('date')(new Date(), "yyyy-MM-dd'T'00:00:00");
            let endDate = $scope.endDate ? $filter('date')($scope.endDate, "yyyy-MM-dd'T'HH:mm:ss") : $filter('date')(new Date(), "yyyy-MM-dd'T'23:59:59");

            console.log("Start Date: ", startDate);
            console.log("End Date: ", endDate);

            // Gọi API cho doanh thu online
            $http.get(`/hoa-don-chi-tiet/thong-ke-online`, {
                params: {startDate: startDate, endDate: endDate}
            }).then(function (response) {
                let result = response.data;
                if (result && result.message === "Thành công") {
                    $scope.doanhThuTodayOnline1 = result.data.doanhThu || 0;
                    $scope.soLuongBanRaTodayOnline1 = result.data.soLuongBanRa || 0;
                    $scope.soLuongHoaDonTodayOnline1 = result.data.soLuongHoaDon || 0;
                    $scope.chiTietSanPhamOnline1 = result.data.chiTietSanPham || [];
                    $scope.chiTietKhachHangOnline1 = result.data.tongHopKhachHang || [];
                    $scope.dsSanPhamDoi = result.data.sanPhamDoiHang || [];
                    $scope.dsSanPhamTra = result.data.sanPhamTraHang || [];

                    // Sắp xếp danh sách sản phẩm theo số lượng bán giảm dần
                    $scope.chiTietSanPhamOnline1 = $scope.chiTietSanPhamOnline1.sort(function (a, b) {
                        return b.soLuong - a.soLuong; // Sắp xếp theo số lượng bán giảm dần
                    });

                    // Tính tổng số sản phẩm và tổng số trang cho sản phẩm
                    $scope.totalItemsOnline1 = $scope.chiTietSanPhamOnline1.length;
                    $scope.totalPagesOnline1 = Math.ceil($scope.totalItemsOnline1 / $scope.itemsPerPageOnline1);

                    // Phân trang sản phẩm
                    $scope.getPageDataOnline1();  // Cập nhật dữ liệu cho trang hiện tại của sản phẩm

                    // Sắp xếp danh sách khách hàng theo doanh thu giảm dần
                    $scope.chiTietKhachHangOnline1 = $scope.chiTietKhachHangOnline1.sort(function (a, b) {
                        return b.doanhThu - a.doanhThu; // Sắp xếp theo doanh thu giảm dần
                    });

                    // Tính tổng số sản phẩm và tổng số trang cho khách hàng
                    $scope.totalItemsKHOnline1 = $scope.chiTietKhachHangOnline1.length;
                    $scope.totalPagesKHOnline1 = Math.ceil($scope.totalItemsKHOnline1 / $scope.itemsPerPageKHOnline1);

                    // Phân trang khách hàng
                    $scope.getPageDataKHOnline1();  // Cập nhật dữ liệu cho trang hiện tại của khách hàng

                    $scope.dsSanPhamDoi = $scope.dsSanPhamDoi.sort(function (a, b) {
                        return b.soLuong - a.soLuong; // Sắp xếp theo doanh thu giảm dần
                    });

                    $scope.totalItemsDH = $scope.dsSanPhamDoi.length;
                    $scope.totalPagesDH = Math.ceil($scope.totalItemsDH / $scope.itemsPerPageDH);

                    $scope.getPageDataDH();

                    $scope.dsSanPhamTra = $scope.dsSanPhamTra.sort(function (a, b) {
                        return b.soLuong - a.soLuong; // Sắp xếp theo doanh thu giảm dần
                    });

                    $scope.totalItemsTH = $scope.dsSanPhamTra.length;
                    $scope.totalPagesTH = Math.ceil($scope.totalItemsTH / $scope.itemsPerPageTH);

                    $scope.getPageDataTH();
                }
            }).catch(function (error) {
                console.error("Lỗi khi gọi API cho doanh thu online: ", error);
            });

            // Gọi API cho doanh thu offline
            $http.get(`/hoa-don-chi-tiet/thong-ke-offline`, {
                params: {startDate: startDate, endDate: endDate}
            }).then(function (response) {
                let result = response.data;
                if (result && result.message === "Thành công") {
                    $scope.doanhThuTodayOffline1 = result.data.doanhThu || 0;
                    $scope.soLuongBanRaTodayOffline1 = result.data.soLuongBanRa || 0;
                    $scope.soLuongHoaDonTodayOffline1 = result.data.soLuongHoaDon || 0;
                    $scope.chiTietSanPhamOffline1 = result.data.chiTietSanPham || [];
                    $scope.chiTietKhachHangOffline1 = result.data.tongHopKhachHang || [];

                    /// danh sách san phâm
                    $scope.chiTietSanPhamOffline1 = $scope.chiTietSanPhamOffline1.sort(function (a, b) {
                        return b.soLuong - a.soLuong; // Sắp xếp theo số lượng bán giảm dần
                    });
                    $scope.totalItems1 = $scope.chiTietSanPhamOffline1.length; // Tổng số sản phẩm
                    $scope.totalPages1 = Math.ceil($scope.totalItems1 / $scope.itemsPerPage1); // Tính tổng số trang

                    /// danh sách khách hàng
                    $scope.chiTietKhachHangOffline1 = $scope.chiTietKhachHangOffline1.sort(function (a, b) {
                        return b.doanhThu - a.doanhThu; // Sắp xếp theo số lượng bán giảm dần
                    });
                    $scope.totalItemsKHOF1 = $scope.chiTietKhachHangOffline1.length; // Tổng số sản phẩm
                    $scope.totalPagesKHOF1 = Math.ceil($scope.totalItemsKHOF1 / $scope.itemsPerPageKHOF1); // Tính tổng số trang

                    $scope.getPageDataOffline1(); // Gọi hàm để lấy dữ liệu trang đầu tiên
                    $scope.getPageDataKHOffline1(); // Gọi hàm để lấy dữ liệu trang đầu tiên

                }
            }).catch(function (error) {
                console.error("Lỗi khi gọi API cho doanh thu offline: ", error);
            });

            $http.get(`/hoa-don-chi-tiet/thong-ke-don-hang`, {
                params: {startDate: startDate, endDate: endDate}
            }).then(function (response) {
                let result = response.data;
                if (result && result.message === "Thành công") {
                    $scope.choXacNhan1 = result.data.choXacNhan || 0;
                    $scope.choGiaoHang1 = result.data.choGiaoHang || 0;
                    $scope.dangGiaoHang1 = result.data.dangGiaoHang || 0;
                    $scope.daGiao1 = result.data.daGiao || 0;
                    $scope.daHuy1 = result.data.daHuy || 0;
                    $scope.taiQuay1 = result.data.taiQuay || 0;
                    $scope.YeuCauDoiTraChoXacNhan1 = result.data.YeuCauDoiTraChoXacNhan || 0;
                    $scope.YeuCauDoiTraHuy1 = result.data.YeuCauDoiTraHuy || 0;
                    $scope.YeuCauDoiTraXacNhan1 = result.data.YeuCauDoiTraXacNhan || 0;
                }
            }).catch(function (error) {
                console.error("Lỗi khi gọi API thống kê đơn hàng: ", error);
            });
        };

        $scope.sanPhamTrongKho = [];
        $scope.itemsPerPageTK = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageTK = 1; // Trang hiện tại
        $scope.totalItemsTK = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.SanPhamTKPage = []; // Mảng chứa các sản phẩm cho trang hiện tại
        $scope.totalPagesTK = 0; // Tổng số trang

        $scope.top5SanPham = []; // Mảng chứa top 5 sản phẩm có số lượng nhiều nhất

        $scope.getTop5SanPham = function () {
            // Sắp xếp sản phẩm theo số lượng giảm dần và lấy 5 sản phẩm đầu tiên
            $scope.top5SanPham = $scope.sanPhamTrongKho.sort(function (a, b) {
                return b.tongSoLuong - a.tongSoLuong; // Sắp xếp theo số lượng giảm dần
            }).slice(0, 5);

            // Cập nhật dữ liệu biểu đồ
            $scope.updateChart();
        };

        $scope.updateChart = function () {
            const labels = $scope.top5SanPham.map(function (sanPham) {
                return sanPham.ten; // Tên sản phẩm
            });

            const data = $scope.top5SanPham.map(function (sanPham) {
                return sanPham.tongSoLuong; // Số lượng sản phẩm
            });

            // Cập nhật biểu đồ với dữ liệu mới
            $scope.chart.data.labels = labels;
            $scope.chart.data.datasets[0].data = data;
            $scope.chart.update();
        };

        $scope.getPageDataTK = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPageTK - 1) * $scope.itemsPerPageTK;
            const end = $scope.currentPageTK * $scope.itemsPerPageTK;

            $scope.SanPhamTKPage = $scope.sanPhamTrongKho.slice(start, end);
        };

        $http.get(`/san-pham/san-pham-trong-kho`)
            .then(function (response) {
                $scope.sanPhamTrongKho = response.data;

                $scope.sanPhamTrongKho = $scope.sanPhamTrongKho.sort(function (a, b) {
                    return b.soLuong - a.soLuong; // Sắp xếp theo số lượng giảm dần
                });

                $scope.totalItemsTK = $scope.sanPhamTrongKho.length;
                $scope.totalPagesTK = $scope.totalItemsTK > 0 ? Math.ceil($scope.totalItemsTK / $scope.itemsPerPageTK) : 1;

                $scope.getPageDataTK();
                $scope.getTop5SanPham(); // Lấy top 5 sản phẩm khi nhận được dữ liệu
                $scope.createChartOnline();
            }).catch(function (error) {
            console.error("Lỗi khi gọi API thống kê đơn hàng: ", error);
        });


        // Gọi hàm fetchData khi trang tải hoặc khi người dùng thay đổi ngày
        $scope.$watchGroup(['startDate', 'endDate'], function () {
            $scope.fetchData();
        });

        // Khởi động việc lấy dữ liệu khi trang tải
        $scope.fetchData();

        // Hàm tạo biểu đồ
        $scope.createChartOnline = function () {
            var ctx = document.getElementById('doanhThuPieChart').getContext('2d');
            // Nếu biểu đồ đã tồn tại, hủy nó đi trước khi tạo mới
            if ($scope.doanhThuPieChart) {
                $scope.doanhThuPieChart.destroy();
            }
            // Tạo biểu đồ mới
            $scope.doanhThuPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Online', 'Offline'],
                    datasets: [{
                        label: 'Tỷ lệ Doanh thu %',
                        data: [$scope.doanhThuPercentage.online, $scope.doanhThuPercentage.offline], // Lấy giá trị từ $scope
                        backgroundColor: ['#dcbe57', '#717503'],
                        borderColor: ['#f64f4f', '#ff0000'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true
                }
            });
            ////////////////////////////////////////////////////////////////////
            var ctxSL = document.getElementById('soLuongPieChart').getContext('2d');
            // Nếu biểu đồ đã tồn tại, hủy nó đi trước khi tạo mới
            if ($scope.soLuongPieChart) {
                $scope.soLuongPieChart.destroy();
            }
            // Tạo biểu đồ mới
            $scope.soLuongPieChart = new Chart(ctxSL, {
                type: 'pie',
                data: {
                    labels: ['Online', 'Offline'],
                    datasets: [{
                        label: 'Tỷ lệ số lượng %',
                        data: [$scope.soLuongBanPercentage.online, $scope.soLuongBanPercentage.offline], // Lấy giá trị từ $scope
                        backgroundColor: ['#c962ba', '#860e33'],
                        borderColor: ['#9b7dc0', '#7011ea'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true
                }
            });
            //////////////////////////////////////////////////////////////////////////
            var ctxDH = document.getElementById('donHangPieChart').getContext('2d');
            // Nếu biểu đồ đã tồn tại, hủy nó đi trước khi tạo mới
            if ($scope.donHangPieChart) {
                $scope.donHangPieChart.destroy();
            }
            // Tạo biểu đồ mới
            $scope.donHangPieChart = new Chart(ctxDH, {
                type: 'pie',
                data: {
                    labels: ['Online', 'Offline'],
                    datasets: [{
                        label: 'Tỷ lệ đơn hàng %',
                        data: [$scope.soLuongHoaDonPercentage.online, $scope.soLuongHoaDonPercentage.offline], // Lấy giá trị từ $scope
                        backgroundColor: ['#82ee79', '#0e7700'],
                        borderColor: ['#43b5ce', '#1f4e9b'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true
                }
            });
            //////////////////////////////////////////////////////////
            const ctxDonHang = document.getElementById('donhangChart').getContext('2d');

            // Nếu đã có biểu đồ, hủy biểu đồ cũ trước khi vẽ mới
            if ($scope.donhangChart) {
                $scope.donhangChart.destroy();
            }

            // Dữ liệu biểu đồ
            const labels = [
                'Chờ XN',
                'Chờ GH',
                'Đang GH',
                'Đã Giao',
                'Đã Hủy',
                'Tại Quầy',
                'ĐT-Chờ XN',
                'ĐT-Hủy',
                'ĐT-XN'
            ];

            const data = [
                $scope.choXacNhan1,
                $scope.choGiaoHang1,
                $scope.dangGiaoHang1,
                $scope.daGiao1,
                $scope.daHuy1,
                $scope.taiQuay1,
                $scope.YeuCauDoiTraChoXacNhan1,
                $scope.YeuCauDoiTraHuy1,
                $scope.YeuCauDoiTraXacNhan1
            ];

            $scope.donhangChart = new Chart(ctxDonHang, {
                type: 'line', // Loại biểu đồ: 'line' thay vì 'bar'
                data: {
                    labels: labels, // Nhãn cho trục X
                    datasets: [{
                        label: 'Thống kê đơn hàng',
                        data: data, // Dữ liệu của biểu đồ
                        backgroundColor: 'rgba(0, 123, 255, 0.2)', // Màu nền của đường biểu đồ
                        borderColor: '#007bff', // Màu của đường biểu đồ
                        borderWidth: 2, // Độ rộng của đường
                        fill: true // Điền màu phía dưới đường biểu đồ (nếu cần)
                    }]
                },
                options: {
                    responsive: true, // Biểu đồ tự động điều chỉnh kích thước theo màn hình
                    scales: {
                        x: {
                            display: true // Hiển thị trục X
                        },
                        y: {
                            beginAtZero: true, // Trục Y bắt đầu từ 0
                            ticks: {
                                stepSize: 1 // Chỉnh khoảng cách giữa các điểm trên trục Y
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true, // Hiển thị chú thích
                            position: 'top' // Vị trí chú thích
                        },
                        tooltip: {
                            enabled: true // Hiển thị tooltip khi hover vào các điểm trên biểu đồ
                        }
                    }
                }
            });
  ///////////////////////////////////////////////////////
            const top5Chart = document.getElementById('top5Chart').getContext('2d');
            $scope.chart = new Chart(top5Chart, {
                type: 'bar', // Chọn loại biểu đồ (bar, line, pie, etc.)
                data: {
                    labels: [], // Tên sản phẩm (sẽ được cập nhật)
                    datasets: [{
                        label: 'Số lượng sản phẩm',
                        data: [], // Số lượng sản phẩm (sẽ được cập nhật)
                        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Màu nền cột
                        borderColor: 'rgba(75, 192, 192, 1)', // Màu viền cột
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        };
    };

    $scope.loadDataOnline = function () {
        $scope.itemsPerPageOnline = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageOnline = 1; // Trang hiện tại
        $scope.totalItemsOnline = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.chiTietSanPhamPageOnline = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataOnline = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPageOnline - 1) * $scope.itemsPerPageOnline;
            const end = $scope.currentPageOnline * $scope.itemsPerPageOnline;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.chiTietSanPhamPageOnline = $scope.chiTietSanPhamOnline.slice(start, end);
        };

        $scope.itemsPerPageKHOnline = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageKHOnline = 1; // Trang hiện tại
        $scope.totalItemsKHOnline = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.chiTietKhachHangPageOnline = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataKHOnline = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPageKHOnline - 1) * $scope.itemsPerPageKHOnline;
            const end = $scope.currentPageKHOnline * $scope.itemsPerPageKHOnline;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.chiTietKhachHangPageOnline = $scope.chiTietKhachHangOnline.slice(start, end);
        };

        $http.get(`/hoa-don-chi-tiet/thong-ke-online`, {
            params: {startDate: startToday, endDate: endToday}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.doanhThuTodayOnline = result.data.doanhThu || 0;
                $scope.soLuongBanRaTodayOnline = result.data.soLuongBanRa || 0;
                $scope.soLuongHoaDonTodayOnline = result.data.soLuongHoaDon || 0;
                $scope.chiTietSanPhamOnline = result.data.chiTietSanPham || [];
                $scope.chiTietKhachHangOnline = result.data.tongHopKhachHang || [];

                /// danh sách san phâm
                $scope.chiTietSanPhamOnline = $scope.chiTietSanPhamOnline.sort(function (a, b) {
                    return b.soLuong - a.soLuong; // Sắp xếp theo số lượng bán giảm dần
                });
                $scope.totalItemsOnline = $scope.chiTietSanPhamOnline.length; // Tổng số sản phẩm
                $scope.totalPagesOnline = Math.ceil($scope.totalItemsOnline / $scope.itemsPerPageOnline); // Tính tổng số trang

                /// danh sách khách hàng
                $scope.chiTietKhachHangOnline = $scope.chiTietKhachHangOnline.sort(function (a, b) {
                    return b.doanhThu - a.doanhThu; // Sắp xếp theo số lượng bán giảm dần
                });
                $scope.totalItemsKHOnline = $scope.chiTietKhachHangOnline.length; // Tổng số sản phẩm

                /// doanh thu theo cap bac
                let doanhThuTheoCapBac = result.data.tongDoanhThuTheoCapBac || {};
                // Dữ liệu để hiển thị trên biểu đồ
                $scope.capBacLabels = Object.keys(doanhThuTheoCapBac); // ["KIM_CUONG", "BAC", "VANG"]
                $scope.capBacData = Object.values(doanhThuTheoCapBac); // [0, 9725000, 0]

                $scope.totalPagesKHOnline = Math.ceil($scope.totalItemsKHOnline / $scope.itemsPerPageKHOnline); // Tính tổng số trang
                $scope.getPageDataOnline(); // Gọi hàm để lấy dữ liệu trang đầu tiên
                $scope.getPageDataKHOnline(); // Gọi hàm để lấy dữ liệu trang đầu tiên
                $scope.createChartOnline();  // tạo biểu đồ

                let chiTietSanPham = result.data.chiTietSanPham || [];
                let sanPhamBanChay = chiTietSanPham.reduce(function (max, current) {
                    return (current.soLuong > max.soLuong) ? current : max;
                }, {soLuong: 0});

                // Lưu sản phẩm bán chạy nhất vào scope
                $scope.sanPhamBanChayOnlineToday = sanPhamBanChay.ten || 'Không có sản phẩm bán chạy';

            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API cho doanh thu hôm nay online: ", error);
        });

        $http.get(`/hoa-don-chi-tiet/thong-ke-online`, {
            params: {startDate: startOfWeek, endDate: endOfWeek}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.doanhThuThisWeekOnline = result.data.doanhThu || 0;
                $scope.soLuongBanRaThisWeekOnline = result.data.soLuongBanRa || 0;
                $scope.soLuongHoaDonThisWeekOnline = result.data.soLuongHoaDon || 0;
            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API cho doanh thu tuần này online: ", error);
        });

        $http.get(`/hoa-don-chi-tiet/thong-ke-online`, {
            params: {startDate: startOfMonth, endDate: endOfMonth}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.doanhThuThisMonthOnline = result.data.doanhThu || 0;
                $scope.soLuongBanRaThisMonthOnline = result.data.soLuongBanRa || 0;
                $scope.soLuongHoaDonThisMonthOnline = result.data.soLuongHoaDon || 0;
            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API cho doanh thu tháng này online: ", error);
        });

        $http.get(`/hoa-don-chi-tiet/thong-ke-online`, {
            params: {startDate: startOfYear, endDate: endOfYear}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.doanhThuThisYearOnline = result.data.doanhThu || 0;
                $scope.soLuongBanRaThisYearOnline = result.data.soLuongBanRa || 0;
                $scope.soLuongHoaDonThisYearOnline = result.data.soLuongHoaDon || 0;
            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API cho doanh thu năm nay online: ", error);
        });

        $scope.createChartOnline = function () {
            // Sắp xếp chiTietSanPham theo số lượng bán giảm dần và lấy top 5 sản phẩm
            let top5SanPham = $scope.chiTietSanPhamOnline.sort(function (a, b) {
                return b.soLuong - a.soLuong; // Sắp xếp theo số lượng bán giảm dần
            }).slice(0, 5); // Lấy 5 sản phẩm đầu tiên

            const labels = []; // Tên sản phẩm
            const soLuong = []; // Số lượng bán của các sản phẩm
            const doanhThu = []; // Doanh thu của các sản phẩm

            // Duyệt qua top5SanPham để lấy tên, số lượng bán và doanh thu
            angular.forEach(top5SanPham, function (item) {
                labels.push(item.ten);
                soLuong.push(item.soLuong);
                doanhThu.push(item.doanhThu);
            });

            // Vẽ biểu đồ
            var ctx = document.getElementById('chartSanPhamOnline').getContext('2d');
            var chartSanPhamOnline = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Số lượng bán',
                        data: soLuong,
                        type: 'bar',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Doanh thu',
                        data: doanhThu,
                        type: 'bar',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            display: false // Ẩn tên sản phẩm dưới cột
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            ///////////////////////////////////////////////////////////////////////////////////////////
            let top5KH = $scope.chiTietKhachHangOnline.sort(function (a, b) {
                return b.doanhThu - a.doanhThu;
            }).slice(0, 5);

            const labelsKH = [];
            const soLuongKH = [];
            const doanhThuKH = [];

            // Duyệt qua top5SanPham để lấy tên, số lượng bán và doanh thu
            angular.forEach(top5KH, function (item) {
                labelsKH.push(item.hoVaTen);
                soLuongKH.push(item.soLuongHoaDon);
                doanhThuKH.push(item.doanhThu);
            });

            // Vẽ biểu đồ
            var ctxKH = document.getElementById('chartKHOnline').getContext('2d');
            var chartKHOfflne = new Chart(ctxKH, {
                type: 'bar',
                data: {
                    labels: labelsKH,
                    datasets: [{
                        label: 'Số lượng đơn mua',
                        data: soLuongKH,
                        type: 'bar',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Tổng tiền mua',
                        data: doanhThuKH,
                        type: 'bar',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            display: false // Ẩn tên sản phẩm dưới cột
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            ///////////////////////////////////////////////////////////////////////////////////////////
            const ctxDT = document.getElementById('combinedChartOffline').getContext('2d');
            new Chart(ctxDT, {
                type: 'bar', // Loại biểu đồ chính là bar
                data: {
                    labels: $scope.capBacLabels, // ["KIM_CUONG", "BAC", "VANG"]
                    datasets: [
                        {
                            type: 'bar', // Biểu đồ cột
                            label: 'Doanh thu theo cấp bậc (Bar)',
                            data: $scope.capBacData, // [0, 9725000, 0]
                            backgroundColor: 'rgba(54, 162, 235, 0.6)', // Màu sắc cột
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            type: 'line', // Biểu đồ đường
                            label: 'Doanh thu theo cấp bậc (Line)',
                            data: $scope.capBacData, // [0, 9725000, 0]
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4 // Đường cong mềm mại
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Cấp bậc'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Doanh thu (VND)'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
        };
    }

    $scope.loadDataOffline = function () {
        $scope.itemsPerPage = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPage = 1; // Trang hiện tại
        $scope.totalItems = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.chiTietSanPhamPageOffline = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataOffline = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPage - 1) * $scope.itemsPerPage;
            const end = $scope.currentPage * $scope.itemsPerPage;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.chiTietSanPhamPageOffline = $scope.chiTietSanPhamOffline.slice(start, end);
        };

        $scope.itemsPerPageKHOF = 5; // Số sản phẩm trên mỗi trang
        $scope.currentPageKHOF = 1; // Trang hiện tại
        $scope.totalItemsKHOF = 0; // Tổng số sản phẩm, sẽ được tính toán khi có dữ liệu
        $scope.chiTietKhachHangPageOffline = []; // Mảng chứa các sản phẩm cho trang hiện tại

        $scope.getPageDataKHOffline = function () {
            // Tính chỉ số bắt đầu và kết thúc của các sản phẩm cho trang hiện tại
            const start = ($scope.currentPage - 1) * $scope.itemsPerPage;
            const end = $scope.currentPage * $scope.itemsPerPage;

            // Cập nhật danh sách sản phẩm cho trang hiện tại
            $scope.chiTietKhachHangPageOffline = $scope.chiTietKhachHangOffline.slice(start, end);
        };

        $http.get(`/hoa-don-chi-tiet/thong-ke-offline`, {
            params: {startDate: startToday, endDate: endToday}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.doanhThuTodayOffline = result.data.doanhThu || 0;
                $scope.soLuongBanRaTodayOffline = result.data.soLuongBanRa || 0;
                $scope.soLuongHoaDonTodayOffline = result.data.soLuongHoaDon || 0;
                $scope.diemDungTodayOffline = result.data.diemDung || 0;
                $scope.chiTietSanPhamOffline = result.data.chiTietSanPham || [];
                $scope.chiTietKhachHangOffline = result.data.tongHopKhachHang || [];

                /// danh sách san phâm
                $scope.chiTietSanPhamOffline = $scope.chiTietSanPhamOffline.sort(function (a, b) {
                    return b.soLuong - a.soLuong; // Sắp xếp theo số lượng bán giảm dần
                });
                $scope.totalItems = $scope.chiTietSanPhamOffline.length; // Tổng số sản phẩm
                $scope.totalPages = Math.ceil($scope.totalItems / $scope.itemsPerPage); // Tính tổng số trang

                /// danh sách khách hàng
                $scope.chiTietKhachHangOffline = $scope.chiTietKhachHangOffline.sort(function (a, b) {
                    return b.doanhThu - a.doanhThu; // Sắp xếp theo số lượng bán giảm dần
                });
                $scope.totalItemsKHOF = $scope.chiTietKhachHangOffline.length; // Tổng số sản phẩm
                $scope.totalPagesKHOF = Math.ceil($scope.totalItemsKHOF / $scope.itemsPerPageKHOF); // Tính tổng số trang

                $scope.getPageDataOffline(); // Gọi hàm để lấy dữ liệu trang đầu tiên
                $scope.getPageDataKHOffline(); // Gọi hàm để lấy dữ liệu trang đầu tiên

                $scope.createChartOffline();  // tạo biểu đồ

                // Lấy sản phẩm có số lượng bán nhiều nhất
                let chiTietSanPham = result.data.chiTietSanPham || [];
                let sanPhamBanChay = chiTietSanPham.reduce(function (max, current) {
                    return (current.soLuong > max.soLuong) ? current : max;
                }, {soLuong: 0});

                // Lưu sản phẩm bán chạy nhất vào scope
                $scope.sanPhamBanChayOfflineToday = sanPhamBanChay.ten || 'Không có sản phẩm bán chạy';

            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API cho doanh thu hôm nay offline: ", error);
        });

        $http.get(`/hoa-don-chi-tiet/thong-ke-offline`, {
            params: {startDate: startOfWeek, endDate: endOfWeek}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.doanhThuThisWeekOffline = result.data.doanhThu || 0;
                $scope.soLuongBanRaThisWeekOffline = result.data.soLuongBanRa || 0;
                $scope.soLuongHoaDonThisWeekOffline = result.data.soLuongHoaDon || 0;
            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API cho doanh thu tuần này offline: ", error);
        });

        $http.get(`/hoa-don-chi-tiet/thong-ke-offline`, {
            params: {startDate: startOfMonth, endDate: endOfMonth}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.doanhThuThisMonthOffline = result.data.doanhThu || 0;
                $scope.soLuongBanRaThisMonthOffline = result.data.soLuongBanRa || 0;
                $scope.soLuongHoaDonThisMonthOffline = result.data.soLuongHoaDon || 0;
            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API cho doanh thu tháng này offline: ", error);
        });

        $http.get(`/hoa-don-chi-tiet/thong-ke-offline`, {
            params: {startDate: startOfYear, endDate: endOfYear}
        }).then(function (response) {
            let result = response.data;
            if (result && result.message === "Thành công") {
                $scope.doanhThuThisYearOffline = result.data.doanhThu || 0;
                $scope.soLuongBanRaThisYearOffline = result.data.soLuongBanRa || 0;
                $scope.soLuongHoaDonThisYearOffline = result.data.soLuongHoaDon || 0;
            }
        }).catch(function (error) {
            console.error("Lỗi khi gọi API cho doanh thu năm nay offline: ", error);
        });

        $scope.createChartOffline = function () {
            // Sắp xếp chiTietSanPham theo số lượng bán giảm dần và lấy top 5 sản phẩm
            let top5SanPham = $scope.chiTietSanPhamOffline.sort(function (a, b) {
                return b.soLuong - a.soLuong; // Sắp xếp theo số lượng bán giảm dần
            }).slice(0, 5); // Lấy 5 sản phẩm đầu tiên

            const labels = []; // Tên sản phẩm
            const soLuong = []; // Số lượng bán của các sản phẩm
            const doanhThu = []; // Doanh thu của các sản phẩm

            // Duyệt qua top5SanPham để lấy tên, số lượng bán và doanh thu
            angular.forEach(top5SanPham, function (item) {
                labels.push(item.ten);
                soLuong.push(item.soLuong);
                doanhThu.push(item.doanhThu);
            });

            // Vẽ biểu đồ
            var ctx = document.getElementById('chartOffline').getContext('2d');
            var chartOfflne = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Số lượng bán',
                        data: soLuong,
                        type: 'bar',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Doanh thu',
                        data: doanhThu,
                        type: 'bar',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            display: false // Ẩn tên sản phẩm dưới cột
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            ///////////////////////////////////////////////////////////////////////////////////////////
            let top5KH = $scope.chiTietKhachHangOffline.sort(function (a, b) {
                return b.doanhThu - a.doanhThu;
            }).slice(0, 5);

            const labelsKH = [];
            const soLuongKH = [];
            const doanhThuKH = [];

            // Duyệt qua top5SanPham để lấy tên, số lượng bán và doanh thu
            angular.forEach(top5KH, function (item) {
                labelsKH.push(item.hoVaTen);
                soLuongKH.push(item.soLuongHoaDon);
                doanhThuKH.push(item.doanhThu);
            });

            // Vẽ biểu đồ
            var ctxKH = document.getElementById('chartKHOffline').getContext('2d');
            var chartKHOfflne = new Chart(ctxKH, {
                type: 'bar',
                data: {
                    labels: labelsKH,
                    datasets: [{
                        label: 'Số lượng đơn mua',
                        data: soLuongKH,
                        type: 'bar',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Tổng tiền mua',
                        data: doanhThuKH,
                        type: 'bar',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            display: false // Ẩn tên sản phẩm dưới cột
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        };

    }

    $scope.loadDataOnline();

    $scope.exportExcel = function () {
        const currentDateTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        // Sheet 1: Dữ liệu doanh thu và đơn hàng online
        const data1 = [
            { Loại: 'Doanh thu', Số_Lượng: $scope.doanhThuTodayOnline.toLocaleString('vi-VN') + ' đ' },
            { Loại: 'Số lượng bán ra', Số_Lượng: $scope.soLuongBanRaTodayOnline },
            { Loại: 'Số đơn hàng mua', Số_Lượng: $scope.soLuongHoaDonTodayOnline },
            // Thêm danh sách chi tiết sản phẩm bán ra dưới mục "Số đơn hàng mua"
            { Loại: 'Thời gian xuất', currentDateTime }
        ];
        // Sheet 2: Dữ liệu danh sách sản phẩm bán
        const data2 = [
            ...$scope.chiTietSanPhamOnline.map((sp, index) => ({
                Tên_sản_phẩm: `${sp.ten}`,
                Mã_SP: `${sp.ma}`,
                Số_Lượng_bán: `${sp.soLuong}`,
                Doanh_thu:`${sp.doanhThu.toLocaleString('vi-VN')} đ`
            })),
        ];
        // Sheet 3: Dữ liệu danh sách khách hàng mua
        const data3 = [
            ...$scope.chiTietKhachHangOnline.map((sp, index) => ({
                Họ_ten: `${sp.hoVaTen}`,
                Số_lượng_hóa_đơn: `${sp.soLuongHoaDon}`,
                Email: `${sp.email}`,
                SDT: `${sp.sdt}`,
                Doanh_thu:`${sp.doanhThu.toLocaleString('vi-VN')} đ`
            })),
        ];
        // Sheet 4: Dữ liệu doanh thu và đơn hàng offline
        const data4 = [
            { Loại: 'Doanh thu', Số_Lượng: $scope.doanhThuTodayOffline.toLocaleString('vi-VN') + ' đ' },
            { Loại: 'Số lượng bán ra', Số_Lượng: $scope.soLuongBanRaTodayOffline },
            { Loại: 'Số đơn hàng mua', Số_Lượng: $scope.soLuongHoaDonTodayOffline },
            // Thêm danh sách chi tiết sản phẩm bán ra dưới mục "Số đơn hàng mua"
            { Loại: 'Thời gian xuất', currentDateTime }
        ];
        // Dữ liệu danh sách sản phẩm bán
        const data5 = [
            ...$scope.chiTietSanPhamOffline.map((sp, index) => ({
                Tên_sản_phẩm: `${sp.ten}`,
                Mã_SP: `${sp.ma}`,
                Số_Lượng_bán: `${sp.soLuong}`,
                Doanh_thu:`${sp.doanhThu.toLocaleString('vi-VN')} đ`
            })),
        ];
        // Dữ liệu danh sách khách hàng mua
        const data6 = [
            ...$scope.chiTietKhachHangOffline.map((sp, index) => ({
                Họ_ten: `${sp.hoVaTen}`,
                Số_lượng_hóa_đơn: `${sp.soLuongHoaDon}`,
                Điểm_dùng: `${sp.diemDung}`,
                SDT: `${sp.sdt}`,
                Doanh_thu:`${sp.doanhThu.toLocaleString('vi-VN')} đ`
            })),
        ];

        // Tạo workbook và các sheet
        const worksheet1 = XLSX.utils.json_to_sheet(data1); // Sheet Doanh Thu
        const worksheet2 = XLSX.utils.json_to_sheet(data2); // Sheet Top Sản Phẩm
        const worksheet3 = XLSX.utils.json_to_sheet(data3); // Sheet Top Sản Phẩm
        const worksheet4 = XLSX.utils.json_to_sheet(data4); // Sheet Top Sản Phẩm
        const worksheet5 = XLSX.utils.json_to_sheet(data5); // Sheet Top Sản Phẩm
        const worksheet6 = XLSX.utils.json_to_sheet(data6); // Sheet Top Sản Phẩm

        // const worksheet3 = XLSX.utils.json_to_sheet(data3); // Sheet Top Sản Phẩm

        // Tạo workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet1, 'Báo Cáo Online');
        XLSX.utils.book_append_sheet(workbook, worksheet2, 'Báo Cáo Sản phẩm bán online');
        XLSX.utils.book_append_sheet(workbook, worksheet3, 'Báo Cáo khách hàng mua online');
        XLSX.utils.book_append_sheet(workbook, worksheet4, 'Báo Cáo Offline');
        XLSX.utils.book_append_sheet(workbook, worksheet5, 'Báo Cáo sản phẩm bán Offline');
        XLSX.utils.book_append_sheet(workbook, worksheet6, 'Báo Cáo khách hàng mua Offline');

        // XLSX.utils.book_append_sheet(workbook, worksheet3, 'Sản Phẩm Còn');

        // Xuất file Excel
        XLSX.writeFile(workbook, `bao_cao_doanh_thu_${currentDateTime}.xlsx`);
    };
});
