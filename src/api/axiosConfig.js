import axios from 'axios';

// Tạo một instance của axios
const apiInstance = axios.create({
    // Cấu hình URL cơ sở cho tất cả các request
    // Mọi request dùng instance này sẽ tự động có tiền tố này
    baseURL: 'https://localhost:7033/api' // <-- THAY BẰNG URL BACKEND CỦA BẠN
});

// Thêm một "interceptor" cho request
// Đây là một hàm sẽ chạy TRƯỚC KHI mỗi request được gửi đi
apiInstance.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('authToken');

        // Nếu token tồn tại, đính kèm nó vào header Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config; // Trả về config đã được sửa đổi
    },
    (error) => {
        // Xử lý lỗi nếu có
        return Promise.reject(error);
    }
);

export default apiInstance;