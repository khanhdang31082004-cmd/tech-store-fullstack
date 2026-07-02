// =========================================================================
// ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
// FILE JAVASCRIPT: app.js - Các hàm dùng chung và logic Trang chủ index.html
// =========================================================================
// 1. CẤU HÌNH ĐƯỜNG DẪN BACKEND API CHUNG (Tự động thích ứng Local/Production)
const API_BASE_URL = 'https://tech-store-fullstack-production.up.railway.app/api';

// Đọc Token và thông tin User hiện tại từ bộ nhớ trình duyệt localStorage
let token = localStorage.getItem("token");
let currentUser = null;
try {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUser = JSON.parse(userStr);
  }
} catch (e) {
  console.error("Lỗi parse thông tin user:", e);
  localStorage.removeItem("user");
}

// =========================================================================
// 2. CÁC HÀM TIỆN ÍCH DÙNG CHUNG TRÊN TOÀN GIAO DIỆN
// =========================================================================

// Hàm định dạng số thành tiền tệ VNĐ (Ví dụ: 2000000 -> 2.000.000 đ)
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hàm hiển thị thông báo Toast nổi trên góc màn hình (success, error, warning)
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `px-5 py-3 rounded-lg shadow-xl text-white font-medium flex items-center gap-2 transition-all duration-300 transform translate-x-20 opacity-0 pointer-events-auto max-w-sm text-xs md:text-sm`;
  
  if (type === 'success') {
    toast.classList.add('bg-emerald-500');
    toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${message}`;
  } else if (type === 'error') {
    toast.classList.add('bg-rose-500');
    toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${message}`;
  } else {
    toast.classList.add('bg-amber-500');
    toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> ${message}`;
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-x-20', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-x-20', 'opacity-0');
    setTimeout(() => { toast.remove(); }, 300);
  }, 3000);
}

// Hàm Fetch tự động đính kèm Token JWT vào Header gửi lên API
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Thêm tiền tố Bearer + token JWT
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: headers
  });

  // Nếu API báo token không hợp lệ hoặc hết hạn (401) -> Đăng xuất người dùng ngay
  // Lưu ý: Không logout với lỗi 403 (Forbidden) vì đó chỉ là lỗi thiếu quyền truy cập
  if (response.status === 401) {
    const data = await response.json();
    if (token) {
      showToast(data.message || "Phiên đăng nhập hết hạn.", "error");
      setTimeout(() => logout(), 1500);
    }
  }

  return response;
}

// Cập nhật số lượng sản phẩm hiển thị trên huy hiệu (badge) của giỏ hàng
function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;

  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch (e) {
    cart = [];
  }

  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  if (totalQuantity > 0) {
    badge.textContent = totalQuantity;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// Hàm cập nhật trạng thái hiển thị của Navbar (Đã đăng nhập / Chưa đăng nhập)
function updateNavbar() {
  const authContainer = document.getElementById("nav-auth-container");
  if (!authContainer) return;

  if (token && currentUser) {
    authContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <a href="profile.html" class="flex items-center gap-1 text-white hover:text-sky-300 font-bold transition-colors">
          <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span class="max-w-[100px] truncate">Chào, ${currentUser.username}</span>
        </a>
        <button onclick="logout()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-bold transition-all text-[11px] border border-slate-700 cursor-pointer">
          Đăng xuất
        </button>
      </div>
    `;
  } else {
    // Nếu chưa đăng nhập thì hiện nút Đăng nhập / Đăng ký
    authContainer.innerHTML = `
      <a href="auth.html?mode=login" class="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-black shadow-md hover-scale transition-all flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
        Đăng nhập
      </a>
    `;
  }
  updateCartBadge(); // Đồng thời cập nhật badge số lượng giỏ hàng
}

// Hàm đăng xuất: Xóa token khỏi bộ nhớ local và quay lại trang chủ
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.location.href = "auth.html";
}

