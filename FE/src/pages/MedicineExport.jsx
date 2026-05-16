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
    <div className="w-3/4 bg-white absolute top-20 left-105 h-5/6 rounded-2xl shadow-xl">
      <div className="flex flex-col px-5 pt-1 justify-center text-black text-xs">
        <div className="cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
          <p>Trở về</p>
        </div>
      </div>
      <h1 className="text-black text-center font-bold text-2xl pt-5 pb-3">
        TRUY XUẤT
      </h1>
      <FillTime
        defaultFrom={dateRange.from}
        defaultTo={dateRange.to}
        loading={loading}
        onChange={(range) => {
          setDateRange(range);
          fetchTrace(range.from, range.to);
        }}
      />
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
      {loading ? (
        <p className="text-center text-gray-400 mt-6">Đang tải...</p>
      ) : (
        <>
          <div className="w-2/3 mx-auto">
            <FormMedicine
              fields={fields}
              onChange={(data) => console.log(data)}
              variant="primary"
              readOnly={true}
              initialData={formData}
            />
          </div>
          <div className="w-2/3 h-2/5 m-auto flex flex-col items-center justify-center gap-5 border border-2 border-[#264580]">
            <div className="w-full h-10 bg-[#264580] flex items-center justify-center text-white font-bold gap-5">
              <img src={timeIcon} alt="timeIcon" className="w-6 h-6" />
              <p>{historyTitle}</p>
            </div>
            <div className="overflow-y-auto max-h-65 h-65 w-5/6">
              <Table columns={columns} data={historyRows} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
