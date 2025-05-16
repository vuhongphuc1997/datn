app.controller("sanphamdoitra-ctrl", function ($scope, $http, $rootScope, $location) {
    $scope.items = [];
    $scope.form = {};
    $scope.formAdd = {};
    $scope.item = {};
    $scope.selectedProduct = {}; // Đối tượng lưu thông tin sản phẩm đã chọn
    $scope.filters = {};
    $scope.error = {};
    $scope.size = [];
    $scope.mausac = [];
    $scope.sanpham = [];
    $scope.searchText = '';

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
                const matchesSearch = !$scope.searchText || item.id.toLowerCase().includes($scope.searchText.toLowerCase());

                // Lọc theo trạng thái
                const matchesStatus = !$scope.trangThai || item.trangThai === parseInt($scope.trangThai);

                return matchesSearch && matchesStatus;
            });

            this.count = Math.ceil(filteredItems.length / this.size); // Tổng số trang
            this.items = filteredItems.slice(this.page * this.size, (this.page + 1) * this.size); // Dữ liệu của trang
        }
    };

    $scope.initialize = function () {
        $http.get("/doi-tra").then(resp => {
            $scope.items = resp.data.data.map(item => ({
                ...item, ngayTao: new Date(item.ngayTao), ngayCapNhat: new Date(item.ngayCapNhat)
            }));
            $scope.pager.updateItems();
        }).catch(error => console.error("Lỗi khi tải danh mục: ", error));

    };


    $scope.edit = function (item) {
        item.ngayCapNhat = new Date(item.ngayCapNhat);
        $scope.form = angular.copy(item);
    };

    const getToken = function () {
        return localStorage.getItem("token");
    };

    $scope.undoSanPham = function (id) {
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn hoàn tác sản phẩm đổi trả này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                const token = getToken(); // Lấy token từ localStorage
                if (!token) {
                    toastr.error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.", "Thất bại");
                    return;
                }
                $http.post(`/doi-tra/${id}`, {}, {
                    headers: {Authorization: `Bearer ${token}`}
                }).then(resp => {
                    toastr.success("Hoàn tác sản phẩm đổi trả thành công!", "Thành công");
                    $scope.initialize();
                }).catch(error => {
                    console.error("Lỗi: ", error);
                    toastr.error("Có lỗi xảy ra, vui lòng thử lại sau!", "Thất bại");
                });
            } else {
                toastr.info("Hành động đã hủy", "Hủy!");
            }
        });
    };

    $scope.sanPhamFail = function (id) {
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn hủy sản phẩm đổi trả này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                const token = getToken(); // Lấy token từ localStorage
                if (!token) {
                    toastr.error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.", "Thất bại");
                    return;
                }
                $http.post(`/doi-tra/fail/${id}`, {}, {
                    headers: {Authorization: `Bearer ${token}`}
                }).then(resp => {
                    toastr.success("Hủy sản phẩm đổi trả thành công", "Thành công!");
                    $scope.initialize();
                }).catch(error => {
                    console.error("Lỗi: ", error);
                    toastr.error("Có lỗi xảy ra, vui lòng thử lại sau!", "Thất bại");
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
            text: "Bạn có chắc muốn hủy sản phẩm đổi trả này?",
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
                $http.post('/doi-tra/fail/' + $scope.idHuyTra, cancelOrderRequest, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                })
                    .then(function (response) {
                        toastr.success("Hủy sản phẩm đổi trả thành công", "Thành công!");
                        $('#huyYeuCau').modal('hide');
                        $scope.initialize();
                    })
                    .catch(function (error) {
                        toastr.error("Có lỗi không thể hủy sản phẩm đổi trả", "Lỗi!");
                        console.error(error);
                    });
            } else {
                toastr.info("Hành động đã hủy", "Hủy!");
            }
        });
    };

    $scope.initialize();

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
});
