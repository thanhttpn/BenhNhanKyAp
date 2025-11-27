import React, { useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';
import { Box } from '@mui/material';

const SignaturePadComponent = ({ width, height, onInit }) => {
    const canvasRef = useRef(null);
    const signaturePadRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
            
            // Khởi tạo thư viện SignaturePad
            signaturePadRef.current = new SignaturePad(canvas, {
                backgroundColor: 'rgba(0,0,0,0)', // Nền trong suốt quan trọng!
                penColor: 'rgb(0, 0, 139)' // Màu mực xanh đậm
            });

            // Gửi instance ra ngoài để cha có thể gọi hàm clear() hoặc save()
            if (onInit) {
                onInit(signaturePadRef.current);
            }
        }
    }, [width, height]);

    return (
        <Box 
            sx={{ 
                position: 'absolute', // Đè lên trên
                top: 0, 
                left: '50%', // Căn giữa theo cha
                transform: 'translateX(-50%)', // Căn giữa
                zIndex: 10, // Nằm trên PDF
                border: '1px dashed blue', // Viền để biết vùng ký
                cursor: 'crosshair'
            }}
        >
            <canvas ref={canvasRef} />
        </Box>
    );
};

export default SignaturePadComponent;