export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    // Trả về HTTP Header chứa Bearer Token
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
}