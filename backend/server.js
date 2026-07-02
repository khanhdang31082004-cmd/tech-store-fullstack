// =========================================================================
// ĐỒ ÁN: WEBSITE BÁN MÁY TÍNH VÀ THIẾT BỊ CÔNG NGHỆ
// FILE BACKEND: server.js - Điểm chạy API Server chính
// =========================================================================

// 1. NHẬP CÁC THƯ VIỆN CẦN THIẾT (IMPORT LIBRARIES)
const express = require('express'); // Framework web Express hỗ trợ viết REST API
const mysql = require('mysql2/promise'); // Kết nối MySQL Database hỗ trợ cơ chế Async/Await
const bcrypt = require('bcryptjs'); // Mã hóa mật khẩu một chiều (Hash) để lưu trữ bảo mật
const jwt = require('jsonwebtoken'); // Cấp phát và xác thực chữ ký token bảo mật (JSON Web Token)
const cors = require('cors'); // Cho phép giao tiếp tài nguyên chéo cổng (Frontend gọi API Backend)
require('dotenv').config(); // Đọc các biến cấu hình trong file .env vào ứng dụng

const app = express();
const PORT = process.env.PORT || 5000; // Sử dụng cổng PORT được chỉ định hoặc mặc định là 5000

// =========================================================================
// 2. CẤU HÌNH MIDDLEWARE HỆ THỐNG
// =========================================================================

// Lấy danh sách các URL Frontend được phép gọi API (khai báo trong file .env)
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

// Cấu hình CORS để bảo vệ các nguồn gọi API từ bên ngoài
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Cho phép các công cụ test như Postman gọi
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true); // Chấp nhận URL hợp lệ
    } else {
      return callback(new Error('CORS: Không cho phép truy cập từ URL này.'));
    }
  },
  credentials: true // Cho phép trao đổi cookie / headers bảo mật giữa các domain khác nhau
}));

app.use(express.json()); // Middleware phân tích cú pháp body request dạng JSON
app.use(express.urlencoded({ extended: true })); // Middleware phân tích cú pháp body gửi từ Form

// =========================================================================
// 3. THIẾT LẬP KẾT NỐI CƠ SỞ DỮ LIỆU MYSQL (CONNECTION POOL)
// =========================================================================

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tech_store',
  charset: 'utf8mb4',
  waitForConnections: true, // Chờ đợi kết nối rảnh nếu hàng đợi đầy
  connectionLimit: 10, // Giới hạn tối đa 10 kết nối đồng thời để tránh quá tải MySQL
  queueLimit: 0
};

let pool;
try {
  pool = mysql.createPool(dbConfig); // Khởi tạo Pool kết nối hiệu năng cao
  console.log(`Đang khởi tạo kết nối MySQL Pool tới ${dbConfig.host}:${dbConfig.port}...`);
} catch (err) {
  console.error('Lỗi cấu hình database pool:', err.message);
}

// Hàm kiểm tra kết nối cơ sở dữ liệu khi bắt đầu chạy Server
async function testDbConnection() {
  try {
    const connection = await pool.getConnection(); // Lấy thử 1 kết nối ra
    console.log('Kết nối MySQL Database thành công!');
    connection.release(); // Trả lại kết nối vào Pool rảnh
  } catch (error) {
    console.error('LỖI KẾT NỐI DATABASE MYSQL:');
    console.error(`- Vui lòng kiểm tra xem MySQL đã chạy chưa.`);
    console.error(`- Đảm bảo đã import file "database/database.sql".`);
    console.error(`- Chi tiết lỗi: ${error.message}`);
  }
}
testDbConnection();

// =========================================================================
// 4. MIDDLEWARES XÁC THỰC & PHÂN QUYỀN
// =========================================================================

// Middleware kiểm tra và giải mã Token JWT của khách hàng gửi kèm trong Header
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Định dạng: Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.' });
  }

  // Xác thực chữ ký token bằng khóa bí mật JWT_SECRET
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
    req.user = user; // Gắn thông tin tài khoản đã giải mã vào đối tượng request
    next(); // Cho phép đi tiếp vào route API thực tế
  });
}
// Middleware kiểm tra tài khoản có quyền Admin (Quản trị viên) hay không
function isAdmin(req, res, next) {
  if (!req.user || req.user.role_name !== 'admin') {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho Admin.' });
  }
  next();
}

// Middleware kiểm tra tài khoản có phải là Nhân viên trở lên không (admin, store_owner, manager, staff)
function isStaff(req, res, next) {
  const allowedRoles = ['admin', 'owner', 'manager', 'staff'];
  if (!req.user || !allowedRoles.includes(req.user.role_name)) {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho nhân viên cửa hàng.' });
  }
  next();
}

// Middleware kiểm tra tài khoản có phải là Quản lý trở lên không (admin, store_owner, manager)
function isManager(req, res, next) {
  const allowedRoles = ['admin', 'owner', 'manager'];
  if (!req.user || !allowedRoles.includes(req.user.role_name)) {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho quản lý hoặc chủ cửa hàng.' });
  }
  next();
}

