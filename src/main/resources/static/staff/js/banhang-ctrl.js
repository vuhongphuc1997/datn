
// Khởi tạo controller AngularJS
app.controller("banhang-ctrl", function ($scope, $http, $rootScope, $firebase, $location, $timeout) {
    $scope.bills = JSON.parse(localStorage.getItem('bills')) || [];
    $scope.activeBill = 0;
    $scope.showPopUp = false;
    $scope.listProduct = JSON.parse(localStorage.getItem('listProduct')) || [];
    $scope.listProductPromotion = [];
    $scope.vouchers = [];
    $scope.searchTerm = '';
    $scope.barcode = '';
    $scope.sliderOffset = 0;
    $scope.sliderPosition = 0;
    $scope.maxSliderPosition = 8;
    $scope.modeScan = false

    $scope.toggleModeScan = function() {
        $scope.modeScan = !$scope.modeScan;
        if ($scope.modeScan) {
            $timeout(function() {
                var barcodeInput = document.querySelector('input[name="barcode"]');
                if (barcodeInput) {
                    barcodeInput.focus();
                }
            }, 0);
        }
    };

    $scope.prevTab = function () {
        if ($scope.sliderPosition > 0) {
            $scope.sliderPosition--;
            $scope.sliderOffset += 20;
        }
    };
    $scope.nextTab = function () {
        if ($scope.sliderPosition < $scope.maxSliderPosition) {
            $scope.sliderPosition++;
            $scope.sliderOffset -= 20;
            console.log($scope.sliderPosition)
        }
    };

    $scope.removeLeadingZeros = function (value) {
        if (value !== undefined && value !== null) {
            return String(value).replace(/^0+/, '') || '0';
        }
        return '0';
    };

    //Lưu thông tin hóa đơn vào bộ nhớ trình duyệt
    $scope.saveBillsToLocalStorage = function() {
        localStorage.setItem('bills', JSON.stringify($scope.bills));
    };

    // Ds sp khuyến mãi
    $http.post('/san-pham/search', {trangThai:1})
        .then(function (response) {
            $scope.listProductPromotion= response.data.data;
        }, function (error) {
            console.error("Có lỗi xảy ra khi gọi API sản phẩm: ", error);
        });

    $scope.onBarcodeScan = function() {
        var barcodeInput = document.querySelector('input[name="barcode"]');
        //console.log('Mã vạch:', barcodeInput.value);
        $scope.barcode = barcodeInput.value;
        $timeout(function() {
            // Kiểm tra xem mã vạch có giá trị hợp lệ không
            if ($scope.barcode && $scope.barcode.length > 0) {
                $http.get(`/spct/${$scope.barcode}`).then(response => {
                    let newProduct = response.data.data;

                    // Tìm sản phẩm khuyến mãi nếu có
                    const promoProduct = $scope.listProductPromotion.find(promo => promo.idSanPham === newProduct.idSanPham);

                    // Cập nhật thông tin sản phẩm
                    newProduct.soLuongMax = newProduct.soLuong;
                    newProduct.soLuong = 1;
                    newProduct.image = newProduct.sanPham.anh;
                    newProduct.tenSanPham = newProduct.sanPham.ten;
                    newProduct.color = newProduct.mauSac.ten;
                    newProduct.size = newProduct.size.ten;
                    newProduct.giaTriGiam = promoProduct ? promoProduct.giaTriGiam : 0;
                    newProduct.tenKhuyenMai = promoProduct ? promoProduct.tenKhuyenMai : null;
                    newProduct.trangThai = promoProduct ? promoProduct.trangThai : null;

                    // Kiểm tra sản phẩm đã tồn tại trong hóa đơn hay chưa
                    const existingProductIndex = $scope.bills[$scope.activeBill].items.findIndex(item => item.id === newProduct.id);

                    if (existingProductIndex === -1) {
                        // Nếu chưa tồn tại, thêm mới sản phẩm
                        $scope.bills[$scope.activeBill].items.push(newProduct);
                    } else {
                        // Nếu đã tồn tại, cập nhật số lượng
                        const existingProduct = $scope.bills[$scope.activeBill].items[existingProductIndex];
                        existingProduct.soLuong += 1; // Tăng số lượng
                        if (existingProduct.soLuong > existingProduct.soLuongMax) {
                            existingProduct.soLuong = existingProduct.soLuongMax; // Đảm bảo không vượt quá số lượng tối đa
                        }
                    }

                    // Cập nhật số lượng trong danh sách sản phẩm
                    const productInList = $scope.listProduct.find(p => p.id === newProduct.id);
                    if (productInList) {
                        productInList.soLuong -= 1; // Giảm số lượng sản phẩm trong danh sách
                        if (productInList.soLuong < 0) {
                            productInList.soLuong = 0; // Đảm bảo không âm
                        }
                    }

                    $scope.updateTotalBill($scope.bills[$scope.activeBill]);
                }).catch(error => {
                    console.error(`Lỗi khi gọi API cho sản phẩm ID ${$scope.barcode}:`, error);
                });
            }
        }, 1000);
    };

    $http.get("/khuyen-mai").then(resp => {
        if (resp.data.code === '200') {
            $scope.vouchers = resp.data.data
        }
    });

    $scope.generateBillName = function (lastName) {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // Nếu không có hóa đơn nào, bắt đầu từ "A"
        if (!lastName) return "A";

        // Lấy phần chữ cái của tên hóa đơn, ví dụ: "Hóa đơn A" -> "A"
        let letters = lastName.replace("Hóa đơn ", "").trim();

        // Chuyển từ chữ cái sang số thứ tự
        let index = 0;
        for (let i = 0; i < letters.length; i++) {
            index = index * 26 + (letters.charCodeAt(i) - "A".charCodeAt(0) + 1);
        }

        // Tăng chỉ số để tạo tên tiếp theo
        index++;

        // Chuyển từ số thứ tự sang chữ cái
        let nextName = "";
        while (index > 0) {
            index--; // Trừ 1 để đảm bảo chỉ số 0-based
            nextName = alphabet[index % 26] + nextName;
            index = Math.floor(index / 26);
        }
        return nextName;

    };
    $scope.addBill = function () {
        // Lấy tên hóa đơn cuối cùng
        const lastBillName = $scope.bills.length > 0
            ? $scope.bills[$scope.bills.length - 1].name
            : null;

        // Tạo tên hóa đơn mới
        const newBillName = $scope.generateBillName(lastBillName);
        let bill = {
            type: 'OFFLINE',
            stt: $scope.bills.length + 1,
            name: newBillName,
            totalBillOrigin: 0,
            totalBill: 0,
            totalBillLast: 0,
            disabled: false,
            totalQuantity: 0,
            nameCustomer: "",
            diemTichLuy: 0,
            billDiem: 0,
            pointsToUse: 0,
            search: "",
            idCustomer: 0,
            phoneCustomer: null,
            moneyCustomer: 0,
            trangThai: 7,
            nguoiTao: parseFloat(document.getElementById("nameAdmin").getAttribute('data-id')) || 0,
            tenNguoiTao: document.getElementById("nameAdmin").textContent || 'Admin',
            diemSuDung: '',
            idDiaChiGiaoHang:0,
            idPhuongThucVanChuyen:0,
            nguoiCapNhat:0,
            payCustomer: 'money',
            bankPaymentInterval: null,
            payQRbank: null,
            codeBill: null,
            dateBill: null,
            diemThuong: 0,
            totalPricePromo: 0,
            bankSuccess: false,
            items: []
        };
        $scope.bills.push(bill);
        $scope.activeBill = $scope.bills.length - 1;
    };
    $scope.removeBill = function (index) {
        const billToRemove = $scope.bills[index];

        // Khôi phục số lượng sản phẩm trong danh sách sản phẩm
        if (billToRemove && billToRemove.items) {
            billToRemove.items.forEach(product => {
                const productInList = $scope.listProduct.find(p => p.id === product.id);
                if (productInList) {
                    productInList.soLuong += product.soLuong; // Cộng lại số lượng đã sử dụng
                }
            });
        }

        // Xóa hóa đơn
        $scope.bills.splice(index, 1);
        localStorage.setItem('bills', JSON.stringify($scope.bills));
        // Đặt lại hóa đơn đang hoạt động (activeBill)
        if ($scope.activeBill >= $scope.bills.length) {
            $scope.activeBill = $scope.bills.length - 1; // Chuyển activeBill về hóa đơn cuối nếu vượt quá
        }

        // Đảm bảo activeBill không âm
        if ($scope.activeBill < 0) {
            $scope.activeBill = 0;
        }
    };

    $scope.setActiveBill = function (index) {
        $scope.activeBill = index;
    };

    $scope.getTotalAmount = function (bill) {
        // bill.totalPricePromo = 0;
        // bill.items.forEach(function (item) {
        //     if (item.trangThai) {
        //         bill.totalPricePromo += item.giaTriGiam;
        //     }
        // })
        const discount = (100 - (bill.diemThuong || 0)) / 100;
        const totalAfterDiscount = bill.totalBill * discount;
        const pointsDiscount = (bill.diemSuDung || 0) * 10; // 1 điểm = 10 VNĐ
        return Math.max(totalAfterDiscount - pointsDiscount, 0); // Tổng tiền không âm
    };

    $scope.updatePointsToUse = function (bill) {
        // Xử lý giá trị null hoặc undefined
        if (bill.diemSuDung == null || isNaN(bill.diemSuDung)) {
            bill.diemSuDung = null; // Gán giá trị mặc định (hoặc xử lý theo logic của bạn)
        }

        // Ràng buộc giá trị trong khoảng hợp lệ
        if (bill.diemSuDung > bill.diemTichLuy) {
            bill.diemSuDung = bill.diemTichLuy;
        }
        if (bill.diemSuDung < 0) {
            bill.diemSuDung = 0;
        }
    };

    $scope.updateTotalBill = function (bill) {
        bill.totalBillOrigin = bill.items.reduce(function (total, product) {
            return total + (parseFloat(product.soLuong * product.gia));
        }, 0);
        bill.totalBill = bill.items.reduce(function (total, product) {
            return total + (parseFloat(product.giaSauKhuyenMai !== product.gia && product.giaSauKhuyenMai !== null ? product.soLuong * product.giaSauKhuyenMai : product.soLuong * product.gia));
        }, 0);
        bill.totalQuantity = bill.items.reduce(function (total, product) {
            return total + parseFloat(product.soLuong);
        }, 0);
        $scope.saveBillsToLocalStorage()
    };
    $scope.showListProduct = function (bill) {
        const noResultItem = document.getElementById('no-results-item');
        if (noResultItem) {
            noResultItem.remove()
        }
        $timeout(function() {
            $http.get('/san-pham').then(resp => {
                if (resp.status === 200) {
                    const productList = resp.data.data; // Danh sách sản phẩm
                    const requests = productList
                        .filter(item => item.trangThai === 1)  // Chỉ lấy sản phẩm có trangThai === 1
                        .map(item => $http.get(`/san-pham/${item.id}`).then(detailResp => {
                            const productDetails = detailResp.data.data.listSanPhamChiTiet;
                            productDetails.forEach(detail => {
                                detail.tenSanPham = item.ten;
                                detail.image = item.anh;
                                detail.listMauSac = detailResp.data.data.listMauSac;
                                detail.listSize = detailResp.data.data.listSize;
                            });
                            return productDetails;
                        }).catch(error => {
                            console.error(`Lỗi khi tải chi tiết sản phẩm với ID ${item.id}:`, error);
                            return []; // Trả về mảng rỗng nếu có lỗi
                        }));

                    // Xử lý tất cả yêu cầu đồng thời với Promise.all
                    Promise.all(requests).then(allDetails => {
                        $scope.listProduct = allDetails.flat(); // Gộp tất cả chi tiết lại thành một mảng
                        $scope.$applyAsync()
                        // Cập nhật số lượng sản phẩm trong listProduct
                        $scope.listProduct.forEach(product => {
                            $scope.bills.forEach(bill => {
                                const matchingItem = bill.items.find(item => item.id === product.id);
                                if (matchingItem) {
                                    // Cập nhật số lượng của sản phẩm trong listProduct
                                    product.soLuong -= matchingItem.soLuong;
                                    if (product.soLuong < 0) {
                                        product.soLuong = 0; // Đảm bảo không có số lượng âm
                                    }
                                    console.log(`Sản phẩm trùng: ${product.tenSanPham}, Số lượng cập nhật: ${product.soLuong}`);
                                }
                            });
                        });
                    }).catch(error => {
                        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
                    });
                } else {
                    console.error("Không thể lấy danh sách sản phẩm:", resp);
                }
            }).catch(error => {
                console.error("Lỗi khi gọi API sản phẩm:", error);
            });
            $scope.$applyAsync()
        },0)
        $scope.$applyAsync()
    };
    $scope.searchProduct = function () {
        const searchInput = document.getElementById('searchProduct2');
        $scope.searchTerm = searchInput.value;

        $timeout(function() {
            let hasResults = false;
            if ($scope.searchTerm.length === 0) {
                hasResults = false;
            }
            // Kiểm tra xem mã vạch có giá trị hợp lệ không
            if ($scope.searchTerm && $scope.searchTerm.length > 0) {
                console.log('sản phẩm:', $scope.searchTerm);

                // Lấy tất cả các hàng (li) trong danh sách sản phẩm
                const rows = document.querySelectorAll('#tableproductlist2 li a');
                console.log('sản phẩm:', rows);

                // Duyệt qua từng sản phẩm để lọc theo tên và id
                rows.forEach(row => {
                    const cells = row.querySelector('.idProd'); // Lấy phần tử chứa id
                    const productName = row.querySelector('.nameProd').textContent.toLowerCase(); // Tên sản phẩm (span)
                    const productId = cells.textContent.toLowerCase(); // ID sản phẩm (b)

                    console.log('Tên sản phẩm:', productName);
                    console.log('ID sản phẩm:', productId);

                    // Kiểm tra nếu tên hoặc id sản phẩm chứa searchTerm
                    if (productName.includes($scope.searchTerm.toLowerCase()) || productId.includes($scope.searchTerm.toLowerCase())) {
                        row.style.display = ''; // Hiển thị hàng nếu khớp
                        hasResults = true;
                    } else {
                        row.style.display = 'none'; // Ẩn hàng nếu không khớp
                    }
                    // Kiểm tra và thêm thông báo nếu không có kết quả phù hợp
                    const noResultItem = document.getElementById('no-results-item');
                    if (!hasResults) {
                        if (!noResultItem) {
                            const ulElement = document.getElementById('tableproductlist2');
                            const liElement = document.createElement('li');
                            liElement.id = 'no-results-item';
                            liElement.innerHTML = '<span class="dropdown-item text-muted">Không tìm thấy sản phẩm</span>';
                            ulElement.appendChild(liElement);
                        }
                    } else {
                        // Xóa thông báo nếu đã có kết quả phù hợp
                        if (noResultItem) {
                            noResultItem.remove();
                        }
                    }
                });
            }
            if ($scope.searchTerm.length === 0) {
                $scope.showListProduct()
            }
        }, 0);  // Đảm bảo thực hiện sau khi AngularJS cập nhật giá trị của ng-model
    };
    $scope.addProductToBill = function (product) {
        const existingProduct = $scope.bills[$scope.activeBill].items.find(item => item.id === product.id);
        const promoProduct = $scope.listProductPromotion.find(promo => promo.id === product.idSanPham);
        //console.log('>>>>>>>', promoProduct)
        if (existingProduct) {
            existingProduct.soLuong++;
        } else {
            $scope.bills[$scope.activeBill].items.push({
                tenSanPham: product.tenSanPham,
                id: product.id,
                idSanPham: product.idSanPham,
                image: product.image,
                gia: product.gia,
                giaTriGiam: promoProduct ? promoProduct.giaTriGiam : 0,
                giaSauKhuyenMai: promoProduct && promoProduct.giaSauKhuyenMai !== promoProduct.gia && promoProduct.giaSauKhuyenMai !== null ? promoProduct.giaSauKhuyenMai : promoProduct.gia,
                tenKhuyenMai: promoProduct ? promoProduct.tenKhuyenMai : null,
                ghiChu: product.ghiChu,
                soLuong: 1 || null,
                soLuongMax: product.soLuong,
                idSize: product.idSize,
                idMauSac: product.idMauSac,
                listSize: product.listSize,
                listMauSac: product.listMauSac
            });
            console.log($scope.bills[$scope.activeBill].items)
        }
        // Giảm số lượng sản phẩm trong danh sách sản phẩm
        const productInList = $scope.listProduct.find(p => p.id === product.id);
        if (productInList) {
            productInList.soLuong--; // Giảm số lượng
        }
        $scope.updateTotalBill($scope.bills[$scope.activeBill]);
        //$scope.showPopUp = false
    };

    $scope.allowOnlyNumbers = function (event) {
        const charCode = event.which || event.keyCode;
        // Chặn các ký tự không phải số (0-9)
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
        }
    };

    $scope.removeNonNumeric = function (item) {
        // Loại bỏ các ký tự không phải số
        item.soLuong = item.soLuong.replace(/[^0-9]/g, '');
    };
    $scope.decreaseQuantity = function (bill, item) {
        // Đảm bảo item.soLuong là kiểu số
        item.soLuong = Number(item.soLuong);  // Ép kiểu về số

        if (item.soLuong > 0) {
            item.soLuong--;
            const productInList = $scope.listProduct.find(p => p.id === item.id);

            if (productInList) {
                if (parseFloat(item.soLuong) > item.soLuongMax) {
                    item.soLuong = item.soLuongMax;
                }
                productInList.soLuong = item.soLuongMax - parseFloat(item.soLuong);
            }
            if (item.soLuong < 1) {
                item.soLuong = 1
                $scope.removeProduct(bill, item);
            }
        }

        // Cập nhật tổng số lượng sau khi thay đổi
        $scope.updateTotalBill(bill);
    };

    $scope.increaseQuantity = function (bill, item) {
        // Đảm bảo item.soLuong là kiểu số
        item.soLuong = Number(item.soLuong);  // Ép kiểu về số

        if (item.soLuong < item.soLuongMax) {
            item.soLuong++;
            const productInList = $scope.listProduct.find(p => p.id === item.id);

            if (productInList) {
                if (parseFloat(item.soLuong) > item.soLuongMax) {
                    item.soLuong = item.soLuongMax;
                }
                productInList.soLuong = item.soLuongMax - parseFloat(item.soLuong);
            }
        }

        // Cập nhật tổng số lượng sau khi thay đổi
        $scope.updateTotalBill(bill);
    };

    $scope.decreaseDiem = function (bill) {
        // Đảm bảo item.soLuong là kiểu số
        bill.diemSuDung = Number(bill.diemSuDung);  // Ép kiểu về số

        if (bill.diemSuDung > 0) {
            bill.diemSuDung--;

        }

        // Cập nhật tổng số lượng sau khi thay đổi
        $scope.updateTotalBill(bill);
    };

    $scope.increaseDiem = function (bill) {
        // Đảm bảo item.soLuong là kiểu số
        bill.diemSuDung = Number(bill.diemSuDung);

        if (bill.diemSuDung < bill.diemTichLuy) {
            bill.diemSuDung++;
        }

        // Cập nhật tổng số lượng sau khi thay đổi
        $scope.updateTotalBill(bill);
    };

    $scope.updateQuantity = function (bill, item) {
        if (item.soLuong === null || item.soLuong === '' || parseFloat(item.soLuong) === 0) {
            item.soLuong = 1;
        }
        const productInList = $scope.listProduct.find(p => p.id === item.id);
        if (parseFloat(item.soLuong) > item.soLuongMax) {
            item.soLuong = item.soLuongMax;
        }
        if (productInList) {
            productInList.soLuong = item.soLuongMax - parseFloat(item.soLuong);
        }

        // Tính lại tổng tiền cho sản phẩm
        item.total = parseFloat(item.soLuong) * item.gia;

        // Cập nhật tổng hóa đơn
        $scope.updateTotalBill(bill);
    };
    $scope.removeProduct = function (bill, product) {
        if (!bill || !bill.items || !product || !$scope.listProduct) {
            console.error("Dữ liệu không hợp lệ.");
            return;
        }
        const index = bill.items.findIndex(item => item.id === product.id);
        // Lưu giá trị ban đầu của sản phẩm
        const originalQuantity = product.soLuong;

        swal({
            title: "Xác nhận",
            text: "Bạn có chắc muốn xóa sản phẩm này?",
            icon: "warning",
            buttons: ["Hủy", "Xác nhận"],
        }).then((result) => {
            if (result) {
                if (index !== -1) {
                    const productInList = $scope.listProduct.find(p => p.id === product.id);
                    if (productInList) {
                        productInList.soLuong = (productInList.soLuong || 0) + (product.soLuong || 0);
                    }

                    bill.items.splice(index, 1);
                    $scope.updateTotalBill(bill);

                    // Đảm bảo render lại giao diện
                    $scope.$applyAsync(); // Kích hoạt cơ chế digest một cách an toàn
                } else {
                    console.warn("Không tìm thấy sản phẩm trong hóa đơn.");
                }
            } else {
                // Nếu hủy, khôi phục lại giá trị ban đầu của sản phẩm
                bill.items[index].soLuong = originalQuantity
                //product.soLuong = originalQuantity;
                $scope.$applyAsync(); // Đảm bảo giao diện được cập nhật
            }
        }).catch(error => {
            console.error("Lỗi trong SweetAlert:", error);
        });
    };

    $scope.onPhoneChange = function(bill) {
        let formData = {
            role: "CLIENT",
            phone: bill.phoneCustomer,
        }
        $http.post("/user/get-list", formData).then(resp => {
            if (resp.data.data.length === 1) {
                bill.nameCustomer = resp.data.data[0].profile.hoVaTen;
                bill.idCustomer = resp.data.data[0].id;
                let dataDiem = {
                    idNguoiDung: bill.idCustomer,
                    diem: 0
                };
                let params = new URLSearchParams();
                for (let key in dataDiem) {
                    params.append(key, dataDiem[key]);
                }
                $http({
                    method: 'PUT',
                    url: '/api/diem-tich-luy/update',
                    data: params.toString(),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(response => {
                    if (response.status === 200) {
                        bill.diemTichLuy = response.data.diem
                    }

                });
            } else if (resp.data.data.length === 0)  {
                bill.nameCustomer = null;
                bill.diemTichLuy = 0;
                $scope.onKeyDownName = function(bill) {
                    if (event.keyCode === 13) {
                        let dataUser ={
                            type: 'OFFLINE',
                            email: `ziaza${bill.phoneCustomer}@gmail.com`,
                            name: bill.nameCustomer,
                            phone: bill.phoneCustomer,
                            password: "Ziaza@123",
                            retypePassword: "Ziaza@123",
                            ngaySinh: "2000-12-11T17:00:00.000Z",
                        }
                        if (!bill.phoneCustomer || !bill.phoneCustomer.startsWith('0') || bill.phoneCustomer.length !== 10) {
                            toastr.error("Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số!");
                            return false;
                        }
                        if (!bill.nameCustomer || bill.nameCustomer.trim() === '' || bill.nameCustomer.startsWith(' ')) {
                            toastr.error("Tên khách hàng không được để trống hoặc bắt đầu bằng dấu cách!");
                            return false;
                        }
                        $http.post("/register", dataUser).then(res => {
                            if (res.data.code === '200') {
                                var toastLiveExample = document.getElementById('liveToast')
                                var toast = new bootstrap.Toast(toastLiveExample)
                                toast.show();
                                $http.post("/user/get-list", formData).then(response => {
                                    if (response.data.data.length === 1) {
                                        bill.idCustomer = response.data.data[0].id;
                                    }
                                })
                            }
                        })
                    }
                };

            } else if (resp.data.data.length >= 1)  {
                bill.nameCustomer = null;
                bill.diemTichLuy = 0;
            }
        });
        if (bill.phoneCustomer === '' || bill.phoneCustomer === null || bill.phoneCustomer === undefined) {
            bill.nameCustomer = '';
        }
    };
    $scope.formatCurrency = function (amount) {
        const formatter = new Intl.NumberFormat('vi-VN');
        return formatter.format(amount);
    };
    $scope.onChangePayment = function (bill) {
        // Nếu chuyển sang phương thức tiền mặt
        if (bill.payCustomer === 'money') {
            console.log("Chọn phương thức thanh toán: Tiền mặt");

            // Hủy trạng thái thanh toán ngân hàng nếu có
            if (bill.bankPaymentInterval) {
                clearInterval(bill.bankPaymentInterval);
                bill.bankPaymentInterval = null;
                console.log("Đã hủy giao dịch thanh toán ngân hàng.");
            }

            // Đặt lại trạng thái thanh toán ngân hàng
            bill.payQRbank = null;
            bill.bankSuccess = false;

            return;
        }

        // Nếu chọn phương thức ngân hàng
        if (bill.payCustomer === 'bank') {
            const AMOUNT = $scope.getTotalAmount(bill);
            const DESCRIPTION = encodeURIComponent('Thanh toán QR tại quầy');
            const ACCOUNT_NAME = encodeURIComponent('NGUYEN THI THANH PHUONG');
            const BASE_QR_URL = 'https://img.vietqr.io/image/970422-3006200466-compact.png';

            // Tạo URL QR
            bill.payQRbank = `${BASE_QR_URL}?amount=${AMOUNT}&addInfo=${DESCRIPTION}&accountName=${ACCOUNT_NAME}`;

            // Bắt đầu gọi API thanh toánh sau 15s
            bill.bankPaymentInterval = setTimeout(() => {
                monitorBankPayment(bill);
            }, 15000);
        }
    };

    // Chuyển khoản thành công
    function monitorBankPayment(bill) {
        let maxRetries = 250; // Giới hạn số lần gọi API
        let retries = 0;

        const checkPayment = () => {
            $http.get("https://script.google.com/macros/s/AKfycbzwaATXVmdDh8H7-PhdUBnnAyJZcd2UuZC8i5Q2JQ_h-bdToM_5IXIlo6uBXUVhvRZ3/exec")
                .then(resp => {
                    const data = resp.data.data;
                    const lastPaid = data[data.length - 1];
                    const lastPrice = lastPaid['Giá trị'];
                    const lastDescription = lastPaid['Mô tả'];

                    if (lastPrice === $scope.getTotalAmount(bill) && !bill.bankSuccess) {
                        $scope.payBill(bill); // Xử lý thanh toán thành công

                        // Cập nhật trạng thái thanh toán
                        bill.bankSuccess = true;

                        // Dừng interval
                        clearInterval(bill.bankPaymentInterval);
                        bill.bankPaymentInterval = null;
                    }
                })
                .catch(error => {
                    console.error("Lỗi khi gọi API thanh toán:", error);
                });

            retries++;
            if (retries >= maxRetries) {
                alert("Hết số lần kiểm tra thanh toán.");
                clearInterval(bill.bankPaymentInterval);
                bill.bankPaymentInterval = null;
            }
        };

        // Đặt interval
        bill.bankPaymentInterval = setInterval(() => {
            if (!bill.bankSuccess) {
                checkPayment();
            }
        }, 1000);

        // Tự động hiện popup thanh toán thành công sau 15s nếu đợi lâu
        const autoSuccessTimeout = setTimeout(() => {
            if (!bill.bankSuccess) {
                $scope.payBill(bill); // Xử lý thanh toán thành công

                // Cập nhật trạng thái thanh toán
                bill.bankSuccess = true;

                // Dừng interval
                clearInterval(bill.bankPaymentInterval);
                bill.bankPaymentInterval = null;
            }
        }, 15000);

        // Tự động dừng sau 5 phút nếu chưa thành công
        const autoStopTimeout = setTimeout(() => {
            if (!bill.bankSuccess) {
                alert("Quá thời gian chờ thanh toán.");
                clearInterval(bill.bankPaymentInterval);
                bill.bankPaymentInterval = null;
            }
        }, 300000);

        // Đảm bảo dừng các `setTimeout` nếu đã thanh toán thành công
        const stopAllTimeouts = () => {
            if (bill.bankSuccess) {
                clearTimeout(autoSuccessTimeout);
                clearTimeout(autoStopTimeout);
            }
        };

        // Theo dõi trạng thái thanh toán và dừng timeout
        const monitorSuccess = setInterval(() => {
            if (bill.bankSuccess) {
                stopAllTimeouts();
                clearInterval(monitorSuccess);
            }
        }, 100); // Kiểm tra trạng thái mỗi 100ms
    }


    // Thanh toán
    $scope.payBill = function (bill) {
        bill.totalBillLast = $scope.getTotalAmount(bill) // tổng tiền hóa đơn sau khuyến mãi
        bill.billDiem = Math.floor($scope.getTotalAmount(bill) / 1000)
        $http.post("/api/hoa-don/thanh-toan", bill).then(resp => {
            if (resp.status === 200) {
                bill.disabled = true;
                bill.codeBill = resp.data.ma;
                bill.dateBill = resp.data.ngayThanhToan;
                const billModal = new bootstrap.Modal(document.getElementById(`paymentModal-${bill.name}`), {
                    keyboard: false
                });
                let dataDiemUse = {
                    idNguoiDung: bill.idCustomer,
                    diemCanSuDung: bill.diemSuDung || 0
                };
                let paramsUse = new URLSearchParams();
                for (let key in dataDiemUse) {
                    paramsUse.append(key, dataDiemUse[key]);
                }

                let dataDiem = {
                    idNguoiDung: bill.idCustomer,
                    diem: bill.billDiem
                };
                let params = new URLSearchParams();
                for (let key in dataDiem) {
                    params.append(key, dataDiem[key]);
                }
                if (bill.phoneCustomer !== null && bill.phoneCustomer !== '' && bill.nameCustomer !== null && bill.nameCustomer !== '') {

                    if (bill.diemTichLuy > 0) {
                        $http({
                            method: 'PUT',
                            url: '/api/diem-tich-luy/use-diem',
                            data: paramsUse.toString(),
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(response => {
                            if (response.status === 200) {
                                $http({
                                    method: 'PUT',
                                    url: '/api/diem-tich-luy/update',
                                    data: params.toString(),
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }
                                }).then(res => {
                                    if (res.status === 200) {
                                        bill.diemTichLuy = res.data.diem
                                    }
                                });

                            }
                        }).catch(function (error) {
                            if (error.status === 500) {
                                $http({
                                    method: 'PUT',
                                    url: '/api/diem-tich-luy/update',
                                    data: params.toString(),
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }
                                }).then(res => {
                                    if (res.status === 200) {
                                        bill.diemTichLuy = res.data.diem
                                    }
                                });

                            }
                        });
                    }


                    if (bill.diemTichLuy === 0) {
                        $http({
                            method: 'PUT',
                            url: '/api/diem-tich-luy/update',
                            data: params.toString(),
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(res => {
                            if (res.status === 200) {
                                bill.diemTichLuy = res.data.diem
                            }
                        });
                    }
                }

                billModal.show();
                $scope.$applyAsync();
                $scope.saveBillsToLocalStorage()
            }
        });

    };
    $scope.clearBill = function (bill, index) {
        $scope.bills.splice(index, 1);
        $scope.saveBillsToLocalStorage()
        // Đặt lại hóa đơn đang hoạt động (activeBill)
        if ($scope.activeBill >= $scope.bills.length) {
            $scope.activeBill = $scope.bills.length - 1; // Chuyển activeBill về hóa đơn cuối nếu vượt quá
        }
    };
    $scope.printBill = function (bill, index) {
        $scope.clearBill(bill, index);
        var innerContents = document.getElementById(`paymentModal-${bill.name}`).innerHTML;
        var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write(`
        <html>
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>In hóa đơn</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
                integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                .modal-header, .modal-footer {
                    display: none;
                }
            </style>
            </head>
            <body onload="window.print()"> ${innerContents}  </html>`
        );
        popupWinindow.document.close();
    };


});
