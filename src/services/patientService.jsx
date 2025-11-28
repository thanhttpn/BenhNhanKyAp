import api from '../api/axiosConfig';

// Hàm gọi API lấy danh sách bệnh nhân
// Có tham số tìm kiếm (mặc định là rỗng)
export const getPatients = async (searchTerm = '') => {
    try {
        // Gọi đến endpoint: /api/BenhNhan?search=...
        // params sẽ tự động được axios chuyển thành ?search=abc
        const response = await api.get('/BenhNhan', {
            params: { search: searchTerm }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bệnh nhân:", error);
        throw error;
    }
};

// Bạn có thể thêm các hàm khác ở đây, ví dụ:
// export const getPatientDetail = (id) => ...