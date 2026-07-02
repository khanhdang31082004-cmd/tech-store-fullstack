// =========================================================================
// ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
// FILE JAVASCRIPT: profile.js - Quản lý Hồ sơ cá nhân và Lịch sử đơn hàng
// =========================================================================

// 1. BẢO VỆ ROUTE: Nếu chưa đăng nhập (không có token) -> Chuyển về trang đăng nhập
if (!localStorage.getItem("token")) {
  showToast("Vui lòng đăng nhập để truy cập trang cá nhân.", "warning");
  setTimeout(() => {
    window.location.href = "auth.html?mode=login";
  }, 1000);
}

// 2. GỌI API LẤY THÔNG TIN CÁ NHÂN (GET PROFILE)
async function loadProfile() {
  const skeleton = document.getElementById("profile-skeleton");
  const form = document.getElementById("form-profile");

  if (!form) return;

  try {
    const response = await fetchWithAuth("/profile"); // Hàm fetch tự đính kèm JWT Token
    if (!response.ok) throw new Error("Không thể tải thông tin cá nhân.");

    const data = await response.json();

    // Điền dữ liệu tải từ cơ sở dữ liệu vào các ô Input của Form
    document.getElementById("profile-username").value = data.username;
    document.getElementById("profile-fullname").value = data.full_name || "";
    document.getElementById("profile-email").value = data.email || "";
    document.getElementById("profile-phone").value = data.phone || "";
    document.getElementById("profile-address").value = data.address || "";

    // Đồng bộ lại Email mới nhất vào localStorage của trình duyệt
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    storedUser.email = data.email;
    localStorage.setItem("user", JSON.stringify(storedUser));

    // Ẩn bộ khung xương loading và hiện form thực tế lên
    if (skeleton) skeleton.classList.add("hidden");
    form.classList.remove("hidden");

  } catch (error) {
    console.error("Lỗi khi load profile:", error);
    showToast(error.message, "error");
  }
}