// Middleware kiểm tra tài khoản có phải là Chủ cửa hàng trở lên không (admin, store_owner)
function isStoreOwner(req, res, next) {
  const allowedRoles = ['admin', 'owner'];
  if (!req.user || !allowedRoles.includes(req.user.role_name)) {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho chủ cửa hàng.' });
  }
  next();
}
// =========================================================================
// 5. ENDPOINT KIỂM TRA MÁY CHỦ (HEALTH CHECK)
// =========================================================================
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return res.status(200).json({
      status: 'OK',
      message: 'Server đang hoạt động bình thường.',
      database: 'Connected',
      timestamp: new Date()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      message: 'Server hoạt động nhưng kết nối Database bị gián đoạn.',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// =========================================================================
// 6. CÁC API HỆ THỐNG (REST API ENDPOINTS)
// =========================================================================

// ----------------------------------------------------
// 6.1 API XÁC THỰC (AUTHENTICATION)
// ----------------------------------------------------

// API Đăng ký tài khoản khách hàng mới
app.post('/api/auth/register', async (req, res) => {
  const { username, password, email, full_name, phone, address } = req.body;

  if (!username || !password || !email || !full_name) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // Bắt đầu Giao dịch (Transaction) an toàn dữ liệu

    // Kiểm tra tên đăng nhập hoặc email đã được sử dụng chưa
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Tên đăng nhập hoặc Email đã tồn tại.' });
    }

    // Mã hóa mật khẩu 1 chiều bằng thuật toán bcryptjs
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Lưu vào bảng tài khoản (mặc định role_id = 2 là khách hàng 'user')
    const [userResult] = await connection.query(
      'INSERT INTO users (username, password, email, role_id) VALUES (?, ?, ?, 2)',
      [username, hashedPassword, email]
    );

    const newUserId = userResult.insertId;

    // Lưu thông tin chi tiết vào bảng khách hàng (customers) liên kết 1-1 với bảng users
    await connection.query(
      'INSERT INTO customers (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)',
      [newUserId, full_name, phone || null, address || null]
    );

    await connection.commit(); // Thành công: Lưu tất cả thay đổi vào DB
    connection.release();

    return res.status(201).json({ message: 'Đăng ký tài khoản khách hàng thành công!' });
  } catch (error) {
    await connection.rollback(); // Lỗi: Thu hồi/Hủy bỏ tất cả các bước trên để tránh rác dữ liệu
    connection.release();
    console.error('Lỗi khi đăng ký:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống khi đăng ký.', error: error.message });
  }
});

// API Đăng nhập hệ thống & cấp token JWT
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tài khoản và mật khẩu.' });
  }

  try {
    // Truy vấn thông tin tài khoản và vai trò của người dùng
    const [users] = await pool.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.username = ?`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const user = users[0];

    if (user.is_active === 0) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.' });
    }

    // Kiểm tra mật khẩu theo 3 cách linh hoạt:
    // a) Đặc cách đăng nhập nhanh cho tài khoản demo với mật khẩu 123456
    const isDemoLogin = (['admin', 'user', 'owner', 'manager', 'staff'].includes(username)) && password === '123456';
    
    // b) So sánh trực tiếp mật khẩu plain text trong DB
    const isPlainMatch = (password === user.password);
    
    // c) So sánh bằng giải mã bcrypt hash
    let isBcryptMatch = false;
    try {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
        isBcryptMatch = bcrypt.compareSync(password, user.password);
      }
    } catch (e) {
      console.log('Lỗi so sánh bcrypt, bỏ qua:', e.message);
    }

    const isPasswordValid = isDemoLogin || isPlainMatch || isBcryptMatch;

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    // Chuẩn hóa role name
    let normalizedRole = user.role_name;
    if (normalizedRole === 'store_owner') normalizedRole = 'owner';

    // Gắn thông tin cần thiết vào JWT Payload
    const tokenPayload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: normalizedRole,
      role_name: normalizedRole, // Trả về giống nhau cho frontend dễ dùng
      store_id: user.store_id
    };

    // Tạo chữ ký số và mã hóa JWT Token có hiệu lực 24 giờ
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      message: 'Đăng nhập thành công!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: normalizedRole,
        role_name: normalizedRole
      }
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi đăng nhập.', error: error.message });
  }
});

// ----------------------------------------------------
// 6.2 API KHÁCH HÀNG & MUA SẮM (CUSTOMER API)
// ----------------------------------------------------

// API Lấy danh sách sản phẩm (có hỗ trợ tìm kiếm và lọc theo danh mục)
app.get('/api/products', async (req, res) => {
  const { category_id, search, limit, page } = req.query;
  
  let sql = `
    SELECT p.*, c.category_name, s.store_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN stores s ON p.store_id = s.id
    WHERE 1=1
  `;
  const params = [];

  // Lọc theo ID danh mục
  if (category_id) {
    sql += ' AND p.category_id = ?';
    params.push(parseInt(category_id));
  }

  // Tìm kiếm theo từ khóa tên sản phẩm
  if (search) {
    sql += ' AND p.product_name LIKE ?';
    params.push(`%${search}%`);
  }

  sql += ' ORDER BY p.id DESC'; // Sắp xếp sản phẩm mới nhất hiển thị trước

  // Phân trang danh sách sản phẩm
  if (limit) {
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page) || 1;
    const offset = (parsedPage - 1) * parsedLimit;
    
    sql += ' LIMIT ? OFFSET ?';
    params.push(parsedLimit, offset);
  }

  try {
    const [products] = await pool.query(sql, params);
    return res.status(200).json(products);
  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách sản phẩm.', error: error.message });
  }
});

// API Lấy thông tin chi tiết của 1 sản phẩm
app.get('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.category_name, s.store_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN stores s ON p.store_id = s.id
       WHERE p.id = ?`,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    return res.status(200).json(products[0]);
  } catch (error) {
    console.error('Lỗi lấy chi tiết sản phẩm:', error);
    return res.status(500).json({ message: 'Lỗi tải chi tiết sản phẩm.', error: error.message });
  }
});

