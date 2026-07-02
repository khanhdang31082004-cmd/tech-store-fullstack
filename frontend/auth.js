// =========================================================================
// ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
// FILE JAVASCRIPT: auth.js - Xử lý logic Đăng nhập & Đăng ký tài khoản
// =========================================================================

// Hàm chuyển đổi qua lại giữa Form Đăng nhập và Form Đăng ký
function switchTab(tab) {
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");

  if (!formLogin || !formRegister) return;

  if (tab === 'login') {
    // Hiển thị form login, ẩn form register
    formLogin.classList.remove("hidden");
    formRegister.classList.add("hidden");
    tabLogin.className = "w-1/2 py-2 rounded-md text-sm font-bold transition-all bg-sky-500 text-white shadow";
    tabRegister.className = "w-1/2 py-2 rounded-md text-sm font-bold text-slate-400 hover:text-white transition-all";
  } else {
    // Hiển thị form register, ẩn form login
    formLogin.classList.add("hidden");
    formRegister.classList.remove("hidden");
    tabLogin.className = "w-1/2 py-2 rounded-md text-sm font-bold text-slate-400 hover:text-white transition-all";
    tabRegister.className = "w-1/2 py-2 rounded-md text-sm font-bold transition-all bg-emerald-500 text-white shadow";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Đọc tham số truy vấn trên URL (?mode=register) để tự động kích hoạt Tab mong muốn
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  if (mode === 'register') {
    switchTab('register');
  } else {
    switchTab('login');
  }

  // Nếu người dùng đã đăng nhập thành công từ trước -> Tự động chuyển hướng về trang chủ/admin
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch (e) {}

  if (token && user) {
    window.location.href = "index.html";
  }

  // 2. Lắng nghe và xử lý sự kiện submit Form ĐĂNG NHẬP
  const formLogin = document.getElementById("form-login");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault(); // Ngăn trình duyệt reload lại trang
      
      const usernameInput = document.getElementById("login-username");
      const passwordInput = document.getElementById("login-password");
      
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        showToast("Vui lòng nhập tài khoản và mật khẩu.", "error");
        return;
      }

      try {
        // Gửi tài khoản mật khẩu lên API Backend
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Đăng nhập thất bại.");
        }

        if (data.user.role !== 'user') {
          throw new Error("Tài khoản quản trị vui lòng đăng nhập tại trang Quản trị (admin-login.html).");
        }

        // Xóa sạch các key rác cũ nếu có
        localStorage.removeItem("adminToken");
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userRole");
        localStorage.removeItem("username");
        localStorage.removeItem("full_name");

        // ĐĂNG NHẬP THÀNH CÔNG: Lưu token JWT và thông tin user vào localStorage của trình duyệt
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        showToast(data.message || "Đăng nhập thành công!", "success");

        // Điều hướng khách hàng vào trang mua sắm
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);

      } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        showToast(error.message, "error");
      }
    });
  }

  // 3. Lắng nghe và xử lý sự kiện submit Form ĐĂNG KÝ tài khoản mới
  const formRegister = document.getElementById("form-register");
  if (formRegister) {
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("reg-username").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value.trim();
      const fullname = document.getElementById("reg-fullname").value.trim();
      const phone = document.getElementById("reg-phone").value.trim();
      const address = document.getElementById("reg-address").value.trim();

      if (!username || !email || !password || !fullname) {
        showToast("Vui lòng điền đủ các trường thông tin bắt buộc (*).", "error");
        return;
      }

      if (password.length < 6) {
        showToast("Mật khẩu phải dài tối thiểu 6 ký tự.", "error");
        return;
      }

      try {
        // Gửi toàn bộ dữ liệu đăng ký lên API Backend
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            password,
            email,
            full_name: fullname,
            phone: phone || null,
            address: address || null
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Đăng ký thất bại.");
        }

        showToast("Đăng ký thành công! Đang chuyển về tab Đăng nhập...", "success");
        formRegister.reset();

        // Chuyển sang Tab Đăng nhập để người dùng login bằng tài khoản vừa đăng ký
        setTimeout(() => {
          switchTab('login');
        }, 1500);

      } catch (error) {
        console.error("Lỗi đăng ký:", error);
        showToast(error.message, "error");
      }
    });
  }

  // 4. Lắng nghe và xử lý sự kiện click nút QUÊN MẬT KHẨU
  const forgotPasswordBtn = document.getElementById("forgot-password-btn");
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Hệ thống khôi phục mật khẩu tự động qua Email đang được nâng cấp. Vui lòng liên hệ Hotline 1800 6868 để được kỹ thuật viên hỗ trợ lấy lại mật khẩu ngay.", "info");
    });
  }
});
