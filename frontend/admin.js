// =========================================================================
// ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
// FILE JAVASCRIPT: admin.js - Xử lý logic nghiệp vụ Quản trị (Admin)
// =========================================================================

// 1. KIỂM TRA QUYỀN TRUY CẬP (Bảo vệ bảo mật trang quản trị)
const adminToken = localStorage.getItem("token");
const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

// Phân quyền: các vai trò được vào trang quản trị gồm: admin, store_owner, manager, staff
const allowedRoles = ['admin', 'store_owner', 'manager', 'staff'];

if (!adminToken || !adminUser || !allowedRoles.includes(adminUser.role_name)) {
  showToast("Quyền truy cập bị từ chối.", "error");
  setTimeout(() => {
    if (!adminToken) {
      window.location.href = "auth.html";
    } else {
      window.location.href = "index.html";
    }
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
// 2. CHUYỂN ĐỔI QUA LẠI GIỮA CÁC TAB QUẢN TRỊ (8 TAB CHUYÊN NGHIỆP)
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
    btn.className = "admin-menu-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold text-slate-400 hover:text-white hover:bg-cyber-800 transition-all bg-transparent border-0 cursor-pointer focus:outline-none";
  });

  const activeBtn = document.getElementById(`menu-${tabId}`);
  if (activeBtn) {
    activeBtn.className = "admin-menu-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all bg-cyber-500 text-black border-0 cursor-pointer focus:outline-none";
  }

  // Cập nhật tiêu đề trang tương ứng với Tab được chọn
  const pageTitle = document.getElementById("admin-page-title");
  if (pageTitle) {
    if (tabId === 'dashboard') pageTitle.textContent = "Bảng điều khiển (Dashboard)";
    if (tabId === 'products') pageTitle.textContent = "Quản lý sản phẩm";
    if (tabId === 'categories') pageTitle.textContent = "Danh mục sản phẩm";
    if (tabId === 'orders') pageTitle.textContent = "Quản lý đơn đặt hàng";
    if (tabId === 'customers') pageTitle.textContent = "Danh sách khách hàng";
    if (tabId === 'employees') pageTitle.textContent = "Nhân viên & phân quyền";
    if (tabId === 'revenue') pageTitle.textContent = "Báo cáo doanh số & kho";
    if (tabId === 'settings') pageTitle.textContent = "Cài đặt chi nhánh";
  }

  // Gọi hàm tải dữ liệu tương ứng của Tab đó từ API Backend
  if (tabId === 'dashboard') loadAdminDashboard();
  if (tabId === 'products') loadAdminProducts();
  if (tabId === 'categories') loadAdminCategories();
  if (tabId === 'orders') loadAdminOrders();
  if (tabId === 'customers') loadAdminCustomers();
  if (tabId === 'employees') loadAdminEmployees();
  if (tabId === 'revenue') loadAdminRevenue();
  if (tabId === 'settings') loadAdminStores();
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
              <td class="px-4 py-3 font-medium text-slate-700">${order.full_name || 'Khách vãng lai'}</td>
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

    const canEdit = ['admin', 'store_owner', 'manager'].includes(adminUser.role_name);

    let html = "";
    products.forEach(prod => {
      html += `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-700 font-medium">
          <td class="px-6 py-4">
            <img src="${prod.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'}" alt="${prod.product_name}" class="w-12 h-12 object-cover rounded border border-slate-200">
          </td>
          <td class="px-6 py-4 font-bold text-slate-800 max-w-xs">
            <div class="truncate">${prod.product_name}</div>
            <div class="text-[10px] text-slate-400 font-semibold mt-0.5">Chi nhánh: ${prod.store_name || 'Mặc định'}</div>
          </td>
          <td class="px-6 py-4"><span class="px-2.5 py-1 text-xs bg-slate-100 rounded text-slate-600 font-bold">${prod.category_name || 'Không rõ'}</span></td>
          <td class="px-6 py-4 text-right font-bold text-sky-600">${formatCurrency(prod.price)}</td>
          <td class="px-6 py-4 text-center font-bold text-slate-800">${prod.stock_quantity}</td>
          <td class="px-6 py-4 text-right flex justify-end gap-2 pt-8">
            ${canEdit ? `
              <button onclick="editProduct(${prod.id})" class="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold text-xs rounded border border-sky-200 transition-all border-0 cursor-pointer">
                Sửa
              </button>
              <button onclick="deleteProduct(${prod.id})" class="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded border border-rose-200 transition-all border-0 cursor-pointer">
                Xóa
              </button>
            ` : `<span class="text-xs text-slate-400 italic">Không có quyền sửa</span>`}
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
    showToast(error.message, "error");
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

      // Hiển thị thêm ghi chú, CCCD, PTTT và Email người nhận
      let detailsMeta = `
        <div class="text-[10px] text-slate-500 mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5 font-semibold">
          <div><strong class="text-slate-700">Người nhận:</strong> ${order.recipient_name || order.full_name}</div>
          <div><strong class="text-slate-700">Điện thoại:</strong> ${order.recipient_phone || order.phone}</div>
          ${order.recipient_email ? `<div><strong class="text-slate-700">Email:</strong> ${order.recipient_email}</div>` : ''}
          <div><strong class="text-slate-700">Đ/C nhận:</strong> ${order.shipping_address}</div>
          <div><strong class="text-slate-700">PTTT:</strong> ${order.payment_method === 'cod' ? 'Thanh toán COD' : order.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'Ví điện tử'}</div>
          ${order.cccd ? `<div><strong class="text-slate-700">CCCD:</strong> ${order.cccd}</div>` : ''}
          ${order.notes ? `<div class="italic text-amber-600"><strong class="text-slate-700">Ghi chú:</strong> ${order.notes}</div>` : ''}
        </div>
      `;

      html += `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-700 font-medium">
          <td class="px-6 py-4 font-bold text-slate-800">
            <div>#DH-00${order.id}</div>
            <div class="text-[10px] text-slate-400 font-normal">${new Date(order.created_at).toLocaleString('vi-VN')}</div>
          </td>
          <td class="px-6 py-4 max-w-xs">
            <div class="text-sm font-bold text-slate-850">${order.username || 'Khách vãng lai'}</div>
            ${detailsMeta}
          </td>
          <td class="px-6 py-4 max-w-xs">${itemsDetailsHtml}</td>
          <td class="px-6 py-4 text-right font-bold text-sky-600">${formatCurrency(order.total_amount)}</td>
          <td class="px-6 py-4 text-center">
            <!-- Dropdown chọn trạng thái đơn hàng -->
            <select id="status-select-${order.id}" class="bg-white border border-slate-300 rounded text-xs px-2.5 py-1 focus:ring-sky-500 font-semibold text-slate-700 cursor-pointer">
              ${optionsHtml}
            </select>
          </td>
          <td class="px-6 py-4 text-right">
            <button onclick="updateOrderStatus(${order.id})" class="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-xs rounded border border-emerald-200 transition-all border-0 cursor-pointer">
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

// Gọi API cập nhật trạng thái đơn hàng
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
    loadAdminOrders(); // Nạp lại bảng đơn hàng

  } catch (error) {
    console.error("Lỗi cập nhật trạng thái đơn:", error);
    showToast(error.message, "error");
  }
}

// =========================================================================
// TAB 4: QUẢN LÝ DANH MỤC (CATEGORY LIST)
// =========================================================================
async function loadAdminCategories() {
  const table = document.getElementById("admin-categories-table");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="3" class="text-center py-8">Đang tải danh mục...</td></tr>`;
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`);
    if (res.ok) {
      const data = await res.json();
      table.innerHTML = data.map(cat => `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-700 font-medium">
          <td class="px-6 py-4 font-bold text-slate-800">#DM-00${cat.id}</td>
          <td class="px-6 py-4 font-bold text-slate-800">${cat.category_name}</td>
          <td class="px-6 py-4 text-slate-500">${cat.description || 'Danh mục thiết bị công nghệ Tech Store.'}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    table.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-rose-500">Lỗi: ${err.message}</td></tr>`;
  }
}

// =========================================================================
// TAB 5: QUẢN LÝ KHÁCH HÀNG (CUSTOMER DIRECTORY)
// =========================================================================
async function loadAdminCustomers() {
  const table = document.getElementById("admin-customers-table");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="4" class="text-center py-8">Đang tải danh sách khách hàng...</td></tr>`;
  try {
    const res = await fetchWithAuth("/api/admin/users");
    if (res.ok) {
      const users = await res.json();
      const customers = users.filter(u => u.role_id === 2);
      if (customers.length === 0) {
        table.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-slate-400">Không có khách hàng đăng ký nào.</td></tr>`;
        return;
      }
      table.innerHTML = customers.map(cust => `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-700 font-medium">
          <td class="px-6 py-4 font-bold text-slate-800">#KH-00${cust.id}</td>
          <td class="px-6 py-4">
            <div class="font-bold text-slate-800">${cust.username}</div>
            <div class="text-slate-450 text-[11px]">${cust.email}</div>
          </td>
          <td class="px-6 py-4 text-slate-650 font-bold">${cust.phone || 'Chưa cập nhật'}</td>
          <td class="px-6 py-4 text-slate-500">${cust.address || 'Chưa cập nhật'}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    table.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-rose-500">Lỗi: ${err.message}</td></tr>`;
  }
}

