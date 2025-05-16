const app = angular.module("admin-app", ["ngRoute", "firebase"]);
app.directive('currencyInput', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            // Hàm định dạng số thành tiền tệ
            function formatCurrency(value) {
                if (!value) return '';
                return value.toLocaleString('vi-VN');
            }

            // Hàm loại bỏ định dạng (trả về số)
            function parseCurrency(value) {
                if (!value) return 0;
                return parseInt(value.replace(/[^0-9]/g, ''), 10);
            }

            // Hiển thị giá trị định dạng
            ngModel.$formatters.push(function (value) {
                return formatCurrency(value);
            });

            // Xử lý giá trị đầu vào và cập nhật mô hình
            ngModel.$parsers.push(function (value) {
                const numericValue = parseCurrency(value);
                ngModel.$setViewValue(formatCurrency(numericValue));
                ngModel.$render();
                return numericValue;
            });

            // Lắng nghe sự kiện blur để định dạng giá trị
            element.on('blur', function () {
                const formattedValue = formatCurrency(ngModel.$modelValue);
                element.val(formattedValue);
            });
        },
    };
});
app.directive('danhMucTree', function() {
    return {
        restrict: 'E',
        scope: {
            danhMucList: '='
        },
        template: `
            <ul class="list-group">
                <li class="list-group-item" ng-repeat="danhMuc in danhMucList">
                    <!-- Hiển thị tên danh mục và sự kiện click -->
                    <div class="danh-muc-item" ng-click="toggleChildren(danhMuc)" ng-mouseenter="onHover(danhMuc)" ng-class="{'active-item': danhMuc.showChildren, 'hover-item': !danhMuc.showChildren}">
                        {{danhMuc.ten}}
                    </div>
                    
                    <!-- Hiển thị danh mục con nếu có -->
                    <danh-muc-tree ng-if="danhMuc.showChildren" danh-muc-list="danhMuc.children"></danh-muc-tree>
                </li>
            </ul>
        `,
        link: function(scope) {
            // Hàm toggle để hiển thị danh mục con khi click
            scope.toggleChildren = function(danhMuc) {
                if (danhMuc.children && danhMuc.children.length > 0) {
                    // Nếu danh mục con đang mở, đóng nó
                    if (danhMuc.showChildren) {
                        danhMuc.showChildren = false;
                    } else {
                        // Đóng tất cả danh mục con khác trong cùng cấp
                        scope.closeAllSiblings(danhMuc);
                        // Mở danh mục con này
                        danhMuc.showChildren = true;
                    }
                }
            };

            // Hàm để đóng tất cả danh mục con khác trong cùng cấp
            scope.closeAllSiblings = function(danhMuc) {
                angular.forEach(scope.danhMucList, function(item) {
                    if (item !== danhMuc && item.showChildren) {
                        item.showChildren = false;
                    }
                });
            };

            // Hiệu ứng hover chỉ thay đổi màu sắc mà không mở/đóng danh mục con
            scope.onHover = function(danhMuc) {
                // Bạn có thể xử lý các logic hover tại đây nếu cần (tạo hiệu ứng, thay đổi màu sắc, etc.)
            };
        }
    };
});

app.directive('formatNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            // Hàm định dạng giá trị thành tiền tệ với dấu phân cách nghìn (dấu chấm)
            function formatCurrency(value) {
                if (!value) return '';
                return value.toLocaleString('vi-VN'); // Định dạng theo chuẩn Việt Nam
            }

            // Hàm loại bỏ định dạng và chuyển thành số nguyên
            function parseCurrency(value) {
                if (!value) return 0;
                return parseInt(value.replace(/[^0-9]/g, ''), 10); // Loại bỏ tất cả ký tự không phải số
            }

            // Hiển thị giá trị định dạng khi mô hình thay đổi
            ngModelController.$formatters.push(function (value) {
                return formatCurrency(value); // Định dạng khi hiển thị
            });

            // Xử lý giá trị đầu vào của người dùng và cập nhật mô hình
            ngModelController.$parsers.push(function (value) {
                // Chuyển đổi đầu vào của người dùng thành số
                const numericValue = parseCurrency(value);

                // Đảm bảo giá trị luôn được hiển thị dưới dạng tiền tệ
                ngModelController.$setViewValue(formatCurrency(numericValue)); // Cập nhật giá trị đã định dạng vào mô hình
                ngModelController.$render(); // Render lại giá trị trong view
                return numericValue; // Trả về giá trị số cho mô hình
            });

            // Lắng nghe sự kiện blur để tự động định dạng lại khi mất focus
            element.on('blur', function () {
                // Đảm bảo giá trị hiển thị dưới dạng tiền tệ khi người dùng rời khỏi input
                const formattedValue = formatCurrency(ngModelController.$modelValue);
                element.val(formattedValue); // Cập nhật giá trị vào input
            });

            // Lắng nghe sự kiện keyup để cập nhật lại giá trị trong trường hợp người dùng nhập
            element.on('keyup', function () {
                const rawValue = element.val();
                const parsedValue = parseCurrency(rawValue); // Chuyển đổi đầu vào thành số
                ngModelController.$setViewValue(formatCurrency(parsedValue)); // Cập nhật giá trị đã định dạng
                ngModelController.$render(); // Render lại giá trị trong view
            });
        }
    };
});

