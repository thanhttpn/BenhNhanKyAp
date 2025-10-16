import React, { useState } from 'react';
import PDFViewer from './components/PDFViewer';
import SignaturePadComponent from './components/SignaturePad';
import './App.css'; // Chúng ta sẽ thêm CSS ở bước sau

function App() {
  const [signature, setSignature] = useState(null);
  // Thay thế bằng URL PDF của bạn hoặc dùng file mẫu
  const samplePdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

  const handleSaveSignature = (data) => {
    setSignature(data);
  };

  return (
    <div className="app-container">
      <h1>Hệ thống Ký tên Bệnh nhân</h1>

      <div className="document-container">
        <PDFViewer pdfUrl={samplePdfUrl} />
        <SignaturePadComponent onSave={handleSaveSignature} />
      </div>

      {signature && (
        <div className="signature-result">
          <h2>Chữ ký đã lưu:</h2>
          <img src={signature} alt="Chữ ký" style={{ border: '1px solid black' }} />
        </div>
      )}
    </div>
  );
}

export default App;