app.controller('danhmuc-ctrl', function ($scope, $http) {
    $scope.items = []; // Danh sách danh mục
    $scope.formAdd = {}; // Biến lưu thông tin khi thêm danh mục
    $scope.formEdit = {}; // Biến lưu thông tin khi chỉnh sửa danh mục
    $scope.danhMucRoot = []; // Danh mục gốc (danh mục cha cấp 1)
    $scope.searchText = ''; // Biến tìm kiếm
    $scope.selectedIdCha = null;
    $scope.pager = {
        page: 0, size: 10, // Giá trị mặc định
        items: [], count: 0, first: function () {
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
                const matchesSearch = item.id.toString().toLowerCase().includes($scope.searchText.toLowerCase()) || item.ten.toLowerCase().includes($scope.searchText.toLowerCase());
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
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    const headers = {
        headers: {Authorization: `Bearer ${token}`}
    };
    $scope.toggleDropdown = function() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        dropdownMenu.classList.toggle('show');

        const dropdownArrow = document.getElementById('dropdown-arrow');
        dropdownArrow.classList.toggle('bi-chevron-down');
        dropdownArrow.classList.toggle('bi-chevron-up');
    };

// Hàm đệ quy tạo cây danh mục (bao gồm các danh mục con nếu có)
    function generateTree(categories, parentElement) {
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.classList.add('treeview-item');
            categoryElement.textContent = category.ten;

            categoryElement.onclick = function(event) {
                event.stopPropagation();

                document.getElementById('dropdown-title').textContent = category.ten;
                document.getElementById('dropdown-title-edit').textContent = category.ten;

                selectCategory(category);
                $scope.toggleDropdown();
            };

            if (category.children && category.children.length > 0) {
                const toggleButton = document.createElement('i');
                toggleButton.classList.add('bi', 'bi-chevron-down');
                toggleButton.classList.add('toggle-button');
                toggleButton.onclick = function(event) {
                    event.stopPropagation();
                    toggleSubCategories(category);
                };
                categoryElement.appendChild(toggleButton);
            }

            if (category.children && category.children.length > 0) {
                const subCategoriesContainer = document.createElement('div');
                subCategoriesContainer.classList.add('sub-categories');
                subCategoriesContainer.style.display = 'none';
                generateTree(category.children, subCategoriesContainer);
                categoryElement.appendChild(subCategoriesContainer);
            }

            parentElement.appendChild(categoryElement);
        });
    }

    $scope.selectedCategory = null;

    function selectCategory(category) {
        $scope.selectedCategory = category;
        console.log('Danh mục đã chọn:', $scope.selectedCategory);
    }

// Hàm toggle ẩn/hiện danh mục con
    function toggleSubCategories(category) {
        const subCategoriesContainer = event.target.closest('.treeview-item').querySelector('.sub-categories');
        if (subCategoriesContainer) {
            const icon = event.target;
            // Toggle ẩn/hiện danh mục con
            if (subCategoriesContainer.style.display === 'none') {
                subCategoriesContainer.style.display = 'block';  // Hiển thị danh mục con
                icon.classList.remove('bi-chevron-down');
                icon.classList.add('bi-chevron-up');  // Đổi sang mũi tên trỏ lên
            } else {
                subCategoriesContainer.style.display = 'none';  // Ẩn danh mục con
                icon.classList.remove('bi-chevron-up');
                icon.classList.add('bi-chevron-down');  // Đổi sang mũi tên trỏ xuống
            }
        }
    }

// Hàm gọi API để lấy danh mục từ server và cập nhật cây danh mục vào modal
    $scope.loadDanhMucForModal = function () {
        $http.get('/rest/danhmuc/get-children', headers)
            .then(function (response) {
                const categories = response.data.data;
                const dropdownMenu = document.getElementById('dropdown-menu');
                dropdownMenu.innerHTML = ''; // Xóa nội dung cũ
                generateTree(categories, dropdownMenu); // Tạo lại cây danh mục
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy danh mục:', error);
            });
    };

// Gọi hàm loadDanhMucForModal khi mở modal
    $('#addModal').on('shown.bs.modal', function () {
        $scope.loadDanhMucForModal();
    });

    function resetModal() {
        $scope.formAdd = {
            ten: '',
            moTa: ''
        };

        // Reset dropdown (nếu cần)
        $scope.selectedCategory = null;
        document.getElementById('dropdown-title').textContent = 'Chọn Danh Mục';

        const dropdownMenu = document.getElementById('dropdown-menu');
        dropdownMenu.innerHTML = ''; // Xóa nội dung trong dropdown menu
    }
    // Gọi hàm resetModal khi đóng modal
    $('#addModal').on('hidden.bs.modal', function () {
        resetModal();
    });

    // Load danh sách danh mục từ server
    $scope.load = function () {
        $http.get('/rest/danhmuc', headers).then((resp) => {
            $scope.items = resp.data.data;
            $scope.danhMucRoot = $scope.items.filter(dm => !dm.idCha); // Lọc danh mục cha cấp 1
            $scope.pager.updateItems();
        }).catch((err) => {
            console.error(err);
            alert('Lỗi khi tải danh mục!');
        });
    };

    // Lấy các danh mục con của một danh mục
    $scope.loadDanhMucCon = function (idCha, level) {
        const danhMucCha = $scope.items.filter(dm => dm.idCha === Number(idCha));

        if (level === 1) {
            $scope.danhMucChildren = danhMucCha;
            $scope.danhMucConCon = []; // Reset cấp 3
            $scope.danhMucConConCon = []; // Reset cấp 4
        } else if (level === 2) {
            $scope.danhMucConCon = danhMucCha;
            $scope.danhMucConConCon = []; // Reset cấp 4
        } else if (level === 3) {
            $scope.danhMucConConCon = danhMucCha;
        }
    };

    // Thêm danh mục mới
    $scope.create = function () {
        // Kiểm tra trường "Tên Danh Mục" không được rỗng
        if (!$scope.formAdd.ten || $scope.formAdd.ten.trim() === '') {
            toastr.error("Tên danh mục không được để trống", "Lỗi!");
            return; // Nếu tên danh mục rỗng thì không tiếp tục thực hiện
        }

        // Hiển thị hộp thoại xác nhận
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn thêm danh mục mới này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                const item = angular.copy($scope.formAdd);
                item.idCha = $scope.selectedCategory ? $scope.selectedCategory.id : null; // Lưu idCha (nếu có)
                item.trangThai = 1;

                // Thực hiện gọi API để thêm danh mục mới
                $http.post('/rest/danhmuc', item, headers).then((resp) => {
                    $scope.items.push(resp.data.data); // Thêm vào danh sách
                    $scope.resetFormAdd(); // Reset form
                    $scope.load(); // Reload danh sách
                    $('#addModal').modal('hide');
                    toastr.success("Thêm danh mục mới thành công", "Thành công!");
                }).catch((err) => {
                    console.error(err);
                    toastr.error("Thêm danh mục mới lỗi", "Lỗi!");
                });
            }
        });
    };


    // Reset form thêm danh mục
    $scope.resetFormAdd = function () {
        $scope.formAdd = {
            ten: '', moTa: '', idCha: '',
        };
    };

    $scope.getTenDanhMuc = function (idCha) {
        const danhMucCha = $scope.items.find(item => item.id === idCha);
        return danhMucCha ? danhMucCha.ten : 'Không có danh mục cha'; // Trả về tên danh mục hoặc 'Không có danh mục cha' nếu không tìm thấy
    };



    $scope.validateForm = function (form, errorContainer, isUpdate = false) {
        // Kiểm tra tên
        if (!form.ten) {
            errorContainer.ten = true;
            toastr.error("Tên danh mục không được để trống.", "Lỗi!");
        } else if (form.ten.length > 200) {
            errorContainer.ten = true;
            toastr.error("Tên danh mục không quá 200 ký tự", "Lỗi!");
        } else if (/[!@#$%^&*()~|]/.test(form.ten)) {  // Kiểm tra ký tự đặc biệt @$%#
            errorContainer.ten = true;
            toastr.error("Tên danh mục không được chứa ký tự đặc biệt.", "Lỗi!");
        } else if ($scope.items.some(item => item.ten.trim().toLowerCase() === form.ten.trim().toLowerCase() && (!isUpdate || item.id !== form.id) // Kiểm tra trùng tên với ID khác (trường hợp update)
        )) {
            errorContainer.ten = true;
            toastr.error("Tên danh mục đã tồn tại. Vui lòng chọn tên khác.", "Lỗi!");
        } else {
            errorContainer.ten = false;
        }

        // Kiểm tra mô tả
        if (!form.moTa) {
            errorContainer.moTa = true;
            toastr.error("Mô tả danh mục không được để trống.", "Lỗi!");
        } else if (form.moTa.length > 1000) {
            errorContainer.moTa = true;
            toastr.error("Mô tả danh mục không quá 1000 ký tự", "Lỗi!");
        } else {
            errorContainer.moTa = false;
        }


        return !Object.values(errorContainer).includes(true);
    };

    $scope.$watchGroup(['searchText', 'selectedIdCha'], function () {
        $scope.pager.updateItems();
    });

    $scope.updateTrangThaiTo1 = function (item) {
        if (item.trangThai === 1) {
            toastr.error("Danh mục này đang hoạt động", "Lỗi!");
            return;
        }
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn mở khóa danh mục này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                let updatedItem = angular.copy(item);
                updatedItem.trangThai = 1;
                var token = localStorage.getItem('token');
                $http.put(`/rest/danhmuc/${updatedItem.id}`, updatedItem, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).then(resp => {
                    console.log(resp);
                    if (resp.data.code === '200') {
                        toastr.success("Đã mở khóa thành công", "Thành công!");
                        $scope.load();
                    }else {
                        toastr.error("Cập nhật trạng thái thất bại", "Lỗi!");
                    }
                }).catch(error => {
                    const errorMessage = error.data && error.data.message ? error.data.message : "Cập nhật trạng thái thất bại";
                    toastr.error(errorMessage, "Lỗi!");
                    console.error("Error: ", error);
                });
            }
        });
    };


    $scope.updateTrangThaiTo2 = function (item) {
        if (item.trangThai === 0) {
            toastr.error("Danh mục này đã bị khóa trước đó", "Lỗi!");
            return;
        }
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn khóa danh mục này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                let updatedItem = angular.copy(item);
                updatedItem.trangThai = 0;
                var token = localStorage.getItem('token');
                $http.put(`/rest/danhmuc/${updatedItem.id}`, updatedItem, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).then(resp => {
                    if (resp.data.code === '200') {
                        toastr.success("Đã khóa thành công", "Thành công!");
                        $scope.load();
                    }else {
                        toastr.error("Cập nhật trạng thái thất bại", "Lỗi!");
                    }
                }).catch(error => {
                    const errorMessage = error.data && error.data.message ? error.data.message : "Cập nhật trạng thái thất bại";
                    toastr.error(errorMessage, "Lỗi!");
                    console.error("Error: ", error);
                });
            }
        });
    };
    $scope.formEdit = {};  // Biến lưu thông tin khi chỉnh sửa danh mục

    // Hàm hiển thị modal chỉnh sửa
    $scope.edit = function (id) {
        // Tìm danh mục theo ID
        const danhMuc = $scope.items.find(item => item.id === id);
        if (danhMuc) {
            $scope.formEdit = angular.copy(danhMuc);  // Sao chép dữ liệu vào formEdit
            $scope.selectedCategory = $scope.formEdit.idCha ? $scope.items.find(item => item.id === $scope.formEdit.idCha) : null;  // Lưu danh mục cha đã chọn
            $scope.loadDanhMucForModalEdit();  // Nạp lại cây danh mục cho modal
            $('#editModal').modal('show');  // Mở modal chỉnh sửa
        }
    };

    // Hàm cập nhật danh mục sau khi chỉnh sửa
    $scope.update = function () {
        // Kiểm tra thông tin form trước khi gửi
        if (!$scope.formEdit.ten || $scope.formEdit.ten.trim() === '') {
            toastr.error("Tên danh mục không được để trống", "Lỗi!");
            return;
        }

        // Hiển thị hộp thoại xác nhận
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn cập nhật danh mục này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
            dangerMode: true,
        }).then((willUpdate) => {
            if (willUpdate) {
                // Sao chép thông tin formEdit
                const updatedItem = angular.copy($scope.formEdit);
                updatedItem.idCha = $scope.selectedCategory ? $scope.selectedCategory.id : null;

                // Gọi API để cập nhật danh mục
                $http.put(`/rest/danhmuc/${updatedItem.id}`, updatedItem, headers).then((resp) => {
                    // Cập nhật lại danh mục trong danh sách
                    const index = $scope.items.findIndex(item => item.id === updatedItem.id);
                    if (index !== -1) {
                        $scope.items[index] = resp.data.data;
                    }
                    $scope.load();
                    toastr.success("Cập nhật danh mục thành công", "Thành công!");
                    $('#editModal').modal('hide');  // Đóng modal
                }).catch((err) => {
                    toastr.error("Cập nhật danh mục thất bại", "Lỗi!");
                    console.error(err);
                });
            }
        });
    };

    // Nạp lại cây danh mục cho modal edit
    $scope.loadDanhMucForModalEdit = function () {
        $http.get('/rest/danhmuc/get-children', headers)
            .then(function (response) {
                const categories = response.data.data;
                const dropdownMenu = document.getElementById('dropdown-menu-edit');
                dropdownMenu.innerHTML = ''; // Xóa nội dung cũ
                generateTree(categories, dropdownMenu); // Tạo lại cây danh mục
            })
            .catch(function (error) {
                console.error('Lỗi khi lấy danh mục:', error);
            });
    };

    // Cập nhật thông tin danh mục khi chọn danh mục cha
    $scope.selectCategoryForEdit = function (category) {
        $scope.selectedCategory = category;  // Lưu danh mục cha đã chọn vào selectedCategory
        document.getElementById('dropdown-title-edit').textContent = category.ten;  // Cập nhật tiêu đề dropdown
        $scope.formEdit.idCha = category.id;  // Cập nhật vào formEdit
        $scope.toggleDropdownEdit();  // Đóng dropdown
    };

    // Hiển thị tên danh mục cha đã chọn
    $scope.getTenDanhMuc = function (idCha) {
        const danhMucCha = $scope.items.find(item => item.id === idCha);
        return danhMucCha ? danhMucCha.ten : 'Không có danh mục cha'; // Trả về tên danh mục hoặc 'Không có danh mục cha' nếu không tìm thấy
    };

    // Hàm toggle ẩn/hiện danh mục con cho modal Edit
    $scope.toggleDropdownEdit = function() {
        const dropdownMenu = document.getElementById('dropdown-menu-edit');
        dropdownMenu.classList.toggle('show');

        const dropdownArrow = document.getElementById('dropdown-arrow-edit');
        dropdownArrow.classList.toggle('bi-chevron-down');
        dropdownArrow.classList.toggle('bi-chevron-up');
    };

    // Reset modal Edit khi đóng
    $scope.resetModalEdit = function () {
        $scope.formEdit = {
            ten: '', moTa: '', idCha: ''
        };
        $scope.selectedCategory = null;
        document.getElementById('dropdown-title-edit').textContent = 'Chọn danh mục cha';
    };

    // Gọi hàm resetModalEdit khi đóng modal
    $('#editModal').on('hidden.bs.modal', function () {
        $scope.resetModalEdit();
    });


    // Khởi chạy
    $scope.load();

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

