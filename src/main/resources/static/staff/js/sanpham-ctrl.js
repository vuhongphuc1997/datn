app.controller("sanpham-ctrl", function ($scope, $http,$location) {
    $scope.items = [];
    $scope.form = {};
    $scope.danhmuc = [];
    $scope.thuonghieu = [];
    $scope.chatlieu = [];
    $scope.mausac = [];
    $scope.size = [];
    $scope.errorMessage = "";
    $scope.filteredSizes = [];
    $scope.filteredColors = [];
    $scope.productDetails = [];

    // Khởi tạo dữ liệu
    $scope.initialize = function () {
        $http.get("/rest/danhmuc").then(resp => {
            $scope.danhmuc = resp.data.data;
            $scope.danhMucRoot = $scope.danhmuc.filter(dm => !dm.idCha); // Lọc danh mục cha cấp 1
            $scope.danhMucChildren = []; // Reset danh mục con
            $scope.danhMucConCon = []; // Reset danh mục con con
            $scope.danhMucConConCon = []; // Reset danh mục con con con
        });

        $http.get("/rest/thuonghieu").then(resp => {
            $scope.thuonghieu = resp.data.data.filter(item => item.trangThai === 1);
        });

        $http.get("/chat-lieu/get-list").then(resp => {
            $scope.chatlieu = resp.data.data.filter(item => item.trangThai === 1);
        });

        $http.get("/size/get-list").then(resp => {
            $scope.size = resp.data.data.filter(item => item.trangThai === 1);
            $scope.filterSizesByIdCha(); // Nếu có logic riêng để lọc theo idCha
        });

        $http.get("/mau-sac/get-list").then(resp => {
            $scope.mausac = resp.data.data.filter(item => item.trangThai === 1);
            $scope.filterColorsByIdCha(); // Nếu có logic riêng để lọc theo idCha
        });

        $http.get("/san-pham").then(resp => {
            $scope.sanpham = resp.data.data; // Lưu danh sách sản phẩm vào biến $scope.sanpham
        });

        $scope.productDetails = []; // Khởi tạo mảng sản phẩm chi tiết
        $scope.form.anh = ""; // Đặt lại ảnh mặc định hoặc rỗng
    };

    $scope.loadDanhMucCon = function (idCha, level) {
        const danhMucCha = $scope.danhmuc.filter(dm => dm.idCha === Number(idCha));

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

    $scope.initialize();

    $scope.filterSizesByIdCha = function () {
        if ($scope.selectedSizeIdCha) {
            $scope.filteredSizes = $scope.size.filter(size => size.idCha == $scope.selectedSizeIdCha);
        } else {
            $scope.filteredSizes = $scope.size;
        }
    };

    $scope.filterColorsByIdCha = function () {
        if ($scope.selectedColorIdCha) {
            $scope.filteredColors = $scope.mausac.filter(mausac => mausac.idCha == $scope.selectedColorIdCha);
        } else {
            $scope.filteredColors = $scope.mausac;
        }
    };

    $scope.filterColorsAndSizes = function () {
        $scope.productDetails = [];
        const selectedColors = $scope.filteredColors.filter(color => color.selected);
        const selectedSizes = $scope.filteredSizes.filter(size => size.selected);

        selectedColors.forEach(function (color) {
            selectedSizes.forEach(function (size) {
                $scope.productDetails.push({
                    idSize: size.id,
                    idMauSac: color.id,
                    soLuong: "",
                    ghiChu: '',
                    size: size,
                    mauSac: color
                });
            });
        });
    };

    $scope.removeProductDetail = function (detail) {
        // Xóa sản phẩm chi tiết khỏi danh sách
        const index = $scope.productDetails.indexOf(detail);
        if (index > -1) {
            $scope.productDetails.splice(index, 1); // Xóa sản phẩm chi tiết
        }
    };
    // Reset form
    $scope.reset = function () {
        $scope.form = {}; // Đặt lại form về trạng thái ban đầu
        $scope.form.anh = ""; // Đặt lại ảnh về mặc định
        $scope.errorMessage = ""; // Xóa bỏ thông báo lỗi
        $scope.initialize();
        $scope.clearImagePreview();
    };

    $scope.generateRandomCode = function (minLength, maxLength) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#';
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    };

    // Xử lý khi file ảnh thay đổi
    $scope.onFileChange = function (event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                $scope.errorMessage = "Kích thước file phải nhỏ hơn 5MB.";
                return;
            }
            if (!file.type.startsWith("image/")) {
                $scope.errorMessage = "Vui lòng chọn một file ảnh.";
                return;
            }

            // Lưu ảnh vào form và hiển thị ảnh đã chọn
            $scope.form.anh = file;
            const reader = new FileReader();
            reader.onload = function (e) {
                $scope.$apply(() => {
                    $scope.form.anh.preview = e.target.result;
                    $scope.errorMessage = ""; // Xóa lỗi nếu file hợp lệ
                });
            };
            reader.readAsDataURL(file); // Đọc file ảnh và lưu vào form
        } else {
            $scope.errorMessage = "Không có ảnh được chọn.";
        }
    };

    // Thêm sản phẩm
    $scope.create = function () {
        $scope.error = {};
        if (!$scope.validateForm($scope.form, $scope.error, false)) {
            return;
        }

        // Display confirmation prompt before creating product
        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn thêm danh mục này không?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willCreate) => {
            if (willCreate) {
                // Proceed with adding product if confirmed
                const now = new Date().toISOString().split('.')[0];
                let ma = $scope.generateRandomCode(5, 12);

                let formData = new FormData();
                formData.append("ten", $scope.form.ten);
                formData.append("ma", ma);
                formData.append("xuatXu", $scope.form.xuatXu);
                formData.append("moTa", $scope.form.moTa);
                formData.append("gia", $scope.form.gia);
                formData.append("idDanhMuc", $scope.form.idDanhMuc);
                formData.append("idThuongHieu", $scope.form.idThuongHieu);
                formData.append("idChatLieu", $scope.form.idChatLieu);
                formData.append("trangThai", 1);

                if ($scope.form.anh) {
                    formData.append("file", $scope.form.anh);
                }

                const token = localStorage.getItem('token'); // Điều chỉnh key 'authToken' theo token bạn lưu trữ trong localStorage

                $http.post("/san-pham", formData, {
                    headers: {
                        'Content-Type': undefined,
                        'Authorization': `Bearer ${token}` // Thêm token vào header Authorization
                    }
                }).then(response => {
                    $http.get("/san-pham").then(resp => {
                        const dataArray = resp.data.data;
                        if (Array.isArray(dataArray) && dataArray.length > 0) {
                            const createdSanPham = dataArray[dataArray.length - 1];
                            const sanPhamChiTietList = $scope.productDetails.map(detail => ({
                                idSanPham: createdSanPham.id,
                                idSize: detail.size.id,
                                idMauSac: detail.mauSac.id,
                                soLuong: detail.soLuong,
                                gia: $scope.form.gia,
                                ghiChu: detail.ghiChu,
                                trangThai: 1,
                                ngayTao: new Date().toISOString(),
                                ngayCapNhat: new Date().toISOString(),
                                nguoiTao: 1,
                                nguoiCapNhat: 1
                            }));
                            const token = localStorage.getItem('token'); // Điều chỉnh key 'authToken' theo token bạn lưu trữ trong localStorage

                            const addDetailsPromises = sanPhamChiTietList.map(detail => $http.post("/spct", detail, {
                                headers: {
                                    'Authorization': `Bearer ${token}` // Thêm token vào header cho yêu cầu chi tiết sản phẩm
                                }
                            }));
                            addDetailsPromises.push($scope.uploadImages(createdSanPham.id));

                            Promise.all(addDetailsPromises).then(() => {
                                $scope.initialize();
                                $scope.reset();
                                $location.path('/listsanpham');
                                toastr.success("Sản phẩm và chi tiết sản phẩm đã được thêm thành công", "Thành công!");
                            }).catch(error => {
                                console.error("Lỗi khi thêm chi tiết sản phẩm:", error);
                            });
                        } else {
                            console.error("Không thể tìm thấy sản phẩm vừa tạo.");
                        }
                    }).catch(error => {
                        console.error("Lỗi khi lấy sản phẩm mới nhất:", error);
                    });
                }).catch(error => {
                    console.error("Có lỗi khi thêm sản phẩm", error);
                    $scope.errorMessage = "Có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử lại.";
                    toastr.error("Chưa có ảnh or sản phẩm chi tiết", "Lỗi!");
                });
            } else {
                toastr.info("Sản phẩm chưa được thêm.", "Hủy bỏ");
            }
        });
    };

    $scope.updateImagePreview3 = function (event) {
        // Xóa tất cả ảnh đã hiển thị trước đó
        var previewContainer = document.getElementById('previewContainer');
        previewContainer.innerHTML = '';

        // Lấy danh sách file được chọn
        var files = event.target.files;

        // Kiểm tra nếu có file nào được chọn
        if (files.length > 0) {
            // Duyệt qua danh sách file và tạo preview cho từng file
            $scope.image.anh = []; // Đảm bảo danh sách ảnh được reset
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();

                // Khi đọc file xong, tạo preview và cập nhật vào model
                reader.onload = (function (theFile) {
                    return function (e) {
                        // Tạo phần tử img để hiển thị ảnh
                        var img = document.createElement('img');
                        img.classList.add('preview-image');
                        img.src = e.target.result;
                        img.style.maxWidth = '100px'; // Đặt kích thước hiển thị
                        img.style.margin = '5px';

                        // Thêm ảnh vào container
                        previewContainer.appendChild(img);

                        // Cập nhật danh sách ảnh vào mô hình Angular
                        $scope.$apply(function () {
                            $scope.image.anh.push({
                                file: theFile,
                                url: e.target.result
                            });
                        });
                    };
                })(file);

                reader.readAsDataURL(file); // Đọc file ảnh
            }
        }
    };

    $scope.uploadImages = function (idSanPham) {
        const input = document.getElementById('profileImage3');
        const files = input.files;
        if (files.length > 0) {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append("images", file);
            });
            formData.append("idSanPham", idSanPham);

            return $http.post("/hinh-anh", formData, {
                headers: {'Content-Type': undefined}
            }).then(resp => {
                console.log("Ảnh đã được tải lên thành công");
                // Cập nhật thông tin đường dẫn hình ảnh cho sản phẩm
                document.getElementById("imagePath3").value = resp.data.filePath;  // hiển thị đường dẫn ở input
            }).catch(error => {
                console.error("Lỗi khi tải lên ảnh:", error);
                toastr.error("Có lỗi khi tải ảnh lên", "Lỗi!");
            });
        } else {
            swal("Lỗi!", "Vui lòng chọn ảnh sản phẩm.", "error");
        }
    };

    $scope.clearImagePreview = function () {
        selectedFiles = [];  // Xóa danh sách các file đã chọn
        // Reset file input by setting its value to null
        const input = document.getElementById('profileImage3');
        if (input) {
            input.value = null;
        }
        const input2 = document.getElementById('anh');
        if (input2) {
            input2.value = null;
        }
        // Clear the preview container
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }

        // Clear any image data in the AngularJS model
        $scope.form.anh = null;
        $scope.errorMessage = "";
    };

    $scope.validateForm = function (form, errorContainer, isUpdate = false) {

        if (!form.ten) {
            errorContainer.ten = true;
            toastr.error("Tên sản phẩm không được để trống.", "Lỗi!");
        } else if (form.ten.length > 200) {
            errorContainer.ten = true;
            toastr.error("Tên sản phẩm không quá 200 ký tự", "Lỗi!");
        } else if (/[!@#$%^&*()~|]/.test(form.ten)) {  // Kiểm tra ký tự đặc biệt @$%#
            errorContainer.ten = true;
            toastr.error("Tên danh mục không được chứa ký tự đặc biệt.", "Lỗi!");
        } else if (
            $scope.sanpham && $scope.sanpham.some(item =>
                item.ten.trim().toLowerCase() === form.ten.trim().toLowerCase() &&
                (!isUpdate || item.id !== form.id) // Kiểm tra trùng tên với ID khác (trường hợp update)
            )
        ) {
            errorContainer.ten = true;
            toastr.error("Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác.", "Lỗi!");
        } else {
            errorContainer.ten = false;
        }

        if (!form.moTa) {
            errorContainer.moTa = true;
            toastr.error("Mô tả sản phẩm không được để trống.", "Lỗi!");
        } else if (form.moTa.length > 2000) {
            errorContainer.moTa = true;
            toastr.error("Mô tả sản phẩm tối đa 1000 ký tự", "Lỗi!");
        } else {
            errorContainer.moTa = false;
        }

        if (!form.xuatXu) {
            errorContainer.xuatXu = true;
            toastr.error("Xuất xứ sản phẩm không được để trống.", "Lỗi!");
        } else if (form.xuatXu.length > 200) {
            errorContainer.xuatXu = true;
            toastr.error("Xuất xứ sản phẩm không quá 200 ký tự", "Lỗi!");
        } else {
            errorContainer.xuatXu = false;
        }

        if (!$scope.form.gia || $scope.form.gia < 0) {
            errorContainer.gia = true;
            toastr.error("Chưa nhập giá và giá phải lơn hơn 0", "Lỗi!");
        } else {
            errorContainer.gia = false;
        }

        // if (!form.idDanhMuc) {
        //     errorContainer.idDanhMuc = true;
        //     toastr.error("Bạn chưa chọn danh mục.", "Lỗi!");
        // } else {
        //     errorContainer.idDanhMuc = false;
        // }

        if (!form.idDanhMuc) {
            errorContainer.idDanhMuc = true;
            toastr.error("Bạn chưa chọn danh mục.", "Lỗi!");
        } else {
            errorContainer.idDanhMuc = false;
        }

        if (!form.idThuongHieu) {
            errorContainer.idThuongHieu = true;
            toastr.error("Bạn chưa chọn thương hiệu.", "Lỗi!");
        } else {
            errorContainer.idThuongHieu = false;
        }

        if (!form.idChatLieu) {
            errorContainer.idChatLieu = true;
            toastr.error("Bạn chưa chọn chất liệu.", "Lỗi!");
        } else {
            errorContainer.idChatLieu = false;
        }

        if (!form.anh) {
            errorContainer.anh = true;
            toastr.error("Bạn chưa chọn ảnh sản phẩm.", "Lỗi!");
        } else if (form.anh.size > 5 * 1024 * 1024) { // Kích thước ảnh lớn hơn 5MB
            errorContainer.anh = true;
            toastr.error("Kích thước ảnh không được vượt quá 5MB.", "Lỗi!");
        } else {
            errorContainer.anh = false;
        }

        if ($scope.productDetails.length === 0) {
            errorContainer.productDetails = true;
            toastr.error("Vui lòng chọn màu sắc và kích thước cho sản phẩm.", "Lỗi!");
        } else {
            errorContainer.productDetails = false;
        }

        // Kiểm tra giá và số lượng của sản phẩm chi tiết
        for (let detail of $scope.productDetails) {
            if (detail.soLuong <= 0 || !detail.soLuong) {
                errorContainer.soLuong = true;
                toastr.error("Số lượng của sản phẩm chi tiết phải lớn hơn 0.");
            } else {
                errorContainer.soLuong = false;
            }
        }

        const input = document.getElementById('profileImage3');
        if (!input.files || input.files.length === 0) {
            toastr.error("Bạn chưa chọn ảnh cho chi tiết sản phẩm.", "Lỗi!");
            errorContainer.images = true;
        } else if (input.files[0].size > 5 * 1024 * 1024) { // Kích thước ảnh lớn hơn 5MB
            toastr.error("Kích thước ảnh không được vượt quá 5MB.", "Lỗi!");
            errorContainer.images = true;
        } else {
            errorContainer.images = false;
        }


        return !Object.values(errorContainer).includes(true);

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

    $scope.toggleDropdown = function(event) {
        $scope.loadDanhMucForModal();
        const dropdownMenu = document.getElementById('dropdown-menu');
        dropdownMenu.classList.toggle('show');

        const dropdownArrow = document.getElementById('dropdown-arrow');
        dropdownArrow.classList.toggle('bi-chevron-down');
        dropdownArrow.classList.toggle('bi-chevron-up');
        console.log("Selected Category ID: ", $scope.form.idDanhMuc);

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
        $scope.form.idDanhMuc = category.id; // Gán ID danh mục vào form

        // Kiểm tra xem phần tử dropdown-title có tồn tại không
        var dropdownTitleElement = document.getElementById('dropdown-title');
        if (dropdownTitleElement) {
            dropdownTitleElement.textContent = category.ten; // Cập nhật giao diện
        } else {
            console.log("Element with id 'dropdown-title' not found.");
        }

        // Log giá trị idDanhMuc để kiểm tra
        console.log("Selected Category ID: ", $scope.form.idDanhMuc);
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
    $scope.loadDanhMucForModal = function () {
        $http.get('/rest/danhmuc/get-children')
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
});
