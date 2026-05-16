import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackIcon from "../assets/svg/BackIcon.jsx";
import FillTime from "../components/FillTime.jsx";
import Title from "../components/Title.jsx";
import excelIcon from "../assets/images/excelIcon.png";
import pdfIcon from "../assets/images/pdfIcon.png";
import Button from "../components/Button.jsx";
import {
  exportMedicinePdf,
  exportMedicineExcel,
} from "../services/medicineService";

const getDefaultRange = () => {
  const now = new Date();
  const from = `${now.getFullYear()}-01-01`;
  const to = now.toISOString().split("T")[0];
  return { from, to };
};

export default function MedicineReport() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(getDefaultRange);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [hasFiltered, setHasFiltered] = useState(false); // ← chỉ hiện sau khi người dùng chọn filter
  const [loading, setLoading] = useState({
    pdf: false,
    excel: false,
    preview: false,
  });
  const [error, setError] = useState("");

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

  const handlePreview = async (range = dateRange) => {
    setError("");
    setLoading((prev) => ({ ...prev, preview: true }));
    setPdfPreviewUrl(null);
    try {
      const blob = await exportMedicinePdf(range);
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      setError(err.message || "Xem trước thất bại.");
    } finally {
      setLoading((prev) => ({ ...prev, preview: false }));
    }
  };

  return (
    <div className="w-3/4 bg-white absolute top-20 left-105 h-5/6 rounded-2xl shadow-xl overflow-y-auto">
      <div className="flex flex-col px-5 pt-1 justify-center text-black text-xs">
        <div className="cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
          <p>Trở về</p>
        </div>
      </div>
      <Title
        title="XUẤT BÁO CÁO"
        subtitle="DANH SÁCH THUỐC"
        wrapperClass="text-center mb-5"
        titleClass="text-3xl font-bold"
        subtitleClass="text-xs"
      />
      <FillTime
        defaultFrom={dateRange.from}
        defaultTo={dateRange.to}
        onChange={(range) => {
          setDateRange(range);
          setHasFiltered(true);
          handlePreview(range); // ← tự động load preview luôn
        }}
      />

      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}

      {/* Chỉ hiện preview + nút xuất sau khi người dùng thao tác filter */}
      {hasFiltered && (
        <div className="relative mt-4">
          <div className="relative mx-auto w-160 mb-5">
            {loading.preview ? (
              <div className="w-full h-96 flex items-center justify-center text-gray-400 text-sm">
                Đang tải xem trước...
              </div>
            ) : pdfPreviewUrl ? (
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-96 rounded border border-gray-200"
                title="PDF Preview"
              />
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-20 w-1/2 mx-auto pb-6">
            <Button
              onClick={handleExportExcel}
              disabled={loading.excel}
              className="w-30 h-10 bg-gradient-to-r from-white to-[#1E6D41] shadow-[inset_0_1px_0.75px_0_rgba(255,255,255,0.07),_0_4px_4px_0_rgba(0,0,0,0.25),_0_4px_4px_0_rgba(0,0,0,0.25),_0_9.965px_9.675px_0_rgba(15,15,15,0.25)] flex items-center justify-center text-white font-bold gap-2"
            >
              <img src={excelIcon} alt="" />
              {loading.excel ? "..." : "EXCEL"}
            </Button>
            <Button
              onClick={handleExportPdf}
              disabled={loading.pdf}
              className="w-30 h-10 bg-gradient-to-r from-white to-[#9E0C1B] shadow-[inset_0_1px_0.75px_0_rgba(255,255,255,0.07),_0_4px_4px_0_rgba(0,0,0,0.25),_0_4px_4px_0_rgba(0,0,0,0.25),_0_9.965px_9.675px_0_rgba(15,15,15,0.25)] flex items-center justify-center text-white font-bold gap-2"
            >
              <img src={pdfIcon} alt="" />
              {loading.pdf ? "..." : "PDF"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