// API Lấy toàn bộ danh mục sản phẩm (để hiện lên thanh lọc)
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Lỗi lấy danh mục:', error);
    return res.status(500).json({ message: 'Không thể lấy danh mục sản phẩm.', error: error.message });
  }
});

// API Xem hồ sơ cá nhân (Chỉ dành cho khách hàng đã đăng nhập)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [profiles] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, c.full_name, c.phone, c.address 
       FROM users u
       LEFT JOIN customers c ON u.id = c.user_id
       WHERE u.id = ?`,
      [req.user.id] // Lấy ID tài khoản từ thông tin giải mã Token JWT
    );

    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
    }

    return res.status(200).json(profiles[0]);
  } catch (error) {
    console.error('Lỗi tải profile:', error);
    return res.status(500).json({ message: 'Không thể lấy thông tin cá nhân.', error: error.message });
  }
});

// API Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ, Email)
app.put('/api/profile', authenticateToken, async (req, res) => {
  const { full_name, phone, address, email } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: 'Họ và tên là bắt buộc.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Cập nhật lại email (nếu email mới không bị trùng với tài khoản khác)
    if (email) {
      const [existingEmail] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );
      if (existingEmail.length > 0) {
        connection.release();
        return res.status(409).json({ message: 'Email này đã được sử dụng bởi một tài khoản khác.' });
      }

      await connection.query(
        'UPDATE users SET email = ? WHERE id = ?',
        [email, req.user.id]
      );
    }

    // Cập nhật thông tin trong bảng customers
    await connection.query(
      `UPDATE customers 
       SET full_name = ?, phone = ?, address = ? 
       WHERE user_id = ?`,
      [full_name, phone || null, address || null, req.user.id]
    );

    await connection.commit();
    connection.release();

    return res.status(200).json({ message: 'Cập nhật thông tin thành công!' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Lỗi cập nhật profile:', error);
    return res.status(500).json({ message: 'Không thể cập nhật hồ sơ cá nhân.', error: error.message });
  }
});

// API Gửi đơn đặt hàng mới (Kiểm tra kho, tính tiền, tạo đơn và chi tiết đơn hàng)
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { recipient_name, recipient_phone, recipient_email, shipping_address, payment_method, notes, cccd, items } = req.body; // items: [{product_id, quantity}]

  if (!recipient_name || !recipient_phone || !shipping_address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Thông tin đặt hàng không đầy đủ hoặc không hợp lệ.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // Thực hiện giao dịch (Transaction) an toàn tránh Race Condition

    // Tìm ID khách hàng tương ứng với tài khoản đăng nhập, tạo mới nếu chưa có
    let customerId;
    const [customers] = await connection.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );

    if (customers.length === 0) {
      const [newCust] = await connection.query(
        'INSERT INTO customers (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)',
        [req.user.id, recipient_name, recipient_phone, shipping_address]
      );
      customerId = newCust.insertId;
    } else {
      customerId = customers[0].id;
      // Cập nhật thông tin khách hàng theo đơn hàng mới nhất
      await connection.query(
        'UPDATE customers SET full_name = ?, phone = ?, address = ? WHERE id = ?',
        [recipient_name, recipient_phone, shipping_address, customerId]
      );
    }

    let totalAmount = 0;
    const orderItemsDetails = [];

    // Duyệt qua từng sản phẩm đặt mua để kiểm tra số lượng tồn kho
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT id, product_name, price, stock_quantity FROM products WHERE id = ? FOR UPDATE', // Khóa tạm thời hàng trong DB
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`Sản phẩm (ID: ${item.product_id}) không còn bán.`);
      }

      const product = products[0];

      // Báo lỗi nếu khách hàng đặt mua vượt quá số lượng còn lại trong kho
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Sản phẩm "${product.product_name}" không đủ hàng (Kho còn: ${product.stock_quantity}).`);
      }

      const itemCost = product.price * item.quantity;
      totalAmount += itemCost;

      orderItemsDetails.push({
        product_id: product.id,
        quantity: item.quantity,
        price: product.price
      });

      // Trừ số lượng tồn kho thực tế của sản phẩm
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, product.id]
      );
    }

    // Tạo đơn hàng mới trong bảng orders với đầy đủ thông tin người nhận
    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_id, total_amount, status, shipping_address, recipient_name, recipient_phone, recipient_email, payment_method, notes, cccd) 
       VALUES (?, ?, "Pending", ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, totalAmount, shipping_address, recipient_name, recipient_phone, recipient_email || null, payment_method || 'cod', notes || null, cccd || null]
    );

    const newOrderId = orderResult.insertId;

    // Chèn chi tiết từng sản phẩm mua vào bảng order_details
    for (const detail of orderItemsDetails) {
      await connection.query(
        'INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [newOrderId, detail.product_id, detail.quantity, detail.price]
      );
    }

    await connection.commit(); // Thành công: Xác nhận lưu đơn hàng vào DB
    connection.release();

    return res.status(201).json({
      message: 'Đặt hàng thành công!',
      order_id: newOrderId,
      total_amount: totalAmount
    });
  } catch (error) {
    await connection.rollback(); // Thất bại: Hoàn tác toàn bộ kho và thông tin đơn hàng
    connection.release();
    console.error('Lỗi đặt hàng:', error.message);
    return res.status(400).json({ message: error.message || 'Lỗi đặt hàng.' });
  }
});

