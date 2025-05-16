// headerJs.js
document.addEventListener('click', function(event) {

    const logoImage = document.getElementById('logoImage'); // Lấy phần tử img có id là logoImage

    // Kiểm tra nếu người dùng nhấn vào ảnh logo
    if (logoImage && logoImage.contains(event.target)) {
        // Chuyển hướng đến trang chủ
        window.location.href = '/'; // Chuyển hướng đến trang chủ
    }
    const userIcon = document.getElementById('userIcon');
    const dropdownMenu = document.querySelector('.user-dropdown .dropdown-menu');
    const cartIcon = document.querySelector('.bi-bag'); // Lấy phần tử biểu tượng giỏ hàng

    // Kiểm tra nếu người dùng nhấn vào biểu tượng người dùng
    if (userIcon.contains(event.target)) {
        // Tạo hiệu ứng bật/tắt menu khi người dùng nhấn vào biểu tượng người dùng
        dropdownMenu.classList.toggle('show');

        // Lấy token từ localStorage (kiểm tra xem người dùng đã đăng nhập chưa)
        const token = localStorage.getItem('token');

        // Lấy tất cả các mục trong menu dropdown
        const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');

        // Nếu có token, nghĩa là người dùng đã đăng nhập
        if (token) {
            // Cập nhật các mục trong dropdown khi người dùng đã đăng nhập
            dropdownItems[0].textContent = 'Hồ sơ'; // Mục đầu tiên: Hồ sơ
            dropdownItems[1].textContent = 'Đổi mật khẩu'; // Mục thứ hai: Đổi mật khẩu
            dropdownItems[2].textContent = 'Đăng xuất'; // Mục thứ ba: Đăng xuất

            // Đảm bảo các mục khác (Đăng nhập và Đăng ký) không hiển thị
            dropdownItems[0].style.display = 'block'; // Hiển thị "Hồ sơ"
            dropdownItems[1].style.display = 'block'; // Hiển thị "Đổi mật khẩu"
            dropdownItems[2].style.display = 'block'; // Hiển thị "Đăng xuất"

            // Khi người dùng nhấn vào "Hồ sơ", chuyển hướng đến trang "Hồ sơ"
            dropdownItems[0].addEventListener('click', function() {
                window.location.href = '/profile'; // Chuyển hướng đến trang /profile
            });

            // Khi người dùng nhấn vào "Đổi mật khẩu", chuyển hướng đến trang thay đổi mật khẩu
            dropdownItems[1].addEventListener('click', function() {
                window.location.href = '/v1/auth/change-password'; // Chuyển hướng đến trang /v1/auth/change-password
            });

            // Khi người dùng nhấn vào "Đăng xuất", xóa token và tải lại trang
            dropdownItems[2].addEventListener('click', function() {
                localStorage.removeItem('token'); // Xóa token khỏi localStorage
                window.location.href = '/';
                // window.location.reload(); // Tải lại trang hiện tại
            });

        } else {
            // Nếu không có token, nghĩa là người dùng chưa đăng nhập
            // Cập nhật các mục trong dropdown khi người dùng chưa đăng nhập
            dropdownItems[0].textContent = 'Đăng nhập'; // Mục đầu tiên: Đăng nhập
            dropdownItems[1].textContent = 'Đăng ký'; // Mục thứ hai: Đăng ký

            // Ẩn mục "Đăng xuất" khi người dùng chưa đăng nhập
            dropdownItems[2].style.display = 'none'; // Ẩn mục "Đăng xuất"

            // Khi người dùng nhấn vào "Đăng nhập", chuyển hướng đến trang đăng nhập
            dropdownItems[0].addEventListener('click', function() {
                window.location.href = '/v1/auth/login'; // Chuyển hướng đến trang /v1/auth/login
            });

            // Khi người dùng nhấn vào "Đăng ký", chuyển hướng đến trang đăng ký
            dropdownItems[1].addEventListener('click', function() {
                window.location.href = '/v1/auth/register'; // Chuyển hướng đến trang /v1/auth/register
            });
        }
    } else if (!dropdownMenu.contains(event.target)) {
        // Nếu người dùng nhấn ra ngoài menu dropdown, đóng menu
        dropdownMenu.classList.remove('show');
    }

    // Kiểm tra nếu người dùng nhấn vào biểu tượng giỏ hàng (biểu tượng .bi-bag)
    if (cartIcon.contains(event.target)) {
        // Chuyển hướng đến trang giỏ hàng
        window.location.href = '/cart'; // Chuyển hướng đến trang /cart
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    // Kiểm tra nếu có token thì fetch API, nếu không có thì hiển thị số lượng giỏ hàng là 0
    if (token) {
        fetchCartItemCount(token); // Gọi hàm lấy số lượng giỏ hàng nếu có token
    } else {
        updateCartBadge(0); // Nếu không có token, hiển thị 0
    }
    fetchMenuData();
});

// Hàm lấy số lượng sản phẩm trong giỏ hàng và cập nhật badge
function fetchCartItemCount(token) {
    fetch('/gio-hang-chi-tiet/get-list', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Thêm token vào header Authorization
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data && data.data) {
                const cartItemCount = data.data.length;
                updateCartBadge(cartItemCount); // Cập nhật số lượng giỏ hàng
            } else {
                console.error('Không có dữ liệu giỏ hàng');
                updateCartBadge(0); // Nếu không có dữ liệu giỏ hàng, hiển thị 0
            }
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error);
            updateCartBadge(0); // Hiển thị 0 nếu có lỗi trong việc gọi API
        });
}

