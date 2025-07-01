// Danh sách thư mục ảnh (gallery) với cấu trúc team/nhân viên
const GALLERIES = [
  { 
    name: "TOTAL", 
    id: "1_g0buaKQHSJ0ms1RJGyMO6cAaL54uP_e",
    type: "summary" // Tab tổng không có nhân viên
  },
  { 
    name: "CHC", 
    id: "1Su62ORkrXcw5A3dI7jMLd7caCFTR7Xle",
    type: "team",
    employees: [
      { name: "Trần Thị Khanh", id: "1Su62ORkrXcw5A3dI7jMLd7caCFTR7Xle" }, // Tạm dùng ID team
      { name: "Lê Thị Thúy Hồng", id: "1Su62ORkrXcw5A3dI7jMLd7caCFTR7Xle" },
      { name: "Bùi Thị Như Quỳnh", id: "1Su62ORkrXcw5A3dI7jMLd7caCFTR7Xle" },
      { name: "Phạm Thị Thanh Thúy", id: "1Su62ORkrXcw5A3dI7jMLd7caCFTR7Xle" }
    ]
  },
  { 
    name: "REFERRAL", 
    id: "1H0vw2QUitQpZreNwG_xPlfgC5Mgi5C06",
    type: "team",
    employees: [
      { name: "Nguyễn Thị Xuân Trang", id: "1H0vw2QUitQpZreNwG_xPlfgC5Mgi5C06" },
      { name: "Mai Lê Bảo Trâm", id: "1H0vw2QUitQpZreNwG_xPlfgC5Mgi5C06" },
      { name: "Dương Thanh Vương", id: "1H0vw2QUitQpZreNwG_xPlfgC5Mgi5C06" }
    ]
  },
  { 
    name: "PACKAGE", 
    id: "1P4xeL2I2vOBVoKd-OsQ5zMjxt2ob3Mzr",
    type: "team",
    employees: [
      { name: "Ngô Thị Lan Anh", id: "1P4xeL2I2vOBVoKd-OsQ5zMjxt2ob3Mzr" },
      { name: "Nguyễn Thị Diễm Trúc", id: "1P4xeL2I2vOBVoKd-OsQ5zMjxt2ob3Mzr" }
    ]
  },
  { 
    name: "PHI", 
    id: "16laL6gC-FQ9h_sluaqampRB9DucBJ67C",
    type: "team",
    employees: [
      { name: "Trần Thị Phương Phi", id: "16laL6gC-FQ9h_sluaqampRB9DucBJ67C" }
    ]
  },
  { 
    name: "DIGITAL", 
    id: "11oO4ziuGCLe3v0u2FS6w2Pe09ihO8XfA",
    type: "team",
    employees: [
      { name: "Nguyễn Đình Quốc", id: "11oO4ziuGCLe3v0u2FS6w2Pe09ihO8XfA" }
    ]
  }
];

// ID file Google Sheet chứa user
const USER_SHEET_ID = '1TrFiuWnxOqh7UjxRRIEaF6DFRRutdNdO-OxBRGC9Oho';
// GID của sheet user (dạng số, không phải tên sheet)
const USER_SHEET_GID = 1993677578;

// Lấy sheet bằng gid (không phụ thuộc tên sheet)
function getSheetByGid(ss, gid) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() == gid) return sheets[i];
  }
  throw new Error('Không tìm thấy sheet với gid=' + gid);
}

// Đăng nhập: kiểm tra user trong sheet
function login(username, password) {
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  const sheet = getSheetByGid(ss, USER_SHEET_GID);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().trim().toLowerCase());

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const user = {};
    headers.forEach((h, idx) => user[h] = row[idx] ? row[idx].toString().trim() : "");
    if (
      user['ten dang nhap'] === username &&
      user['mat khau'] === password
    ) {
      // Lưu trạng thái đăng nhập cho user (theo username)
      const cache = CacheService.getUserCache();
      cache.put('loggedIn', '1', 60 * 30); // 30 phút
      cache.put('currentUser', JSON.stringify(user), 60 * 30);
      return {
        success: true,
        html: HtmlService.createTemplateFromFile('Index').evaluate().getContent(),
        user: {
          tenNhanVien: user['ten nhan vien'],
          phanQuyen: user['phan quyen'],
          hinhAnh: user['hinh anh'],
          team: user['team'],
          email: user['mail hoan my'] // Thêm email
        }
      };
    }
  }
  return { success: false, message: 'Sai tài khoản hoặc mật khẩu.' };
}