// API Xem lịch sử đơn hàng của khách hàng hiện tại
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const [customers] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
    }
    const customerId = customers[0].id;

    // Lấy toàn bộ đơn hàng của khách hàng này xếp mới nhất lên đầu
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC',
      [customerId]
    );

    const ordersWithDetails = [];
    // Truy vấn chi tiết tên/ảnh sản phẩm cho mỗi đơn hàng
    for (const order of orders) {
      const [details] = await pool.query(
        `SELECT od.*, p.product_name, p.image_url 
         FROM order_details od
         JOIN products p ON od.product_id = p.id
         WHERE od.order_id = ?`,
        [order.id]
      );
      ordersWithDetails.push({
        ...order,
        items: details
      });
    }

    return res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error('Lỗi lấy đơn hàng:', error);
    return res.status(500).json({ message: 'Không thể tải lịch sử đơn hàng.', error: error.message });
  }
});

// ----------------------------------------------------
// 6.3 API CHỈ DÀNH CHO QUẢN TRỊ VIÊN (ADMIN API)
// ----------------------------------------------------

// Admin - Xem danh sách sản phẩm quản trị (Nhân viên trở lên có thể xem)
app.get('/api/admin/products', authenticateToken, isStaff, async (req, res) => {
  try {
    let products;
    if (req.user.role_name === 'admin') {
      const [rows] = await pool.query(
        `SELECT p.*, c.category_name, s.store_name 
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN stores s ON p.store_id = s.id
         ORDER BY p.id DESC`
      );
      products = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT p.*, c.category_name, s.store_name 
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN stores s ON p.store_id = s.id
         WHERE p.store_id = ?
         ORDER BY p.id DESC`,
        [req.user.store_id]
      );
      products = rows;
    }
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tải danh sách sản phẩm quản trị.', error: error.message });
  }
});

// Admin - Thêm sản phẩm công nghệ mới (Quản lý trở lên mới được thêm)
app.post('/api/admin/products', authenticateToken, isManager, async (req, res) => {
  const { product_name, description, price, image_url, stock_quantity, category_id, store_id } = req.body;

  if (!product_name || price === undefined || stock_quantity === undefined) {
    return res.status(400).json({ message: 'Tên sản phẩm, giá bán và số lượng kho là bắt buộc.' });
  }

  const finalStoreId = req.user.role_name === 'admin' ? (store_id ? parseInt(store_id) : 1) : req.user.store_id;

  try {
    const [result] = await pool.query(
      `INSERT INTO products (product_name, description, price, image_url, stock_quantity, category_id, store_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name, 
        description || null, 
        parseFloat(price), 
        image_url || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500', 
        parseInt(stock_quantity), 
        category_id ? parseInt(category_id) : null, 
        finalStoreId
      ]
    );

    return res.status(201).json({ message: 'Thêm sản phẩm thành công!', product_id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể thêm sản phẩm.', error: error.message });
  }
});

// Admin - Cập nhật thông tin sản phẩm (Quản lý trở lên mới được sửa)
app.put('/api/admin/products/:id', authenticateToken, isManager, async (req, res) => {
  const productId = req.params.id;
  const { product_name, description, price, image_url, stock_quantity, category_id, store_id } = req.body;

  try {
    const [check] = await pool.query('SELECT id, store_id FROM products WHERE id = ?', [productId]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    if (req.user.role_name !== 'admin' && check[0].store_id !== req.user.store_id) {
      return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Bạn không thể sửa sản phẩm của chi nhánh khác.' });
    }

    const finalStoreId = req.user.role_name === 'admin' ? (store_id ? parseInt(store_id) : check[0].store_id) : req.user.store_id;

    await pool.query(
      `UPDATE products 
       SET product_name = ?, description = ?, price = ?, image_url = ?, stock_quantity = ?, category_id = ?, store_id = ? 
       WHERE id = ?`,
      [product_name, description || null, parseFloat(price), image_url || null, parseInt(stock_quantity), category_id ? parseInt(category_id) : null, finalStoreId, productId]
    );

    return res.status(200).json({ message: 'Cập nhật thông tin sản phẩm thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể cập nhật sản phẩm.', error: error.message });
  }
});

// Admin - Xóa sản phẩm khỏi hệ thống (Quản lý trở lên mới được xóa)
app.delete('/api/admin/products/:id', authenticateToken, isManager, async (req, res) => {
  const productId = req.params.id;
  try {
    const [check] = await pool.query('SELECT id, store_id FROM products WHERE id = ?', [productId]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    if (req.user.role_name !== 'admin' && check[0].store_id !== req.user.store_id) {
      return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Bạn không thể xóa sản phẩm của chi nhánh khác.' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    return res.status(200).json({ message: 'Xóa sản phẩm thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể xóa sản phẩm do đang có đơn hàng mua sản phẩm này.', error: error.message });
  }
});

// Admin - Xem danh sách toàn bộ các đơn hàng của khách (Nhân viên trở lên có thể xem)
app.get('/api/admin/orders', authenticateToken, isStaff, async (req, res) => {
  try {
    let orders;
    if (req.user.role_name === 'admin') {
      const [rows] = await pool.query(
        `SELECT o.*, c.full_name, c.phone, u.username, u.email 
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         JOIN users u ON c.user_id = u.id
         ORDER BY o.id DESC`
      );
      orders = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT DISTINCT o.*, c.full_name, c.phone, u.username, u.email 
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         JOIN users u ON c.user_id = u.id
         JOIN order_details od ON o.id = od.order_id
         JOIN products p ON od.product_id = p.id
         WHERE p.store_id = ?
         ORDER BY o.id DESC`,
        [req.user.store_id]
      );
      orders = rows;
    }

    const ordersWithDetails = [];
    for (const order of orders) {
      let details;
      if (req.user.role_name === 'admin') {
        const [rows] = await pool.query(
          `SELECT od.*, p.product_name 
           FROM order_details od
           JOIN products p ON od.product_id = p.id
           WHERE od.order_id = ?`,
          [order.id]
        );
        details = rows;
      } else {
        const [rows] = await pool.query(
          `SELECT od.*, p.product_name 
           FROM order_details od
           JOIN products p ON od.product_id = p.id
           WHERE od.order_id = ? AND p.store_id = ?`,
          [order.id, req.user.store_id]
        );
        details = rows;
      }
      ordersWithDetails.push({ ...order, items: details });
    }

    return res.status(200).json(ordersWithDetails);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể lấy danh sách đơn hàng.', error: error.message });
  }
});

// Admin - Cập nhật trạng thái đơn hàng (Tự động hoàn trả kho nếu hủy đơn)
app.put('/api/admin/orders/:id', authenticateToken, isStaff, async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body; // 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'

  try {
    const [check] = await pool.query('SELECT id, status FROM orders WHERE id = ?', [orderId]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại.' });
    }

    if (req.user.role_name !== 'admin') {
      // Kiểm tra xem đơn hàng có chứa sản phẩm thuộc chi nhánh của nhân viên không
      const [hasItems] = await pool.query(
        `SELECT od.id FROM order_details od
         JOIN products p ON od.product_id = p.id
         WHERE od.order_id = ? AND p.store_id = ?`,
        [orderId, req.user.store_id]
      );
      if (hasItems.length === 0) {
        return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Đơn hàng này không thuộc chi nhánh của bạn.' });
      }
    }

    const currentStatus = check[0].status;

    // Trạng thái mới là Hủy đơn (Cancelled) nhưng đơn hàng cũ chưa Hủy -> Hoàn lại số lượng vào kho sản phẩm
    if (status === 'Cancelled' && currentStatus !== 'Cancelled') {
      const [details] = await pool.query('SELECT product_id, quantity FROM order_details WHERE order_id = ?', [orderId]);
      for (const item of details) {
        await pool.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // Phục hồi từ trạng thái Hủy đơn (Cancelled) về trạng thái khác -> Trừ lại hàng trong kho sản phẩm
    if (currentStatus === 'Cancelled' && status !== 'Cancelled') {
      const [details] = await pool.query('SELECT product_id, quantity FROM order_details WHERE order_id = ?', [orderId]);
      for (const item of details) {
        await pool.query(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    return res.status(200).json({ message: `Cập nhật trạng thái đơn hàng thành công: ${status}` });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể cập nhật trạng thái đơn hàng.', error: error.message });
  }
});

// Admin/Owner xóa đơn hàng
app.delete('/api/admin/orders/:id', authenticateToken, isStaff, async (req, res) => {
  const orderId = req.params.id;
  
  if (req.user.role_name !== 'admin' && req.user.role_name !== 'owner') {
    return res.status(403).json({ success: false, message: 'Không có quyền xóa đơn hàng' });
  }

  try {
    const [check] = await pool.query('SELECT id FROM orders WHERE id = ?', [orderId]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    // Yêu cầu: Xóa order_details trước, sau đó xóa orders (mặc dù csdl có ON DELETE CASCADE)
    await pool.query('DELETE FROM order_details WHERE order_id = ?', [orderId]);
    await pool.query('DELETE FROM orders WHERE id = ?', [orderId]);

    return res.status(200).json({ success: true, message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Không thể xóa đơn hàng' });
  }
});

// Admin - API Lấy dữ liệu thống kê Dashboard (Doanh thu, Top bán chạy, Đơn đặt mới)
app.get('/api/admin/dashboard', authenticateToken, isStaff, async (req, res) => {
  try {
    const isSysAdmin = req.user.role_name === 'admin';
    const storeId = req.user.store_id;

    // 1. Tổng doanh thu (Chỉ tính các đơn hàng có trạng thái Completed)
    let totalRevenue = 0;
    if (isSysAdmin) {
      const [result] = await pool.query('SELECT SUM(total_amount) AS total_revenue FROM orders WHERE status = "Completed"');
      totalRevenue = result[0].total_revenue || 0;
    } else {
      const [result] = await pool.query(
        `SELECT SUM(od.quantity * od.price) AS total_revenue 
         FROM order_details od 
         JOIN products p ON od.product_id = p.id 
         JOIN orders o ON od.order_id = o.id 
         WHERE o.status = "Completed" AND p.store_id = ?`,
        [storeId]
      );
      totalRevenue = result[0].total_revenue || 0;
    }

    // 2. Tổng số đơn hàng
    let totalOrders = 0;
    if (isSysAdmin) {
      const [result] = await pool.query('SELECT COUNT(id) AS total_orders FROM orders');
      totalOrders = result[0].total_orders || 0;
    } else {
      const [result] = await pool.query(
        `SELECT COUNT(DISTINCT o.id) AS total_orders 
         FROM orders o 
         JOIN order_details od ON o.id = od.order_id 
         JOIN products p ON od.product_id = p.id 
         WHERE p.store_id = ?`,
        [storeId]
      );
      totalOrders = result[0].total_orders || 0;
    }

    // 3. Tổng số sản phẩm
    let totalProducts = 0;
    if (isSysAdmin) {
      const [result] = await pool.query('SELECT COUNT(id) AS total_products FROM products');
      totalProducts = result[0].total_products || 0;
    } else {
      const [result] = await pool.query('SELECT COUNT(id) AS total_products FROM products WHERE store_id = ?', [storeId]);
      totalProducts = result[0].total_products || 0;
    }

    // 4. Tổng số lượng khách hàng
    let totalCustomers = 0;
    if (isSysAdmin) {
      const [result] = await pool.query(
        'SELECT COUNT(c.id) AS total_customers FROM customers c JOIN users u ON c.user_id = u.id WHERE u.role_id != 1'
      );
      totalCustomers = result[0].total_customers || 0;
    } else {
      const [result] = await pool.query(
        `SELECT COUNT(DISTINCT o.customer_id) AS total_customers 
         FROM orders o 
         JOIN order_details od ON o.id = od.order_id 
         JOIN products p ON od.product_id = p.id 
         WHERE p.store_id = ?`,
        [storeId]
      );
      totalCustomers = result[0].total_customers || 0;
    }

    // 5. Thống kê số lượng đơn đặt theo trạng thái
    let statusStats;
    if (isSysAdmin) {
      const [stats] = await pool.query('SELECT status, COUNT(id) AS count FROM orders GROUP BY status');
      statusStats = stats;
    } else {
      const [stats] = await pool.query(
        `SELECT o.status, COUNT(DISTINCT o.id) AS count 
         FROM orders o 
         JOIN order_details od ON o.id = od.order_id 
         JOIN products p ON od.product_id = p.id 
         WHERE p.store_id = ? 
         GROUP BY o.status`,
        [storeId]
      );
      statusStats = stats;
    }

    // 6. Top 5 sản phẩm bán chạy nhất
    let topProducts;
    if (isSysAdmin) {
      const [rows] = await pool.query(
        `SELECT p.id, p.product_name, SUM(od.quantity) AS sold_quantity, SUM(od.quantity * od.price) AS total_sales, p.price, p.image_url
         FROM order_details od
         JOIN products p ON od.product_id = p.id
         JOIN orders o ON od.order_id = o.id
         WHERE o.status = "Completed"
         GROUP BY p.id
         ORDER BY sold_quantity DESC
         LIMIT 5`
      );
      topProducts = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT p.id, p.product_name, SUM(od.quantity) AS sold_quantity, SUM(od.quantity * od.price) AS total_sales, p.price, p.image_url
         FROM order_details od
         JOIN products p ON od.product_id = p.id
         JOIN orders o ON od.order_id = o.id
         WHERE o.status = "Completed" AND p.store_id = ?
         GROUP BY p.id
         ORDER BY sold_quantity DESC
         LIMIT 5`,
        [storeId]
      );
      topProducts = rows;
    }

    // 7. Doanh thu phân chia theo Danh mục thiết bị
    let categoryStats;
    if (isSysAdmin) {
      const [rows] = await pool.query(
        `SELECT c.category_name, SUM(od.quantity * od.price) AS revenue
         FROM order_details od
         JOIN products p ON od.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         JOIN orders o ON od.order_id = o.id
         WHERE o.status = "Completed"
         GROUP BY c.id
         ORDER BY revenue DESC`
      );
      categoryStats = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT c.category_name, SUM(od.quantity * od.price) AS revenue
         FROM order_details od
         JOIN products p ON od.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         JOIN orders o ON od.order_id = o.id
         WHERE o.status = "Completed" AND p.store_id = ?
         GROUP BY c.id
         ORDER BY revenue DESC`,
        [storeId]
      );
      categoryStats = rows;
    }

    // 8. 5 đơn hàng mới nhất phát sinh gần đây
    let recentOrders;
    if (isSysAdmin) {
      const [rows] = await pool.query(
        `SELECT o.id, o.total_amount, o.status, o.created_at, c.full_name
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         ORDER BY o.id DESC
         LIMIT 5`
      );
      recentOrders = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT DISTINCT o.id, o.total_amount, o.status, o.created_at, c.full_name
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
         JOIN order_details od ON o.id = od.order_id
         JOIN products p ON od.product_id = p.id
         WHERE p.store_id = ?
         ORDER BY o.id DESC
         LIMIT 5`,
        [storeId]
      );
      recentOrders = rows;
    }

    // 9. Sản phẩm sắp hết hàng (tồn kho dưới 10)
    let lowStockProducts = [];
    if (isSysAdmin) {
      const [rows] = await pool.query('SELECT id, product_name, stock_quantity FROM products WHERE stock_quantity <= 10 ORDER BY stock_quantity ASC LIMIT 10');
      lowStockProducts = rows;
    } else {
      const [rows] = await pool.query('SELECT id, product_name, stock_quantity FROM products WHERE store_id = ? AND stock_quantity <= 10 ORDER BY stock_quantity ASC LIMIT 10', [storeId]);
      lowStockProducts = rows;
    }

    return res.status(200).json({
      revenue: parseFloat(totalRevenue),
      orders: totalOrders,
      products: totalProducts,
      customers: totalCustomers,
      orderStatusStats: statusStats,
      topSellingProducts: topProducts,
      revenueByCategory: categoryStats,
      recentOrders: recentOrders,
      lowStockProducts: lowStockProducts
    });
  } catch (error) {
    console.error('Lấy thông tin dashboard lỗi:', error);
    return res.status(500).json({ message: 'Không thể tính toán dữ liệu Dashboard.', error: error.message });
  }
});

// ----------------------------------------------------
// 6.4 API GIỎ HÀNG SERVER-SIDE (CART API)
// ----------------------------------------------------

// Lấy danh sách sản phẩm trong giỏ hàng của user
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await pool.query(
      `SELECT c.id, c.product_id, c.quantity, p.product_name, p.price, p.image_url, p.stock_quantity, cat.category_name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN categories cat ON p.category_id = cat.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    return res.status(200).json(cartItems);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải giỏ hàng.', error: error.message });
  }
});

// Thêm sản phẩm vào giỏ hàng
app.post('/api/cart', authenticateToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id) {
    return res.status(400).json({ message: 'product_id là bắt buộc.' });
  }
  const qty = parseInt(quantity || 1);

  try {
    const [productCheck] = await pool.query('SELECT stock_quantity FROM products WHERE id = ?', [product_id]);
    if (productCheck.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    const [existing] = await pool.query('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);

    if (existing.length > 0) {
      const newQty = existing[0].quantity + qty;
      if (newQty > productCheck[0].stock_quantity) {
        return res.status(400).json({ message: `Vượt quá số lượng tồn kho (Còn lại: ${productCheck[0].stock_quantity})` });
      }
      await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
      return res.status(200).json({ message: 'Cập nhật số lượng giỏ hàng thành công!' });
    } else {
      if (qty > productCheck[0].stock_quantity) {
        return res.status(400).json({ message: `Vượt quá số lượng tồn kho (Còn lại: ${productCheck[0].stock_quantity})` });
      }
      await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, qty]);
      return res.status(201).json({ message: 'Thêm vào giỏ hàng thành công!' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi thêm sản phẩm vào giỏ hàng.', error: error.message });
  }
});

// Cập nhật số lượng của một mặt hàng trong giỏ
app.put('/api/cart/:id', authenticateToken, async (req, res) => {
  const cartItemId = req.params.id;
  const { quantity } = req.body;

  if (quantity === undefined || parseInt(quantity) <= 0) {
    return res.status(400).json({ message: 'Số lượng phải lớn hơn 0.' });
  }

  try {
    const [cartCheck] = await pool.query('SELECT product_id FROM cart WHERE id = ? AND user_id = ?', [cartItemId, req.user.id]);
    if (cartCheck.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm này trong giỏ hàng.' });
    }

    const productId = cartCheck[0].product_id;
    const [productCheck] = await pool.query('SELECT stock_quantity FROM products WHERE id = ?', [productId]);

    if (parseInt(quantity) > productCheck[0].stock_quantity) {
      return res.status(400).json({ message: `Vượt quá số lượng tồn kho (Còn lại: ${productCheck[0].stock_quantity})` });
    }

    await pool.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [parseInt(quantity), cartItemId, req.user.id]);
    return res.status(200).json({ message: 'Cập nhật số lượng thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi cập nhật giỏ hàng.', error: error.message });
  }
});

// Xóa một mặt hàng khỏi giỏ
app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  const cartItemId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cartItemId, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm này trong giỏ hàng.' });
    }
    return res.status(200).json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xóa sản phẩm khỏi giỏ hàng.', error: error.message });
  }
});

// Xóa sạch giỏ hàng
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    return res.status(200).json({ message: 'Đã xóa sạch giỏ hàng!' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi làm trống giỏ hàng.', error: error.message });
  }
});

// ----------------------------------------------------
// 6.5 API QUẢN LÝ TÀI KHOẢN (USER MANAGEMENT API - ADMIN ONLY)
// ----------------------------------------------------

// Lấy danh sách toàn bộ tài khoản
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.role_name, u.store_id, s.store_name, u.is_active, u.created_at, u.full_name, u.phone, u.hometown
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN stores s ON u.store_id = s.id
       ORDER BY u.id DESC`
    );
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tải danh sách người dùng.', error: error.message });
  }
});

