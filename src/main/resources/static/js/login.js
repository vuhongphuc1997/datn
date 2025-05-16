$(document).ready(function () {

    // Khởi tạo Facebook SDK
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '919233929793599',
            cookie     : true,
            xfbml      : true,
            version    : 'v12.0'
        });
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

// Xử lý sự kiện đăng nhập Facebook khi nhấn nút
    $('#fb-login-button').click(function() {
        FB.login(function(response) {
            if (response.authResponse) {
                // Đăng nhập thành công, lấy access token từ Facebook
                const accessToken = response.authResponse.accessToken;

                // Gửi token lên server để xử lý đăng nhập
                authByFacebook(accessToken);
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, { scope: 'email' }); // Quyền yêu cầu access email của người dùng
    });

// Hàm gửi access_token lên server để xử lý đăng nhập
    function authByFacebook(accessToken) {
        $.ajax({
            url: '/auth/facebook',
            method: 'GET',
            data: {
                access_token: accessToken
            },
            success: function(response) {
                console.log('Login Success:', response);
                // Lưu token vào localStorage
                localStorage.setItem('token', response.token);

                toastr.success('Đăng nhập thành công!', 'Thành công');

                setTimeout(function () {
                    window.location.href = '/';
                }, 500);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('Login Error:', jqXHR.responseJSON ? jqXHR.responseJSON.message : errorThrown);
                toastr.error('Đăng nhập thất bại!', 'Lỗi');
            }
        });
    }


    $('#togglePassword').click(function() {
        const passwordField = $('#password');
        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            $(this).removeClass('bi-eye-slash').addClass('bi-eye');
        } else {
            passwordField.attr('type', 'password');
            $(this).removeClass('bi-eye').addClass('bi-eye-slash');
        }
    });

    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');

    // Nếu có thông tin đã lưu, tự động điền thông tin vào form
    if (savedUsername) {
        $('#username').val(savedUsername);
        if (savedPassword) {
            $('#password').val(savedPassword);
        }
    }

    // Hàm xử lý đăng nhập khi nhấn nút Đăng nhập
    $('#loginButton').click(function () {
        handleLogin();
    });

    // Xử lý khi nhấn Enter trong form
    $('#username, #password').keypress(function (event) {
        if (event.which === 13) { // Kiểm tra nếu phím Enter (key code 13) được nhấn
            handleLogin();
        }
    });

    // Hàm đăng nhập chính
    function handleLogin() {
        const form = $('#create_customer')[0];

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const loginData = {
            username: $('#username').val().trim(),
            password: $('#password').val().trim()
        };

        $.ajax({
            url: '/auth',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            success: function (response) {
                const token = response.token;
                const role = response.vaiTro;
                localStorage.setItem('token', token);
                if ($('#remember').is(':checked')) {
                    // Lưu username và password vào localStorage
                    localStorage.setItem('savedUsername', loginData.username);
                    localStorage.setItem('savedPassword', loginData.password);
                } else {
                    // Nếu không chọn, xóa thông tin đã lưu
                    localStorage.removeItem('savedUsername');
                    localStorage.removeItem('savedPassword');
                }
                toastr.success('Đăng nhập thành công!', 'Thành công');
                if (role === 'USER' || role === 'ADMIN') {
                    setTimeout(function () {
                        window.location.href = '/staff';
                    }, 500);
                } else if (role === 'CLIENT') {
                    setTimeout(function () {
                        window.location.href = '/';
                    }, 500);
                } else {
                    window.location.href = '/';
                }
            },
            error: function (jqXHR) {
                const errorMsg = jqXHR.responseJSON && jqXHR.responseJSON.message
                    ? jqXHR.responseJSON.message
                    : 'Thông tin đăng nập không chính xác!';
                toastr.error(errorMsg, 'Lỗi');
            }
        });
    }

    // Hàm ẩn thông báo sau khi delay
    function hideMessageAfterDelay() {
        setTimeout(function () {
            $('#message').fadeOut('slow', function () {
                $(this).empty().show();
            });
        }, 2000);
    }
});