// Kiểm tra đã đăng nhập chưa
function isLoggedIn() {
  return !!CacheService.getUserCache().get('loggedIn');
}

// Lấy thông tin user hiện tại (nếu đăng nhập)
function getCurrentUser() {
  const data = CacheService.getUserCache().get('currentUser');
  return data ? JSON.parse(data) : null;
}

// Đăng xuất (cập nhật để clear remember me nếu cần)
function logout() {
  const cache = CacheService.getUserCache();
  cache.remove('loggedIn');
  cache.remove('currentUser');
  
  // Không xóa remember me data khi logout thông thường
  // Chỉ xóa khi user bỏ tick remember me
  
  return { 
    success: true, 
    html: HtmlService.createTemplateFromFile('Login').evaluate().getContent() 
  };
}

// Function để clear remember me (có thể gọi từ UI nếu cần)
function clearRememberMe() {
  // Chỉ để tham khảo, localStorage được handle ở client-side
  return { success: true };
}

// Apps Script doGet
function doGet() {
  let template;
  if (isLoggedIn()) {
    template = HtmlService.createTemplateFromFile('Index');
  } else {
    template = HtmlService.createTemplateFromFile('Login');
  }
  return template
    .evaluate()
    .setTitle("Biểu đồ từ Google Drive")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Hàm include (nhúng file html/css/js)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Trả về danh sách gallery (tên + id + employees)
function getGalleryList() {
  if (!isLoggedIn()) return [];
  return GALLERIES.map(g => ({
    name: g.name,
    id: g.id,
    type: g.type,
    employees: g.employees || []
  }));
}

// Lấy ảnh từ folderId truyền vào
function getImages(folderId) {
  if (!isLoggedIn()) return [];
  if (!folderId) folderId = GALLERIES[0].id; // default: TOTAL
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  let arr = [];
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType().startsWith('image/')) {
      const blob = file.getBlob();
      const base64 = Utilities.base64Encode(blob.getBytes());
      const mimeType = blob.getContentType();
      const url = `data:${mimeType};base64,${base64}`;
      arr.push({
        name: file.getName(),
        url: url
      });
    }
  }
  arr.sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }));
  return arr.map(item => item.url);
}

// Đổi mật khẩu
function changePassword(oldPassword, newPassword) {
  const userCache = CacheService.getUserCache();
  const currentUserJson = userCache.get('currentUser');
  if (!currentUserJson) return {success: false, message: "Bạn chưa đăng nhập!"};
  const currentUser = JSON.parse(currentUserJson);

  // Đọc Sheet user
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  const sheet = getSheetByGid(ss, USER_SHEET_GID);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().trim().toLowerCase());

  // Tìm dòng user hiện tại
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const user = {};
    headers.forEach((h, idx) => user[h] = row[idx] ? row[idx].toString().trim() : "");
    if (
      user['ten dang nhap'] === currentUser['ten dang nhap']
    ) {
      // Kiểm tra mật khẩu cũ
      if (user['mat khau'] !== oldPassword) {
        return {success: false, message: "Mật khẩu cũ không đúng!"};
      }
      // Cập nhật mật khẩu mới
      const passwordIdx = headers.indexOf('mat khau');
      sheet.getRange(i+1, passwordIdx+1).setValue(newPassword);
      return {success: true};
    }
  }
  return {success: false, message: "Không tìm thấy tài khoản!"};
}

// Đổi avatar (url hình ảnh)
function changeAvatar(newAvatarUrl) {
  const userCache = CacheService.getUserCache();
  const currentUserJson = userCache.get('currentUser');
  if (!currentUserJson) return {success: false, message: "Bạn chưa đăng nhập!"};
  const currentUser = JSON.parse(currentUserJson);

  // Đọc Sheet user
  const ss = SpreadsheetApp.openById(USER_SHEET_ID);
  const sheet = getSheetByGid(ss, USER_SHEET_GID);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().trim().toLowerCase());

  // Tìm dòng user hiện tại
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const user = {};
    headers.forEach((h, idx) => user[h] = row[idx] ? row[idx].toString().trim() : "");
    if (
      user['ten dang nhap'] === currentUser['ten dang nhap']
    ) {
      // Cập nhật url ảnh mới
      const avatarIdx = headers.indexOf('hinh anh');
      sheet.getRange(i+1, avatarIdx+1).setValue(newAvatarUrl);
      // Cập nhật lại cache
      user['hinh anh'] = newAvatarUrl;
      userCache.put('currentUser', JSON.stringify(user), 60 * 30);
      return {success: true};
    }
  }
  return {success: false, message: "Không tìm thấy tài khoản!"};
}