// 3. GỌI API LẤY LỊCH SỬ ĐƠN HÀNG (GET ORDERS)
async function loadOrders() {
  const container = document.getElementById("orders-list-container");
  if (!container) return;

  try {
    const response = await fetchWithAuth("/orders");
    if (!response.ok) throw new Error("Không thể tải lịch sử đơn hàng.");

    const orders = await response.json();

    // Nếu khách hàng chưa mua đơn hàng nào
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8">
          <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <p class="text-slate-500 font-medium">Bạn chưa đặt đơn hàng nào trên hệ thống.</p>
          <a href="index.html" class="inline-block mt-3 text-sm font-bold text-sky-500 hover:underline">Khám phá cửa hàng ngay &rarr;</a>
        </div>
      `;
      return;
    }

    let html = "";
    // Duyệt danh sách các đơn hàng đã đặt
    orders.forEach(order => {
      // Phân loại trạng thái đơn hàng để gán màu sắc giao diện tương ứng
      let statusText = "Chờ xử lý";
      let statusClass = "bg-amber-100 text-amber-800 border-amber-200";

      if (order.status === 'Processing') {
        statusText = "Đang chuẩn bị hàng";
        statusClass = "bg-blue-100 text-blue-800 border-blue-200";
      } else if (order.status === 'Shipped') {
        statusText = "Đang giao hàng";
        statusClass = "bg-purple-100 text-purple-800 border-purple-200";
      } else if (order.status === 'Completed') {
        statusText = "Đã giao thành công";
        statusClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
      } else if (order.status === 'Cancelled') {
        statusText = "Đã hủy đơn";
        statusClass = "bg-rose-100 text-rose-800 border-rose-200";
      }

      const orderDate = new Date(order.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      // Tạo chuỗi HTML hiển thị các sản phẩm được mua trong đơn này
      let itemsHtml = "";
      order.items.forEach(item => {
        itemsHtml += `
          <div class="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
            <div class="flex items-center gap-3">
              <img src="${item.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'}" alt="${item.product_name}" class="w-12 h-12 object-cover rounded-lg border border-slate-200">
              <div>
                <h4 class="text-sm font-bold text-slate-800 line-clamp-1">${item.product_name}</h4>
                <span class="text-xs text-slate-400">Số lượng: <strong>${item.quantity}</strong></span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-sm font-bold text-slate-700">${formatCurrency(item.price)}</span>
            </div>
          </div>
        `;
      });

      html += `
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
          <!-- Phần đầu thông tin đơn hàng -->
          <div class="bg-slate-50 px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="text-xs text-slate-400 font-medium block">Mã đơn hàng:</span>
              <span class="text-sm font-extrabold text-slate-800">#DH-00${order.id}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 font-medium block flex">Ngày đặt:</span>
              <span class="text-sm font-semibold text-slate-700">${orderDate}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 font-medium block mb-1">Trạng thái:</span>
              <span class="px-3 py-1 text-xs font-bold rounded-full border ${statusClass}">${statusText}</span>
            </div>
          </div>

          <!-- Danh sách các sản phẩm của đơn hàng -->
          <div class="px-5 divide-y divide-slate-100">
            ${itemsHtml}
          </div>
          <!-- Thông tin tóm tắt thanh toán và giao hàng -->
          <div class="bg-slate-50/50 px-5 py-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div class="text-[11px] text-slate-500 space-y-0.5 font-semibold">
              <div><strong class="text-slate-700">Người nhận:</strong> ${order.recipient_name || 'Mặc định'} - <strong class="text-slate-700">SĐT:</strong> ${order.recipient_phone || 'Chưa cung cấp'}</div>
              ${order.recipient_email ? `<div><strong class="text-slate-700">Email:</strong> ${order.recipient_email}</div>` : ''}
              <div><strong class="text-slate-700">Địa chỉ giao:</strong> ${order.shipping_address}</div>
              <div><strong class="text-slate-700">Hình thức thanh toán:</strong> ${order.payment_method === 'cod' ? 'Thanh toán COD khi nhận hàng' : order.payment_method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : 'Ví điện tử'}</div>
              ${order.cccd ? `<div><strong class="text-slate-700">Số CCCD:</strong> ${order.cccd}</div>` : ''}
              ${order.notes ? `<div class="italic text-amber-600"><strong class="text-slate-700">Ghi chú:</strong> ${order.notes}</div>` : ''}
            </div>
            <div class="text-right flex items-center gap-2">
              <span class="text-sm font-medium text-slate-500">Tổng tiền:</span>
              <span class="text-lg font-extrabold text-sky-600">${formatCurrency(order.total_amount)}</span>
            </div>
          </div>        </div>
      `;
    });

    container.innerHTML = html;

  } catch (error) {
    console.error("Lỗi tải lịch sử đơn hàng:", error);
    container.innerHTML = `<span class="text-rose-500 font-semibold block text-center">Không thể tải dữ liệu đơn hàng.</span>`;
  }
}

// 4. LẮNG NGHE SỰ KIỆN SUBMIT FORM ĐỂ CẬP NHẬT THÔNG TIN HỒ SƠ
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-profile");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullname = document.getElementById("profile-fullname").value.trim();
      const email = document.getElementById("profile-email").value.trim();
      const phone = document.getElementById("profile-phone").value.trim();
      const address = document.getElementById("profile-address").value.trim();

      if (!fullname || !email) {
        showToast("Họ tên và Email là bắt buộc.", "error");
        return;
      }

      try {
        // Gửi yêu cầu PUT cập nhật hồ sơ cá nhân lên API
        const response = await fetchWithAuth("/profile", {
          method: "PUT",
          body: JSON.stringify({
            full_name: fullname,
            email: email,
            phone: phone || null,
            address: address || null
          })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Không thể cập nhật.");

        showToast(data.message || "Cập nhật thành công!", "success");
        loadProfile(); // Nạp lại thông tin mới nhất lên giao diện

      } catch (error) {
        console.error("Lỗi cập nhật profile:", error);
        showToast(error.message, "error");
      }
    });
  }

  // Khởi động nạp dữ liệu cá nhân & lịch sử mua hàng
  loadProfile();
  loadOrders();
});
