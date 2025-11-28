import React, { useState, useEffect } from 'react'; // <-- Import useState
import { useAuth } from '../context/AuthContext';
import { 
    AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, CardActions, Box, Avatar, TextField, InputAdornment,CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SearchIcon from '@mui/icons-material/Search'; 
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

import SignatureDialog from './SignatureDialog';
import ClinicalExamDialog from './ClinicalExamDialog';
import { getPatients } from '../services/patientService';

const mockPatients = [
    { id: 1, name: 'Nguyễn Văn A', dob: '1990-01-01', code: 'BN001', status: 'Chờ ký' },
    { id: 2, name: 'Trần Thị B', dob: '1985-05-12', code: 'BN002', status: 'Đã ký' },
    { id: 3, name: 'Lê Văn C', dob: '2000-11-20', code: 'BN003', status: 'Chờ ký' },
    { id: 4, name: 'Phạm Thị D', dob: '1998-02-28', code: 'BN004', status: 'Chờ ký' },
    { id: 5, name: 'Hoàng Văn E', dob: '1995-10-10', code: 'BN005', status: 'Chờ ký' },
];

const Dashboard = () => {
    const { user, logout } = useAuth();

    const [patients, setPatients] = useState([]); // Danh sách bệnh nhân thật
    const [isLoadingData, setIsLoadingData] = useState(false); // Trạng thái đang tải
    
    // State để quản lý việc mở Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [openExamDialog, setOpenExamDialog] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Link PDF mẫu (Sau này lấy từ API)
    const samplePdfUrl = '/test.pdf';

    useEffect(() => {
        // Hàm lấy dữ liệu
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                // Gọi service lấy danh sách (kèm từ khóa tìm kiếm)
                const data = await getPatients(searchTerm);
                console.info(data.length);
                setPatients(data);
            } catch (error) {
                // Có thể hiện thông báo lỗi nếu cần
            } finally {
                setIsLoadingData(false);
            }
        };

        // Kỹ thuật Debounce: Đợi 500ms sau khi người dùng ngừng gõ mới gọi API
        // Giúp tránh việc gọi API liên tục mỗi khi gõ 1 ký tự
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 500);

        // Cleanup: Nếu người dùng gõ tiếp trong khi chưa hết 500ms, hủy lệnh gọi cũ
        return () => clearTimeout(delayDebounceFn);

    }, [searchTerm]); // Chạy lại mỗi khi searchTerm thay đổi

    const handleOpenSign = (patient) => {
        setSelectedPatient(patient);
        setOpenDialog(true);
    };

    const handleCloseSign = () => {
        setOpenDialog(false);
        setSelectedPatient(null);
    };

    //-- End ký số

    // --- Logic cho Khám Nội
    const handleOpenExam = (patient) => {
        setSelectedPatient(patient);
        setOpenExamDialog(true);
    };

    const handleCloseExam = () => {
        setOpenExamDialog(false);
        setSelectedPatient(null); // Reset nếu muốn, hoặc giữ để tránh null khi animation đóng
    };

    const handleSaveExamData = (data) => {
        console.log("Dữ liệu khám nội nhận được:", data);
        alert("Đã lưu kết quả khám nội thành công!");
    };
    // -- End Khám Nội
    // 2. Logic lọc danh sách: Tìm theo Tên hoặc Mã BN (không phân biệt hoa thường)
    const filteredPatients = mockPatients.filter((patient) => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <PersonIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Xin chào, {user?.profile?.tenNhanVien || 'Nhân viên'}
                    </Typography>
                    <Button color="inherit" onClick={logout} startIcon={<ExitToAppIcon />}>
                        Đăng xuất
                    </Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                        Danh sách bệnh nhân
                    </Typography>

                    {/* 3. Ô tìm kiếm */}
                    <TextField
                        label="Tìm tên hoặc mã BN..."
                        variant="outlined"
                        size="small"
                        sx={{ width: { xs: '100%', md: '300px' }, bgcolor: 'white' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Hiển thị Loading hoặc Danh sách */}
                {isLoadingData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {patients.length > 0 ? (
                            patients.map((patient) => (
                                // Sử dụng patient.maBenhNhan làm key vì nó là unique
                                <Grid item xs={12} sm={6} md={4} key={patient.maBenhNhan}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                {/* Đổi màu Avatar dựa trên trạng thái */}
                                                <Avatar sx={{ 
                                                    bgcolor: patient.trangThai === 'Đã ký' ? 'green' : 
                                                             patient.trangThai === 'Đã khám' ? 'blue' : 'orange', 
                                                    mr: 2 
                                                }}>
                                                    {patient.hoTen ? patient.hoTen.charAt(0) : '?'}
                                                </Avatar>
                                                <Typography variant="h6">{patient.hoTen}</Typography>
                                            </Box>
                                            
                                            {/* HIỂN THỊ DỮ LIỆU TỪ API */}
                                            <Typography color="text.secondary">Mã BN: <strong>{patient.maBenhNhan}</strong></Typography>
                                            <Typography color="text.secondary">Năm sinh: {patient.namSinh} ({patient.tuoi} tuổi)</Typography>
                                            <Typography color="text.secondary">Giới tính: {patient.gioiTinh}</Typography>
                                            <Typography color="text.secondary">BHYT: {patient.soTheBHYT || 'Không'}</Typography>
                                            
                                            <Typography sx={{ 
                                                mt: 1, 
                                                color: patient.trangThai === 'Đã ký' ? 'green' : 'orange', 
                                                fontWeight: 'bold' 
                                            }}>
                                                Trạng thái: {patient.trangThai}
                                            </Typography>
                                        </CardContent>
                                        
                                        <CardActions sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                fullWidth
                                                startIcon={<MedicalServicesIcon />}
                                                onClick={() => handleOpenExam(patient)}
                                            >
                                                Khám nội
                                            </Button>

                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                fullWidth
                                                onClick={() => handleOpenSign(patient)}
                                            >
                                                Xem hồ sơ & Ký
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
                                <Typography variant="h6" color="text.secondary">
                                    Không tìm thấy bệnh nhân nào.
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                )}
            </Container>

            {/* Dialog Ký Tên */}
            <SignatureDialog 
                open={openDialog} 
                onClose={handleCloseSign} 
                patientName={selectedPatient?.name}
                pdfUrl={samplePdfUrl} // Truyền URL PDF vào
            />
            {/* Dialog Khám Nội*/}
            <ClinicalExamDialog 
                open={openExamDialog}
                onClose={handleCloseExam}
                patient={selectedPatient}
                onSave={handleSaveExamData}
            />
        </Box>
    );
};

export default Dashboard;