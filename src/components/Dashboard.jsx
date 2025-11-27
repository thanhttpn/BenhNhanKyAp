import React, { useState } from 'react'; // <-- Import useState
import { useAuth } from '../context/AuthContext';
import { 
    AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, CardActions, Box, Avatar, TextField, InputAdornment
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SearchIcon from '@mui/icons-material/Search'; // <-- Import icon tìm kiếm
import SignatureDialog from './SignatureDialog';

const mockPatients = [
    { id: 1, name: 'Nguyễn Văn A', dob: '1990-01-01', code: 'BN001', status: 'Chờ ký' },
    { id: 2, name: 'Trần Thị B', dob: '1985-05-12', code: 'BN002', status: 'Đã ký' },
    { id: 3, name: 'Lê Văn C', dob: '2000-11-20', code: 'BN003', status: 'Chờ ký' },
    { id: 4, name: 'Phạm Thị D', dob: '1998-02-28', code: 'BN004', status: 'Chờ ký' },
    { id: 5, name: 'Hoàng Văn E', dob: '1995-10-10', code: 'BN005', status: 'Chờ ký' },
];

const Dashboard = () => {
    const { user, logout } = useAuth();
    
    // State để quản lý việc mở Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // 1. State lưu từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    // Link PDF mẫu (Sau này lấy từ API)
    const samplePdfUrl = '/test.pdf';

    const handleOpenSign = (patient) => {
        setSelectedPatient(patient);
        setOpenDialog(true);
    };

    const handleCloseSign = () => {
        setOpenDialog(false);
        setSelectedPatient(null);
    };

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

                <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
                    Danh sách bệnh nhân
                </Typography>

                <Grid container spacing={3}>
                    {filteredPatients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: patient.status === 'Đã ký' ? 'green' : 'orange', mr: 2 }}>
                                            {patient.name.charAt(0)}
                                        </Avatar>
                                        <Typography variant="h6">{patient.name}</Typography>
                                    </Box>
                                    <Typography color="text.secondary">Mã BN: <strong>{patient.code}</strong></Typography>
                                    <Typography color="text.secondary">Ngày sinh: {patient.dob}</Typography>
                                    <Typography sx={{ mt: 1, color: patient.status === 'Đã ký' ? 'green' : 'orange', fontWeight: 'bold' }}>
                                        Trạng thái: {patient.status}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ p: 2 }}>
                                    {/* Sửa sự kiện onClick ở đây */}
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
                    ))}
                </Grid>
            </Container>

            {/* Component Dialog được đặt ở đây */}
            <SignatureDialog 
                open={openDialog} 
                onClose={handleCloseSign} 
                patientName={selectedPatient?.name}
                pdfUrl={samplePdfUrl} // Truyền URL PDF vào
            />
        </Box>
    );
};

export default Dashboard;