// =========================================================================
// 3. LOGIC HÀM XỬ LÝ TRANG CHỦ (INDEX.HTML)
// =========================================================================

let currentCategoryId = null; // ID danh mục hiện tại đang được lọc
let currentSearch = ""; // Từ khóa tìm kiếm hiện tại

// Hàm bật/tắt Modal chọn chi nhánh
window.toggleStoreModal = function(show) {
  const modal = document.getElementById("store-modal");
  if (!modal) return;
  if (show) {
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
  }
}

// Hàm chọn chi nhánh
window.selectStore = function(storeName) {
  const label = document.getElementById("current-store-label");
  if (label) {
    label.textContent = "Chi nhánh: " + storeName;
  }
  showToast("Đã chọn: " + storeName);
  toggleStoreModal(false);
}

// Gọi API lấy danh mục sản phẩm và nạp vào thanh lọc Sidebar
async function loadCategories() {
  const listContainer = document.getElementById("dynamic-categories-list");
  if (!listContainer) return;

  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error("Lỗi tải danh mục");
    const categories = await response.json();

    let html = "";
    categories.forEach(cat => {
      html += `
        <button onclick="filterCategory(${cat.id}, '${cat.category_name}')" 
                id="cat-btn-${cat.id}"
                class="category-btn text-left px-3.5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-between w-full border-0 focus:outline-none cursor-pointer" style="font-size: 16px;">
          <span>${cat.category_name}</span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
        </button>
      `;
    });
    listContainer.innerHTML = html;
  } catch (error) {
    console.error("Lỗi khi load danh mục:", error);
    listContainer.innerHTML = `<span class="text-xs text-rose-500">Không thể tải danh mục.</span>`;
  }
}

// Cập nhật bộ lọc danh mục và tải lại danh sách sản phẩm tương ứng
function filterCategory(catId, catName = "Tất cả sản phẩm") {
  currentCategoryId = catId;
  
  // Xóa class active của các nút cũ và thiết lập cho nút được click mới
  const allButtons = document.querySelectorAll(".category-btn, #cat-btn-all");
  allButtons.forEach(btn => {
    btn.className = "category-btn text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-between w-full border-0 focus:outline-none cursor-pointer";
  });

  const activeBtn = document.getElementById(catId ? `cat-btn-${catId}` : "cat-btn-all");
  if (activeBtn) {
    activeBtn.className = "text-left px-3.5 py-2.5 rounded-xl font-black bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all flex items-center justify-between w-full border-0 focus:outline-none cursor-pointer";
    activeBtn.style.fontSize = "16px";
  }

  document.getElementById("section-title").textContent = catName;
  loadProducts(); // Gọi API lấy sản phẩm
}

