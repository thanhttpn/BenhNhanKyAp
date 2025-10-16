import React, { useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';

const SignaturePadComponent = ({ onSave }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Thiết lập kích thước canvas (bạn có thể điều chỉnh sau)
    canvas.width = 800;
    canvas.height = 300;
    signaturePadRef.current = new SignaturePad(canvas);
  }, []);

  const handleClear = () => {
    signaturePadRef.current.clear();
  };

  const handleSave = () => {
    if (signaturePadRef.current.isEmpty()) {
      alert('Vui lòng ký tên trước khi lưu.');
    } else {
      const dataUrl = signaturePadRef.current.toDataURL(); // Lấy chữ ký dưới dạng ảnh PNG
      onSave(dataUrl);
      console.log("Chữ ký đã được lưu:", dataUrl);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 200, left: 100, border: '2px dashed grey' }}>
      <canvas ref={canvasRef}></canvas>
      <div>
        <button onClick={handleClear}>Ký lại</button>
        <button onClick={handleSave}>Xác nhận chữ ký</button>
      </div>
    </div>
  );
};

export default SignaturePadComponent;