// Admin tạo tài khoản nhân viên / quản lý / chủ cửa hàng mới
// Admin tạo tài khoản nhân viên / quản lý / chủ cửa hàng mới
app.post('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  const { username, password, email, role_id, store_id, full_name, phone, hometown } = req.body;
  if (!username || !password || !email || !role_id) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc để tạo tài khoản.' });
  }

  try {
    const [existing] = await pool.query('SELECT id, username, email FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      if (existing[0].username === username) return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại.' });
      return res.status(409).json({ success: false, message: 'Email đã tồn tại.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await pool.query(
      'INSERT INTO users (username, password, email, role_id, store_id, full_name, phone, hometown, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [username, hashedPassword, email, parseInt(role_id), store_id ? parseInt(store_id) : null, full_name || null, phone || null, hometown || null]
    );

    return res.status(201).json({ success: true, message: 'Tạo tài khoản nhân viên thành công!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi tạo tài khoản.', error: error.message });
  }
});

// Admin cập nhật quyền / thông tin tài khoản / khóa tài khoản
app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { role_id, store_id, is_active, full_name, phone, hometown, email } = req.body;

  try {
    const [check] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại.' });
    }

    await pool.query(
      `UPDATE users 
       SET role_id = COALESCE(?, role_id), store_id = ?, is_active = COALESCE(?, is_active),
           full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), hometown = COALESCE(?, hometown), email = COALESCE(?, email)
       WHERE id = ?`,
      [
        role_id ? parseInt(role_id) : null, 
        store_id ? parseInt(store_id) : null, 
        is_active !== undefined ? parseInt(is_active) : null, 
        full_name !== undefined ? full_name : null,
        phone !== undefined ? phone : null,
        hometown !== undefined ? hometown : null,
        email !== undefined ? email : null,
        userId
      ]
    );

    return res.status(200).json({ success: true, message: 'Cập nhật tài khoản thành công!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật tài khoản.', error: error.message });
  }
});

