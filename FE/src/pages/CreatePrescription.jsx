import { useNavigate } from "react-router-dom";
import FormPrescription from "../components/FormPrescription";
import { createPrescription } from "../services/prescriptionService";
import { getProfile } from "../services/profileService";
import { useState, useEffect } from "react";

export default function CreatePrescription() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [startTime, setStartTime] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setDoctorName(profile.fullname ?? profile.username ?? "");
        setStartTime(new Date().toLocaleString("vi-VN"));
      } catch {
        setStartTime(new Date().toLocaleString("vi-VN"));
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async ({ studentCode, diagnosis, note, medicines }) => {
    setError("");
    try {
      await createPrescription({
        studentCode,
        diagnosis,
        note,
        medicalStaff: doctorName,
        details: medicines.map((m) => ({
          medicineId: m.id,
          quantity: Number(m.quantity),
        })),
      });
      navigate("/prescription");
    } catch (err) {
      setError(err.message || "Tạo đơn thuốc thất bại.");
    }
  };

  return (
    <>
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
      <FormPrescription
        mode="create"
        initialData={{ doctorName, startTime }}
        onSave={handleSave}
        onBack={() => navigate("/prescription")}
      />
    </>
  );
}
