// =========================================================================
// ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
// FILE JAVASCRIPT: admin.js - Xử lý logic nghiệp vụ Quản trị (Admin)
// =========================================================================

// 1. KIỂM TRA QUYỀN TRUY CẬP (Bảo vệ bảo mật trang quản trị)
const adminToken = localStorage.getItem("token");
const adminUser = JSON.parse(localStorage.getItem("user"));

// Nếu không có token hoặc tài khoản đăng nhập không có vai trò 'admin' -> Trả về đăng nhập
if (!adminToken || !adminUser || adminUser.role_name !== 'admin') {
  showToast("Quyền truy cập bị từ chối. Chỉ dành cho Admin.", "error");
  setTimeout(() => {
    window.location.href = "auth.html?mode=login";
  }, 1000);
}

// Cập nhật đồng hồ thời gian trên header quản trị
function updateClock() {
  const clockEl = document.getElementById("admin-time");
  if (!clockEl) return;
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString('vi-VN');
}
setInterval(updateClock, 1000);

// =========================================================================
// 2. CHUYỂN ĐỔI QUA LẠI GIỮA CÁC TAB QUẢN TRỊ (DASHBOARD, SẢN PHẨM, ĐƠN HÀNG)
// =========================================================================
function switchAdminTab(tabId) {
  // Ẩn toàn bộ nội dung các tab đang hiện
  const contents = document.querySelectorAll(".admin-tab-content");
  contents.forEach(content => content.classList.add("hidden"));

  // Hiện nội dung tab được nhấp chọn
  const activeContent = document.getElementById(`tab-content-${tabId}`);
  if (activeContent) activeContent.classList.remove("hidden");

  // Thiết lập class active màu sắc cho nút trên Sidebar
  const menuButtons = document.querySelectorAll(".admin-menu-btn");
  menuButtons.forEach(btn => {
    btn.className = "admin-menu-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all";
  });

  const activeBtn = document.getElementById(`menu-${tabId}`);
  if (activeBtn) {
    activeBtn.className = "admin-menu-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all bg-sky-600 text-white shadow-md";
  }

  // Cập nhật tiêu đề trang tương ứng với Tab được chọn
  const pageTitle = document.getElementById("admin-page-title");
  if (pageTitle) {
    if (tabId === 'dashboard') pageTitle.textContent = "Bảng điều khiển (Dashboard)";
    if (tabId === 'products') pageTitle.textContent = "Quản lý sản phẩm";
    if (tabId === 'orders') pageTitle.textContent = "Quản lý đơn hàng";
  }

  // Gọi hàm tải dữ liệu tương ứng của Tab đó từ API Backend
  if (tabId === 'dashboard') loadAdminDashboard();
  if (tabId === 'products') loadAdminProducts();
  if (tabId === 'orders') loadAdminOrders();
}

// =========================================================================
// TAB 1: LOGIC BẢNG ĐIỀU KHIỂN THỐNG KÊ (DASHBOARD)
// =========================================================================
async function loadAdminDashboard() {
  try {
    const response = await fetchWithAuth("/api/admin/dashboard");
    if (!response.ok) throw new Error("Không thể tải thông tin Dashboard.");
    const data = await response.json();

    // 1. Nạp số liệu thống kê lên 4 thẻ chức năng (Doanh thu, Đơn hàng, Sản phẩm, Khách hàng)
    document.getElementById("stat-revenue").textContent = formatCurrency(data.revenue);
    document.getElementById("stat-orders").textContent = data.orders;
    document.getElementById("stat-products").textContent = data.products;
    document.getElementById("stat-customers").textContent = data.customers;

    // 2. Kết xuất danh sách Top 5 sản phẩm bán chạy nhất vào bảng
    const topProductsContainer = document.getElementById("dashboard-top-products");
    if (topProductsContainer) {
      if (data.topSellingProducts.length === 0) {
        topProductsContainer.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-slate-400">Chưa có dữ liệu.</td></tr>`;
      } else {
        let html = "";
        data.topSellingProducts.forEach((prod, index) => {
          html += `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="px-4 py-3 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">${index + 1}</span>
                <span class="font-semibold text-slate-800 line-clamp-1">${prod.product_name}</span>
              </td>
              <td class="px-4 py-3 text-center font-bold text-slate-700">${prod.sold_quantity}</td>
              <td class="px-4 py-3 text-right font-extrabold text-sky-600">${formatCurrency(prod.total_sales)}</td>
            </tr>
          `;
        });
        topProductsContainer.innerHTML = html;
      }
    }

    // 3. Kết xuất danh sách 5 đơn đặt hàng mới nhất
    const recentOrdersContainer = document.getElementById("dashboard-recent-orders");
    if (recentOrdersContainer) {
      if (data.recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-slate-400">Chưa có đơn hàng nào.</td></tr>`;
      } else {
        let html = "";
        data.recentOrders.forEach(order => {
          let statusText = "Chờ duyệt";
          let statusClass = "bg-amber-100 text-amber-800";

          if (order.status === 'Processing') { statusText = "Đang xử lý"; statusClass = "bg-blue-100 text-blue-800"; }
          else if (order.status === 'Shipped') { statusText = "Đang giao"; statusClass = "bg-purple-100 text-purple-800"; }
          else if (order.status === 'Completed') { statusText = "Đã giao"; statusClass = "bg-emerald-100 text-emerald-800"; }
          else if (order.status === 'Cancelled') { statusText = "Đã hủy"; statusClass = "bg-rose-100 text-rose-800"; }

          html += `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="px-4 py-3 font-bold text-slate-800">#DH-00${order.id}</td>
              <td class="px-4 py-3 font-medium text-slate-700">${order.full_name}</td>
              <td class="px-4 py-3 text-center font-bold text-sky-600">${formatCurrency(order.total_amount)}</td>
              <td class="px-4 py-3 text-right">
                <span class="px-2 py-0.5 text-xs font-bold rounded-full ${statusClass}">${statusText}</span>
              </td>
            </tr>
          `;
        });
        recentOrdersContainer.innerHTML = html;
      }
    }

  } catch (error) {
    console.error("Lỗi nạp dashboard:", error);
    showToast("Không thể tải dữ liệu thống kê Dashboard.", "error");
  }
}

// =========================================================================
// TAB 2: QUẢN LÝ SẢN PHẨM (CRUD - THÊM, SỬA, XÓA)
// =========================================================================