// Hàm cập nhật số lượng giỏ hàng trong badge
function updateCartBadge(count) {
    const elements = document.querySelectorAll('.cart-badge, .cart-count, .cart-total');
    elements.forEach(element => element.textContent = count);
}

// Hàm tạo danh mục con cho mỗi cấp
function createSubMenu(children, level = 1) {
    const subMenu = document.createElement('ul');
    subMenu.classList.add('submenu'); // Thêm class submenu để kiểm soát hiển thị

    children.forEach(child => {
        const subCategoryItem = document.createElement('li');
        subCategoryItem.textContent = child.ten;
        // Thêm sự kiện click cho danh mục con
        subCategoryItem.addEventListener('click', (event) => {
            event.stopPropagation(); // Ngừng sự kiện propagating để tránh sự kiện click vào menu cha
            // Khi click vào danh mục con, gửi idDanhMuc sang trang search
            window.location.href = `/search?idDanhMuc=${child.id}`;
        });

        // Lắng nghe sự kiện hover vào menu con để hiển thị cấp tiếp theo
        subCategoryItem.addEventListener('mouseenter', () => {
            // Tạo cấp độ con tiếp theo (nếu có) khi hover vào mục con
            if (child.children && child.children.length > 0) {
                const nextLevelMenu = createSubMenu(child.children, level + 1);
                subCategoryItem.appendChild(nextLevelMenu); // Thêm submenu con vào mục này
            }
        });

        subMenu.appendChild(subCategoryItem);
    });

    return subMenu;
}

// Hàm gắn danh mục con vào các menu cha dựa trên data-id
function populateMenu(data) {
    // Lấy tất cả các liên kết trong menu
    const menuLinks = document.querySelectorAll('.header-link');

    // Duyệt qua tất cả các menu link
    menuLinks.forEach(link => {
        const menuId = link.getAttribute('data-id'); // Lấy data-id từ các liên kết

        // Tìm danh mục tương ứng trong dữ liệu API
        const category = data.find(item => item.id == menuId);

        // Nếu có danh mục con, thêm submenu cấp 1
        if (category && category.children && category.children.length > 0) {
            const subMenu = createSubMenu(category.children, 1);
            link.appendChild(subMenu); // Thêm submenu vào link
            link.addEventListener('click', (event) => {
                event.stopPropagation(); // Ngừng sự kiện propagating
                window.location.href = `/search?idDanhMuc=${category.id}`; // Chuyển hướng đến trang search với idDanhMuc
            });
        }
    });
}

function fetchMenuData() {
    fetch('/rest/danhmuc/get-children')
        .then(response => response.json())
        .then(data => {
            if (data && data.data) {
                populateMenu(data.data);
            }
        })
        .catch(error => {
            console.error('Error fetching menu data:', error);
        });
}

