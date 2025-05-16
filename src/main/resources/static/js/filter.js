$(document).ready(function () {
    const form = $('#searchForm');
    const input = $('#searchInput');
    const resultsContainer = $('#searchResults');
    const categoryTitle = $('#categoryTitle');
    const paginationContainer = $('#paginationContainer');

    let currentPage = 1; // Trang hiện tại
    let totalPages = 1; // Tổng số trang
    let allProducts = []; // Lưu trữ toàn bộ sản phẩm

    // Hàm hiển thị thông báo
    function displayMessage(message, type = 'text-danger') {
        resultsContainer.html(`<p class="${type}">${message}</p>`);
    }

    // Hàm tạo HTML cho sản phẩm
    function createProductHtml(product) {
        // Kiểm tra nếu có giá sau khuyến mãi
        const saleTag = product.giaSauKhuyenMai ? `
        <div class="hot-sale-badge position-absolute translate-middle">
             <img src="/images/hotsale3.gif" alt="Hot Sale" class="img-fluid" />
        </div>
        ` : ''; // Nếu có, thêm thẻ "SALE"

        return `
            <div class="col-md-3 mb-3 product" data-product-id="${product.id}">
                <div class=" product-card">
                    <a href="/productDetail/${product.id}">
                        <div class="image-container">
                            <img class="product-image" style="width: 100%; height: 100%; object-fit: contain;" src="/images/${product.anh || 'default.png'}" alt="${product.ten}">
                            ${saleTag}  <!-- Hiển thị thẻ SALE nếu có khuyến mãi -->
                        </div>
                    </a>
                    <div class="card-body">
                        <div class="text-start">
                            <a href="/productDetail/${product.id}">
                                <h6 class="card-title fw-bold">${product.ten}</h6>                    
                            </a>
                             ${product.giaSauKhuyenMai !== null ? `
                            <p class="price old-price">${product.gia.toLocaleString()}đ</p>
                            <p class="price new-price">${product.giaSauKhuyenMai.toLocaleString()}đ</p>
                            ` : `<p class="price">${product.gia.toLocaleString()}đ</p>`}
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <button class="btn btn-buy btn-dark w-75">                            
                                <a style="color: white" href="/productDetail/${product.id}">XEM CHI TIẾT
                                </a>
                            </button>
                            <span style="cursor: pointer" class="icon-heart">
                                <i style="font-size: 24px" class="bi bi-heart"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>`;
    }


    // Cập nhật tiêu đề danh mục
    function updateCategoryTitle(keyword, count) {
        categoryTitle.text(`${keyword || 'Tất cả sản phẩm'} (${count} sản phẩm)`);
    }

    // Hàm gọi API tìm kiếm
    async function fetchSearchResults(keyword, page = 1) {

        const requestData = {
            keyword: keyword,
            idChatLieu: selectedMaterialId,
            idThuongHieu: selectedBrandId,
            idDanhMuc: selectedCategoryId,
            giaMin: null, // Không có giá min
            giaMax: null  // Không có giá max
        };

        fetchFilteredSearchResults(requestData, page);  // Gọi hàm chung
    }

    // Hàm hiển thị sản phẩm theo trang
    function showPage(page) {
        currentPage = page;
        const startIndex = (currentPage - 1) * 16; // 8 sản phẩm mỗi trang
        const endIndex = startIndex + 16;
        const productsToDisplay = allProducts.slice(startIndex, endIndex);  // Lọc sản phẩm theo trang

        resultsContainer.empty();
        productsToDisplay.forEach(product => {
            resultsContainer.append(createProductHtml(product));
        });
    }


    // Cập nhật phân trang
    function updatePagination(currentPage) {
        paginationContainer.empty();

        // Nút Previous
        paginationContainer.append(`
        <a href="#" class="prev ${currentPage === 1 ? 'disabled' : ''}">«</a>
    `);

        // Các trang
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.append(`
            <a href="#" class="page-num ${i === currentPage ? 'active' : ''}">${i}</a>
        `);
        }

        // Nút Next
        paginationContainer.append(`
        <a href="#" class="next ${currentPage === totalPages ? 'disabled' : ''}">»</a>
    `);

        // Sự kiện cho các nút trang
        $('.page-num').off('click').on('click', function () {
            const pageNum = parseInt($(this).text());
            const keyword = input.val().trim();
            fetchSearchResults(keyword, pageNum);  // Gọi lại API tìm kiếm với trang người dùng chọn
        });

        // Sự kiện cho nút Previous
        $('.prev').off('click').on('click', function () {
            if (currentPage > 1) {
                fetchSearchResults(input.val().trim(), currentPage - 1);
            }
        });

        // Sự kiện cho nút Next
        $('.next').off('click').on('click', function () {
            if (currentPage < totalPages) {
                fetchSearchResults(input.val().trim(), currentPage + 1);
            }
        });
    }


    // Hàm gắn sự kiện cho biểu tượng trái tim
    function attachWishlistEvent() {
        $('.icon-heart i').off('click').on('click', function () {
            const productId = $(this).closest('.product').data('product-id');
            const authToken = localStorage.getItem('token');

            if (!authToken) {
                toastr.info('Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.', 'Kiểm tra');
                return;
            }

            const heartIcon = $(this);

            $.ajax({
                url: `/yeu-thich/${productId}/check`,
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${authToken}`
                },
                success: function (isInWishlist) {
                    if (isInWishlist) {
                        toastr.info('Sản phẩm đã có trong danh sách yêu thích.', 'Đã có');
                        heartIcon.removeClass('bi-heart').addClass('bi-heart-fill');
                    } else {
                        $.ajax({
                            url: `/yeu-thich/${productId}`,
                            method: 'POST',
                            headers: {
                                "Authorization": `Bearer ${authToken}`
                            },
                            success: function () {
                                toastr.success('Đã thêm sản phẩm vào danh sách yêu thích!', 'Thành công');
                                heartIcon.removeClass('bi-heart').addClass('bi-heart-fill');
                            },
                            error: function () {
                                toastr.dangerMode('Có lỗi khi thêm sản phẩm vào yêu thích.', 'Lỗi');
                            }
                        });
                    }
                },
                error: function () {
                    toastr.dangerMode('Có lỗi khi khi kiểm trả danh sách yêu thích.', 'Lỗi');
                }
            });
        });
    }
    fetchSearchResults();
    // Xử lý sự kiện gửi form
    form.on('submit', function (e) {
        e.preventDefault();
        const keyword = input.val().trim();
        const page = 1;  // Mặc định trang 1 khi tìm kiếm
        fetchSearchResults(keyword, page);  // Gọi API tìm kiếm
    });

    // Kiểm tra từ khóa trong URL khi tải trang
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('ten');
    const page = params.get('page') || 1;

    if (keyword) {
        input.val(keyword); // Hiển thị từ khóa trên input
        fetchSearchResults(keyword, page); // Gọi tìm kiếm với phân trang
    } else {
        displayMessage('Không có từ khóa tìm kiếm.');
    }
    async function fetchFilteredSearchResults(requestData, page = 1) {
        try {
            const response = await fetch('san-pham/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...requestData, page: page })
            });

            if (!response.ok) {
                throw new Error('Lỗi khi gửi yêu cầu API');
            }

            const data = await response.json();
            console.log(data);

            // Lọc chỉ các sản phẩm có trangThai = 1
            const filteredProducts = data.data.filter(product => product.trangThai === 1);

            // Lưu trữ sản phẩm mới và tính lại tổng số trang
            allProducts = filteredProducts;
            totalPages = Math.ceil(allProducts.length / 16); // 8 sản phẩm mỗi trang

            if (allProducts.length === 0) {
                displayMessage('Không tìm thấy sản phẩm nào!');
                updateCategoryTitle(requestData.keyword, 0);
            } else {
                showPage(page);  // Hiển thị sản phẩm của trang hiện tại
                updateCategoryTitle(requestData.keyword, allProducts.length);
                attachWishlistEvent();  // Gắn sự kiện cho biểu tượng trái tim
                updatePagination(page);  // Cập nhật phân trang
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
            alert('Đã xảy ra lỗi khi tìm kiếm sản phẩm');
        }
    }


    // Lắng nghe sự kiện click vào nút lọc
    document.getElementById('filterButton').addEventListener('click', async function (event) {
        event.preventDefault(); // Ngừng hành động mặc định của nút submit

        const keyword = document.getElementById('searchInput').value.trim();
        const giaMin = new Decimal(document.getElementById('minPrice').value) || null;
        const giaMax = new Decimal(document.getElementById('maxPrice').value) || null;

        // Kiểm tra điều kiện giá (giaMax >= giaMin)
        if (giaMin !== null && giaMax !== null && giaMax.lessThan(giaMin)) {
            document.getElementById('price-error-message').style.display = 'block';
        } else {
            document.getElementById('price-error-message').style.display = 'none';
        }

        const currentPage = 1; // Khi lọc, bạn vẫn bắt đầu từ trang 1
        const requestData = {
            keyword: keyword,
            idChatLieu: selectedMaterialId,
            idThuongHieu: selectedBrandId,
            idDanhMuc: selectedCategoryId,
            giaMin: giaMin ? giaMin.toString() : null,  // Chuyển đổi Decimal thành string
            giaMax: giaMax ? giaMax.toString() : null   // Chuyển đổi Decimal thành string
        };

        // Gọi lại API với trang hiện tại
        fetchFilteredSearchResults(requestData, currentPage);  // Đảm bảo gửi yêu cầu với trang 1 sau khi lọc
    });



});
document.addEventListener('DOMContentLoaded', async function () {
    // Lấy danh sách chất liệu, thương hiệu và danh mục từ API
    try {
        // Gọi API lấy danh sách chất liệu
        const materialsResponse = await fetch('/chat-lieu/get-list');
        const materialsResponseData = await materialsResponse.json();

        // Kiểm tra xem materialsResponseData.data có phải là mảng không
        if (Array.isArray(materialsResponseData.data)) {
            renderMaterials(materialsResponseData.data);
        } else {
            console.error('Dữ liệu chất liệu không phải là mảng:', materialsResponseData.data);
            displayMessage('Không thể tải danh sách chất liệu.');
        }

        // Gọi API lấy danh sách thương hiệu
        const brandsResponse = await fetch('/rest/thuonghieu');
        const brandsResponseData = await brandsResponse.json();

        // Kiểm tra xem brandsResponseData.data có phải là mảng không
        if (Array.isArray(brandsResponseData.data)) {
            renderBrands(brandsResponseData.data);
        } else {
            console.error('Dữ liệu thương hiệu không phải là mảng:', brandsResponseData.data);
            displayMessage('Không thể tải danh sách thương hiệu.');
        }

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
        displayMessage('Đã xảy ra lỗi khi tải dữ liệu.');
    }
});

// Biến toàn cục để lưu giá trị của checkbox được chọn
let selectedMaterialId = null;
let selectedBrandId = null;

// Render các checkbox chất liệu  <label class="form-check-label" for="material${material.id}">${material.ten}</label>
function renderMaterials(materials) {
    const materialContainer = document.querySelector('.filter-group#material-group');
    materials.forEach(material => {
        const checkboxHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${material.id}" id="material${material.id}" onchange="handleMaterialCheckboxChange(this)">${material.ten}
            </div>
           
        `;
        materialContainer.innerHTML += checkboxHTML;
    });
}

// Render các checkbox thương hiệu <label class="form-check-label" for="brand${brand.id}">${brand.ten}</label>
function renderBrands(brands) {
    const brandContainer = document.querySelector('.filter-group#brand-group');
    brands.forEach(brand => {
        const checkboxHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${brand.id}" id="brand${brand.id}" onchange="handleBrandCheckboxChange(this)">${brand.ten}
            </div>
        `;
        brandContainer.innerHTML += checkboxHTML;
    });
}

// Hàm xử lý khi checkbox chất liệu được thay đổi
function handleMaterialCheckboxChange(checkbox) {
    // Nếu checkbox được chọn, lưu giá trị vào biến
    if (checkbox.checked) {
        // Bỏ chọn các checkbox còn lại
        const otherCheckboxes = document.querySelectorAll('.filter-group#material-group .form-check-input');
        otherCheckboxes.forEach(c => {
            if (c !== checkbox) c.checked = false;
        });

        // Lưu id của chất liệu được chọn
        selectedMaterialId = checkbox.value;
    } else {
        selectedMaterialId = null; // Nếu bỏ chọn, gán giá trị null
    }
    console.log('Chất liệu được chọn:', selectedMaterialId);
}

// Hàm xử lý khi checkbox thương hiệu được thay đổi
function handleBrandCheckboxChange(checkbox) {
    // Nếu checkbox được chọn, lưu giá trị vào biến
    if (checkbox.checked) {
        // Bỏ chọn các checkbox còn lại
        const otherCheckboxes = document.querySelectorAll('.filter-group#brand-group .form-check-input');
        otherCheckboxes.forEach(c => {
            if (c !== checkbox) c.checked = false;
        });

        // Lưu id của thương hiệu được chọn
        selectedBrandId = checkbox.value;
    } else {
        selectedBrandId = null; // Nếu bỏ chọn, gán giá trị null
    }
    console.log('Thương hiệu được chọn:', selectedBrandId);
}


document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('rest/danhmuc/get-children');
        const data = await response.json();

        // Kiểm tra và render danh mục
        if (data.data && Array.isArray(data.data)) {
            renderCategoryTree(data.data);
        } else {
            console.error('Dữ liệu danh mục không hợp lệ:', data);
            displayMessage('Không thể tải danh mục.');
        }
    } catch (error) {
        console.error('Lỗi khi gọi API danh mục:', error);
        displayMessage('Đã xảy ra lỗi khi tải danh mục.');
    }
});


// Hàm render danh mục dạng cây (tree view)
function renderCategoryTree(categories) {
    const treeContainer = document.getElementById('category-tree');
    treeContainer.innerHTML = ''; // Xóa nội dung cũ

    // Lọc các danh mục không có cha (idCha == null)
    const parentCategories = categories.filter(category => !category.idCha);

    // Render danh mục cha
    parentCategories.forEach(category => {
        treeContainer.appendChild(createCategoryItem(category, categories));
    });
}

// Hàm tạo phần tử HTML cho một danh mục và các danh mục con
function createCategoryItem(category, allCategories) {
    // Tạo phần tử li cho danh mục này
    const li = document.createElement('li');
    li.classList.add('category-item');

    // Tạo checkbox cho danh mục
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `category-${category.id}`;
    checkbox.addEventListener('change', function () {
        handleCheckboxChange(checkbox, category);
    });

    // Tạo tên danh mục
    const span = document.createElement('span');
    span.textContent = category.ten;

    // Nếu danh mục có con, thêm mũi tên
    if (category.children && category.children.length > 0) {
        span.classList.add('has-children');
        span.style.cursor = 'pointer'; // Thêm con trỏ chuột cho phần tử có thể nhấn

        // Tạo mũi tên
        const arrowIcon = document.createElement('i');
        arrowIcon.classList.add('bi', 'bi-chevron-down');
        arrowIcon.id = `arrow-${category.id}`;

        // Khi nhấn vào mũi tên, hiển thị các danh mục con
        span.addEventListener('click', function () {
            const childrenContainer = li.querySelector('.children');
            const isHidden = childrenContainer.classList.contains('hidden');

            // Chuyển mũi tên thành mũi tên lên hoặc xuống
            const arrow = li.querySelector('i');
            if (isHidden) {
                childrenContainer.classList.remove('hidden');
                arrow.classList.replace('bi-chevron-down', 'bi-chevron-up');
            } else {
                childrenContainer.classList.add('hidden');
                arrow.classList.replace('bi-chevron-up', 'bi-chevron-down');
            }
        });

        span.appendChild(arrowIcon);

        // Tạo danh sách các danh mục con
        const childrenUl = document.createElement('ul');
        childrenUl.classList.add('children', 'hidden'); // Ẩn các con
        category.children.forEach(childCategory => {
            childrenUl.appendChild(createCategoryItem(childCategory, allCategories));
        });

        li.appendChild(childrenUl);
    }

    // Thêm checkbox và tên danh mục vào phần tử li
    li.insertBefore(checkbox, li.firstChild);
    li.insertBefore(span, li.firstChild.nextSibling);

    return li;
}

// Biến toàn cục lưu ID của danh mục được chọn
let selectedCategoryId = null;
// Lấy idDanhMuc từ URL
function getCategoryIdFromURL() {
    const params = new URLSearchParams(window.location.search); // Lấy query string từ URL
    return params.get('idDanhMuc'); // Trả về giá trị idDanhMuc
}

// Gán idDanhMuc vào selectedCategoryId
document.addEventListener('DOMContentLoaded', function () {
    selectedCategoryId = getCategoryIdFromURL(); // Lấy idDanhMuc từ URL
    if (selectedCategoryId) {
        console.log("Selected Category ID:", selectedCategoryId);
    }
});

// Hàm xử lý khi checkbox thay đổi
function handleCheckboxChange(checkbox, category) {
    if (checkbox.checked) {
        // Nếu checkbox được chọn, lưu ID của danh mục vào biến selectedCategoryId
        if (selectedCategoryId !== category.id) {
            // Nếu có danh mục đã được chọn, bỏ chọn nó
            const previousCheckbox = document.getElementById(`category-${selectedCategoryId}`);
            if (previousCheckbox) {
                previousCheckbox.checked = false;
            }
        }
        selectedCategoryId = category.id;  // Chỉ lưu ID của danh mục được chọn
        console.log('Danh mục được chọn:', selectedCategoryId);
    } else {
        // Nếu checkbox bị bỏ chọn, xóa ID của danh mục khỏi biến selectedCategoryId
        if (selectedCategoryId === category.id) {
            selectedCategoryId = null;
        }
    }
}


// Hàm hiển thị thông báo lỗi hoặc thành công
function displayMessage(message) {
    const messageContainer = document.querySelector('#message-container');
    if (messageContainer) {
        messageContainer.textContent = message;
    }
}

