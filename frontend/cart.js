// 1. BẢO VỆ ROUTE: Nếu chưa đăng nhập -> Chuyển về trang đăng nhập
if (!localStorage.getItem("token")) {
  showToast("Vui lòng đăng nhập để truy cập giỏ hàng và thanh toán.", "warning");
  setTimeout(() => {
    window.location.href = "auth.html?mode=login";
  }, 1000);
} else if (!localStorage.getItem("selectedStoreId")) {
  showToast("Vui lòng chọn chi nhánh trước khi xem giỏ hàng.", "warning");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// 1. KẾT XUẤT THÔNG TIN CÁC SẢN PHẨM TRONG GIỎ HÀNG LÊN MÀN HÌNH
function renderCart() {
  const container = document.getElementById("cart-items-container");
  const subtotalLabel = document.getElementById("summary-subtotal");
  const totalLabel = document.getElementById("summary-total");

  if (!container) return;

  let cart = getCart();

  // Nếu giỏ hàng rỗng: Hiển thị giao diện báo rỗng & ẩn form thanh toán
  const clearCartContainer = document.getElementById("clear-cart-container");
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 px-4">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        <h3 class="text-lg font-bold text-slate-700 mb-1">Giỏ hàng của bạn đang trống</h3>
        <p class="text-slate-500 text-sm mb-4">Hãy quay lại cửa hàng và chọn cho mình thiết bị ưng ý.</p>
        <a href="index.html" class="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow inline-block">Mua sắm ngay</a>
      </div>
    `;
    subtotalLabel.textContent = "0 đ";
    totalLabel.textContent = "0 đ";
    
    const checkoutForm = document.getElementById("form-checkout");
    if (checkoutForm) checkoutForm.classList.add("hidden");
    if (clearCartContainer) clearCartContainer.classList.add("hidden");
    return;
  }

  if (clearCartContainer) clearCartContainer.classList.remove("hidden");
  clearCartContainer.classList.add("flex");

  let html = "";
  
  const currentStoreName = localStorage.getItem("selectedStoreName");
  if (currentStoreName) {
    html += `<div class="col-span-full text-sm font-bold text-sky-600 px-6 py-2">Giỏ hàng thuộc chi nhánh: ${currentStoreName}</div>`;
  }

  let totalCost = 0; // Bộ tính tổng tiền

  // Duyệt danh sách các sản phẩm đang có trong giỏ hàng
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalCost += itemTotal;

    html += `
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-5 items-center">
        <!-- Cột sản phẩm (Tên, Ảnh) -->
        <div class="col-span-1 sm:col-span-6 flex items-center gap-4">
          <img src="${item.image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'}" alt="${item.product_name}" class="w-16 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0">
          <div>
            <h3 class="font-bold text-slate-800 text-sm leading-snug line-clamp-2">${item.product_name}</h3>
            <button onclick="removeFromCart(${item.product_id})" class="text-xs text-rose-500 hover:text-rose-600 font-bold mt-1.5 transition-colors flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Xóa khỏi giỏ
            </button>
          </div>
        </div>

        <!-- Cột Đơn giá -->
        <div class="col-span-1 sm:col-span-2 text-left sm:text-center">
          <span class="sm:hidden text-xs text-slate-400 block font-medium">Đơn giá:</span>
          <span class="text-sm font-semibold text-slate-700">${formatCurrency(item.price)}</span>
        </div>

        <!-- Cột Số lượng (Có nút + và - để điều chỉnh nhanh) -->
        <div class="col-span-1 sm:col-span-2 flex items-center justify-start sm:justify-center">
          <div class="flex items-center border border-slate-300 rounded-lg overflow-hidden h-9">
            <button onclick="changeQuantity(${item.product_id}, -1)" class="px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold transition-all h-full">-</button>
            <span class="w-10 text-center font-bold text-sm text-slate-800 select-none">${item.quantity}</span>
            <button onclick="changeQuantity(${item.product_id}, 1)" class="px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold transition-all h-full">+</button>
          </div>
        </div>

        <!-- Cột Tổng tiền của mặt hàng đó (Giá x Số lượng) -->
        <div class="col-span-1 sm:col-span-2 text-left sm:text-right">
          <span class="sm:hidden text-xs text-slate-400 block font-medium">Tổng tiền:</span>
          <span class="text-sm font-extrabold text-sky-600">${formatCurrency(itemTotal)}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  subtotalLabel.textContent = formatCurrency(totalCost);
  totalLabel.textContent = formatCurrency(totalCost);
  
  // Chỉ hiện form đặt hàng khi đã đăng nhập
  if (localStorage.getItem("token")) {
    const checkoutForm = document.getElementById("form-checkout");
    if (checkoutForm) checkoutForm.classList.remove("hidden");
  }
}

// 2. THAY ĐỔI SỐ LƯỢNG SẢN PHẨM TRONG GIỎ (+1 / -1)
function changeQuantity(productId, delta) {
  let cart = getCart();

  const idx = cart.findIndex(item => item.product_id === productId);
  if (idx === -1) return;

  const newQty = cart[idx].quantity + delta;

  // Nếu số lượng giảm về 0 thì hỏi xác nhận xóa khỏi giỏ
  if (newQty <= 0) {
    if (confirm(`Bạn có chắc muốn xóa "${cart[idx].product_name}"?`)) {
      cart.splice(idx, 1);
    }
  } else {
    cart[idx].quantity = newQty;
  }

  saveCart(cart);
  renderCart();
  updateCartBadge();
}

// 3. XÓA BỎ HẲN SẢN PHẨM KHỎI GIỎ HÀNG
function removeFromCart(productId) {
  let cart = getCart();

  const newCart = cart.filter(item => item.product_id !== productId);
  saveCart(newCart);
  showToast("Đã xóa sản phẩm khỏi giỏ hàng.", "info");
  renderCart();
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

// 3.5. XÓA TOÀN BỘ GIỎ HÀNG
function clearCart() {
  if (confirm("Bạn có chắc muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?")) {
    clearCartData();
    showToast("Đã xóa toàn bộ giỏ hàng.", "info");
    renderCart();
    if (typeof updateCartBadge === 'function') updateCartBadge();
  }
}

// =========================================================================
// 4. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP & CHUẨN BỊ THÔNG TIN CHECKOUT
// =========================================================================
async function prepareCheckout() {
  const token = localStorage.getItem("token");
  const authWarning = document.getElementById("checkout-auth-warning");
  const checkoutForm = document.getElementById("form-checkout");

  if (!token) {
    // Nếu chưa đăng nhập: Hiện thông báo yêu cầu đăng nhập, ẩn form điền thông tin ship
    if (authWarning) authWarning.classList.remove("hidden");
    if (checkoutForm) checkoutForm.classList.add("hidden");
    return;
  }

  if (authWarning) authWarning.classList.add("hidden");
  if (checkoutForm) checkoutForm.classList.remove("hidden");

  // Nạp sẵn thông tin cá nhân của User vào form để họ không phải nhập lại từ đầu
  try {
    const response = await fetchWithAuth("/profile");
    if (response.ok) {
      const profile = await response.json();
      
      const hasFontError = (str) => {
        if (!str) return false;
        const mojibake = ["Ã", "Ä", "áº", "Æ°", "", "á»"];
        return mojibake.some(m => str.includes(m));
      };

      if (!hasFontError(profile.full_name)) {
        document.getElementById("checkout-fullname").value = profile.full_name || "";
      } else {
        document.getElementById("checkout-fullname").value = "";
      }

      if (!hasFontError(profile.phone)) {
        document.getElementById("checkout-phone").value = profile.phone || "";
      } else {
        document.getElementById("checkout-phone").value = "";
      }

      document.getElementById("checkout-address").value = "";
    }
  } catch (error) {
    console.error("Lỗi lấy profile cho checkout:", error);
  }
}

// =========================================================================
// 5. GỬI ĐƠN HÀNG LÊN SERVER BACKEND (SUBMIT CHECKOUT)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  prepareCheckout();

  const formCheckout = document.getElementById("form-checkout");
  if (formCheckout) {
    const showFieldError = (fieldId, message) => {
      const el = document.getElementById(fieldId);
      if (!el) return;
      el.classList.add("input-error", "shake");
      setTimeout(() => el.classList.remove("shake"), 300);
      
      let errEl = document.getElementById(fieldId + "-error");
      if (!errEl) {
        errEl = document.createElement("div");
        errEl.id = fieldId + "-error";
        errEl.className = "text-rose-500 text-[10px] font-bold mt-1.5 error-message-shake";
        el.parentNode.appendChild(errEl);
      }
      errEl.textContent = message;
    };

    const clearFieldError = (fieldId) => {
      const el = document.getElementById(fieldId);
      if (el) el.classList.remove("input-error");
      const errEl = document.getElementById(fieldId + "-error");
      if (errEl) errEl.remove();
    };

    const validateField = (id) => {
      clearFieldError(id);
      const el = document.getElementById(id);
      if (!el) return true;
      const val = el.value.trim();

      if (id === "checkout-fullname") {
        if (val === "") {
          showFieldError(id, "Vui lòng nhập họ tên người nhận");
          return false;
        }
        const nameRegex = /^[A-Za-zÀ-ỹà-ỹ\s]{2,100}$/;
        if (!nameRegex.test(val)) {
          showFieldError(id, "Họ tên chỉ được chứa chữ cái và khoảng trắng");
          return false;
        }
      }

      if (id === "checkout-phone") {
        if (val === "") {
          showFieldError(id, "Vui lòng nhập số điện thoại");
          return false;
        }
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(val)) {
          showFieldError(id, "Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số");
          return false;
        }
      }

      if (id === "checkout-email") {
        if (val !== "") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            showFieldError(id, "Email không hợp lệ");
            return false;
          }
        }
      }

      if (id === "checkout-address") {
        if (val === "") {
          showFieldError(id, "Vui lòng nhập địa chỉ giao hàng");
          return false;
        }
      }

      if (id === "checkout-payment") {
        if (val === "") {
          showFieldError(id, "Vui lòng chọn phương thức thanh toán");
          return false;
        }
      }

      return true;
    };

    const fieldsToValidate = ["checkout-fullname", "checkout-phone", "checkout-email", "checkout-address", "checkout-payment"];

    // Chỉ validate khi blur hoặc submit (không validate khi đang gõ)
    fieldsToValidate.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("blur", () => validateField(id));
      }
    });

    const validateCheckoutForm = () => {
      let isValid = true;
      let firstErrorEl = null;

      fieldsToValidate.forEach(id => {
        if (!validateField(id)) {
          isValid = false;
          if (!firstErrorEl) firstErrorEl = document.getElementById(id);
        }
      });

      const cart = getCart();
      if (cart.length === 0) {
        showToast("Giỏ hàng đang trống", "error");
        isValid = false;
      }

      if (!localStorage.getItem("selectedStoreId")) {
        showToast("Vui lòng chọn chi nhánh trước khi đặt hàng", "error");
        isValid = false;
      }

      if (!isValid && firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return isValid;
    };

    formCheckout.addEventListener("submit", async (e) => {
      e.preventDefault(); // Ngăn trình duyệt tự động load lại trang

      if (!validateCheckoutForm()) return;

      const cart = getCart();

      // Lấy dữ liệu từ Form
      const fullname = document.getElementById("checkout-fullname").value.trim();
      const phone = document.getElementById("checkout-phone").value.trim();
      const email = document.getElementById("checkout-email") ? document.getElementById("checkout-email").value.trim() : "";
      const address = document.getElementById("checkout-address").value.trim();
      const payment = document.getElementById("checkout-payment").value.trim();
      const notes = document.getElementById("checkout-notes") ? document.getElementById("checkout-notes").value.trim() : "";

      // Xây dựng mảng sản phẩm đúng định dạng cấu trúc API Backend yêu cầu
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      // Gom thông tin người nhận vào địa chỉ giao hàng đầy đủ cho khả năng hiển thị tương thích cũ nếu cần
      const fullShippingAddress = `${address}`;

      try {
        // Gửi đơn đặt hàng lên API
        const response = await fetchWithAuth("/orders", {
          method: "POST",
          body: JSON.stringify({
            recipient_name: fullname,
            recipient_phone: phone,
            recipient_email: email || null,
            shipping_address: fullShippingAddress,
            payment_method: payment,
            notes: notes || null,
            store_id: localStorage.getItem("selectedStoreId") ? parseInt(localStorage.getItem("selectedStoreId")) : null,
            store_name: localStorage.getItem("selectedStoreName") || null,
            items: items
          })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Đặt hàng thất bại.");

        showToast("Đặt hàng thành công! Đang chuyển hướng...", "success");
        
        // Làm sạch giỏ hàng trong localStorage và server-side sau khi đặt thành công
        clearCartData();
        try {
          await fetchWithAuth("/cart", { method: "DELETE" });
        } catch (err) {
          console.error("Lỗi xóa giỏ hàng server:", err);
        }
        
        renderCart();
        updateCartBadge();

        // Chuyển hướng người dùng sang trang profile cá nhân để theo dõi trạng thái đơn hàng
        setTimeout(() => {
          window.location.href = "profile.html";
        }, 1500);

      } catch (error) {
        console.error("Lỗi đặt hàng:", error);
        showToast(error.message, "error");
      }
    });
  }
});
