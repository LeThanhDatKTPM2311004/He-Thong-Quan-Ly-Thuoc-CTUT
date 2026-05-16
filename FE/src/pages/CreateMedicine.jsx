import FormMedicine from "../components/FormMedicine";
import Button from "../components/Button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createMedicine } from "../services/medicineService";

export default function CreateMedicine() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fields = [
    { name: "tenThuoc", label: "Tên thuốc:", width: "full" },
    { name: "soLuong", label: "Số lượng:", width: "half", type: "number" },
    { name: "donViTinh", label: "Đơn vị tính:", width: "half" },
    { name: "hanSuDung", label: "Hạn sử dụng:", width: "full", type: "date" },
  ];

  const handleSubmit = async () => {
    setError("");

    // Validate
    if (!formData.tenThuoc?.trim()) {
      setError("Vui lòng nhập tên thuốc.");
      return;
    }
    if (!formData.soLuong || Number(formData.soLuong) <= 0) {
      setError("Vui lòng nhập số lượng hợp lệ.");
      return;
    }
    if (!formData.donViTinh?.trim()) {
      setError("Vui lòng nhập đơn vị tính.");
      return;
    }
    if (!formData.hanSuDung) {
      setError("Vui lòng nhập hạn sử dụng.");
      return;
    }

    setLoading(true);
    try {
      await createMedicine({
        name: formData.tenThuoc.trim(),
        unit: formData.donViTinh.trim(),
        quantity: Number(formData.soLuong),
        expiryDate: formData.hanSuDung, // "YYYY-MM-DD"
      });
      navigate("/medicine");
    } catch (err) {
      setError(err.message || "Thêm thuốc thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-2/3 bg-white absolute top-20 left-125 h-1/2 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-10">
      <h1 className="text-black text-center font-bold text-2xl pt-5 pb-3 w-full">
        THÊM THUỐC MỚI
      </h1>
      <div className="w-2/3 mx-auto">
        <FormMedicine
          fields={fields}
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
          className="bg-[#951010] hover:bg-red-600 w-30 h-10"
          onClick={() => navigate("/medicine")}
          disabled={loading}
        >
          HỦY BỎ
        </Button>
        <Button
          className="bg-[#268037] hover:bg-green-600 w-30 h-10 flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
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
  );
}
