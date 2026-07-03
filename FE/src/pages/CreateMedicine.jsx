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
    {
      name: "hanSuDung",
      label: "Hạn sử dụng:",
      width: "full",
      type: "date",
      min: new Date(Date.now() + 86400000).toISOString().split("T")[0], // ← ngày mai trở đi
    },
  ];

  const handleSubmit = async () => {
    setError("");

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
    // Kiểm tra hạn sử dụng không được ở quá khứ — Expiry date must be in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(formData.hanSuDung) <= today) {
      setError("Hạn sử dụng phải sau ngày hôm nay.");
      return;
    }

    setLoading(true);
    try {
      await createMedicine({
        name: formData.tenThuoc.trim(),
        unit: formData.donViTinh.trim(),
        quantity: Number(formData.soLuong),
        expiryDate: formData.hanSuDung,
      });
      navigate("/medicine");
    } catch (err) {
      setError(err.message || "Thêm thuốc thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="w-[70%] min-h-[55%] bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-10">
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
            className="bg-[#951010] hover:bg-red-600 w-40 h-10"
            onClick={() => navigate("/medicine")}
            disabled={loading}
          >
            HỦY BỎ
          </Button>
          <Button
            className="bg-[#268037] hover:bg-green-600 w-40 h-10 flex items-center justify-center gap-2"
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
    </div>
  );
}
