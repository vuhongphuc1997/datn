$(document).ready(function () {

    $('#togglePassword').click(function () {
        const passwordField = $('[name="customer[password]"]');

        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            $(this).removeClass('bi-eye-slash').addClass('bi-eye');
        } else {
            passwordField.attr('type', 'password');  // Ẩn mật khẩu
            $(this).removeClass('bi-eye').addClass('bi-eye-slash');
        }
    });

    $('#toggleRepassword').click(function () {
        const rePasswordField = $('[name="customer[retypePassword]"]');

        if (rePasswordField.attr('type') === 'password') {
            rePasswordField.attr('type', 'text');
            $(this).removeClass('bi-eye-slash').addClass('bi-eye');
        } else {
            rePasswordField.attr('type', 'password');
            $(this).removeClass('bi-eye').addClass('bi-eye-slash');
        }
    });

    // Xử lý khi nhấn vào nút Đăng ký
    $('#registerButton').click(function (event) {
        event.preventDefault(); // Ngừng hành động mặc định của nút

        handleRegister();  // Gọi hàm đăng ký
    });

    // Xử lý khi nhấn Enter trong form
    $('#create_customer input').keypress(function (event) {
        if (event.which === 13) { // Kiểm tra nếu phím Enter (key code 13) được nhấn
            event.preventDefault();  // Ngừng hành động mặc định (nếu có)
            handleRegister();  // Gọi hàm đăng ký
        }
    });

    // Hàm xử lý đăng ký
    function handleRegister() {
        const form = $('#create_customer')[0];

        if (!form.checkValidity()) {
            form.reportValidity();  // Hiển thị thông báo lỗi nếu form không hợp lệ
            return;
        }
        const name = $('input[name="customer[name]"]').val().trim();

        // Kiểm tra trường "name": không được rỗng, có thể chứa dấu cách nhưng không được chỉ có dấu cách
        const nameRegex = /^[\p{L}0-9 ]+$/u;
        if (name.length === 0) {
            toastr.error('Tên không được để trống.', 'Lỗi');
            return;
        }
        if (!nameRegex.test(name)) {
            toastr.error('Tên không được chứa ký tự đặc biệt ngoài dấu cách.', 'Lỗi');
            return;
        }
        if (name === '') {
            toastr.error('Tên không được chỉ có dấu cách.', 'Lỗi');
            return;
        }

        // Kiểm tra ngày sinh không được quá ngày hiện tại
        const ngaySinh = $('input[name="customer[ngaySinh]"]').val().trim();
        const today = new Date();
        const birthDate = new Date(ngaySinh);

        // So sánh ngày sinh với ngày hiện tại
        if (isNaN(birthDate.getTime())) {
            toastr.error('Ngày sinh không hợp lệ.', 'Lỗi');
            return;
        }

        if (birthDate > today) {
            toastr.error('Ngày sinh không được quá ngày hiện tại.', 'Lỗi');
            return;
        }

        const registerData = {
            name: $('input[name="customer[name]"]').val().trim(),
            email: $('input[name="customer[email]"]').val().trim(),
            phone: $('input[name="customer[phone]"]').val().trim(),
            password: $('input[name="customer[password]"]').val().trim(),
            retypePassword: $('input[name="customer[retypePassword]"]').val().trim(),
            ngaySinh: $('input[name="customer[ngaySinh]"]').val().trim()
        };

        $.ajax({
            url: '/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(registerData),
            success: function (response) {
                toastr.success('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.', 'Thành công');
                setTimeout(function () {
                    window.location.href = '/v1/auth/login';
                }, 500);
            },
            error: function (jqXHR) {
                const errorMsg = jqXHR.responseJSON && jqXHR.responseJSON.message
                    ? jqXHR.responseJSON.message
                    : 'Thông tin đăng ký không hợp lệ!';
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