// Gọi API lấy danh sách sản phẩm dựa vào bộ lọc (search, category) và render
async function loadProducts() {
  const container = document.getElementById("products-container");
  const countLabel = document.getElementById("products-count");
  if (!container) return;

  // Hiển thị vòng quay loading
  container.innerHTML = `
    <div class="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
      <svg class="animate-spin h-8 w-8 text-sky-500 mb-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>Đang tải danh sách thiết bị công nghệ...</span>
    </div>
  `;

  try {
    let url = `${API_BASE_URL}/products?`;
    if (currentCategoryId) url += `category_id=${currentCategoryId}&`;
    if (currentSearch) url += `search=${encodeURIComponent(currentSearch)}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Lỗi tải sản phẩm");
    const products = await response.json();

    countLabel.textContent = `${products.length} thiết bị`;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3 class="text-sm font-bold text-slate-600 mb-1">Không tìm thấy sản phẩm nào phù hợp</h3>
        </div>
      `;
      return;
    }

    let html = "";
    products.forEach(prod => {
      const isOutOfStock = prod.stock_quantity <= 0;
      const buttonHtml = isOutOfStock 
        ? `<button disabled class="w-full mt-3 py-2 rounded-lg bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed border-0">Hết hàng</button>`
        : `<button onclick="addToCart(${prod.id}, '${prod.product_name.replace(/'/g, "\\'")}', ${prod.price}, '${prod.image_url}')" class="flex-grow py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-all hover-scale shadow border-0 cursor-pointer">Thêm vào giỏ</button>`;

      html += `
        <div class="product-card bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col transition-all duration-300">
          <!-- Ảnh + tag danh mục + tooltip slide-up khi hover -->
            <div onclick="showProductDetail(${prod.id})" class="relative h-44 w-full bg-slate-100 rounded-xl overflow-hidden mb-3 cursor-pointer flex-shrink-0">
              <img src="${prod.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500';" alt="${prod.product_name}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105">
              ${isOutOfStock ? `<div class="absolute inset-0 bg-slate-900/50 flex items-center justify-center"><span class="bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">Hết hàng</span></div>` : ''}
              <span class="absolute top-2 left-2 bg-slate-900/75 text-sky-400 font-bold text-[9px] px-2 py-0.5 rounded tracking-wide uppercase backdrop-blur-sm">${prod.category_name}</span>
            </div>

          <!-- Nội dung card: flex-1 đảm bảo các card bằng chiều cao nhau -->
          <div class="flex flex-col flex-1">
            <h3 onclick="showProductDetail(${prod.id})" class="font-bold text-slate-800 leading-snug line-clamp-2 cursor-pointer hover:text-sky-600 transition-colors" style="font-size: 20px; font-weight: 700; min-height:3rem">${prod.product_name}</h3>

            <div class="flex items-center gap-1 mt-1.5">
              <span class="text-amber-400" style="font-size:13px">★★★★★</span>
              <span class="text-slate-400 font-semibold" style="font-size:12px">(4.8)</span>
            </div>

            <p class="text-slate-500 line-clamp-2 mt-1.5 leading-relaxed" style="font-size:16px; min-height:3rem">${prod.description || 'Sản phẩm công nghệ chính hãng.'}</p>

            <!-- Giá + nút: luôn ở dưới cùng nhờ mt-auto -->
            <div class="mt-auto border-t border-slate-100 pt-2.5">
              <div class="flex items-end justify-between mb-2">
                <div>
                  <span class="text-slate-400 block font-medium leading-none mb-0.5" style="font-size:12px">Giá bán:</span>
                  <span class="font-black text-sky-600 leading-none" style="font-size: 22px; font-weight: 800;">${formatCurrency(prod.price)}</span>
                </div>
                <span class="text-slate-400 font-medium" style="font-size:12px">Kho: <strong class="text-slate-600">${prod.stock_quantity}</strong></span>
              </div>
              <div class="flex gap-2">
                ${buttonHtml}
                <button onclick="showProductDetail(${prod.id})" class="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs border-0 cursor-pointer flex-shrink-0 transition-colors">Chi tiết</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (error) {
    console.error("Lỗi khi load sản phẩm:", error);
    container.innerHTML = `<div class="col-span-full text-center py-12"><span class="text-rose-600 font-bold">Không thể tải sản phẩm.</span></div>`;
  }
}

// Thêm sản phẩm được chọn vào Giỏ hàng lưu trữ ở localStorage
function addToCart(productId, name, price, imageUrl) {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch (e) {
    cart = [];
  }

  // Nếu sản phẩm đã có sẵn trong giỏ -> Chỉ tăng số lượng thêm 1
  const existingItemIndex = cart.findIndex(item => item.product_id === productId);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    // Nếu chưa có -> Tạo mới bản ghi sản phẩm trong mảng giỏ hàng
    cart.push({
      product_id: productId,
      product_name: name,
      price: price,
      image_url: imageUrl,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart)); // Lưu lại mảng giỏ hàng vào trình duyệt
  showToast(`Đã thêm "${name}" vào giỏ hàng.`, "success");
  updateCartBadge(); // Cập nhật lại số hiển thị trên icon giỏ hàng của Navbar
  
  // Đồng bộ ngay với Popup Cart Drawer nếu đang mở
  if (!document.getElementById("cart-drawer").classList.contains("translate-x-full")) {
    renderCartDrawer();
  }

  // Đồng bộ giỏ hàng lên server-side nếu người dùng đã đăng nhập
  const token = localStorage.getItem("token");
  if (token) {
    fetchWithAuth("/api/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    }).catch(err => console.error("Lỗi đồng bộ giỏ hàng lên server:", err));
  }
}

// Hàm xử lý tìm kiếm sản phẩm từ thanh công cụ
window.handleSearch = function(event) {
  event.preventDefault();
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    currentSearch = searchInput.value.trim();
    loadProducts();
  }
}

// =========================================================================
// 4. LOGIC XỬ LÝ CART DRAWER & HỆ THỐNG CỬA HÀNG
// =========================================================================

// Toggle hiển thị Cart Drawer
window.toggleCartDrawer = function(state) {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-drawer-overlay");
  if (!drawer || !overlay) return;

  if (state) {
    drawer.classList.remove("translate-x-full");
    overlay.classList.remove("hidden");
    renderCartDrawer();
  } else {
    drawer.classList.add("translate-x-full");
    overlay.classList.add("hidden");
  }
};

// Render dữ liệu lên Cart Drawer
window.renderCartDrawer = function() {
  const container = document.getElementById("cart-drawer-items");
  const totalLabel = document.getElementById("cart-drawer-total");
  if (!container) return;

  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch (e) {
    cart = [];
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        <p class="text-sm font-semibold">Giỏ hàng của bạn đang trống.</p>
        <button onclick="toggleCartDrawer(false)" class="mt-4 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors border-0 cursor-pointer">Tiếp tục mua sắm</button>
      </div>
    `;
    totalLabel.textContent = "0 đ";
    return;
  }

  let html = "";
  let totalCost = 0;

  cart.forEach(item => {
    const cost = item.price * item.quantity;
    totalCost += cost;

    html += `
      <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex gap-3">
        <img src="${item.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500';" class="w-20 h-20 object-cover rounded border border-slate-100 flex-shrink-0">
        <div class="flex-grow flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <h4 class="text-sm font-bold text-slate-800 leading-snug line-clamp-2 pr-2">${item.product_name}</h4>
            <button onclick="removeFromCartDrawer(${item.product_id})" class="text-slate-300 hover:text-rose-500 transition-colors bg-transparent border-0 p-0 flex-shrink-0 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
          <div class="flex justify-between items-center mt-2">
            <div class="flex items-center border border-slate-200 rounded">
              <button onclick="updateCartItemQuantity(${item.product_id}, -1)" class="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border-0 cursor-pointer">-</button>
              <span class="w-8 text-center text-xs font-bold">${item.quantity}</span>
              <button onclick="updateCartItemQuantity(${item.product_id}, 1)" class="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border-0 cursor-pointer">+</button>
            </div>
            <span class="font-extrabold text-sky-600 text-sm">${formatCurrency(cost)}</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  totalLabel.textContent = formatCurrency(totalCost);
};

// Cập nhật số lượng sản phẩm trong drawer
window.updateCartItemQuantity = function(productId, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const index = cart.findIndex(item => item.product_id === productId);
  if (index > -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
      showToast("Đã xóa sản phẩm khỏi giỏ.", "info");
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    renderCartDrawer();
  }
};

// Xóa sản phẩm khỏi giỏ trực tiếp từ Cart Drawer
window.removeFromCartDrawer = function(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(item => item.product_id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("Đã xóa sản phẩm khỏi giỏ.", "info");
  updateCartBadge();
  renderCartDrawer();
};

window.clearCart = function() {
  localStorage.removeItem("cart");
  showToast("Đã xóa toàn bộ giỏ hàng.", "info");
  updateCartBadge();
  renderCartDrawer();
};

// Mở/Đóng Popup Hệ thống cửa hàng
async function toggleStoreModal(state) {
  const modal = document.getElementById("store-modal");
  if (!modal) return;
  if (state) {
    modal.classList.remove("hidden");
    const container = modal.querySelector(".space-y-4");
    if (container) {
      container.innerHTML = `<div class="text-center py-4 text-slate-400">Đang tải thông tin...</div>`;
      try {
        const response = await fetch(`${API_BASE_URL}/api/stores`);
        const stores = await response.json();
        if (stores.length > 0) {
          container.innerHTML = stores.map(store => `
            <div class="p-3.5 bg-slate-50 border border-slate-250 rounded-xl hover:border-cyan-300 hover:bg-slate-100/50 transition-all">
              <h4 class="font-bold text-slate-850 text-sm">${store.store_name}</h4>
              <p class="text-xs text-slate-500 mt-1">Địa chỉ: ${store.address}</p>
              <p class="text-xs text-slate-500">Số điện thoại: ${store.phone || 'Đang cập nhật'}</p>
              <span class="inline-block mt-2 px-2.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-850 rounded font-bold uppercase tracking-wider">Đang hoạt động (8:00 - 22:00)</span>
            </div>
          `).join('');
        } else {
          container.innerHTML = `<div class="text-center py-4 text-slate-400 text-sm">Chưa có chi nhánh nào.</div>`;
        }
      } catch (err) {
        container.innerHTML = `<div class="text-center py-4 text-rose-500 text-sm">Lỗi tải danh sách chi nhánh.</div>`;
      }
    }
  } else {
    modal.classList.add("hidden");
  }
}

// =========================================================================
// 5. BANNER SLIDER - TỰ ĐỘNG CHUYỂN SLIDE VÀ PHÍM TIẾN LÙI
// =========================================================================
let activeSlideIndex = 0;
let slideInterval = null;

function showBannerSlide(index) {
  const slides = document.querySelectorAll(".banner-slide");
  if (slides.length === 0) return;

  // Xoay vòng index nếu vượt quá
  if (index >= slides.length) activeSlideIndex = 0;
  else if (index < 0) activeSlideIndex = slides.length - 1;
  else activeSlideIndex = index;

  slides.forEach((slide, idx) => {
    if (idx === activeSlideIndex) {
      slide.classList.remove("opacity-0", "pointer-events-none");
      slide.classList.add("opacity-100");
    } else {
      slide.classList.remove("opacity-100");
      slide.classList.add("opacity-0", "pointer-events-none");
    }
  });
}

function prevBannerSlide() {
  showBannerSlide(activeSlideIndex - 1);
  resetBannerInterval(); // Reset lại thời gian trượt khi người dùng click thủ công
}

function nextBannerSlide() {
  showBannerSlide(activeSlideIndex + 1);
  resetBannerInterval();
}

function initBannerSlider() {
  showBannerSlide(0);
  resetBannerInterval();
}

function resetBannerInterval() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    showBannerSlide(activeSlideIndex + 1);
  }, 5000); // 5 giây tự động chuyển 1 lần
}

// =========================================================================
// 6. PHÂN CHIA TAB PANEL KHÔNG CUỘN TRANG
// =========================================================================
window.showPanel = function(panelName) {
  const panels = ["store", "promotion", "contact"];
  
  // Ẩn tất cả các panel và hiện đúng panel được chọn
  panels.forEach(name => {
    const el = document.getElementById(`panel-${name}`);
    if (el) {
      if (name === panelName) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });

  // Cập nhật trạng thái active nổi bật cho menu điều hướng
  const navLinks = document.querySelectorAll("[data-nav]");
  navLinks.forEach(link => {
    const isSubNavbar = link.closest('.bg-slate-800'); // Check xem nút có nằm trên Sub-navbar không
    if (link.getAttribute("data-nav") === panelName) {
      if (isSubNavbar) {
        link.className = "text-sky-400 font-extrabold transition-all hover:text-sky-305 bg-transparent border-0 cursor-pointer focus:outline-none";
      } else {
        link.className = "text-sky-400 font-extrabold transition-all hover:text-sky-300 bg-transparent border-0 cursor-pointer focus:outline-none";
      }
    } else {
      if (isSubNavbar) {
        link.className = "text-slate-300 hover:text-white transition-colors bg-transparent border-0 cursor-pointer focus:outline-none font-bold";
      } else {
        link.className = "hover:text-white transition-colors bg-transparent border-0 cursor-pointer focus:outline-none";
      }
    }
  });
};

// =========================================================================
// 7. LIÊN HỆ & MODAL CHI TIẾT SẢN PHẨM TRÊN TRANG CHỦ
// =========================================================================

// Hàm gửi yêu cầu tư vấn liên hệ thực tế (Validate không được để trống và hiển thị thông báo)
function handleContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("contact-name").value.trim();
  const phone = document.getElementById("contact-phone").value.trim();
  const interest = document.getElementById("contact-interest").value;
  const message = document.getElementById("contact-message").value.trim();

  if (!name || !phone || !interest || !message) {
    showToast("Vui lòng điền đầy đủ tất cả các trường thông tin.", "error");
    return;
  }

  showToast("Yêu cầu tư vấn đã được ghi nhận. Nhân viên sẽ liên hệ lại sau.", "success");
  event.target.reset();
}

// Hàm toàn cục sao chép mã ưu đãi voucher vào clipboard
window.copyToClipboard = function(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Đã sao chép mã ưu đãi "${code}" thành công!`, "success");
  }).catch(err => {
    console.error("Lỗi copy:", err);
    showToast("Không thể sao chép tự động. Vui lòng chọn và sao chép thủ công.", "warning");
  });
};

