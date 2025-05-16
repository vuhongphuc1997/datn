async function fetchCartData() {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const response = await fetch('gio-hang-chi-tiet/get-list', {
        method: 'GET',
        headers: headers,
    });
    const result = await response.json();
    const data = result.data; // Lấy dữ liệu từ result
    renderCart(data);
}

function handleCheckboxClick(itemId, isChecked) {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    if (isChecked) {
        selectedItems.push(itemId);
    } else {
        const index = selectedItems.indexOf(itemId);
        if (index > -1) {
            selectedItems.splice(index, 1);
        }
    }
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    updateTotalSection();
}

function handleCheckout() {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];

    if (selectedItems.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo',
            text: 'Không có sản phẩm nào được chọn!',
            confirmButtonText: 'OK'
        });
    } else {
        Swal.fire({
            icon: 'question',
            title: 'Bạn có chắc chắn?',
            text: 'Bạn muốn tiếp tục đến trang thanh toán?',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/checkout';
            }
        });
    }
}


function updateTotalSection() {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    const productItems = document.querySelectorAll('.product-item');
    let totalAmount = 0;
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(amount);
    };
    let selectedCount = 0;

    productItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            const totalText = item.querySelector('.total').textContent;
            const total = parseFloat(totalText.replace(/[^\d,]/g, '').replace(/,/g, '').replace(/\./g, '.'));
            totalAmount += total;
            selectedCount++;
        }
    });

    const totalSection = document.querySelector('.total-section .total');

    // Cập nhật "Tổng sản phẩm" và "Tạm tính"
    const totalProducts = document.querySelector('.total-products');
    const temporaryTotal = document.querySelector('.temporary-total');

    totalProducts.textContent = `Tổng sản phẩm: ${selectedCount}`;
    temporaryTotal.textContent = `Tạm tính: ${formatCurrency(totalAmount)}`;
}


