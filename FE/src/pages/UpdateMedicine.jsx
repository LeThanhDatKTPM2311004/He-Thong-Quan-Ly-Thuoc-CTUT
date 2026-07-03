import FormMedicine from "../components/FormMedicine";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getBatchById, updateBatch } from "../services/medicineService";

export default function UpdateMedicine() {
  const navigate = useNavigate();
  const location = useLocation();
  // Nhận cả medicineId và batchId từ Medicine.jsx
  const batchId = location.state?._id;
  const medicineId = location.state?.medicineId;

  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fields = [
    { name: "tenThuoc", label: "Tên thuốc:", width: "full", readOnly: true },
    { name: "soLuong", label: "Số lượng:", width: "half", type: "number" },
    { name: "donViTinh", label: "Đơn vị tính:", width: "half", readOnly: true },
    { name: "lothuoc", label: "Lô thuốc:", width: "half", readOnly: true },
    { name: "hanSuDung", label: "Hạn sử dụng:", width: "half", type: "date" },
  ];

  useEffect(() => {
    if (!batchId || !medicineId) {
      navigate("/medicine");
      return;
    }
    const fetchData = async () => {
      try {
        const data = await getBatchById(batchId);
        const batch = data.batches?.[0];
        const prefill = {
          tenThuoc: data.name ?? "",
          soLuong: String(batch?.quantity ?? ""),
          donViTinh: data.unit ?? "",
          lothuoc: batch?.batchNumber ?? "",
          hanSuDung: batch?.expiryDate ?? "",
        };
        setInitialData(prefill);
        setFormData(prefill);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin thuốc.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [batchId, medicineId]);

  const handleSubmit = async () => {
    setError("");

    if (!formData.soLuong || Number(formData.soLuong) <= 0) {
      setError("Vui lòng nhập số lượng hợp lệ.");
      return;
    }
    if (!formData.hanSuDung) {
      setError("Vui lòng nhập hạn sử dụng.");
      return;
    }

    setSubmitting(true);
    try {
      await updateBatch(medicineId, batchId, {
        name: formData.tenThuoc.trim(),
        unit: formData.donViTinh.trim(),
        quantity: Number(formData.soLuong),
        expiryDate: formData.hanSuDung,
      });
      navigate("/medicine");
    } catch (err) {
      setError(err.message || "Cập nhật thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-400">Đang tải...</p>;

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="w-[70%] min-h-[55%] bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-10">
        <h1 className="text-black text-center font-bold text-2xl pt-5 pb-3 w-full">
          CẬP NHẬT THÔNG TIN THUỐC
        </h1>
        <div className="w-2/3 mx-auto">
          <FormMedicine
            fields={fields}
            initialData={initialData}
            onChange={(data) => setFormData(data)}
            variant="primary"
            readOnly={false}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center -mt-5">{error}</p>
        )}

        <div className="flex items-center justify-center gap-16 font-bold text-white">
          <Button
            className="bg-[#951010] hover:bg-red-600 w-40 h-10"
            onClick={() => navigate("/medicine")}
            disabled={submitting}
          >
            HỦY BỎ
          </Button>
          <Button
            className="bg-[#268037] hover:bg-green-600 w-40 h-10 flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              "HOÀN TẤT"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