// Admin xóa tài khoản khỏi hệ thống
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const userId = req.params.id;
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình.' });
  }

  try {
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    return res.status(200).json({ message: 'Xóa tài khoản thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể xóa tài khoản này.', error: error.message });
  }
});

// ----------------------------------------------------
// 6.6 API QUẢN LÝ CỬA HÀNG CHI NHÁNH (STORE MANAGEMENT API)
// ----------------------------------------------------

// API Công khai: Lấy danh sách cửa hàng cho khách hàng xem
app.get('/api/stores', async (req, res) => {
  try {
    const [stores] = await pool.query('SELECT * FROM stores ORDER BY id ASC');
    return res.status(200).json(stores);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tải danh sách cửa hàng.', error: error.message });
  }
});

// Lấy danh sách toàn bộ cửa hàng chi nhánh (cho Admin)
app.get('/api/admin/stores', authenticateToken, isStaff, async (req, res) => {
  try {
    const [stores] = await pool.query('SELECT * FROM stores ORDER BY id DESC');
    return res.status(200).json(stores);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tải danh sách cửa hàng.', error: error.message });
  }
});

// Admin tạo cửa hàng mới
app.post('/api/admin/stores', authenticateToken, isAdmin, async (req, res) => {
  const { store_name, address, phone } = req.body;
  if (!store_name || !address) {
    return res.status(400).json({ message: 'Tên cửa hàng và địa chỉ là bắt buộc.' });
  }

  try {
    await pool.query(
      'INSERT INTO stores (store_name, address, phone, status) VALUES (?, ?, ?, "active")',
      [store_name, address, phone || null]
    );
    return res.status(201).json({ message: 'Tạo cửa hàng mới thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tạo cửa hàng.', error: error.message });
  }
});