function handleQuantityChange(itemId, isIncreasing) {
    const productItem = document.querySelector(`.product-item input[data-id="${itemId}"]`).closest('.product-item');
    let currentQuantity = parseInt(productItem.querySelector('.quantity span').textContent);
    const newQuantity = isIncreasing ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity < 1) return; // Không cho phép số lượng nhỏ hơn 1

    // Gọi đến API để cập nhật số lượng
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    fetch(`/gio-hang-chi-tiet/change/${itemId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(newQuantity)
    })
        .then(response => response.json())
        .then(result => {
            if (result.code == '200') {
                // Cập nhật hiển thị số lượng và tổng tiền
                productItem.querySelector('.quantity span').textContent = newQuantity;
                const price = parseFloat(
                    productItem
                        .querySelector('.price')
                        .textContent
                        .replace(/[^\d,.-]/g, '') // Loại bỏ ký tự không phải số, dấu `,`, `.` hoặc `-`
                        .replace(/\./g, '')       // Xóa tất cả dấu `.`
                        .replace(',', '.')        // Thay dấu `,` thành `.`
                );
                const total = newQuantity * price;
                const formatCurrency = (amount) => {
                    return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(amount);
                };
                productItem.querySelector('.total').textContent = `${formatCurrency(total)}`;
                updateTotalSection();
            } else {
                toastr.error(result.message || 'Cập nhật số lượng thất bại!', 'Lỗi');
            }
        })
        .catch(error => {
            // Hiển thị lỗi nếu có lỗi trong quá trình gọi API
            toastr.error('Lỗi khi gọi API', 'Lỗi');
            console.error('Lỗi khi gọi API', error);
        });
}

function hienThiThongBao(message, success = true) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.backgroundColor = success ? 'rgba(0, 128, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function handleDelete(itemId) {
    Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
        text: 'Hành động này không thể hoàn tác!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            deleteItem(itemId);
        }
    });
}

function deleteItem(itemId) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    fetch(`/gio-hang-chi-tiet/${itemId}`, {
        method: 'DELETE',
        headers: headers
    })
        .then(response => response.json())
        .then(result => {
            if (result.code === '200') {
                toastr.success('Sản phẩm đã được xóa thành công!', 'Thành công');
                fetchCartData();
                const token = localStorage.getItem('token');
                if (token) {
                    fetchCartItemCount(token); // Gọi hàm lấy số lượng giỏ hàng nếu có token
                } else {
                    updateCartBadge(0); // Nếu không có token, hiển thị 0
                }
                fetchMenuData();
            } else {
                console.error('Xóa sản phẩm thất bại', result.message);
                toastr.error('Xóa sản phẩm thất bại!', 'Lỗi');
            }
        })
        .catch(error => {
            console.error('Lỗi khi gọi API', error);
            toastr.error('Có lỗi xảy ra khi gọi API.', 'Lỗi');
        });
}


function renderCart(items) {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
    const productSection = document.querySelector('.product-section');
    productSection.innerHTML = '';

    if (items.length === 0) {
        productSection.innerHTML = '<p>Không có sản phẩm nào.</p>';
        return;
    }

    let totalAmount = 0;
    items.forEach(item => {
        const sanPham = item.sanPham || {}; // Xử lý trường hợp sanPham là null
        const sanPhamChiTiet = item.sanPhamChiTiet || {};
        const gia = item.giaSauKhuyenMai != null ? item.giaSauKhuyenMai : item.sanPham.gia;
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(amount);
        };

        const total = gia * item.soLuong;
        totalAmount += total;

        // Kiểm tra nếu sản phẩm hết hàng
        const isOutOfStock = sanPhamChiTiet.soLuong === 0;
        // Kiểm tra nếu số lượng giỏ hàng vượt quá số lượng có sẵn
        const isNotEnoughStock = item.soLuong > sanPhamChiTiet.soLuong;

        const productItem = document.createElement('div');
        productItem.className = 'product-item';

        // HTML của sản phẩm
        const itemHtml = `
            <div class="product-content ${isOutOfStock || isNotEnoughStock ? 'out-of-stock' : ''}">
                <!-- Hiển thị chữ "Hết hàng" nếu hết hàng -->
                ${isOutOfStock ? '<span class="out-of-stock-label">Hết hàng</span>' : ''}
                <!-- Hiển thị chữ "Không đủ số lượng" nếu số lượng giỏ hàng vượt quá số lượng có sẵn (chỉ khi không hết hàng) -->
                ${!isOutOfStock && isNotEnoughStock ? '<span class="out-of-stock-label">Không đủ số lượng</span>' : ''}
                
                <input type="checkbox" ${selectedItems.includes(item.id) ? 'checked' : ''} 
                    data-id="${item.id}" ${isOutOfStock || isNotEnoughStock ? 'disabled' : ''}>
                <img class="product-image" src="/images/${sanPham.anh || ''}" alt="${sanPham.ten || 'Không có ảnh'}">
                <div class="product-info">
                    <span class="product-name" style="font-size: 20px;">${sanPham.ten || 'Sản phẩm không xác định'}</span>
                    <span class="product-details">
                        Phân loại: ${sanPhamChiTiet.mauSac?.ten || 'N/A'}, Size: ${sanPhamChiTiet.size?.ten || 'N/A'}
                    </span>
                </div>
            </div>
            <div class="price">
                ${formatCurrency(gia)}
            </div>
            <div class="quantity">
                <button ${isOutOfStock || isNotEnoughStock ? 'disabled' : ''}>-</button>
                <span>${item.soLuong}</span>
                <button ${isOutOfStock || isNotEnoughStock ? 'disabled' : ''}>+</button>
            </div>
            <div class="total">${formatCurrency(total)}</div>
            <div><button class="btn delete-btn" data-id="${item.id}"><i class="fa fa-trash"></i></button></div>

        `;

        productItem.innerHTML = itemHtml;
        productSection.appendChild(productItem);
    });

    updateTotalSection();

    // Thêm sự kiện cho các nút tăng giảm số lượng
    document.querySelectorAll('.product-item .quantity button').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.closest('.product-item').querySelector('input[data-id]').dataset.id;
            const isIncreasing = e.target.textContent === '+';
            handleQuantityChange(itemId, isIncreasing);
        });
    });

    // Thêm sự kiện cho các ô checkbox
    document.querySelectorAll('.product-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            handleCheckboxClick(e.target.dataset.id, e.target.checked);
        });
    });

    // Thêm sự kiện cho các nút Xóa
    document.querySelectorAll('.product-item .delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.closest('.delete-btn').dataset.id;  // Lấy ID từ data-id thay vì tìm kiếm lại
            handleDelete(itemId);
        });
    });

    // Thêm sự kiện cho nút Mua Hàng
    document.querySelector('.checkout-btn').addEventListener('click', handleCheckout);
}

document.addEventListener('DOMContentLoaded', () => {
    // Xóa selectedItems khỏi local storage khi trang được tải lại
    localStorage.removeItem('selectedItems');
    fetchCartData();
});
document.addEventListener('DOMContentLoaded', () => {
    checkToken();
    // Xóa selectedItems khỏi local storage khi trang được tải lại
    localStorage.removeItem('selectedItems');
    fetchCartData();

    // Thêm sự kiện cho nút "Chọn Tất cả"
    document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.querySelectorAll('.product-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = isChecked;
            handleCheckboxClick(checkbox.dataset.id, isChecked);
        });
    });
});

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
    } else {
        try {
            const decodedToken = jwt_decode(token);
            console.log(decodedToken);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Token không hợp lệ',
                text: 'Vui lòng đăng nhập lại.',
                confirmButtonText: 'Đến trang đăng nhập',
                willClose: () => {
                    window.location.href = '/v1/auth/login';
                }
            });
        }
    }
}

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
            const formattedSalePrice = product.giaSauKhuyenMai
                ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(product.giaSauKhuyenMai)
                : '';
            const salePriceHTML = product.giaSauKhuyenMai
                ? `<p class="discount-price fw-bold" style="font-size: 25px; color: red;">${formattedSalePrice}</p>`
                : '';
            const oldPriceClass = product.giaSauKhuyenMai ? 'text-decoration: line-through;' : '';

            const productHtml = `
            <div class="product d-flex flex-column align-items-center justify-content-between">
                <div class="image-wrapper">
                    <a href="/productDetail/${product.id}">
                        <img class="product-image" src="/images/${product.anh}" alt="${product.ten}">
                    </a>
                    ${product.giaSauKhuyenMai ? `
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
            data: JSON.stringify({trangThai: 1}),
            success: function (response) {
                const products = response.data || [];

                const topSellingProducts = products.filter(product => product.isTopSelling);
                displayCategoryProducts(topSellingProducts, 'sanphambanchay'); // Hiển thị sản phẩm bán chạy

                // Hiển thị sản phẩm lên trang
                // displayProducts(currentPage);
                attachWishlistEvent(); // Gắn sự kiện wishlist
            },
            error: function (error) {
                console.error('Error fetching products:', error);
            }
        });
    }

    // Gọi hàm
    fetchAllProducts(); // Gọi API lấy toàn bộ sản phẩm
});

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
        },
        function (error) {
            console.error("Lỗi khi thêm sản phẩm vào danh sách yêu thích:", error);
            showToast('Có lỗi khi thêm sản phẩm vào yêu thích.', 'danger');
            toastr.danger('Có lỗi khi thêm sản phẩm vào yêu thích.', 'Lỗi');
            button.attr('disabled', false);
        }
    );
}

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

function showToast(message, type) {
    const toastBody = $('#toast .toast-body');
    toastBody.text(message);

    const toast = $('#toast').removeClass('bg-danger bg-success bg-info');
    toast.addClass(type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-info');

    toast.toast({delay: 3000});
    toast.toast('show');
}
