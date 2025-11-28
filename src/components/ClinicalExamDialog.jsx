import React, { useState, useEffect, useMemo } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Grid, FormControlLabel, Checkbox, 
    Typography, Divider, InputAdornment, MenuItem, Box, Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const mockHistory = [
    {
        Lan: 1,
        ThoiGian: '2023-10-25T08:30:00',
        Mach: '80', NhietDo: '37', HuyetApThap: '120/80', SPO2: '98',
        KhamToanThan: 'Bệnh nhân tỉnh, tiếp xúc tốt',
        Tim: 'Tim đều', Phoi: 'Phổi trong', Bung: 'Mềm', Khac: '',
        TheoDoiGayMeHoiSuc: false,
        MaDieuDuong: 101, TenDieuDuong: 'Nguyễn Y Tá A'
    },
    {
        Lan: 2,
        ThoiGian: '2023-10-26T09:00:00',
        Mach: '82', NhietDo: '37.5', HuyetApThap: '125/85', SPO2: '97',
        KhamToanThan: 'Bệnh nhân hơi mệt',
        Tim: 'Tim đều', Phoi: 'Có ran nổ nhẹ', Bung: 'Mềm', Khac: '',
        TheoDoiGayMeHoiSuc: true,
        MaDieuDuong: 102, TenDieuDuong: 'Trần Y Tá B'
    }
];