// =========================================================================
// TAB 6: QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN (EMPLOYEE ACCOUNTS CRUD)
// =========================================================================
async function loadAdminEmployees() {
  const table = document.getElementById("admin-employees-table");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="7" class="text-center py-8">Đang tải thông tin nhân viên...</td></tr>`;
  try {
    const res = await fetchWithAuth("/api/admin/users");
    if (res.ok) {
      const users = await res.json();
      const employees = users.filter(u => u.role_id !== 2); // Loại khách hàng ra
      table.innerHTML = employees.map(emp => `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-700 font-medium">
          <td class="px-6 py-4 font-bold text-slate-800">#NV-00${emp.id}</td>
          <td class="px-6 py-4 font-bold text-slate-800">${emp.full_name || 'Chưa cập nhật'}</td>
          <td class="px-6 py-4 font-bold text-slate-800">${emp.username}</td>
          <td class="px-6 py-4 text-slate-650 font-semibold">${emp.email}</td>
          <td class="px-6 py-4 font-bold text-slate-800">${emp.phone || 'N/A'}</td>
          <td class="px-6 py-4 font-bold text-slate-800">${emp.hometown || 'N/A'}</td>
          <td class="px-6 py-4">
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-750 uppercase tracking-wider">
              ${emp.role_name === 'admin' ? 'Admin hệ thống' : emp.role_name === 'store_owner' ? 'Chủ cửa hàng' : emp.role_name === 'manager' ? 'Quản lý' : 'Nhân viên'}
            </span>
          </td>
          <td class="px-6 py-4 font-bold text-slate-800">${emp.store_name || 'Tất cả'}</td>
          <td class="px-6 py-4 text-center">
            <span class="px-2 py-0.5 text-xs font-bold rounded-full ${emp.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
              ${emp.is_active ? 'Đang hoạt động' : 'Bị khóa'}
            </span>
          </td>
          <td class="px-6 py-4 text-right flex justify-end gap-2">
            <button onclick="editEmployee(${emp.id})" class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold text-xs rounded border border-sky-200 transition-all border-0 cursor-pointer">Sửa</button>
            <button onclick="deleteEmployee(${emp.id})" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded border border-rose-200 transition-all border-0 cursor-pointer">Xóa</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    table.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-rose-500">Lỗi: ${err.message}</td></tr>`;
  }
}

// Modal Nhân viên helpers
function openEmployeeModal() {
  const modal = document.getElementById("employee-modal");
  const form = document.getElementById("form-employee");
  if (!modal || !form) return;
  form.reset();
  document.getElementById("modal-employee-id").value = "";
  document.getElementById("employee-password-container").style.display = "block";
  document.getElementById("employee-password").setAttribute("required", "required");
  document.getElementById("employee-status-container").classList.add("hidden");
  document.getElementById("employee-modal-title").textContent = "Thêm tài khoản nhân viên";
  modal.classList.remove("hidden");
}

function closeEmployeeModal() {
  document.getElementById("employee-modal")?.classList.add("hidden");
}

async function editEmployee(id) {
  openEmployeeModal();
  document.getElementById("employee-modal-title").textContent = "Cập nhật nhân viên";
  document.getElementById("employee-password-container").style.display = "none";
  document.getElementById("employee-password").removeAttribute("required");
  document.getElementById("employee-status-container").classList.remove("hidden");
  try {
    const res = await fetchWithAuth("/api/admin/users");
    if (res.ok) {
      const users = await res.json();
      const emp = users.find(u => u.id === id);
      if (emp) {
        document.getElementById("modal-employee-id").value = emp.id;
        document.getElementById("employee-username").value = emp.username;
        document.getElementById("employee-email").value = emp.email;
        document.getElementById("employee-role").value = emp.role_id;
        document.getElementById("employee-store").value = emp.store_id || "";
        document.getElementById("employee-active").value = emp.is_active;
      }
    }
  } catch (err) {
    showToast("Không thể nạp dữ liệu nhân viên", "error");
  }
}

async function deleteEmployee(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa tài khoản nhân viên này?")) return;
  try {
    const res = await fetchWithAuth(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast("Đã xóa tài khoản nhân viên thành công!", "success");
    loadAdminEmployees();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// =========================================================================
// TAB 7: PHÂN TÍCH DOANH THU & KHO HÀNG (REVENUE & STOCK STATUS)
// =========================================================================
async function loadAdminRevenue() {
  const container = document.getElementById("revenue-by-category-container");
  const lowStockTable = document.getElementById("revenue-low-stock-table");
  if (!container || !lowStockTable) return;

  container.innerHTML = `<p class="text-center py-6 text-slate-400">Đang tải...</p>`;
  lowStockTable.innerHTML = `<tr><td colspan="3" class="text-center py-6">Đang tải...</td></tr>`;

  try {
    const res = await fetchWithAuth("/api/admin/dashboard");
    if (res.ok) {
      const data = await res.json();

      // Category Revenue bar chart simulation
      if (!data.revenueByCategory || data.revenueByCategory.length === 0) {
        container.innerHTML = `<p class="text-center py-6 text-slate-400">Chưa có số liệu doanh số.</p>`;
      } else {
        const maxRev = Math.max(...data.revenueByCategory.map(c => parseFloat(c.revenue || 0))) || 1;
        container.innerHTML = data.revenueByCategory.map(cat => {
          const percentage = Math.round((parseFloat(cat.revenue) / maxRev) * 100);
          return `
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-semibold text-slate-750">
                <span>${cat.category_name}</span>
                <span class="font-extrabold text-sky-650">${formatCurrency(cat.revenue)}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-gradient-to-r from-sky-500 to-emerald-400 h-2 rounded-full" style="width: ${percentage}%"></div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Low stock products warning table
      if (!data.lowStockProducts || data.lowStockProducts.length === 0) {
        lowStockTable.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-slate-400">Tất cả sản phẩm đều đủ hàng.</td></tr>`;
      } else {
        lowStockTable.innerHTML = data.lowStockProducts.map(p => `
          <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
            <td class="px-4 py-2.5 font-semibold text-slate-700">#SP-00${p.id}</td>
            <td class="px-4 py-2.5 font-bold text-slate-800">${p.product_name}</td>
            <td class="px-4 py-2.5 text-center">
              <span class="px-2.5 py-1 rounded bg-rose-50 text-rose-600 font-extrabold">${p.stock_quantity} cái</span>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    container.innerHTML = `<p class="text-center py-6 text-rose-500">Lỗi nạp doanh số: ${err.message}</p>`;
  }
}

// =========================================================================
// TAB 8: CÀI ĐẶT HỆ THỐNG / CHI NHÁNH CỬA HÀNG (STORE SETTINGS)
// =========================================================================
async function loadAdminStores() {
  const table = document.getElementById("admin-stores-table");
  if (!table) return;
  table.innerHTML = `<tr><td colspan="6" class="text-center py-8">Đang tải...</td></tr>`;
  try {
    const res = await fetchWithAuth("/api/admin/stores");
    if (res.ok) {
      const stores = await res.json();
      
      const canEditStores = adminUser.role_name === 'admin';

      table.innerHTML = stores.map(st => `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-700 font-medium">
          <td class="px-6 py-4 font-bold text-slate-800">#CN-00${st.id}</td>
          <td class="px-6 py-4 font-bold text-slate-800">${st.store_name}</td>
          <td class="px-6 py-4 text-slate-650">${st.address}</td>
          <td class="px-6 py-4 font-bold text-slate-800">${st.phone || 'Chưa cập nhật'}</td>
          <td class="px-6 py-4 text-center">
            <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${st.status === 'active' ? 'bg-emerald-100 text-emerald-800' : st.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
              ${st.status === 'active' ? 'Đang hoạt động' : st.status === 'pending' ? 'Chờ duyệt' : 'Đã khóa'}
            </span>
          </td>
          <td class="px-6 py-4 text-right flex justify-end gap-2">
            ${canEditStores ? `
              <button onclick="editStore(${st.id})" class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold text-xs rounded border border-sky-200 transition-all border-0 cursor-pointer">Sửa</button>
              <button onclick="deleteStore(${st.id})" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded border border-rose-200 transition-all border-0 cursor-pointer">Xóa</button>
            ` : `<span class="text-xs text-slate-400 italic">Không có quyền sửa</span>`}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    table.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-rose-500">Lỗi: ${err.message}</td></tr>`;
  }
}

// Modal Cửa hàng helpers
function openStoreModal() {
  const modal = document.getElementById("store-modal");
  const form = document.getElementById("form-store");
  if (!modal || !form) return;
  form.reset();
  document.getElementById("modal-store-id").value = "";
  document.getElementById("store-status-container").classList.add("hidden");
  document.getElementById("store-modal-title").textContent = "Thêm chi nhánh mới";
  modal.classList.remove("hidden");
}

function closeStoreModal() {
  document.getElementById("store-modal")?.classList.add("hidden");
}

async function editStore(id) {
  openStoreModal();
  document.getElementById("store-modal-title").textContent = "Cập nhật chi nhánh";
  document.getElementById("store-status-container").classList.remove("hidden");
  try {
    const res = await fetchWithAuth("/api/admin/stores");
    if (res.ok) {
      const stores = await res.json();
      const st = stores.find(s => s.id === id);
      if (st) {
        document.getElementById("modal-store-id").value = st.id;
        document.getElementById("store-name").value = st.store_name;
        document.getElementById("store-address").value = st.address;
        document.getElementById("store-phone").value = st.phone || "";
        document.getElementById("store-status").value = st.status;
      }
    }
  } catch (err) {
    showToast("Không thể tải chi nhánh", "error");
  }
}

async function deleteStore(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa chi nhánh cửa hàng này?")) return;
  try {
    const res = await fetchWithAuth(`/api/admin/stores/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast("Đã xóa chi nhánh thành công!", "success");
    loadAdminStores();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// =========================================================================
// 9. NẠP CHI NHÁNH VÀO CÁC DROPDOWN & XỬ LÝ LẮP RÁP
// =========================================================================
async function loadStoresIntoSelects() {
  try {
    const response = await fetchWithAuth("/api/admin/stores");
    if (response.ok) {
      const stores = await response.json();
      const modalStoreSelect = document.getElementById("modal-store");
      const employeeStoreSelect = document.getElementById("employee-store");
      
      let html = '<option value="">Chọn chi nhánh làm việc (Tất cả)</option>';
      stores.forEach(st => {
        html += `<option value="${st.id}">${st.store_name}</option>`;
      });
      if (modalStoreSelect) modalStoreSelect.innerHTML = html;
      if (employeeStoreSelect) employeeStoreSelect.innerHTML = html;
    }
  } catch (err) {
    console.error("Lỗi nạp danh sách cửa hàng:", err);
  }
}

// Lấy tên vai trò tiếng Việt
function getVietnameseRole(role) {
  switch(role) {
    case 'admin': return 'Admin hệ thống';
    case 'store_owner': return 'Chủ cửa hàng';
    case 'manager': return 'Quản lý chi nhánh';
    case 'staff': return 'Nhân viên bán hàng';
    case 'user': return 'Khách hàng';
    default: return 'Không xác định';
  }
}

// Áp dụng ẩn hiện menu dựa theo phân quyền nhân viên đăng nhập
function applyRolePermissions() {
  const role = adminUser.role_name;

  // Hiển thị thông tin sidebar
  const usernameEl = document.getElementById("sidebar-username");
  const roleEl = document.getElementById("sidebar-role");
  if (usernameEl) usernameEl.textContent = adminUser.full_name || adminUser.username || "Người dùng";
  if (roleEl) roleEl.textContent = getVietnameseRole(role);

  if (role === 'staff') {
    document.getElementById("menu-dashboard")?.classList.add("hidden");
    document.getElementById("menu-products")?.classList.add("hidden");
    document.getElementById("menu-categories")?.classList.add("hidden");
    document.getElementById("menu-employees")?.classList.add("hidden");
    document.getElementById("menu-revenue")?.classList.add("hidden");
    document.getElementById("menu-settings")?.classList.add("hidden");
    const addProdBtn = document.querySelector('[onclick="openProductModal()"]');
    if (addProdBtn) addProdBtn.classList.add("hidden");
  } else if (role === 'manager') {
    document.getElementById("menu-categories")?.classList.add("hidden");
    document.getElementById("menu-employees")?.classList.add("hidden");
    document.getElementById("menu-revenue")?.classList.add("hidden");
    document.getElementById("menu-settings")?.classList.add("hidden");
    const addStoreBtn = document.getElementById("btn-add-store");
    if (addStoreBtn) addStoreBtn.classList.add("hidden");
  } else if (role === 'store_owner') {
    document.getElementById("menu-categories")?.classList.add("hidden");
    document.getElementById("menu-customers")?.classList.add("hidden");
  }
  
  loadStoresIntoSelects();
}

// =========================================================================
// 10. KHỞI TẠO CÁC SỰ KIỆN SUBMIT VÀ LOAD DỮ LIỆU BAN ĐẦU
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  applyRolePermissions();
  loadCategoriesIntoModal(); // Tải danh mục vào form popup modal
  
  if (adminUser && adminUser.role_name === 'staff') {
    switchAdminTab("orders");
  } else {
    switchAdminTab("dashboard");
  }

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
        store_id: storeId || null,
        image_url: imageUrl || null,
        description: description || null
      };

      try {
        let url = "/api/admin/products";
        let method = "POST";

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

  // Đăng ký sự kiện submit Form Thêm / Sửa nhân viên
  const formEmployee = document.getElementById("form-employee");
  if (formEmployee) {
    formEmployee.addEventListener("submit", async (e) => {
      e.preventDefault();

      const empId = document.getElementById("modal-employee-id").value;
      const username = document.getElementById("employee-username").value.trim();
      const email = document.getElementById("employee-email").value.trim();
      const roleId = document.getElementById("employee-role").value;
      const storeId = document.getElementById("employee-store").value;

      const bodyData = {
        username,
        email,
        role_id: parseInt(roleId),
        store_id: storeId ? parseInt(storeId) : null
      };

      if (!empId) {
        bodyData.password = document.getElementById("employee-password").value;
      } else {
        bodyData.is_active = parseInt(document.getElementById("employee-active").value);
      }

      try {
        const url = empId ? `/api/admin/users/${empId}` : "/api/admin/users";
        const method = empId ? "PUT" : "POST";
        const res = await fetchWithAuth(url, {
          method: method,
          body: JSON.stringify(bodyData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Thao tác thất bại.");

        showToast(data.message || "Lưu thông tin nhân sự thành công!", "success");
        closeEmployeeModal();
        loadAdminEmployees();

      } catch (error) {
        console.error("Lỗi lưu nhân sự:", error);
        showToast(error.message, "error");
      }
    });
  }

  // Đăng ký sự kiện submit Form Thêm / Sửa cửa hàng
  const formStore = document.getElementById("form-store");
  if (formStore) {
    formStore.addEventListener("submit", async (e) => {
      e.preventDefault();

      const storeId = document.getElementById("modal-store-id").value;
      const name = document.getElementById("store-name").value.trim();
      const address = document.getElementById("store-address").value.trim();
      const phone = document.getElementById("store-phone").value.trim();

      const bodyData = {
        store_name: name,
        address,
        phone: phone || null
      };

      if (storeId) {
        bodyData.status = document.getElementById("store-status").value;
      }

      try {
        const url = storeId ? `/api/admin/stores/${storeId}` : "/api/admin/stores";
        const method = storeId ? "PUT" : "POST";
        const res = await fetchWithAuth(url, {
          method: method,
          body: JSON.stringify(bodyData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Thao tác thất bại.");

        showToast(data.message || "Lưu thông tin chi nhánh thành công!", "success");
        closeStoreModal();
        loadAdminStores();

      } catch (error) {
        console.error("Lỗi lưu chi nhánh:", error);
        showToast(error.message, "error");
      }
    });
  }
});
