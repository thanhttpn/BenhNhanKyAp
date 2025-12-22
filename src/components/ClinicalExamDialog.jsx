import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Grid, FormControlLabel, Checkbox, 
    Typography, Divider, InputAdornment, MenuItem, Box, Alert, CircularProgress, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Icon xóa
import { useAuth } from '../context/AuthContext';
// Import Service vừa tạo
import { getClinicalExamHistory, saveClinicalExam, deleteClinicalExam } from '../services/clinicalExamService';

// Hàm tiện ích: Lấy giờ hiện tại Việt Nam định dạng YYYY-MM-DDTHH:mm
const getCurrentDateTimeVN = () => {
    const now = new Date();
    // Dùng locale Thụy Điển (sv-SE) vì nó có định dạng giống ISO (YYYY-MM-DD hh:mm)
    // Ép múi giờ về Việt Nam
    const vnTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
    // Kết quả sv-SE là "2023-10-25 14:30", ta cần thay khoảng trắng bằng "T"
    return vnTime.replace(' ', 'T').slice(0, 16);
};

const ClinicalExamDialog = ({ open, onClose, patient, onSaveSuccess }) => {
    const { user } = useAuth();
    
    // --- STATE ---
    const [historyList, setHistoryList] = useState([]); // Danh sách lịch sử từ API
    const [isLoading, setIsLoading] = useState(false);  // Trạng thái đang tải
    const [errorMsg, setErrorMsg] = useState('');       // Thông báo lỗi
    const [successMsg, setSuccessMsg] = useState('');   // Thông báo thành công

    // Xác định lần khám tiếp theo (Max + 1)
    const nextLan = historyList.length > 0 
        ? Math.max(...historyList.map(h => h.lan)) + 1 
        : 1;

    const [selectedLan, setSelectedLan] = useState(1);

    // Form dữ liệu (Khớp với Class C#)
    const [formData, setFormData] = useState({
        maBenhAn: '',
        lan: 1,
        canNang: '', chieuCao: '', nhietDo: '', mach: '', 
        huyetApThap: '', spO2: '', khamNhipTho: '',
        khamToanThan: '', tim: '', phoi: '', bung: '', khac: '',
        theoDoiGayMeHoiSuc: false,
        thoiGian: new Date().toISOString().slice(0, 16),
        maDieuDuong: 0, tenDieuDuong: ''
    });

    // --- EFFECT: LOAD DỮ LIỆU KHI MỞ DIALOG ---
    useEffect(() => {
        if (open && patient?.maBenhAn) {
            fetchHistory(patient.maBenhAn);
        } else {
            // Reset khi đóng
            setHistoryList([]);
            setErrorMsg('');
            setSuccessMsg('');
        }
    }, [open, patient]);

    // Hàm gọi API lấy lịch sử
    const fetchHistory = async (maBenhAn) => {
        setIsLoading(true);
        try {
            const data = await getClinicalExamHistory(maBenhAn);
            // Sắp xếp tăng dần theo Lần để dễ xử lý
            const sortedData = data.sort((a, b) => a.lan - b.lan);
            setHistoryList(sortedData);
            
            // Tính toán lần tiếp theo sau khi có dữ liệu
            const maxLan = sortedData.length > 0 ? sortedData[sortedData.length - 1].lan : 0;
            const newLan = maxLan + 1;
            
            // Mặc định chọn lần mới nhất (Tạo mới)
            setSelectedLan(newLan);
            
            // Nạp dữ liệu cho lần mới (Auto-fill từ lần cuối)
            fillDataForLan(newLan, sortedData);

        } catch (err) {
            setErrorMsg("Không thể tải lịch sử khám.");
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý logic điền dữ liệu vào Form
    const fillDataForLan = (lan, list = historyList) => {
        // 1. Tìm xem lần này có trong lịch sử không (Chế độ Xem/Sửa)
        const existingExam = list.find(h => h.lan === lan);

        if (existingExam) {
            setFormData({
                ...existingExam,
                // Chuyển đổi ngày giờ để hiện đúng trên input datetime-local
                thoiGian: existingExam.thoiGian ? existingExam.thoiGian.slice(0, 16) : ''
            });
        } else {
            // 2. Chế độ Tạo Mới (Lấy dữ liệu lần cuối để copy)
            const lastExam = list[list.length - 1];
            
            if (lastExam) {
                setFormData({
                    ...lastExam, // Copy tất cả
                    maBenhAn: patient?.maBenhAn,
                    lan: lan,    // Set lần mới
                    thoiGian: getCurrentDateTimeVN(), // Giờ hiện tại
                    // Reset thông tin điều dưỡng thành người đang đăng nhập
                    maDieuDuong: user?.profile?.maNV || 0,
                    tenDieuDuong: user?.profile?.tenNhanVien || ''
                });
            } else {
                // Chưa có lịch sử nào -> Form trắng
                setFormData({
                    maBenhAn: patient?.maBenhAn,
                    lan: lan,
                    canNang: patient?.canNang, chieuCao: patient?.chieuCao, nhietDo: '', mach: '', 
                    huyetApThap: '', spO2: '', khamNhipTho: '',
                    khamToanThan: '', tim: '', phoi: '', bung: '', khac: '',
                    theoDoiGayMeHoiSuc: false,
                    thoiGian: getCurrentDateTimeVN(),
                    maDieuDuong: user?.profile?.maNV || 0,
                    tenDieuDuong: user?.profile?.tenNhanVien || ''
                });
            }
        }
    };

    const handleLanChange = (e) => {
        const lan = parseInt(e.target.value);
        setSelectedLan(lan);
        fillDataForLan(lan);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // --- LƯU DỮ LIỆU ---
    const handleSubmit = async () => {
        try {
            // Chuẩn bị dữ liệu gửi đi
            const dataToSave = {
                ...formData,
                maBenhAn: patient?.maBenhAn,
                // Đảm bảo thông tin người sửa/tạo là người đang đăng nhập
                maDieuDuong: user?.profile?.maNV || 0,
                tenDieuDuong: user?.profile?.tenNhanVien || ''
            };

            await saveClinicalExam(dataToSave);
            
            setSuccessMsg("Lưu dữ liệu thành công!");
            setErrorMsg('');
            
            // Load lại lịch sử để cập nhật danh sách
            fetchHistory(patient.maBenhAn);
            
            // Gọi callback để báo dashboard biết (nếu cần)
            if (onSaveSuccess) onSaveSuccess();

        } catch (err) {
            setErrorMsg("Lỗi khi lưu dữ liệu.");
        }
    };

    // --- XÓA DỮ LIỆU ---
    const handleDelete = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phiếu khám Lần ${selectedLan}?`)) return;

        try {
            await deleteClinicalExam(patient.maBenhAn, selectedLan);
            setSuccessMsg(`Đã xóa lần khám ${selectedLan}.`);
            // Load lại
            fetchHistory(patient.maBenhAn);
        } catch (err) {
            setErrorMsg("Không thể xóa (hoặc lỗi server).");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#e3f2fd', color: '#1565c0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    Khám Nội - BN: <strong>{patient?.hoTen}</strong> ({patient?.maBenhAn})
                </Box>
                {/* Badge trạng thái */}
                {selectedLan === nextLan ? (
                    <Box sx={{ fontSize: '0.8rem', bgcolor: '#4caf50', color: 'white', px: 1, borderRadius: 1 }}>
                        Tạo mới lần {nextLan}
                    </Box>
                ) : (
                    <Box sx={{ fontSize: '0.8rem', bgcolor: '#ff9800', color: 'white', px: 1, borderRadius: 1 }}>
                        Xem lại lần {selectedLan}
                    </Box>
                )}
            </DialogTitle>
            
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Thông báo lỗi/thành công */}
                        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
                        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

                        {/* --- CHỌN LẦN KHÁM & THỜI GIAN --- */}
                        <Grid container spacing={2} sx={{ mb: 3, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    label="Chọn lần khám"
                                    value={selectedLan}
                                    onChange={handleLanChange}
                                    fullWidth
                                    size="small"
                                >
                                    {historyList.map((h) => (
                                        <MenuItem key={h.lan} value={h.lan}>
                                            Lần {h.lan} (Cũ - {new Date(h.thoiGian).toLocaleDateString()})
                                        </MenuItem>
                                    ))}
                                    <MenuItem value={nextLan} sx={{ fontWeight: 'bold', color: 'green' }}>
                                        Lần {nextLan} (Mới - Tạo tiếp)
                                    </MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Thời gian khám"
                                    type="datetime-local"
                                    name="thoiGian"
                                    value={formData.thoiGian}
                                    onChange={handleChange}
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            {/* Nút Xóa chỉ hiện khi đang xem Lần Cũ */}
                            <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                {selectedLan !== nextLan && (
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        startIcon={<DeleteIcon />} 
                                        onClick={handleDelete}
                                        fullWidth
                                    >
                                        Xóa
                                    </Button>
                                )}
                            </Grid>

                            {selectedLan === nextLan && historyList.length > 0 && (
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ py: 0 }}>
                                        Dữ liệu đã được sao chép từ lần khám trước.
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>

                        {/* --- FORM NHẬP LIỆU (Giữ nguyên logic cũ, chỉ đổi tên biến camelCase) --- */}
                        <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                            I. Sinh hiệu
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} sm={3}>
                                <TextField 
                                    label="Mạch" name="mach" fullWidth size="small"
                                    value={formData.mach || ''} onChange={handleChange}
                                    InputProps={{ endAdornment: <InputAdornment position="end">l/p</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField 
                                    label="Nhiệt độ" name="nhietDo" fullWidth size="small"
                                    value={formData.nhietDo || ''} onChange={handleChange}
                                    InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField 
                                    label="Huyết áp" name="huyetApThap" fullWidth size="small"
                                    value={formData.huyetApThap || ''} onChange={handleChange}
                                    InputProps={{ endAdornment: <InputAdornment position="end">mmHg</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField 
                                    label="Nhịp thở" name="khamNhipTho" fullWidth size="small"
                                    value={formData.khamNhipTho || ''} onChange={handleChange}
                                    InputProps={{ endAdornment: <InputAdornment position="end">l/p</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField 
                                    label="SPO2" name="spO2" fullWidth size="small"
                                    value={formData.spO2 || ''} onChange={handleChange}
                                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                />
                            </Grid>
                             <Grid item xs={6} sm={3}>
                                <TextField 
                                    label="Cân nặng" name="canNang" fullWidth size="small"
                                    value={formData.canNang || ''} onChange={handleChange}
                                    InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField 
                                    label="Chiều cao" name="chieuCao" fullWidth size="small"
                                    value={formData.chieuCao || ''} onChange={handleChange}
                                    InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                            II. Khám lâm sàng
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField 
                                    label="Khám toàn thân" name="khamToanThan" fullWidth multiline rows={2}
                                    value={formData.khamToanThan || ''} onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Tim" name="tim" fullWidth multiline rows={2}
                                    value={formData.tim || ''} onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Phổi" name="phoi" fullWidth multiline rows={2}
                                    value={formData.phoi || ''} onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Bụng" name="bung" fullWidth multiline rows={2}
                                    value={formData.bung || ''} onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    label="Khác" name="khac" fullWidth multiline rows={2}
                                    value={formData.khac || ''} onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={formData.theoDoiGayMeHoiSuc || false} 
                                            onChange={handleChange} 
                                            name="theoDoiGayMeHoiSuc" 
                                        />
                                    }
                                    label="Theo dõi gây mê hồi sức"
                                />
                            </Grid>
                        </Grid>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Đóng</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={isLoading}
                >
                    {selectedLan === nextLan ? 'Lưu Lần Khám Mới' : 'Cập Nhật Lần Khám Cũ'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClinicalExamDialog;