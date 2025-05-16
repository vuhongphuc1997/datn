document.addEventListener('DOMContentLoaded', function () {
    setupLogoRedirect();
    setupFixedHeaderOnScroll();
    setupUserAuthenticationDisplay();
    setupDropdownToggle();
    setupTooltips();
});

// Điều hướng logo đến trang home
function setupLogoRedirect() {
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '/home';
        });
    }
}

// Cố định header khi cuộn xuống
function setupFixedHeaderOnScroll() {
    window.addEventListener('scroll', function () {
        const header = document.querySelector('header');
        if (window.scrollY > 200) {
            header?.classList.add('fixed-header');
        } else {
            header?.classList.remove('fixed-header');
        }
    });
}

// Hiển thị thông tin người dùng hoặc nút đăng nhập
function setupUserAuthenticationDisplay() {
    const token = localStorage.getItem('token');
    const userInfoContainer = document.getElementById('userInfo');
    const authButtons = document.getElementById('authButtons');
    const usernameDisplay = document.getElementById('usernameDisplay');

    if (!userInfoContainer || !authButtons || !usernameDisplay) return;

    if (token) {
        try {
            const decodedToken = jwt_decode(token);
            const username = decodedToken.fullName;

            userInfoContainer.style.display = 'block';
            usernameDisplay.innerText = username;
            authButtons.style.display = 'none';
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    } else {
        userInfoContainer.style.display = 'none';
        authButtons.style.display = 'block';
    }
}

// Xử lý dropdown user menu
function setupDropdownToggle() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const usernameDisplay = document.getElementById('usernameDisplay');

    if (!dropdownMenu || !usernameDisplay) return;

    usernameDisplay.addEventListener('click', function () {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function (event) {
        if (
            !usernameDisplay.contains(event.target) &&
            !dropdownMenu.contains(event.target) &&
            !event.target.matches('.username') &&
            !event.target.matches('.user-icon')
        ) {
            dropdownMenu.style.display = 'none';
        }
    });
}

// Đăng xuất
function logout() {
    localStorage.clear();
    location.reload();
}

// Kích hoạt tooltip Bootstrap
function setupTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}