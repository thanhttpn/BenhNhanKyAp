import React, { useState, useRef } from 'react';
import { 
    Dialog, AppBar, Toolbar, IconButton, Typography, Button, Box, Slide 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PDFViewer from './PDFViewer';
import SignaturePadComponent from './SignaturePad';

// Hiệu ứng trượt lên khi mở Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SignatureDialog = ({ open, onClose, patientName, pdfUrl }) => {
    const [pdfSize, setPdfSize] = useState({ width: 0, height: 0 });
    const signaturePadRef = useRef(null);

    // Khi PDF load xong, lấy kích thước để set cho khung ký tên
    const handlePdfLoadSuccess = (size) => {
        setPdfSize(size);
    };

    // Lưu reference của SignaturePad để gọi hàm
    const handleSignatureInit = (padInstance) => {
        signaturePadRef.current = padInstance;
    };

    const handleClear = () => {
        signaturePadRef.current?.clear();
    };

    const handleSave = () => {
        if (signaturePadRef.current?.isEmpty()) {
            alert("Vui lòng ký tên trước khi lưu!");
            return;
        }
        const dataUrl = signaturePadRef.current.toDataURL();
        console.log("Ảnh chữ ký (Base64):", dataUrl);
        alert("Đã lấy được dữ liệu chữ ký! Xem console.");
        // Sau này sẽ gọi API gửi dataUrl này về Backend .NET
        onClose();
    };

    return (
        <Dialog 
            fullScreen 
            open={open} 
            onClose={onClose} 
            TransitionComponent={Transition}
        >
            {/* Thanh tiêu đề */}
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Ký hồ sơ: {patientName}
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleClear} startIcon={<DeleteIcon />}>
                        Xóa ký lại
                    </Button>
                    <Button autoFocus color="inherit" onClick={handleSave} startIcon={<SaveIcon />} sx={{ ml: 2 }}>
                        Lưu hồ sơ
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Vùng hiển thị PDF và Chữ ký */}
            <Box sx={{ position: 'relative', overflow: 'auto', bgcolor: '#f0f0f0', height: '100%', p: 2 }}>
                <Box sx={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                    {/* 1. Lớp dưới: PDF */}
                    <PDFViewer pdfUrl={pdfUrl} onLoadSuccess={handlePdfLoadSuccess} />

                    {/* 2. Lớp trên: Vùng ký (Chỉ hiện khi PDF đã có kích thước) */}
                    {pdfSize.width > 0 && (
                        <SignaturePadComponent 
                            width={pdfSize.width} 
                            height={pdfSize.height} 
                            onInit={handleSignatureInit}
                        />
                    )}
                </Box>
            </Box>
        </Dialog>
    );
};

export default SignatureDialog;