// Hàm hiển thị Popup Modal Chi Tiết Sản Phẩm
async function showProductDetail(productId) {
  const modal = document.getElementById("product-detail-modal");
  const content = document.getElementById("product-detail-content");
  if (!modal || !content) return;

  // Hiển thị modal và trạng thái loading bên trong
  modal.classList.remove("hidden");
  content.innerHTML = `
    <div class="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
      <svg class="animate-spin h-8 w-8 text-sky-500 mb-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>Đang tải thông số kỹ thuật...</span>
    </div>
  `;

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    if (!response.ok) throw new Error("Không thể tải thông tin sản phẩm.");
    const prod = await response.json();

    const isOutOfStock = prod.stock_quantity <= 0;
    const buttonHtml = isOutOfStock
      ? `<button disabled class="w-full py-3 rounded-lg bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed border-0">Đã hết hàng tồn kho</button>`
      : `<button onclick="addToCart(${prod.id}, '${prod.product_name.replace(/'/g, "\\'")}', ${prod.price}, '${prod.image_url}'); closeProductDetailModal();" class="w-full py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow transition-all border-0 cursor-pointer">Thêm vào giỏ hàng</button>`;

    // Tải sản phẩm liên quan (cùng danh mục)
    let relatedHtml = "";
    try {
      const relResponse = await fetch(`${API_BASE_URL}/api/products?category_id=${prod.category_id}`);
      if (relResponse.ok) {
        const allInCat = await relResponse.json();
        const relatedList = allInCat.filter(item => item.id !== prod.id).slice(0, 3);
        
        if (relatedList.length > 0) {
          relatedHtml = `
            <div class="mt-6 border-t border-slate-100 pt-5 col-span-full">
              <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider mb-3">Sản phẩm liên quan</h4>
              <div class="grid grid-cols-3 gap-3">
                ${relatedList.map(rp => `
                  <div onclick="showProductDetail(${rp.id})" class="bg-slate-50 p-2 rounded-xl border border-slate-100 cursor-pointer hover:border-sky-500 transition-colors flex flex-col justify-between h-36">
                    <img src="${rp.image_url}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500';" class="h-16 w-full object-cover rounded-lg mb-1.5">
                    <h5 class="font-extrabold text-slate-750 text-[10px] line-clamp-1 leading-snug">${rp.product_name}</h5>
                    <span class="text-[10px] font-black text-sky-600 mt-1">${formatCurrency(rp.price)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm liên quan:", err);
    }

    content.innerHTML = `
      <div class="flex flex-col md:flex-row gap-8 w-full p-2">
        <div class="w-full md:w-1/2 flex items-center justify-center bg-white rounded-xl overflow-hidden">
          <img src="${prod.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500';" alt="${prod.product_name}" class="w-full object-contain rounded-lg" style="max-height: 420px;">
        </div>
        <div class="w-full md:w-1/2 flex flex-col justify-start">
          <span class="inline-block self-start bg-slate-100 text-sky-600 font-bold text-[11px] px-3 py-1.5 rounded-lg mb-3 uppercase tracking-wider">${prod.category_name}</span>
          <h3 class="font-black text-slate-800 text-2xl leading-tight mb-4">${prod.product_name}</h3>
          
          <div class="flex items-center gap-2 mb-6">
            <span class="text-amber-400 text-lg">★★★★★</span>
            <span class="text-slate-500 font-medium text-sm">(Đánh giá 4.8/5.0)</span>
            <span class="mx-2 text-slate-300">|</span>
            <span class="text-slate-500 text-sm">Đã bán 120+</span>
          </div>
          
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed mb-6">
            <h4 class="font-bold text-slate-800 mb-2">Đặc điểm nổi bật:</h4>
            <ul class="list-disc list-inside space-y-1.5 marker:text-sky-500">
              <li>Sản phẩm phân phối chính hãng.</li>
              <li>Bảo hành toàn quốc đổi mới trong 30 ngày.</li>
              <li>${prod.description || 'Hiệu năng tuyệt vời, đáp ứng hoàn hảo mọi nhu cầu sử dụng công nghệ của bạn.'}</li>
            </ul>
          </div>

          <div class="flex flex-col gap-2 mb-8 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Chi nhánh phân phối:</span>
              <span class="font-bold text-slate-800">${prod.store_name || 'Tech Store Việt Nam'}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Trạng thái tồn kho:</span>
              <span class="font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}">${isOutOfStock ? 'Hết hàng' : `Còn hàng (${prod.stock_quantity})`}</span>
            </div>
          </div>

          <div class="mt-auto border-t border-slate-100 pt-5">
            <div class="flex items-end justify-between mb-5">
              <span class="text-sm text-slate-500 font-medium pb-1">Giá bán lẻ:</span>
              <span class="text-3xl font-black text-rose-600 leading-none">${formatCurrency(prod.price)}</span>
            </div>
            ${buttonHtml}
          </div>
        </div>
      </div>
      ${relatedHtml}
    `;
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);
    content.innerHTML = `
      <div class="col-span-full py-12 text-center text-rose-500 font-bold">
        ${error.message}
      </div>
    `;
  }
}

// Hàm đóng Popup Modal Chi Tiết Sản Phẩm
window.closeProductDetailModal = function() {
  const modal = document.getElementById("product-detail-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Khởi chạy khi tệp HTML load xong
document.addEventListener("DOMContentLoaded", () => {
  // Chỉ chạy các hàm này nếu trình duyệt đang ở trang chủ index.html
  if (document.getElementById("products-container")) {
    loadCategories();
    loadProducts();
    // Khởi tạo slider banner
    if (typeof initBannerSlider === 'function') {
      initBannerSlider();
    }
  }
  updateNavbar();

  // Đóng các modal khi nhấn ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Đóng product modal
      closeProductDetailModal();
      
      // Đóng store modal
      if (typeof toggleStoreModal === 'function') toggleStoreModal(false);
      
      // Đóng cart drawer
      if (typeof toggleCartDrawer === 'function') toggleCartDrawer(false);
    }
  });
});