// Admin cập nhật thông tin cửa hàng
app.put('/api/admin/stores/:id', authenticateToken, isAdmin, async (req, res) => {
  const storeId = req.params.id;
  const { store_name, address, phone, status } = req.body;

  try {
    const [check] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Cửa hàng không tồn tại.' });
    }

    await pool.query(
      `UPDATE stores 
       SET store_name = COALESCE(?, store_name), address = COALESCE(?, address), phone = COALESCE(?, phone), status = COALESCE(?, status) 
       WHERE id = ?`,
      [store_name || null, address || null, phone || null, status || null, storeId]
    );

    return res.status(200).json({ message: 'Cập nhật cửa hàng thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi cập nhật cửa hàng.', error: error.message });
  }
});

// Admin duyệt / khóa cửa hàng
app.put('/api/admin/stores/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const storeId = req.params.id;
  const { status } = req.body; // 'active', 'suspended', 'pending'

  if (!status || !['active', 'suspended', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái cửa hàng không hợp lệ.' });
  }

  try {
    const [result] = await pool.query('UPDATE stores SET status = ? WHERE id = ?', [status, storeId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cửa hàng không tồn tại.' });
    }
    return res.status(200).json({ message: `Cập nhật trạng thái cửa hàng thành công: ${status}` });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái cửa hàng.', error: error.message });
  }
});

// Admin xóa cửa hàng chi nhánh
app.delete('/api/admin/stores/:id', authenticateToken, isAdmin, async (req, res) => {
  const storeId = req.params.id;
  try {
    await pool.query('DELETE FROM stores WHERE id = ?', [storeId]);
    return res.status(200).json({ message: 'Xóa cửa hàng thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể xóa cửa hàng do có sản phẩm hoặc tài khoản liên quan.', error: error.message });
  }
});

// =========================================================================
// 7. GLOBAL ERROR HANDLER & CHẠY SERVER
// =========================================================================

// Middleware kiểm soát và bắt lỗi toàn cục của ứng dụng Express
app.use((err, req, res, next) => {
  console.error('Lỗi hệ thống tập trung:', err.stack);
  res.status(500).json({
    message: 'Đã xảy ra lỗi không mong muốn trên hệ thống API.',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Server API đang chạy trên: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
