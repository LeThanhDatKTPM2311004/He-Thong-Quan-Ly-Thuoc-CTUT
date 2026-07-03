import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackIcon from "../assets/svg/BackIcon.jsx";
import FillTime from "../components/FillTime.jsx";
import FormMedicine from "../components/FormMedicine.jsx";
import Table from "../components/Table/Table.jsx";
import timeIcon from "../assets/images/timeIcon.png";
import { traceMedicine } from "../services/medicineService";

export default function MedicineExport() {
  const location = useLocation();
  const navigate = useNavigate();

  const medicineId = location.state?.medicineId;

  const getDefaultRange = () => {
    const now = new Date();
    const from = `${now.getFullYear()}-01-01`;
    const to = now.toISOString().split("T")[0]; // YYYY-MM-DD hôm nay
    return { from, to };
  };

  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState(getDefaultRange);

  const fields = [
    { name: "tenThuoc", label: "Tên thuốc:", width: "full" },
    { name: "tonCuoi", label: "Tồn cuối:", width: "half" },
    { name: "donViTinh", label: "Đơn vị tính:", width: "half" },
    { name: "tongNhap", label: "Tổng nhập:", width: "half" },
    { name: "tongXuat", label: "Tổng xuất:", width: "half" },
  ];

  const columns = [
    { key: "time", label: "Thời gian", align: "left" },
    { key: "quantity", label: "Số lượng", align: "left" },
    { key: "unit", label: "Đơn vị tính", align: "left" },
    { key: "status", label: "Trạng thái", align: "center" },
  ];

  const fetchTrace = async (from = "", to = "") => {
    if (!medicineId) return;
    setLoading(true);
    setError("");
    try {
      const res = await traceMedicine(medicineId, { from, to });
      setTraceData(res);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu truy xuất.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { from, to } = getDefaultRange();
    fetchTrace(from, to);
  }, [medicineId]);

  const formData = traceData
    ? {
        tenThuoc: traceData.medicineName ?? "",
        tonCuoi: traceData.remainingQuantity ?? "",
        donViTinh: traceData.unit ?? "",
        tongNhap: traceData.totalImport ?? "",
        tongXuat: traceData.totalExport ?? "",
      }
    : {};

  const mapType = (type = "") => {
    const t = type.toLowerCase();
    if (t === "import" || t === "nhập" || t === "imp") return "imp";
    if (t === "export" || t === "xuất" || t === "exp") return "exp";
    return t;
  };
  const historyRows = (traceData?.histories ?? []).map((h, i) => ({
    id: i,
    time: h.createdAt ? new Date(h.createdAt).toLocaleString("vi-VN") : "",
    quantity: h.quantity,
    unit: h.unit,
    status: mapType(h.type),
  }));

  const historyTitle =
    dateRange.from && dateRange.to
      ? `Lịch Sử Nhập Xuất Từ ${dateRange.from} Đến ${dateRange.to}`
      : "Lịch Sử Nhập Xuất";

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

        <h1 className="text-black text-center font-bold text-2xl pt-3 pb-3 flex-shrink-0">
          TRUY XUẤT
        </h1>

        <div className="flex-shrink-0 px-8">
          <FillTime
            defaultFrom={dateRange.from}
            defaultTo={dateRange.to}
            loading={loading}
            onChange={(range) => {
              setDateRange(range);
              fetchTrace(range.from, range.to);
            }}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        {loading ? (
          <p className="text-center text-gray-400 mt-6">Đang tải...</p>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col gap-4 px-8 py-4">
            {/* Form thông tin thuốc — Medicine info form */}
            <div className="w-2/3 mx-auto">
              <FormMedicine
                fields={fields}
                onChange={(data) => console.log(data)}
                variant="primary"
                readOnly={true}
                initialData={formData}
              />
            </div>

            {/* Bảng lịch sử nhập xuất — Import/export history table */}
            <div className="w-2/3 mx-auto flex flex-col border-2 border-[#264580] rounded overflow-hidden">
              <div className="w-full h-10 bg-[#264580] flex items-center justify-center text-white font-bold gap-5 flex-shrink-0">
                <img src={timeIcon} alt="timeIcon" className="w-6 h-6" />
                <p>{historyTitle}</p>
              </div>
              <div className="overflow-y-auto flex-1 max-h-64 p-4">
                <Table columns={columns} data={historyRows} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
