import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Giữ nguyên cách import worker này vì nó đã hoạt động tốt với Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const PDFViewer = ({ pdfUrl, onLoadSuccess }) => {
    const canvasRef = useRef(null);
    
    // Tách riêng 2 biến tham chiếu để quản lý
    const loadingTaskRef = useRef(null); // Quản lý việc tải file PDF (getDocument)
    const renderTaskRef = useRef(null);  // Quản lý việc vẽ trang lên canvas (page.render)

    useEffect(() => {
        const renderPdf = async () => {
            try {
                // 1. Hủy các tác vụ cũ nếu đang chạy
                if (renderTaskRef.current) {
                    try { renderTaskRef.current.cancel(); } catch (e) {}
                }
                if (loadingTaskRef.current) {
                    try { loadingTaskRef.current.destroy(); } catch (e) {}
                }

                console.log("Đang tải PDF từ:", pdfUrl);
                
                // 2. Bắt đầu tải Document
                const loadingTask = pdfjsLib.getDocument(pdfUrl);
                loadingTaskRef.current = loadingTask; // Lưu vào ref để hủy nếu cần
                
                const pdf = await loadingTask.promise;
                console.log("PDF tải xong. Số trang:", pdf.numPages);

                // 3. Lấy trang 1
                const page = await pdf.getPage(1);
                
                // Tính toán viewport (Scale 1.5)
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                
                // 4. Bắt đầu vẽ (Render)
                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask; // Lưu vào ref để hủy nếu cần
                
                await renderTask.promise;
                console.log("Render trang 1 thành công!");

                // Báo ra ngoài kích thước thật
                if (onLoadSuccess) {
                    onLoadSuccess({ width: viewport.width, height: viewport.height });
                }

            } catch (error) {
                // Bỏ qua lỗi nếu do ta chủ động hủy (khi đóng dialog hoặc đổi file)
                if (error.name === 'RenderingCancelledException') {
                    console.log('Render bị hủy do user thao tác.');
                    return;
                }
                console.error('Lỗi tải/vẽ PDF:', error);
            }
        };

        if (pdfUrl) {
            renderPdf();
        }

        // Cleanup function: Chạy khi component bị đóng (Unmount)
        return () => {
            // Hủy vẽ trang
            if (renderTaskRef.current) {
                try { renderTaskRef.current.cancel(); } catch (e) {}
            }
            // Hủy tải file
            if (loadingTaskRef.current) {
                try { loadingTaskRef.current.destroy(); } catch (e) {}
            }
        };
    }, [pdfUrl]);

    return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto', border: '1px solid #ccc' }} />;
};

export default PDFViewer;