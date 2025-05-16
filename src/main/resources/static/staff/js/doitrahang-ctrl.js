app.controller("yeucaudoitra-ctrl", function ($scope, $http, $routeParams, $location) {
    const loai = $routeParams.loai;
    const trangThai = $routeParams.trangThai;
    $scope.trangThai = ""; // Giá trị mặc định là tất cả trạng thái

    // Khởi tạo dữ liệu
    $scope.items = [];
    $scope.hinhanh = [];
    $scope.searchText = "";

    $scope.pager = {
        page: 0, size: 10, items: [], count: 0, first: function () {
            this.page = 0;
            this.updateItems();
        }, prev: function () {
            if (this.page > 0) {
                this.page--;
                this.updateItems();
            }
        }, next: function () {
            if (this.page < this.count - 1) {
                this.page++;
                this.updateItems();
            }
        }, last: function () {
            this.page = this.count - 1;
            this.updateItems();
        }, updateItems: function () {
            const filteredItems = $scope.items.filter(item => {
                // Lọc theo từ khóa tìm kiếm
                const matchesSearch = !$scope.searchText || item.hoaDon.ma.toLowerCase().includes($scope.searchText.toLowerCase());

                // Lọc theo trạng thái
                const matchesStatus = !$scope.trangThai || item.trangThai === parseInt($scope.trangThai);

                return matchesSearch && matchesStatus;
            });
            filteredItems.sort((a, b) => {
                const dateA = new Date(a.ngayTao); // Giả sử `ngayCapNhat` là trường ngày
                const dateB = new Date(b.ngayTao);
                return dateB - dateA; // Sắp xếp theo thứ tự giảm dần
            });
            this.count = Math.ceil(filteredItems.length / this.size); // Tổng số trang
            this.items = filteredItems.slice(this.page * this.size, (this.page + 1) * this.size); // Dữ liệu của trang
        }
    };

    $scope.initialize = function () {
        $http.get(`/yeu-cau/doitra?loai=${loai}`).then(resp => {
            if (resp.data && Array.isArray(resp.data.data)) {
                $scope.items = resp.data.data.map(item => ({
                    ...item, ngayTao: new Date(item.ngayTao), // Chuyển đổi định dạng ngày tháng
                    ngayCapNhat: new Date(item.ngayCapNhat)
                }));
                $scope.pager.updateItems(); // Cập nhật phân trang
            } else {
                console.error("Dữ liệu API không hợp lệ.");
            }
        }).catch(error => {
            console.error("Lỗi khi tải dữ liệu từ API:", error);
        });
    };
    $scope.edit = function (item) {
        item.ngayCapNhat = new Date(item.ngayCapNhat);
        item.ngayTao = new Date(item.ngayTao);
        $scope.form = angular.copy(item);
        $http.get("/hinh-anh").then(resp => {
            // Lọc hình ảnh theo id yêu cầu đổi hàng
            $scope.hinhanh = resp.data.filter(image => image.idYeuCauDoiTra === item.id);
        }).catch(error => {
            console.error("Lỗi khi tải hình ảnh:", error);
        });
    };

    // Gọi hàm khi controller được khởi tạo
    $scope.initialize();

    $scope.yeuCauChiTietList = [];

    // Hàm lấy danh sách chi tiết theo idDoiTra
    $scope.loadChiTiet = function (idDoiTra) {
        $http.get(`/yeu-cau-chi-tiet/by-yeu-cau/${idDoiTra}`).then(resp => {
            $scope.yeuCauChiTietList = resp.data.data; // Gán danh sách vào scope
            console.log("Chi tiết yêu cầu đổi trả:", $scope.yeuCauChiTietList);
        }).catch(error => {
            console.error("Lỗi khi tải dữ liệu chi tiết:", error);
        });
    };

    // Hàm cập nhật trạng thái yêu cầu

    $scope.updateStatus = function (idDoiTra) {
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn duyệt yêu cầu này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                // Thực hiện cập nhật trạng thái hóa đơn nếu người dùng xác nhận
                $http.put(`/yeu-cau/${idDoiTra}/update-status`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }).then(function (response) {
                    if (response.data.code === 200) {
                        // Cập nhật lại trạng thái trong bảng
                        const updatedItem = response.data.data;
                        const index = $scope.items.findIndex(item => item.id === idDoiTra);
                        if (index !== -1) {
                            $scope.items[index] = updatedItem;
                        }
                    }
                    toastr.success("Duyệt yêu cầu thành công", "Thành công!");
                    $scope.initialize();
                }).catch(function (error) {
                    toastr.error("Có lỗi", "Lỗi!");
                    console.error("Lỗi khi duyệt yêu cầu:", error);
                });
            } else {
                toastr.info("Hành động đã hủy", "Hủy!");
            }
        });
    };

    $scope.selectedGhiChu = '';  // Lý do hủy được chọn
    $scope.idHuyTra = null;  // ID hóa đơn cần cập nhật

    // Mở modal và lưu ID hóa đơn
    $scope.openModal = function (idHuyTra) {
        $scope.idHuyTra = idHuyTra; // Lưu ID hóa đơn
    };

    $scope.updateCancelOrder = function () {
        if (!$scope.selectedGhiChu) {
            toastr.error("Bạn chưa nhập lý do hủy", "Lỗi!");
            return;
        }
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn hủy yêu cầu này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                var cancelOrderRequest = {
                    orderInfo: $scope.selectedGhiChu
                };
                // Lấy token từ localStorage
                var token = localStorage.getItem('token');
                // Gửi yêu cầu hủy đơn hàng
                $http.post('/yeu-cau/cancel/' + $scope.idHuyTra, cancelOrderRequest, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                })
                    .then(function (response) {
                        toastr.success("Hủy yêu cầu thành công", "Thành công!");
                        $('#huyYeuCau').modal('hide');
                        $scope.initialize();
                    })
                    .catch(function (error) {
                        toastr.error("Có lỗi không thể hủy yêu cầu", "Lỗi!");
                        console.error(error);
                    });
            } else {
                toastr.info("Hành động đã hủy", "Hủy!");
            }
        });
    };

    // Tạo map để ánh xạ giá trị loai và trangThai sang tiêu đề
    $scope.getTitle = function () {
        if (loai === "DOI_HANG") {
            return "đổi hàng";
        }
        if (loai === "TRA_HANG") {
            return "hoàn hàng";
        }
        return "Quản lý yêu cầu đổi hàng";
    };

    $scope.openImage = function (imageUrl) {
        // Lưu URL của ảnh vào biến để hiển thị trong modal
        $scope.selectedImageUrl = imageUrl;

        // Mở modal để hiển thị ảnh phóng to
        var imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
        imageModal.show();
    };


    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right", // Hiển thị ở góc trên bên phải
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000", // Thời gian thông báo tồn tại (ms)
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    $scope.updateChiTietStatusHoanThanh = function (chiTiet) {
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn duyệt sản phẩm yêu cầu này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                // Lấy token từ localStorage
                const token = localStorage.getItem("token");

                if (!token) {
                    toastr.error("Vui lòng đăng nhập để thực hiện hành động này", "Lỗi!");
                    return;
                }
                // Thực hiện gọi API cập nhật trạng thái
                $http({
                    method: 'PUT',
                    url: `/yeu-cau/chi-tiet-hoan-thanh/${chiTiet.id}`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(function (response) {
                    // Cập nhật trạng thái trực tiếp trên giao diện
                    toastr.success("Duyệt sản phẩm yêu cầu thành công", "Thành công!");
                    chiTiet.trangThai = 2;
                }).catch(function (error) {
                    toastr.error("Có lỗi xảy ra", "Lỗi!");
                    console.error("Lỗi khi duyệt sản phẩm yêu cầu:", error);
                });
            }
        });
    };

    $scope.updateChiTietStatusHuy = function (chiTiet) {
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn hủy sản phẩm yêu cầu này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                // Lấy token từ localStorage
                const token = localStorage.getItem("token");

                if (!token) {
                    toastr.error("Vui lòng đăng nhập để thực hiện hành động này", "Lỗi!");
                    return;
                }

                // Thực hiện gọi API cập nhật trạng thái
                $http({
                    method: 'PUT',
                    url: `/yeu-cau/chi-tiet-tu-choi/${chiTiet.id}`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(function (response) {
                    // Cập nhật trạng thái trực tiếp trên giao diện
                    toastr.success("Hủy sản phẩm yêu cầu thành công", "Thành công!");
                    chiTiet.trangThai = 3;
                }).catch(function (error) {
                    toastr.error("Có lỗi xảy ra", "Lỗi!");
                    console.error("Lỗi khi hủy sản phẩm yêu cầu:", error);
                });
            }
        });
    };

    // Hàm để xử lý từ chối yêu cầu chi tiết

});