app.filter('dotCurrency', function() {
    return function(input) {
        if (!input) return '';
        // Đảm bảo đầu vào là số
        let num = parseInt(input, 10);
        if (isNaN(num)) return input;
        // Định dạng số với dấu chấm
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
    };
});
app.directive('numberFormatter', function($filter) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            // Định dạng giá trị khi hiển thị trong input
            ngModelCtrl.$formatters.push(function(value) {
                if (value === null || value === undefined || value <= 0) {
                    return '0'; // Hiển thị 0 khi giá trị là null, undefined hoặc <= 0
                }
                return new Intl.NumberFormat('vi-VN').format(value);
            });

            // Xử lý giá trị nhập vào
            ngModelCtrl.$parsers.push(function(value) {
                if (!value) {
                    return 0; // Trả về 0 nếu giá trị nhập là null, undefined, hoặc chuỗi rỗng
                }
                let plainNumber = value.replace(/\./g, ''); // Loại bỏ dấu chấm
                return parseInt(plainNumber, 10) || 0; // Trả về 0 nếu không hợp lệ
            });

            // Định dạng lại khi rời khỏi ô input
            element.on('blur', function() {
                let formattedValue = ngModelCtrl.$modelValue > 0
                    ? new Intl.NumberFormat('vi-VN').format(ngModelCtrl.$modelValue)
                    : '0';
                element.val(formattedValue);
            });
        }
    };
});


