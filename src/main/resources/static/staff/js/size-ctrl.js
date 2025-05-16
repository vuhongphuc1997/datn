app.controller("size-ctrl", function ($scope, $http) {
    $scope.items = [];
    $scope.form = {};
    $scope.formAdd = {};
    $scope.searchText = ''; // Biến tìm kiếm
    $scope.pager = {
        page: 0,
        size: 10,
        items: [],
        count: 0,
        first: function () {
            this.page = 0;
            this.updateItems();
        },
        prev: function () {
            if (this.page > 0) {
                this.page--;
                this.updateItems();
            }
        },
        next: function () {
            if (this.page < this.count - 1) {
                this.page++;
                this.updateItems();
            }
        },
        last: function () {
            this.page = this.count - 1;
            this.updateItems();
        },
        updateItems: function () {
            // Lọc các mục theo tìm kiếm
            const filteredItems = $scope.items.filter(item => {
                const matchesSearch = item.id.toString().toLowerCase().includes($scope.searchText.toLowerCase()) ||
                    item.ten.toLowerCase().includes($scope.searchText.toLowerCase());
                const matchesIdCha = !$scope.selectedIdCha || item.idCha === Number($scope.selectedIdCha);
                return matchesSearch && matchesIdCha;
            });
            filteredItems.sort((a, b) => {
                const dateA = new Date(a.ngayTao); // Giả sử `ngayCapNhat` là trường ngày
                const dateB = new Date(b.ngayTao);
                return dateB - dateA; // Sắp xếp theo thứ tự giảm dần
            });

            this.count = Math.ceil(filteredItems.length / this.size);
            this.items = filteredItems.slice(this.page * this.size, (this.page + 1) * this.size);
        }
    };

    // Khởi tạo và tải dữ liệu
    $scope.initialize = function () {
        // Gọi API và kiểm tra dữ liệu
        $http.get("/size/get-list").then(resp => {
            console.log("Dữ liệu từ API: ", resp.data); // Kiểm tra dữ liệu từ API
            // Kiểm tra xem resp.data.data có phải là mảng không
            if (Array.isArray(resp.data.data)) {
                $scope.items = resp.data.data.map(item => ({
                    ...item,
                    ngayTao: new Date(item.ngayTao), // Chuyển đổi ngày
                    ngayCapNhat: new Date(item.ngayCapNhat) // Chuyển đổi ngày
                }));
                $scope.pager.updateItems(); // Cập nhật các mục cho pager
            } else {
                console.error("API không trả về một mảng. Kiểm tra cấu trúc dữ liệu.");
            }
        }).catch(error => {
            console.error("Lỗi khi tải danh mục: ", error);
        });
    };

    // Theo dõi thay đổi trong ô tìm kiếm
    $scope.$watch('searchText', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.pager.updateItems();
        }
    });

    $scope.$watch('selectedIdCha', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.pager.updateItems();
        }
    });


    $scope.initialize();

    $scope.reset = function () {
        $scope.form.ten = ''
    };

    $scope.resetAdd = function () {
        $scope.formAdd = {};
    };

    $scope.edit = function (item) {
        // Chuyển timestamp thành Date object
        item.ngayCapNhat = new Date(item.ngayCapNhat);
        item.ngayTao = new Date(item.ngayTao);
        $scope.form = angular.copy(item);
    };

    $scope.validateForm = function (form, errorContainer, isUpdate = false) {
        // Kiểm tra tên
        if (!form.ten) {
            errorContainer.ten = true;
            toastr.error("Tên size không được để trống.", "Lỗi!");
        } else if (form.ten.length > 100) {
            errorContainer.ten = true;
            toastr.error("Tên size không lớn quá 100 ký tự", "Lỗi!");
        } else if (/[!@#$%^&*()~|]/.test(form.ten)) {  // Kiểm tra ký tự đặc biệt @$%#
            errorContainer.ten = true;
            toastr.error("Tên size không được chứa ký tự đặc biệt.", "Lỗi!");
        } else if (
            $scope.items.some(item =>
                item.ten.trim().toLowerCase() === form.ten.trim().toLowerCase() &&
                (!isUpdate || item.id !== form.id) // Kiểm tra trùng tên với ID khác (trường hợp update)
            )
        ) {
            errorContainer.ten = true;
            toastr.error("Tên size đã tồn tại. Vui lòng chọn tên khác.", "Lỗi!");
        } else {
            errorContainer.ten = false;
        }

        if (!form.idCha) {
            errorContainer.idCha = true;
            toastr.error("Bạn chưa chọn loại size.", "Lỗi!");
        } else {
            errorContainer.idCha = false;
        }

        return !Object.values(errorContainer).includes(true);
    };

    $scope.create = function () {
        $scope.error1 = {};
        if (!$scope.validateForm($scope.formAdd, $scope.error1, false)) {
            return;
        }

        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn thêm size này không?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willAdd) => {
            if (willAdd) {
                let item = angular.copy($scope.formAdd);
                var token = localStorage.getItem('token');
                item.trangThai = 1; // Thiết lập mặc định giá trị trangThai là 1
                $http.post(`/size/add`, item, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).then(resp => {
                    $scope.initialize();
                    $scope.resetAdd();
                    $('#addModal').modal('hide');
                    toastr.success("Thêm mới size thành công", "Thành công!");
                }).catch(error => {
                    toastr.error("Thêm mới size thất bại", "Lỗi!");
                    console.error("Error: ", error);
                });
            }
        });
    };

    $scope.update = function () {
        $scope.error = {};
        if (!$scope.validateForm($scope.form, $scope.error, true)) {
            return;
        }

        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn cập size này không?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                let item = angular.copy($scope.form);
                var token = localStorage.getItem('token');
                $http.put(`/size/update/${item.id}`, item, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).then(resp => {
                    $scope.initialize();
                    $('#exampleModal').modal('hide');
                    toastr.success("Cập nhật size thành công", "Thành công!");
                }).catch(error => {
                    toastr.error("Cập nhật size thất bại", "Lỗi!");
                    console.error("Error: ", error);
                });
            }
        });
    };

    $scope.updateTrangThaiTo1 = function (item) {
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn mở khóa size này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                let updatedItem = angular.copy(item);
                updatedItem.trangThai = 1;
                var token = localStorage.getItem('token');
                $http.put(`/size/update/${updatedItem.id}`, updatedItem, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).then(resp => {
                    $scope.initialize();
                    toastr.success("Đã mở khóa size này", "Thành công!");
                }).catch(error => {
                    toastr.error("Mở khóa size này thất bại", "Lỗi!");
                    console.error("Error: ", error);
                });
            }
        });
    };

    $scope.updateTrangThaiTo2 = function (item) {
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn cập khóa size này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                let updatedItem = angular.copy(item);
                updatedItem.trangThai = 2;
                var token = localStorage.getItem('token');
                $http.put(`/size/update/${updatedItem.id}`, updatedItem, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).then(resp => {
                    $scope.initialize();
                    toastr.success("Đã khóa size này", "Thành công!");
                }).catch(error => {
                    toastr.error("Khóa size này thất bại", "Lỗi!");
                    console.error("Error: ", error);
                });
            }
        });
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
});
