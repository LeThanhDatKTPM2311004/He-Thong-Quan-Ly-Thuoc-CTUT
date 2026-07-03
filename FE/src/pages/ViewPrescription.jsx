import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormPrescription from "../components/FormPrescription.jsx";
import {
  getPrescriptionByCode,
  updatePrescription,
} from "../services/prescriptionService";

export default function ViewPrescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const prescriptionCode = location.state?.prescriptionCode;

  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapStatus = (s = "") => {
    if (s === "Chờ thuốc") return "pending";
    if (s === "Đã cấp thuốc") return "dispensed";
    if (s === "Đã hoàn thuốc") return "completed";
    return s;
  };

  useEffect(() => {
    if (!prescriptionCode) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getPrescriptionByCode(prescriptionCode);
        setPrescriptionData(res);
      } catch (err) {
        setError(err.message || "Không thể tải đơn thuốc.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [prescriptionCode]);

  const handleSave = async ({ studentCode, diagnosis, note, medicines }) => {
    setError("");
    try {
      await updatePrescription(prescriptionCode, {
        studentCode,
        diagnosis,
        note,
        details: medicines.map((m) => ({
          medicineId: m.id,
          quantity: Number(m.quantity),
        })),
      });
      navigate("/prescription");
    } catch (err) {
      setError(err.message || "Cập nhật đơn thuốc thất bại.");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-20">Đang tải đơn thuốc...</p>
    );
  }

  if (!prescriptionData) return null;

  const initialData = {
    doctorName: prescriptionData.medicalStaff ?? "", // ← dùng medicalStaff
    shift: prescriptionData.shift ?? "",
    startTime: prescriptionData.createdAt
      ? new Date(prescriptionData.createdAt).toLocaleString("vi-VN")
      : "",
    fullname: prescriptionData.fullName ?? "",
    studentId: prescriptionData.studentCode ?? "",
    classCode: prescriptionData.classCode ?? "",
    insurance: prescriptionData.insuranceCode ?? "",
    diagnosis: prescriptionData.diagnosis ?? "",
    notes: prescriptionData.note ?? "",
    medicines: (prescriptionData.details ?? []).map((d) => ({
      id: d.medicineId,
      name: d.medicineName,
      unit: d.unit,
      quantity: d.quantity,
    })),
  };

  return (
    <>
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
      <FormPrescription
        key={prescriptionCode}
        mode="edit"
        status={mapStatus(prescriptionData.status)}
        initialData={initialData}
        onSave={handleSave}
        onBack={() => navigate("/prescription")}
      />
    </>
  );
}