// Gọi API lấy danh sách toàn bộ sản phẩm và render vào bảng quản lý
async function loadAdminProducts() {
  const tableBody = document.getElementById("admin-products-table");
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8">Đang tải danh sách thiết bị...</td></tr>`;

  try {
    const response = await fetchWithAuth("/api/admin/products");
    if (!response.ok) throw new Error("Không thể tải danh sách sản phẩm.");
    const products = await response.json();

    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">Hệ thống trống. Hãy bấm "Thêm sản phẩm mới".</td></tr>`;
      return;
    }

    let html = "";
    products.forEach(prod => {
      html += `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-700 font-medium">
          <td class="px-6 py-4">
            <img src="${prod.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'}" alt="${prod.product_name}" class="w-12 h-12 object-cover rounded border border-slate-200">
          </td>
          <td class="px-6 py-4 font-bold text-slate-800 max-w-xs truncate">${prod.product_name}</td>
          <td class="px-6 py-4"><span class="px-2.5 py-1 text-xs bg-slate-100 rounded text-slate-600 font-bold">${prod.category_name || 'Không rõ'}</span></td>
          <td class="px-6 py-4 text-right font-bold text-sky-600">${formatCurrency(prod.price)}</td>
          <td class="px-6 py-4 text-center font-bold text-slate-800">${prod.stock_quantity}</td>
          <td class="px-6 py-4 text-right flex justify-end gap-2 pt-8">
            <button onclick="editProduct(${prod.id})" class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold text-xs rounded border border-sky-200 transition-all">
              Sửa
            </button>
            <button onclick="deleteProduct(${prod.id})" class="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded border border-rose-200 transition-all">
              Xóa
            </button>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;

  } catch (error) {
    console.error("Lỗi lấy sản phẩm admin:", error);
    showToast(error.message, "error");
  }
}

// Gọi API lấy danh mục nạp vào ô select trong Modal thêm/sửa sản phẩm
async function loadCategoriesIntoModal() {
  const select = document.getElementById("modal-category");
  if (!select) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (response.ok) {
      const categories = await response.json();
      let html = "";
      categories.forEach(cat => {
        html += `<option value="${cat.id}">${cat.category_name}</option>`;
      });
      select.innerHTML = html;
    }
  } catch (error) {
    console.error("Lỗi tải danh mục vào modal:", error);
  }
}

// Mở Modal Popup điền thông tin sản phẩm
function openProductModal() {
  const modal = document.getElementById("product-modal");
  const form = document.getElementById("form-product");
  const title = document.getElementById("modal-title");

  if (!modal || !form) return;

  form.reset(); // Làm trống form nhập liệu
  document.getElementById("modal-product-id").value = ""; // Đặt rỗng ID sản phẩm
  title.textContent = "Thêm sản phẩm mới";
  
  modal.classList.remove("hidden");
}

// Đóng Modal Popup
function closeProductModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.classList.add("hidden");
}

// Sửa sản phẩm: Lấy dữ liệu cũ từ API điền vào Modal
async function editProduct(id) {
  openProductModal();
  const title = document.getElementById("modal-title");
  title.textContent = "Cập nhật sản phẩm";

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!response.ok) throw new Error("Không thể tải sản phẩm.");
    
    const prod = await response.json();

    // Điền dữ liệu cũ vào các ô input
    document.getElementById("modal-product-id").value = prod.id;
    document.getElementById("modal-name").value = prod.product_name;
    document.getElementById("modal-price").value = parseInt(prod.price);
    document.getElementById("modal-stock").value = prod.stock_quantity;
    document.getElementById("modal-category").value = prod.category_id || "";
    document.getElementById("modal-store").value = prod.store_id || 1;
    document.getElementById("modal-image").value = prod.image_url || "";
    document.getElementById("modal-description").value = prod.description || "";

  } catch (error) {
    console.error("Lỗi load sp sửa:", error);
    showToast(error.message, "error");
    closeProductModal();
  }
}

// Gọi API xóa sản phẩm khỏi cơ sở dữ liệu
async function deleteProduct(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?")) return;

  try {
    const response = await fetchWithAuth(`/api/admin/products/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Xóa sản phẩm thất bại.");

    showToast("Đã xóa sản phẩm thành công!", "success");
    loadAdminProducts(); // Tải lại danh sách sản phẩm

  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    showToast(error.message, "error"); // Báo lỗi nếu sản phẩm đang nằm trong đơn hàng mua
  }
}

// =========================================================================
// TAB 3: QUẢN LÝ ĐƠN HÀNG (CẬP NHẬT TRẠNG THÁI GIAO HÀNG/HỦY ĐƠN)
// =========================================================================

// Gọi API lấy toàn bộ danh sách đơn đặt hàng của hệ thống hiển thị ra bảng
async function loadAdminOrders() {
  const tableBody = document.getElementById("admin-orders-table");
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8">Đang tải danh sách đơn hàng...</td></tr>`;

  try {
    const response = await fetchWithAuth("/api/admin/orders");
    if (!response.ok) throw new Error("Không thể tải danh sách đơn hàng.");
    const orders = await response.json();

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">Hệ thống chưa có đơn hàng nào.</td></tr>`;
      return;
    }

    let html = "";
    orders.forEach(order => {
      // Danh sách sản phẩm con được mua trong đơn đặt hàng này
      let itemsDetailsHtml = "<ul class='space-y-1 text-xs'>";
      order.items.forEach(item => {
        itemsDetailsHtml += `<li class='text-slate-600'>• ${item.product_name} (<strong class='text-slate-800'>x${item.quantity}</strong>)</li>`;
      });
      itemsDetailsHtml += "</ul>";

      // Menu lựa chọn các trạng thái đơn hàng
      const statuses = [
        { val: 'Pending', txt: 'Chờ duyệt' },
        { val: 'Processing', txt: 'Đang xử lý' },
        { val: 'Shipped', txt: 'Đang giao' },
        { val: 'Completed', txt: 'Đã giao' },
        { val: 'Cancelled', txt: 'Hủy đơn' }
      ];

      let optionsHtml = "";
      statuses.forEach(status => {
        const isSelected = order.status === status.val ? "selected" : "";
        optionsHtml += `<option value="${status.val}" ${isSelected}>${status.txt}</option>`;
      });

      html += `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-700 font-medium">
          <td class="px-6 py-4 font-bold text-slate-800">#DH-00${order.id}</td>
          <td class="px-6 py-4">
            <div class="text-sm font-bold text-slate-800">${order.full_name}</div>
            <div class="text-xs text-slate-400">${order.phone || 'SĐT không rõ'}</div>
          </td>
          <td class="px-6 py-4 max-w-xs">${itemsDetailsHtml}</td>
          <td class="px-6 py-4 text-right font-bold text-sky-600">${formatCurrency(order.total_amount)}</td>
          <td class="px-6 py-4 text-center">
            <!-- Dropdown chọn trạng thái đơn hàng -->
            <select id="status-select-${order.id}" class="bg-white border border-slate-300 rounded text-xs px-2.5 py-1 focus:ring-sky-500 font-semibold text-slate-700">
              ${optionsHtml}
            </select>
          </td>
          <td class="px-6 py-4 text-right">
            <button onclick="updateOrderStatus(${order.id})" class="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-xs rounded border border-emerald-200 transition-all">
              Cập nhật
            </button>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;

  } catch (error) {
    console.error("Lỗi tải đơn hàng admin:", error);
    showToast(error.message, "error");
  }
}

// Gọi API cập nhật trạng thái đơn hàng (Tự động hoàn lại hàng vào kho nếu trạng thái chuyển sang Hủy đơn)
async function updateOrderStatus(orderId) {
  const select = document.getElementById(`status-select-${orderId}`);
  if (!select) return;

  const newStatus = select.value;

  try {
    const response = await fetchWithAuth(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Cập nhật thất bại.");

    showToast(data.message || "Đã cập nhật trạng thái đơn hàng!", "success");
    loadAdminOrders(); // Nạp lại bảng đơn hàng để đồng bộ lại thông tin kho hàng nếu có sự thay đổi hủy/khôi phục

  } catch (error) {
    console.error("Lỗi cập nhật trạng thái đơn:", error);
    showToast(error.message, "error");
  }
}

// =========================================================================
// 6. KHỞI TẠO CÁC SỰ KIỆN SUBMIT VÀ LOAD DỮ LIỆU BAN ĐẦU
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadCategoriesIntoModal(); // Tải danh mục vào form popup modal
  switchAdminTab("dashboard"); // Mặc định mở Tab Dashboard thống kê đầu tiên

  // Đăng ký sự kiện submit Form Thêm / Sửa sản phẩm
  const formProduct = document.getElementById("form-product");
  if (formProduct) {
    formProduct.addEventListener("submit", async (e) => {
      e.preventDefault();

      const productId = document.getElementById("modal-product-id").value;
      const name = document.getElementById("modal-name").value.trim();
      const price = parseFloat(document.getElementById("modal-price").value);
      const stock = parseInt(document.getElementById("modal-stock").value);
      const categoryId = document.getElementById("modal-category").value;
      const storeId = document.getElementById("modal-store").value;
      const imageUrl = document.getElementById("modal-image").value.trim();
      const description = document.getElementById("modal-description").value.trim();

      if (!name || isNaN(price) || isNaN(stock)) {
        showToast("Vui lòng nhập đầy đủ các trường bắt buộc.", "error");
        return;
      }

      const bodyData = {
        product_name: name,
        price: price,
        stock_quantity: stock,
        category_id: categoryId || null,
        store_id: storeId || 1,
        image_url: imageUrl || null,
        description: description || null
      };

      try {
        let url = "/api/admin/products";
        let method = "POST";

        // Nếu trường modal-product-id có giá trị -> Chuyển sang gọi API UPDATE (PUT)
        if (productId) {
          url = `/api/admin/products/${productId}`;
          method = "PUT";
        }

        const response = await fetchWithAuth(url, {
          method: method,
          body: JSON.stringify(bodyData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Không thể thực hiện.");

        showToast(data.message || "Lưu thông tin sản phẩm thành công!", "success");
        closeProductModal(); // Đóng popup modal
        loadAdminProducts(); // Tải lại danh sách sản phẩm

      } catch (error) {
        console.error("Lỗi lưu sản phẩm:", error);
        showToast(error.message, "error");
      }
    });
  }
});