const ClinicalExamDialog = ({ open, onClose, patient, onSave }) => {
    const { user } = useAuth(); // Lấy thông tin người dùng đang đăng nhập
    // 1. Xác định lần khám tiếp theo (Mặc định là Max + 1)
    const nextLan = mockHistory.length > 0 ? Math.max(...mockHistory.map(h => h.Lan)) + 1 : 1;
    // State quản lý lần khám đang chọn
    const [selectedLan, setSelectedLan] = useState(nextLan);
    // State form dữ liệu
    const [formData, setFormData] = useState({
        CanNang: '', ChieuCao: '', NhietDo: '', Mach: '', 
        HuyetApThap: '', SPO2: '', KhamNhipTho: '',
        KhamToanThan: '', Tim: '', Phoi: '', Bung: '', Khac: '',
        TheoDoiGayMeHoiSuc: false,
        Lan: nextLan,
        ThoiGian: new Date().toISOString().slice(0, 16) // Định dạng cho input datetime-local
    });

    // Reset và load dữ liệu khi mở dialog hoặc đổi patient
    useEffect(() => {
        if (open) {
            // Mặc định chọn lần khám mới nhất
            setSelectedLan(nextLan);
            loadDataForLan(nextLan);
        }
    }, [open, patient, nextLan]);
    // Hàm xử lý khi người dùng đổi "Lần khám"
    const handleLanChange = (e) => {
        const lan = parseInt(e.target.value);
        setSelectedLan(lan);
        loadDataForLan(lan);
    };
    // Logic nạp dữ liệu vào form
    const loadDataForLan = (lan) => {
        // Tìm xem lần này có trong lịch sử không
        const historyData = mockHistory.find(h => h.Lan === lan);

        if (historyData) {
            // A. Nếu chọn LẦN CŨ: Load y nguyên dữ liệu cũ để xem/sửa
            setFormData({
                ...historyData,
                ThoiGian: historyData.ThoiGian.slice(0, 16) // Cắt giây để vừa input
            });
        } else {
            // B. Nếu chọn LẦN MỚI (Lần tiếp theo):
            // Lấy dữ liệu của lần gần nhất (nếu có) để điền sẵn (Copy)
            const lastExam = mockHistory[mockHistory.length - 1];
            
            if (lastExam) {
                setFormData({
                    ...lastExam, // Copy toàn bộ
                    Lan: lan, // Ghi đè số lần mới
                    ThoiGian: new Date().toISOString().slice(0, 16), // Thời gian hiện tại
                    // Có thể reset một số trường sinh hiệu nếu muốn bắt buộc đo lại
                    // Mach: '', NhietDo: '' ... (Tùy nghiệp vụ của bạn)
                });
            } else {
                // Chưa có lịch sử nào -> Form trắng
                setFormData({
                    CanNang: '', ChieuCao: '', NhietDo: '', Mach: '', 
                    HuyetApThap: '', SPO2: '', KhamNhipTho: '',
                    KhamToanThan: '', Tim: '', Phoi: '', Bung: '', Khac: '',
                    TheoDoiGayMeHoiSuc: false,
                    Lan: lan,
                    ThoiGian: new Date().toISOString().slice(0, 16)
                });
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = () => {
        const dataToSave = {
            ...formData,
            MaBenhAn: patient?.code,
            MaDieuDuong: user?.profile?.maNV || 0, 
            TenDieuDuong: user?.profile?.tenNhanVien || '',
            // Lưu ý: Nếu đang sửa lần cũ thì giữ nguyên ID cũ (nếu có)
        };
        onSave(dataToSave);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#e3f2fd', color: '#1565c0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    Khám Nội - BN: <strong>{patient?.name}</strong> ({patient?.code})
                </Box>
                {/* Hiển thị trạng thái */}
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
                {/* --- KHU VỰC CHỌN LẦN KHÁM & THỜI GIAN --- */}
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
                            {/* Render danh sách các lần khám cũ */}
                            {mockHistory.map((h) => (
                                <MenuItem key={h.Lan} value={h.Lan}>
                                    Lần {h.Lan} (Cũ)
                                </MenuItem>
                            ))}
                            {/* Render lần khám mới tiếp theo */}
                            <MenuItem value={nextLan} sx={{ fontWeight: 'bold', color: 'green' }}>
                                Lần {nextLan} (Mới - Tạo tiếp)
                            </MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            label="Thời gian khám"
                            type="datetime-local"
                            name="ThoiGian"
                            value={formData.ThoiGian}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    {/* Thông báo nhỏ nếu đang copy dữ liệu */}
                    {selectedLan === nextLan && mockHistory.length > 0 && (
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ py: 0 }}>
                                Dữ liệu đã được sao chép từ lần khám gần nhất (Lần {mockHistory.length}). Vui lòng cập nhật các chỉ số mới.
                            </Alert>
                        </Grid>
                    )}
                </Grid>

                <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                    I. Sinh hiệu
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                        <TextField 
                            label="Mạch" name="Mach" fullWidth size="small"
                            value={formData.Mach} onChange={handleChange}
                            InputProps={{ endAdornment: <InputAdornment position="end">l/p</InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField 
                            label="Nhiệt độ" name="NhietDo" fullWidth size="small"
                            value={formData.NhietDo} onChange={handleChange}
                            InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField 
                            label="Huyết áp" name="HuyetApThap" fullWidth size="small"
                            value={formData.HuyetApThap} onChange={handleChange}
                            placeholder="120/80"
                            InputProps={{ endAdornment: <InputAdornment position="end">mmHg</InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField 
                            label="Nhịp thở" name="KhamNhipTho" fullWidth size="small"
                            value={formData.KhamNhipTho} onChange={handleChange}
                            InputProps={{ endAdornment: <InputAdornment position="end">l/p</InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField 
                            label="SPO2" name="SPO2" fullWidth size="small"
                            value={formData.SPO2} onChange={handleChange}
                            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField 
                            label="Cân nặng" name="CanNang" fullWidth size="small"
                            value={formData.CanNang} onChange={handleChange}
                            InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField 
                            label="Chiều cao" name="ChieuCao" fullWidth size="small"
                            value={formData.ChieuCao} onChange={handleChange}
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
                            label="Khám toàn thân" name="KhamToanThan" fullWidth multiline rows={2}
                            value={formData.KhamToanThan} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Tim" name="Tim" fullWidth multiline rows={2}
                            value={formData.Tim} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Phổi" name="Phoi" fullWidth multiline rows={2}
                            value={formData.Phoi} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Bụng" name="Bung" fullWidth multiline rows={2}
                            value={formData.Bung} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Khác" name="Khac" fullWidth multiline rows={2}
                            value={formData.Khac} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={formData.TheoDoiGayMeHoiSuc} 
                                    onChange={handleChange} 
                                    name="TheoDoiGayMeHoiSuc" 
                                />
                            }
                            label="Theo dõi gây mê hồi sức"
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Đóng</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    // Chỉ cho phép lưu nếu đang ở chế độ tạo mới hoặc sửa
                    // Bạn có thể thêm logic disable nếu muốn chặn sửa lịch sử cũ
                >
                    {selectedLan === nextLan ? 'Lưu Lần Khám Mới' : 'Cập Nhật Lần Khám Cũ'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClinicalExamDialog;