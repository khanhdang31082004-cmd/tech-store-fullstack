// =========================================================================
// ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
// FILE JAVASCRIPT: admin-login.js - Xử lý logic Đăng nhập Quản Trị Viên
// =========================================================================

const API_BASE_URL = "https://tech-store-fullstack-production.up.railway.app/api";

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
  } else if (type === 'error') {
    toast.classList.add('bg-rose-500');
  } else {
    toast.classList.add('bg-amber-500');
  }

  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.remove('translate-x-20', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('translate-x-20', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  // Nếu đã đăng nhập thành công từ trước -> Tự động chuyển hướng về admin
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch (e) {}

  if (token && user) {
    if (['admin', 'owner', 'manager', 'staff'].includes(user.role)) {
      window.location.href = "admin.html";
    }
  }

  const formLogin = document.getElementById("form-login-admin");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById("login-username");
      const passwordInput = document.getElementById("login-password");
      
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        showToast("Vui lòng nhập tài khoản và mật khẩu.", "error");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const text = await response.text();
        console.log("LOGIN RESPONSE:", text);
        const data = JSON.parse(text);

        if (!response.ok) {
          throw new Error(data.message || "Đăng nhập thất bại.");
        }
        
        // Kiểm tra quyền: chỉ cho phép role quản trị
        const allowedRoles = ['admin', 'owner', 'manager', 'staff'];
        if (!allowedRoles.includes(data.user.role)) {
          throw new Error("Tài khoản khách hàng không có quyền truy cập hệ thống quản trị");
        }

        // ĐĂNG NHẬP THÀNH CÔNG
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        showToast("Đăng nhập quản trị thành công!", "success");

        setTimeout(() => {
          window.location.href = "admin.html";
        }, 1000);

      } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        showToast(error.message, "error");
      }
    });
  }
});
