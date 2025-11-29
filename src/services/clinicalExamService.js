import api from '../api/axiosConfig';

// 1. Lấy lịch sử khám của bệnh nhân
export const getClinicalExamHistory = async (maBenhAn) => {
    try {
        const response = await api.get(`/BenhNhan/LamSangKhamNoi/${maBenhAn}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi lấy lịch sử khám:", error);
        throw error;
    }
};

// 2. Lưu (Thêm mới hoặc Cập nhật)
export const saveClinicalExam = async (data) => {
    try {
        const response = await api.post('/BenhNhan/LamSangKhamNoi/Save', data);
        return response.data;
    } catch (error) {
        console.error("Lỗi lưu khám nội:", error);
        throw error;
    }
};

// 3. Xóa lần khám
export const deleteClinicalExam = async (maBenhAn, lan) => {
    try {
        const response = await api.delete('/BenhNhan/LamSangKhamNoi/Delete', {
            params: { MaBenhAn: maBenhAn, Lan: lan }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi xóa khám nội:", error);
        throw error;
    }
};