import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackIcon from "../assets/svg/BackIcon.jsx";
import Title from "../components/Title.jsx";
import wordicon from "../assets/images/wordicon.png";
import pdfIcon from "../assets/images/pdfIcon.png";
import Button from "../components/Button.jsx";
import {
  exportMedicinePdf,
  exportMedicineExcel,
} from "../services/medicineService";

export default function PrescriptionReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    pdf: false,
    excel: false,
    preview: false,
  });
  const [error, setError] = useState("");

  // TODO: thay bằng state thật khi có filter/API, tạm thời set cứng để hiện khung
  const [dateRange] = useState({ from: "", to: "" });
  const [hasFiltered] = useState(true); // tạm để true cho hiện khung, sau này set theo filter thật
  const [pdfPreviewUrl] = useState(null); // null -> hiện khung trống, sau này gán url PDF từ API

  const handleExportPdf = async () => {
    setError("");
    setLoading((prev) => ({ ...prev, pdf: true }));
    try {
      const blob = await exportMedicinePdf(dateRange);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `danh-sach-thuoc-${dateRange.from}-${dateRange.to}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Xuất PDF thất bại.");
    } finally {
      setLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  const handleExportExcel = async () => {
    setError("");
    setLoading((prev) => ({ ...prev, excel: true }));
    try {
      const blob = await exportMedicineExcel(dateRange);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `danh-sach-thuoc-${dateRange.from}-${dateRange.to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Xuất Excel thất bại.");
    } finally {
      setLoading((prev) => ({ ...prev, excel: false }));
    }
  };

  return (
    /* Wrapper co dãn — Responsive wrapper */
    <div
      style={{ padding: "30px" }}
      className="w-full h-9/10 flex flex-col min-h-0"
    >
      <div className="bg-white flex-1 min-h-0 rounded-2xl shadow-xl flex flex-col overflow-y-auto">
        {/* Nút trở về — Back button */}
        <div
          className="flex flex-col px-5 pt-3 text-black text-xs cursor-pointer flex-shrink-0"
          onClick={() => navigate(-1)}
        >
          <BackIcon />
          <p>Trở về</p>
        </div>

        <Title
          title="IN ĐƠN THUỐC"
          subtitle="DANH SÁCH ĐƠN THUỐC"
          wrapperClass="text-center mb-5 flex-shrink-0"
          titleClass="text-3xl font-bold"
          subtitleClass="text-xs"
        />
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        {/* Chỉ hiện sau khi filter — Show only after filter applied */}
        {hasFiltered && (
          <div className="flex flex-col items-center gap-4 px-8 py-4 flex-1 min-h-0">
            {/* Preview PDF — PDF preview area */}
            <div className="w-full max-w-5xl">
              {loading.preview ? (
                <div className="w-full h-110 flex items-center justify-center text-gray-400 text-sm border border-gray-200 rounded">
                  Đang tải xem trước...
                </div>
              ) : pdfPreviewUrl ? (
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-110 rounded border border-gray-200"
                  title="PDF Preview"
                />
              ) : (
                // Khung trống tạm thời, sau này thay bằng iframe khi có url từ API
                <div className="w-full h-110 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                  Chưa có dữ liệu xem trước
                </div>
              )}
            </div>

            {/* Nút xuất file — Export buttons */}
            <div className="flex items-center justify-center gap-16 pb-6">
              <Button
                onClick={handleExportExcel}
                disabled={loading.excel}
                className="w-30 h-10 bg-gradient-to-r from-white to-[#000080] shadow-[inset_0_1px_0.75px_0_rgba(255,255,255,0.07),_0_4px_4px_0_rgba(0,0,0,0.25)] flex items-center justify-center text-white font-bold gap-2"
              >
                <img src={wordicon} alt="" className="h-8" />
                {loading.word ? "..." : "WORD"}
              </Button>
              <Button
                onClick={handleExportPdf}
                disabled={loading.pdf}
                className="w-30 h-10 bg-gradient-to-r from-white to-[#9E0C1B] shadow-[inset_0_1px_0.75px_0_rgba(255,255,255,0.07),_0_4px_4px_0_rgba(0,0,0,0.25)] flex items-center justify-center text-white font-bold gap-2"
              >
                <img src={pdfIcon} alt="" />
                {loading.pdf ? "..." : "PDF"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}