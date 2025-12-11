export default function authHeader() {
  const userStr = localStorage.getItem('user');
  console.log("1. Raw LocalStorage 'user':", userStr); // Xem chuỗi thô

  if (!userStr) {
    console.log("=> Không tìm thấy key 'user' trong LocalStorage!");
    return {};
  }

  try {
    const user = JSON.parse(userStr);
    console.log("2. Parsed User Object:", user); // Xem object sau khi parse

    // Kiểm tra cả 2 trường hợp tên biến phổ biến
    const token = user.token || user.accessToken;
    console.log("3. Token tìm thấy:", token);

    if (token) {
      console.log("=> OK! Đang gửi Header Authorization...");
      return { Authorization: 'Bearer ' + token };
    } else {
      console.log("=> Lỗi: Object user có tồn tại nhưng không có trường 'token' hoặc 'accessToken'");
      return {};
    }
  } catch (e) {
    console.error("=> Lỗi JSON Parse:", e);
    return {};
  }
}