app.config(function ($routeProvider) {
    $routeProvider
        // tổng quan
        .when("/tongquan", {
            templateUrl: "asset/tongquan.html",
            controller: "tongquan-ctrl"
        })

        /// Nhân viên
        .when("/taikhoan", {
            templateUrl: "asset/nhanvien/taikhoan.html",
            controller: "taikhoan-ctrl"
        })
        .when("/tttaikhoan", {
            templateUrl: "asset/nhanvien/tttaikhoan.html",
            controller: "tttaikhoan-ctrl"
        })
        .when("/ttcanhan", {
            templateUrl: "asset/nhanvien/ttcanhan.html",
            controller: "ttcanhan-ctrl"
        })
        .when("/phanquyen", {
            templateUrl: "asset/nhanvien/phanquyen.html",
            controller: "phanquyen-ctrl"
        })
        .when("/nhom", {
            templateUrl: "asset/nhanvien/nhom.html",
            controller: "nhom-ctrl"
        })
        .when("/chucnang", {
            templateUrl: "asset/nhanvien/chucnang.html",
            controller: "chucnang-ctrl"
        })

        /// Khách hàng
        .when("/listkhachhang", {
            templateUrl: "asset/khachhang/list.html",
            controller: "listkhachhang-ctrl"
        })
        .when("/quanlykh", {
            templateUrl: "asset/khachhang/quanly.html",
            controller: "quanlykh-ctrl"
        })
        .when("/tttaikhoan_kh", {
            templateUrl: "asset/nhanvien/tttaikhoan_kh.html",
            controller: "tttaikhoan_kh-ctrl"
        })
        .when("/ttcanhan_kh", {
            templateUrl: "asset/nhanvien/ttcanhan_kh.html",
            controller: "ttcanhan_kh-ctrl"
        })

        /// Danh mục
        .when("/listdanhmuc", {
            templateUrl: "asset/danhmuc/listdanhmuc.html",
            controller: "danhmuc-ctrl"
        })
        .when("/quanlydanhmuc", {
            templateUrl: "asset/danhmuc/quanlydanhmuc.html",
            controller: "danhmuc-ctrl"
        })

        /// Thương hiệu
        .when("/listthuonghieu", {
            templateUrl: "asset/thuonghieu/listthuonghieu.html",
            controller: "thuonghieu-ctrl"
        })
        .when("/quanlythuonghieu", {
            templateUrl: "asset/thuonghieu/quanlythuonghieu.html",
            controller: "thuonghieu-ctrl"
        })

        /// thuộc tính
        .when("/size", {
            templateUrl: "asset/thuoctinh/size.html",
            controller: "size-ctrl"
        })
        .when("/chatlieu", {
            templateUrl: "asset/thuoctinh/chatlieu.html",
            controller: "chatlieu-ctrl"
        })
        .when("/mausac", {
            templateUrl: "asset/thuoctinh/mausac.html",
            controller: "mausac-ctrl"
        })

        /// nhân viên
        .when("/nhom", {
            templateUrl: "asset/nhanvien/nhom.html",
            controller: "nhom-ctrl"
        })
        .when("/chucnang", {
            templateUrl: "asset/nhanvien/chucnang.html",
            controller: "chucnang-ctrl"
        })
        .when("/phanquyen", {
            templateUrl: "asset/nhanvien/phanquyen.html",
            controller: "phanquyen-ctrl"
        })

        /// sản phâm
        .when("/listsanpham", {
            templateUrl: "asset/sanpham/listsanpham.html",
            controller: "listproduct-ctrl"
        })
        .when("/listsanphaman", {
            templateUrl: "asset/sanpham/listsanphaman.html",
            controller: "listproduct-ctrl"
        })
        .when("/spct", { // Thêm :id để nhận ID sản phẩm từ URL
            templateUrl: "asset/sanpham/quanlyspct.html",
            controller: "quanlyspct-ctrl"
        })
        .when("/sanpham", {
            templateUrl: "asset/sanpham/sanpham.html",
            controller: "sanpham-ctrl"
        })
        .when("/hinhanh", {
            templateUrl: "asset/sanpham/hinhanhsp.html",
            controller: "hinhanh-ctrl"
        })
        .when("/sanphamdoitra", {
            templateUrl: "asset/sanpham/sanphamdoitra.html",
            controller: "sanphamdoitra-ctrl"
        })

        /// Bán tại quầy
        .when("/bhtq", {
            templateUrl: "asset/banhang/banhang.html",
            controller: "banhang-ctrl"
        })

        /// hóa đơn
        .when("/hdct", {
            templateUrl: "asset/hoadon/chitiethoadon.html",
            controller: "hdct-ctrl"
        })
        .when("/hoadon", {
            templateUrl: "asset/hoadon/hoadon.html",
            controller: "hoadon-ctrl"
        })

        /// khuyến mãi
        .when("/listkhuyenmai", {
            templateUrl: "asset/khuyenmai/list.html",
            controller: "khuyenmai-ctrl"
        })
        .when("/quanlykhuyenmai", {
            templateUrl: "asset/khuyenmai/quanly.html",
            controller: "khuyenmai-ctrl"
        })
        .when("/apdungkhuyenmai", {
            templateUrl: "asset/khuyenmai/apdung.html",
            controller: "apdungkhuyenmai-ctrl.js"
        })
        .when("/danhsachspkm", {
            templateUrl: "asset/khuyenmai/danhsachspkm.html",
            controller: "danhsachspkm-ctrl"
        })

        /// Hỗ trợ
        // .when("/traloihotro", {
        //     templateUrl: "asset/hotro/traloihotro.html",
        //     controller: "traloihotro-ctrl"
        // })
        .when("/yeucaudoitra/:loai", {
            templateUrl: "asset/hotro/yeucaudoitra.html",
            controller: "yeucaudoitra-ctrl"
        })
        // .when("/doihangthanhcong", {
        //     templateUrl: "asset/hotro/doihangthanhcong.html",
        //     controller: "doitrahang-ctrl"
        // })
        // .when("/doihanghuy", {
        //     templateUrl: "asset/hotro/doihanghuy.html",
        //     controller: "doitrahang-ctrl"
        // })
        //
        // .when("/trahangcho", {
        //     templateUrl: "asset/hotro/trahangcho.html",
        //     controller: "doitrahang-ctrl"
        // })
        // .when("/trahangthanhcong", {
        //     templateUrl: "asset/hotro/trahangthanhcong.html",
        //     controller: "doitrahang-ctrl"
        // })
        // .when("/trahanghuy", {
        //     templateUrl: "asset/hotro/trahanghuy.html",
        //     controller: "doitrahang-ctrl"
        // })
        // .when("/chitietdoitra", {
        //     templateUrl: "asset/hotro/chitietdoitra.html",
        //     controller: "chitietdoitra-ctrl"
        // })

        /// BLog
        .when("/blog", {
            templateUrl: "asset/blog/blog.html",
            controller: "blog-ctrl"
        })

        .when("/group", {
            templateUrl: "asset/group/group.html",
            controller: "group-ctrl"
        })

        .when("/test", {
            templateUrl: "asset/test/test.html",
            controller: "test-ctrl"
        })


})





