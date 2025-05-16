$(document).ready(function () {
    // Hàm để lấy danh sách sản phẩm
    let currentPage = 0; // Chỉ số trang hiện tại
    const totalProducts = 8; // Tổng số sản phẩm
    const productsPerPage = 8; // Số sản phẩm mỗi trang
    const totalPages = Math.ceil(totalProducts / productsPerPage); // Số trang cần hiển thị

    let allProducts = []; // Mảng lưu tất cả các sản phẩm

    // function fetchProducts() {
    //     $.ajax({
    //         url: '/san-pham',
    //         method: 'GET',
    //         dataType: 'json',
    //         success: function (response) {
    //             const products = response.data;
    //
    //             if (Array.isArray(products)) {
    //                 allProducts = products.filter(product => product.trangThai === 1);  // Lọc sản phẩm có trangThai là 1
    //
    //                 // Lấy giá khuyến mãi dựa trên tên sản phẩm
    //                 const searchPromises = allProducts.map(product => {
    //                     return $.ajax({
    //                         url: 'san-pham/search',
    //                         method: 'POST',
    //                         contentType: 'application/json',
    //                         data: JSON.stringify({
    //                             keyword: product.ten
    //                         })
    //                     }).then(searchResponse => {
    //                         const foundProduct = searchResponse.data.find(p => p.id === product.id);
    //                         product.giaSauKhuyenMai = foundProduct ? foundProduct.giaSauKhuyenMai : product.gia;
    //                     });
    //                 });
    //
    //                 // Chờ tất cả các yêu cầu API hoàn tất
    //                 Promise.all(searchPromises).then(() => {
    //                     allProducts.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
    //                     displayProducts(currentPage);
    //
    //                     if (currentPage < totalPages - 1) {
    //                         $('#load-more').html('<i style="font-size: 24px" class="bi bi-arrow-right"></i>');
    //                     } else {
    //                         $('#load-more').hide();
    //                     }
    //                 });
    //             } else {
    //                 console.error('Expected array but got:', products);
    //             }
    //         },
    //         error: function (error) {
    //             console.error('Error fetching products:', error);
    //         }
    //     });
    // }

    // function fetchProducts() {
    //     $.ajax({
    //         url: '/san-pham/search',  // Dùng API search thay vì /san-pham
    //         method: 'POST',
    //         contentType: 'application/json',
    //         data: JSON.stringify({
    //             keyword: ""  // Truyền từ khóa tìm kiếm rỗng để lấy tất cả sản phẩm
    //         }),
    //         success: function (response) {
    //             const products = response.data;
    //
    //             if (Array.isArray(products)) {
    //                 // Lọc sản phẩm có trạng thái là 1 (đang hoạt động)
    //                 allProducts = products.filter(product => product.trangThai === 1);
    //
    //                 // Sắp xếp các sản phẩm theo ngày tạo
    //                 allProducts.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
    //
    //                 // Hiển thị sản phẩm lên trang
    //                 displayProducts(currentPage);
    //
    //                 // Kiểm tra và điều chỉnh hiển thị nút Load More
    //                 if (currentPage < totalPages - 1) {
    //                     $('#load-more').html('<i style="font-size: 24px" class="bi bi-arrow-right"></i>');
    //                 } else {
    //                     $('#load-more').hide();
    //                 }
    //             } else {
    //                 console.error('Expected array but got:', products);
    //             }
    //         },
    //         error: function (error) {
    //             console.error('Error fetching products:', error);
    //         }
    //     });
    // }


    // Gọi hàm để hiển thị sản phẩm ngay khi trang tải
    // $(document).ready(function () {
    //     fetchProducts(); // Hiển thị sản phẩm của trang đầu tiên
    // });

    // Sự kiện bấm vào nút "Xem thêm" hoặc "Ẩn bớt"
    $('#load-more').on('click', function () {
        // Nếu đang ở trang hiện tại và chưa đến trang cuối
        if (currentPage < totalPages - 1) {
            currentPage++;  // Chuyển sang trang kế tiếp
            displayProducts(currentPage);
        }

        // Nếu là trang cuối, ẩn nút "Xem thêm"
        if (currentPage === totalPages - 1) {
            $('#load-more').hide();
        }
    });

    // Sự kiện bấm vào nút mũi tên trái để quay lại trang đầu tiên
    $('#prev-page').on('click', function () {
        currentPage = 0; // Quay về trang đầu tiên
        displayProducts(currentPage); // Hiển thị sản phẩm của trang đầu tiên

        // Cập nhật lại trạng thái của nút "Xem thêm" (nếu cần)
        $('#load-more').html('<i style="font-size: 24px" class="bi bi-arrow-right"></i>');
        $('#load-more').show();
    });


    $(document).ready(function () {
        // Hàm lấy productId từ URL
        function getProductIdFromUrl() {
            const url = window.location.href; // Lấy URL hiện tại
            const match = url.match(/\/productDetail\/(\d+)/); // Dùng regex để lấy id sản phẩm từ URL
            return match ? match[1] : null; // Trả về productId hoặc null nếu không tìm thấy
        }

        // Hàm tải chi tiết sản phẩm từ API
        function loadProductDetails(productId) {
            $.ajax({
                url: `/san-pham/${productId}`, // Địa chỉ API mới
                method: 'GET',
                success: function (data) {
                    if (data.data) {
                        const product = data.data;

                        // Cập nhật thông tin sản phẩm vào form
                        $('#productName').text(product.ten);
                        $('#productBrand').text(product.thuonghieu.ten); // Thương hiệu
                        $('#productCode').text(product.ma); // Mã sản phẩm
                        $('#productPrice').text(product.gia.toLocaleString() + ' ₫'); // Giá sản phẩm
                        $('#productDescription').text(product.moTa); // Mô tả ngắn

                        if (product.giaSauKhuyenMai != null) {
                            const formattedSalePrice = new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(product.giaSauKhuyenMai);
                            $('#productSalePrice').text(formattedSalePrice);  // Hiển thị giá sau khuyến mãi
                            $('#productPrice').css('text-decoration', 'line-through');  // Gạch ngang giá gốc
                        }

                        //image
                        $(document).ready(function () {
                            // Tải ảnh vào carousel và thumbnail
                            if (product.hinhAnhList && product.hinhAnhList.length > 0) {
                                $('#productImages').empty();
                                $('#thumbnailImages').empty();
                                product.hinhAnhList.forEach(function (image, index) {
                                    const activeClass = index === 0 ? 'active' : '';
                                    // Thêm ảnh vào carousel
                                    $('#productImages').append(`
                                    <div class="carousel-item ${activeClass}">
                                        <img style="width: 690px;height: auto;" src="/images/${image.anh}" class="d-block w-100" alt="Image">
                                    </div>
                                    `);
                                    // Thêm thumbnail vào danh sách
                                    $('#thumbnailImages').append(`
                                        <img class="thumbnail-img" src="/images/${image.anh}" alt="Thumbnail" data-index="${index}">
                                    `);
                                });
                            } else {
                                $('#productImages').html(`
                                <div class="text-center mt-5">
                                    <img src="../images/logo.png" alt="">
                                    <h3 class="text-uppercase">Shop sẽ sớm cập nhật hình ảnh!</h3>
                                </div>
                                `);
                                $('#thumbnailImages').empty();
                            }

                            // Gán sự kiện click cho các ảnh thumbnail
                            $('#thumbnailImages img').on('click', function () {
                                const index = $(this).data('index');
                                setActiveImage(index);
                            });

                            // Gán sự kiện cho nút cuộn lên và xuống
                            $('#thumbnailPrevBtn').on('click', function () {
                                scrollThumbnails('up');
                            });

                            $('#thumbnailNextBtn').on('click', function () {
                                scrollThumbnails('down');
                            });

                            // Hàm cập nhật ảnh chính khi click vào thumbnail
                            function setActiveImage(index) {
                                // Cập nhật ảnh trong carousel
                                $('#productImages .carousel-item').removeClass('active');
                                $('#productImages .carousel-item').eq(index).addClass('active');

                                // Cập nhật viền thumbnail
                                $('#thumbnailImages img').css('border', '2px solid #ccc');  // Bỏ viền tất cả thumbnail
                                $('#thumbnailImages img').eq(index).css('border', '2px solid #000');  // Làm nổi bật thumbnail được chọn
                            }

                            // Hàm cuộn ảnh thumbnail lên hoặc xuống
                            function scrollThumbnails(direction) {
                                const thumbnailContainer = $('#thumbnailImagesWrapper');
                                const scrollAmount = 100;  // Số pixel cuộn mỗi lần

                                if (direction === 'up') {
                                    thumbnailContainer.scrollTop(thumbnailContainer.scrollTop() - scrollAmount);
                                } else if (direction === 'down') {
                                    thumbnailContainer.scrollTop(thumbnailContainer.scrollTop() + scrollAmount);
                                }
                            }
                        });

                        // Lắng nghe sự kiện khi carousel thay đổi ảnh
                        $('#carouselExampleAutoplaying').on('slid.bs.carousel', function () {
                            const activeIndex = $('#productImages .carousel-item.active').index();  // Lấy index của ảnh đang hiển thị

                            // Cập nhật ảnh trong carousel và thumbnail
                            $('#productImages .carousel-item').removeClass('active').eq(activeIndex).addClass('active');
                            $('#thumbnailImages img').css('border', '2px solid #ccc').eq(activeIndex).css('border', '2px solid #000');
                        });

                        $('#sizeOptions').empty();
                        product.listSize.forEach(function (size) {
                            $('#sizeOptions').append(`
                            <label class="custom-radio">
                                <input type="radio" name="size" id="size${size.id}" value="${size.id}">
                                <span class="radio-label">${size.ten}</span>
                            </label>
                            `);
                        });


                        const colorMap = {
                            "Đỏ": "#ff0000",
                            "Xanh Dương": "#0000ff",
                            "Xanh Lá": "#00ff00",
                            "Vàng": "#ffff00",
                            "Tím": "#800080",
                            "Cam": "#ffa500",
                            "Xám": "#808080",
                            "Be": "#f5f5dc",
                            "Trắng": "#ffffff",
                            "Đen": "#000000",
                            "Ghi": "#808080",
                            "Nâu": "#8b4513",
                            "Xanh Nhạt": "#add8e6",
                            "Xanh Đậm": "#00008b",
                            "Hồng": "#ff69b4"
                        };

                        $('#colorOptions').empty();
                        product.listMauSac.forEach(function (mauSac) {
                            const colorCode = colorMap[mauSac.ten] || "#cccccc"; // Mặc định màu xám nếu không khớp

                            $('#colorOptions').append(`
                            <label class="custom-radio-circle">
                                <input type="radio" name="color" id="color${mauSac.id}" value="${mauSac.id}">
                                <span class="radio-circle" style="background-color: ${colorCode};" title="${mauSac.ten}"></span>
                            </label>
                            `);
                        });


                        // Cập nhật số lượng sản phẩm còn lại
                        const totalQuantity = product.listSanPhamChiTiet.reduce((sum, item) => sum + item.soLuong, 0);
                        $('#quantityLeft').text(totalQuantity); // Số lượng còn lại trong kho

                        // Lắng nghe sự kiện thay đổi màu sắc hoặc kích thước
                        $('input[name="color"], input[name="size"]').on('change', function () {
                            updateQuantity(product);
                        });

                        // Xử lý tăng giảm số lượng mua
                        $('#increaseQuantity').on('click', function () {
                            let quantity = parseInt($('#quantityInput').val(), 10);
                            const maxQuantity = getMaxQuantity(product); // Số lượng tối đa có thể chọn

                            if (quantity < maxQuantity) {
                                $('#quantityInput').val(quantity + 1);
                            }
                            updateQuantityDisplay();
                        });

                        $('#decreaseQuantity').on('click', function () {
                            let quantity = parseInt($('#quantityInput').val(), 10);
                            if (quantity > 1) {
                                $('#quantityInput').val(quantity - 1);
                            }
                            updateQuantityDisplay();
                        });

                        // Sự kiện thay đổi trực tiếp trong input số lượng
                        $('#quantityInput').on('input', function () {
                            let quantity = parseInt($('#quantityInput').val(), 10);
                            const maxQuantity = getMaxQuantity(product);
                            if (quantity > maxQuantity) {
                                $('#quantityInput').val(maxQuantity); // Giới hạn số lượng nhập vào
                            } else if (quantity < 1) {
                                $('#quantityInput').val(1); // Không cho nhập dưới 1
                            }
                            updateQuantityDisplay();
                        });

                        // Vô hiệu hóa các lựa chọn không hợp lệ (kích thước hoặc màu sắc không còn)
                        disableUnavailableOptions(product);
                    } else {
                        console.log("No product data found.");
                    }
                },
                error: function (error) {
                    console.log("Error loading product details:", error);
                }
            });
        }

        // Hàm cập nhật số lượng còn lại dựa trên lựa chọn màu sắc và kích thước
        // Hàm cập nhật số lượng còn lại và giá tiền dựa trên lựa chọn màu sắc và kích thước
        // Hàm cập nhật số lượng còn lại và giá tiền dựa trên lựa chọn màu sắc và kích thước
        function updateQuantity(product) {
            const selectedColor = $('input[name="color"]:checked').val(); // Lấy giá trị màu sắc được chọn
            const selectedSize = $('input[name="size"]:checked').val();   // Lấy giá trị kích thước được chọn

            if (selectedColor && selectedSize) {
                // Lọc ra sản phẩm chi tiết với màu sắc và kích thước đã chọn và có trangThai = 1
                const selectedProductDetail = product.listSanPhamChiTiet.filter(item =>
                    item.idMauSac == selectedColor && item.idSize == selectedSize && item.trangThai === 1
                )[0]; // Lấy sản phẩm chi tiết đầu tiên phù hợp

                if (selectedProductDetail) {
                    // Cập nhật số lượng
                    $('#quantityLeft').text(selectedProductDetail.soLuong);

                    // Cập nhật giá tiền
                    $('#productPrice').text(selectedProductDetail.gia.toLocaleString() + ' ₫');
                } else {
                    // Nếu không có sản phẩm chi tiết tương ứng
                    $('#quantityLeft').text(0);
                    $('#productPrice').text('Không khả dụng');
                }
            }

            // Cập nhật tình trạng vô hiệu hóa các lựa chọn
            disableUnavailableOptions(product);
        }

        // Hàm vô hiệu hóa các lựa chọn không hợp lệ (kích thước hoặc màu sắc không còn)
        function disableUnavailableOptions(product) {
            const selectedColor = $('input[name="color"]:checked').val(); // Lấy giá trị màu sắc được chọn
            const selectedSize = $('input[name="size"]:checked').val();   // Lấy giá trị kích thước được chọn

            // Vô hiệu hóa các màu sắc không có kích thước tương ứng và có trangThai = 1
            $('input[name="color"]').each(function () {
                const colorId = $(this).val();
                const availableSizes = product.listSanPhamChiTiet.filter(item =>
                    item.idMauSac == colorId && item.soLuong > 0 && item.trangThai === 1
                ).map(item => item.idSize);

                if (selectedSize && !availableSizes.includes(parseInt(selectedSize))) {
                    $(this).prop('disabled', true); // Vô hiệu hóa nếu không có size tương ứng
                    $(this).closest('.custom-radio-circle').addClass('disabled'); // Thêm lớp 'disabled' để làm mờ
                } else {
                    $(this).prop('disabled', false); // Kích hoạt nếu có size tương ứng
                    $(this).closest('.custom-radio-circle').removeClass('disabled'); // Xóa lớp 'disabled' khi kích hoạt lại
                }
            });

            // Vô hiệu hóa các kích thước không có màu sắc tương ứng và có trangThai = 1
            $('input[name="size"]').each(function () {
                const sizeId = $(this).val();
                const availableColors = product.listSanPhamChiTiet.filter(item =>
                    item.idSize == sizeId && item.soLuong > 0 && item.trangThai === 1
                ).map(item => item.idMauSac);

                if (selectedColor && !availableColors.includes(parseInt(selectedColor))) {
                    $(this).prop('disabled', true); // Vô hiệu hóa nếu không có màu tương ứng
                    $(this).closest('.custom-radio').addClass('disabled'); // Thêm lớp 'disabled' để làm mờ
                } else {
                    $(this).prop('disabled', false); // Kích hoạt nếu có màu tương ứng
                    $(this).closest('.custom-radio').removeClass('disabled'); // Xóa lớp 'disabled' khi kích hoạt lại
                }
            });
        }


        // Lấy số lượng tối đa có thể chọn từ radio size và màu sắc
        function getMaxQuantity(product) {
            const selectedColor = $('input[name="color"]:checked').val();
            const selectedSize = $('input[name="size"]:checked').val();

            if (selectedColor && selectedSize) {
                // Lọc ra sản phẩm chi tiết với màu sắc và kích thước đã chọn
                const selectedProductDetail = product.listSanPhamChiTiet.find(item =>
                    item.idMauSac == selectedColor && item.idSize == selectedSize
                );
                return selectedProductDetail ? selectedProductDetail.soLuong : 0;
            }
            return 0; // Nếu chưa chọn màu sắc hoặc kích thước, không cho phép tăng số lượng
        }

        // Lấy productId từ URL và gọi API để lấy chi tiết sản phẩm
        const productId = getProductIdFromUrl();

        // Kiểm tra nếu productId hợp lệ, sau đó gọi hàm loadProductDetails
        if (productId) {
            loadProductDetails(productId);
        } else {
            console.log("Product ID not found in URL.");
        }
    });

    // fetchProducts();

    $(document).ready(function () {
        // Kiểm tra token
        function checkToken() {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Bạn chưa đăng nhập!',
                    text: 'Vui lòng đăng nhập để tiếp tục.',
                    confirmButtonText: 'Đến trang đăng nhập',
                    willClose: () => {
                        window.location.href = '/v1/auth/login';
                    }
                });

                return false;
            }
            return true;
        }

        // Hàm lấy thông tin sản phẩm từ URL và form
        function getProductIdFromUrl() {
            const url = window.location.href;
            const match = url.match(/\/productDetail\/(\d+)/);
            return match ? match[1] : null;
        }

        function getSelectedProductDetails() {
            const idSanPham = getProductIdFromUrl();
            const idSize = $('input[name="size"]:checked').val();
            const idMauSac = $('input[name="color"]:checked').val();
            const soLuong = $('#quantityInput').val();

            return {
                idSanPham: idSanPham,
                idSize: idSize,
                idMauSac: idMauSac,
                soLuong: soLuong
            };
        }

        // Hiển thị modal xác nhận
        function showConfirmModal(callback) {
            $('#confirmModal').fadeIn();

            $('#confirmAddToCart').on('click', function () {
                $('#confirmModal').fadeOut();
                callback(true);
            });

            $('#cancelAddToCart').on('click', function () {
                callback(false);
                $('#confirmModal').fadeOut();
            });
        }

        // Hiển thị thông báo giữa màn hình
        function showNotification(message, type) {
            const notification = $('<div class="notification"></div>')
                .text(message)
                .css({
                    'position': 'fixed',
                    'top': '70%',
                    'left': '50%',
                    'transform': 'translate(-50%, -50%)',
                    'padding': '15px 30px',
                    'background-color': type === 'success' ? 'green' : 'yellow',
                    'color': 'black',
                    'border-radius': '5px',
                    'font-size': '16px',
                    'z-index': '9999'
                });

            $('body').append(notification);

            setTimeout(function () {
                notification.fadeOut(function () {
                    notification.remove();
                });
            }, 2000);
        }

        // Xử lý thêm sản phẩm vào giỏ hàng
        function addToCart(productDetails, token, isBuyNow = false) {
            $.ajax({
                url: '/gio-hang-chi-tiet',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(productDetails),
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                success: function (response) {
                    toastr.success('Sản phẩm đã được thêm vào giỏ hàng thành công!', 'Thành công');

                    if (isBuyNow) {
                        window.location.href = '/cart';
                    } else {
                        const token = localStorage.getItem('token');
                        if (token) {
                            fetchCartItemCount(token); // Gọi hàm lấy số lượng giỏ hàng nếu có token
                        } else {
                            updateCartBadge(0); // Nếu không có token, hiển thị 0
                        }
                        fetchMenuData();
                    }
                },
                error: function (error) {
                    console.error('Error adding product to cart:', error);
                    if (error.responseJSON.code === '400') {
                        toastr.error(error.responseJSON.message, 'Lỗi');
                    } else {
                        toastr.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.', 'Lỗi');
                    }
                }
            });
        }

        function validateProductDetails(productDetails) {
            if (!productDetails.idSize || !productDetails.idMauSac || !productDetails.soLuong) {
                toastr.warning('Vui lòng chọn màu sắc, kích thước và số lượng!', 'Lỗi');
                return false;
            }
            return true;
        }

        $('#addToCartButton').on('click', function () {
            if (!checkToken()) {
                return;
            }

            const productDetails = getSelectedProductDetails();

            if (!validateProductDetails(productDetails)) {
                return;
            }

            Swal.fire({
                title: 'Xác nhận',
                text: 'Bạn có chắc chắn muốn thêm sản phẩm vào giỏ hàng?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy',
                reverseButtons: true,
                dangerMode: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    const token = localStorage.getItem('token');
                    addToCart(productDetails, token);
                }
            });
        });

        $('#buyButton').on('click', function () {
            if (!checkToken()) {
                return;
            }

            const productDetails = getSelectedProductDetails();

            if (!validateProductDetails(productDetails)) {
                return;
            }

            Swal.fire({
                title: 'Xác nhận',
                text: 'Bạn có chắc chắn muốn mua sản phẩm này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy',
                reverseButtons: true,
                dangerMode: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    const token = localStorage.getItem('token');
                    addToCart(productDetails, token, true);
                }
            });
        });


    });

    // function displayProducts(page) {
    //     const productContainer = $('#product-info');
    //
    //     // Ẩn container với hiệu ứng mờ dần
    //     productContainer.fadeOut(100, function () {
    //         productContainer.empty(); // Xóa sản phẩm cũ
    //
    //         const startIndex = page * productsPerPage;
    //         const productsToShow = allProducts.slice(startIndex, startIndex + productsPerPage);
    //
    //         // Hiển thị sản phẩm mới
    //         productsToShow.forEach(product => productContainer.append(createProductHtml(product)));
    //
    //         productContainer.fadeIn(100); // Hiển thị lại với hiệu ứng
    //
    //         attachHoverEffect();  // Gắn sự kiện hover
    //         attachWishlistEvent(); // Gắn sự kiện wishlist
    //     });
    // }

    // Hàm tạo HTML cho từng sản phẩm
    // function createProductHtml(product) {
    //     console.log('product:', product);
    //
    //     // Định dạng giá gốc
    //     const formattedPrice = new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(product.gia);
    //
    //     // Kiểm tra giaSauKhuyenMai, nếu có giá trị thì hiển thị giá sau khuyến mãi
    //     const formattedSalePrice = product.giaSauKhuyenMai != null
    //         ? new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(product.giaSauKhuyenMai)
    //         : '';
    //
    //     // Nếu có giá sau khuyến mãi thì tạo HTML cho giá sau khuyến mãi, nếu không thì không có gì
    //     const salePriceHTML = product.giaSauKhuyenMai != null
    //         ? `<p class="discount-price fw-bold" style="font-size: 25px; color: red;">${formattedSalePrice}</p>`
    //         : '';
    //
    //     // Nếu có giá khuyến mãi, gạch ngang giá gốc
    //     const oldPriceClass = product.giaSauKhuyenMai != null ? 'text-decoration: line-through;' : '';
    //
    //     return `
    //     <div class="product d-flex flex-column align-items-center justify-content-between">
    //          <div class="image-wrapper">
    //               <a href="/productDetail/${product.id}">
    //                    <img class="product-image" src="/images/${product.anh}" alt="${product.ten}">
    //               </a>
    //               ${product.giaSauKhuyenMai != null ? `
    //               <div class="hot-sale-badge position-absolute translate-middle">
    //                    <img src="/images/hotsale3.gif" alt="Hot Sale" class="img-fluid" />
    //               </div>` : ''}
    //          </div>
    //          <div class="price-and-name text-center">
    //               <p class="name" style="font-size: 19px;">${product.ten}</p>
    //               <p class="price fw-bold" style="font-size: 23px; ${oldPriceClass}">
    //                   ${formattedPrice}
    //               </p>
    //               ${salePriceHTML}
    //          </div>
    //          <br><br>
    //          <div class="product-buttons d-flex justify-content-center mt-3 gap-2">
    //              <a class="btn w-50 add-to-wishlist-btn" data-product-id="${product.id}">
    //                   Yêu thích
    //              </a>
    //              <a href="/productDetail/${product.id}" class="btn w-50 view-details-btn">
    //                   Xem chi tiết
    //              </a>
    //          </div>
    //     </div>
    // `;
    // }
    //
    // // Gắn sự kiện hover
    // function attachHoverEffect() {
    //     $('.product').hover(
    //         function () {
    //             $(this).find('.add-to-wishlist-btn').fadeIn(200);
    //         },
    //         function () {
    //             $(this).find('.add-to-wishlist-btn').fadeOut(200);
    //         }
    //     );
    // }

    // Gắn sự kiện wishlist
    function attachWishlistEvent() {
        $('.add-to-wishlist-btn').off('click').on('click', function (e) {
            e.preventDefault();

            const productId = $(this).data('product-id');
            const authToken = localStorage.getItem("token");

            if (!authToken) {
                showToast('Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.', 'danger');
                return;
            }

            const heartIcon = $(this).closest('.product').find('.icon-heart i');
            const button = $(this);

            checkProductInWishlist(productId, authToken, heartIcon, button);
        });
    }

    // Kiểm tra và thêm vào danh sách yêu thích
    function checkProductInWishlist(productId, authToken, heartIcon, button) {
        sendAjax(`/yeu-thich/${productId}/check`, 'GET', authToken, null,
            function (isInWishlist) {
                if (isInWishlist) {
                    showToast('Sản phẩm đã có trong danh sách yêu thích.', 'info');
                    toastr.info('Sản phẩm đã có trong danh sách yêu thích.', 'Đã có');
                    updateWishlistButton(button, heartIcon);
                } else {
                    addProductToWishlist(productId, authToken, heartIcon, button);
                }
            },
            function (error) {
                console.error("Lỗi khi kiểm tra sản phẩm trong wishlist:", error);
                showToast('Có lỗi khi kiểm tra danh sách yêu thích.', 'danger');
                toastr.warning('Có lỗi khi kiểm tra danh sách yêu thích.', 'Lỗi');
            }
        );
    }

    // Thêm sản phẩm vào wishlist
    function addProductToWishlist(productId, authToken, heartIcon, button) {
        button.attr('disabled', true);

        sendAjax(`/yeu-thich/${productId}`, 'POST', authToken, null,
            function () {
                showToast('Đã thêm sản phẩm vào danh sách yêu thích!', 'success');
                toastr.success('Đã thêm sản phẩm vào danh sách yêu thích!', 'Thành công');
                updateWishlistButton(button, heartIcon);
            },
            function (error) {
                console.error("Lỗi khi thêm sản phẩm vào danh sách yêu thích:", error);
                showToast('Có lỗi khi thêm sản phẩm vào yêu thích.', 'danger');
                toastr.danger('Có lỗi khi thêm sản phẩm vào yêu thích.', 'Lỗi');
                button.attr('disabled', false);
            }
        );
    }

    // Cập nhật nút và biểu tượng wishlist
    //     function updateWishlistButton(button, heartIcon) {
    //         heartIcon.removeClass('bi-heart').addClass('bi-heart-fill');
    //         button.text("Added to wishlist").attr('disabled', true);
    //     }

    // Hàm gửi AJAX chung
    function sendAjax(url, method, authToken, data, successCallback, errorCallback) {
        $.ajax({
            url: url,
            method: method,
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            data: data,
            success: successCallback,
            error: errorCallback
        });
    }

    // Hiển thị thông báo Toast
    function showToast(message, type) {
        const toastBody = $('#toast .toast-body');
        toastBody.text(message);

        const toast = $('#toast').removeClass('bg-danger bg-success bg-info');
        toast.addClass(type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-info');

        toast.toast({delay: 3000});
        toast.toast('show');
    }

    /////////////////////////////// wislist detail product //////////////////////
    $(document).ready(function () {
        // Lấy ID sản phẩm từ URL
        const url = window.location.href;
        const productId = url.split('/').pop(); // Lấy phần cuối của URL, giả sử URL là /productDetail/10007

        // Gắn sự kiện cho nút yêu thích
        $('#addWislist').on('click', function () {
            const authToken = localStorage.getItem("token");

            if (!authToken) {
                showToast('Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.', 'danger');
                return;
            }

            // Kiểm tra sản phẩm đã có trong danh sách yêu thích chưa
            checkProductInWishlist(productId, authToken);
        });

        // Kiểm tra sản phẩm đã có trong danh sách yêu thích chưa
        function checkProductInWishlist(productId, authToken) {
            $.ajax({
                url: `/yeu-thich/${productId}/check`, // Endpoint để kiểm tra
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + authToken
                },
                success: function (isInWishlist) {
                    if (isInWishlist) {
                        showToast('Sản phẩm đã có trong danh sách yêu thích.', 'info');
                        toastr.info('Sản phẩm đã có trong danh sách yêu thích.', 'Đã có');
                    } else {
                        addProductToWishlist(productId, authToken);
                    }
                },
                error: function (error) {
                    console.error("Lỗi khi kiểm tra sản phẩm trong wishlist:", error);
                    showToast('Có lỗi khi kiểm tra danh sách yêu thích.', 'danger');
                    toastr.danger('Có lỗi khi thêm sản phẩm vào yêu thích.', 'Lỗi');
                }
            });
        }

        // Hàm thêm sản phẩm vào wishlist
        function addProductToWishlist(productId, authToken) {
            // Gửi yêu cầu AJAX để thêm sản phẩm vào wishlist
            $.ajax({
                url: `/yeu-thich/${productId}`,
                type: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + authToken
                },
                success: function (response) {
                    // Thông báo thành công
                    showToast('Đã thêm sản phẩm vào danh sách yêu thích!', 'success');
                    toastr.success('Đã thêm sản phẩm vào danh sách yêu thích!', 'Thành công');
                },
                error: function (error) {
                    console.error("Lỗi khi thêm sản phẩm vào danh sách yêu thích:", error);
                    showToast('Có lỗi khi thêm sản phẩm vào yêu thích.', 'danger');
                    toastr.danger('Có lỗi khi thêm sản phẩm vào yêu thích.', 'Lỗi');
                }
            });
        }

        // Hàm hiển thị thông báo
    });


    //////////////////////// danh sách bán chạy /////////////////////////

    $(document).ready(function () {
        // Hàm hiển thị sản phẩm
        function displayCategoryProducts(products, containerId) {
            const productContainer = $(`#${containerId}`);
            productContainer.empty();

            // Chỉ lấy 8 sản phẩm đầu tiên
            const limitedProducts = products.slice(0, 8);

            limitedProducts.forEach(product => {
                const formattedPrice = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(product.gia);
                const formattedSalePrice = product.giaSauKhuyenMai !== null
                    ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(product.giaSauKhuyenMai)
                    : '';
                const salePriceHTML = product.giaSauKhuyenMai !== null
                    ? `<p class="discount-price fw-bold" style="font-size: 25px; color: red;">${formattedSalePrice}</p>`
                    : '';
                const oldPriceClass = product.giaSauKhuyenMai !== null ? 'text-decoration: line-through;' : '';

                const productHtml = `
            <div class="product d-flex flex-column align-items-center justify-content-between">
                <div class="image-wrapper">
                    <a href="/productDetail/${product.id}">
                        <img class="product-image" src="/images/${product.anh}" alt="${product.ten}">
                    </a>
                    ${product.giaSauKhuyenMai !== null ? `
                    <div class="hot-sale-badge position-absolute translate-middle">
                        <img src="/images/hotsale3.gif" alt="Hot Sale" class="img-fluid" />
                    </div>` : ''}
                </div>
                <div class="price-and-name text-center">
                    <p class="name" style="font-size: 19px;">${product.ten}</p>
                    <p class="price fw-bold" style="font-size: 23px; ${oldPriceClass}">
                        ${formattedPrice}
                    </p>
                    ${salePriceHTML}
                </div>
                <br><br>
                <div class="product-buttons d-flex justify-content-center mt-3 gap-2">
                    <a class="btn w-50 add-to-wishlist-btn" data-product-id="${product.id}">
                        Yêu thích
                    </a>
                    <a href="/productDetail/${product.id}" class="btn w-50 view-details-btn">
                        Xem chi tiết
                    </a>
                </div>
            </div>
        `;
                productContainer.append(productHtml);
            });
        }

        // Hàm lấy toàn bộ sản phẩm
        function fetchAllProducts() {
            $.ajax({
                url: '/san-pham/search',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ trangThai: 1 }),  // Lọc theo trạng thái ngay khi gửi request
                success: function (response) {
                    const products = response.data || [];

                    // Lọc sản phẩm có trạng thái = 1 nếu không có trong dữ liệu trả về
                    const activeProducts = products.filter(product => product.trangThai === 1);

                    // Phân loại sản phẩm theo danh mục
                    const categorizedProducts = {
                        cardigan: activeProducts.filter(product => product.idDanhMuc === 10),
                        quandai: activeProducts.filter(product => product.idDanhMuc === 6),
                        len: activeProducts.filter(product => product.idDanhMuc === 9),
                        hoodie: activeProducts.filter(product => product.idDanhMuc === 5),
                        aophong: activeProducts.filter(product => product.idDanhMuc === 12),
                        polo: activeProducts.filter(product => product.idDanhMuc === 11),
                        aokhoac: activeProducts.filter(product => product.idDanhMuc === 8),
                        somidaitay: activeProducts.filter(product => product.idDanhMuc === 13)
                    };

                    // Hiển thị sản phẩm theo danh mục
                    displayCategoryProducts(categorizedProducts.cardigan, 'cardigan');
                    displayCategoryProducts(categorizedProducts.quandai, 'quandai');
                    displayCategoryProducts(categorizedProducts.len, 'len');
                    displayCategoryProducts(categorizedProducts.hoodie, 'hoodie');
                    displayCategoryProducts(categorizedProducts.aophong, 'aophong');
                    displayCategoryProducts(categorizedProducts.polo, 'polo');
                    displayCategoryProducts(categorizedProducts.aokhoac, 'aokhoac');
                    displayCategoryProducts(categorizedProducts.somidaitay, 'somidaitay');

                    // Lấy sản phẩm mới nhất từ danh sách sản phẩm đã lọc
                    const latestProducts = activeProducts.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao)).slice(0, 8);
                    if (latestProducts.length > 0) {
                        displayCategoryProducts(latestProducts, 'product-info');
                    }

                    // Lọc và hiển thị sản phẩm bán chạy
                    const topSellingProducts = activeProducts.filter(product => product.isTopSelling);
                    displayCategoryProducts(topSellingProducts, 'sanphambanchay'); // Hiển thị sản phẩm bán chạy

                    // Gắn sự kiện wishlist
                    attachWishlistEvent();
                },
                error: function (error) {
                    console.error('Error fetching products:', error);
                }
            });
        }

        // Gọi hàm
        fetchAllProducts(); // Gọi API lấy toàn bộ sản phẩm
    });


});