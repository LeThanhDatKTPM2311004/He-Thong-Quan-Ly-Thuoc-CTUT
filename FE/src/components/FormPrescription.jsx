import Button from "./Button";
import add from "../assets/images/add.png";
import FormListMedicine from "./FormListMedicine";
import FormChoseMedicine from "./FormChoseMedicine";
import { useState, useEffect } from "react";
import { getMedicines } from "../services/medicineService";
import { getStudentByCode } from "../services/studentService";

export default function FormPrescription({
  mode = "create",
  status = null,
  initialData = {},
  onBack = () => {},
  onSave = () => {},
}) {
  const [showChoose, setShowChoose] = useState(false);
  const [medicines, setMedicines] = useState(initialData.medicines || []);
  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState([]);

  // Controlled form fields
  const [studentId, setStudentId] = useState(initialData.studentId || "");
  const [classCode, setClassCode] = useState(initialData.classCode || "");
  const [fullname, setFullname] = useState(initialData.fullname || "");
  const [insurance, setInsurance] = useState(initialData.insurance || "");
  const [diagnosis, setDiagnosis] = useState(initialData.diagnosis || "");
  const [notes, setNotes] = useState(initialData.notes || "");

  // Validation errors (batch)
  const [errors, setErrors] = useState({});

  // Lỗi MSSV từ API
  const [studentError, setStudentError] = useState("");

  // Xác định các trạng thái hiển thị
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const canEdit = isEditMode && status === "pending";
  const isReadOnly = isViewMode || (isEditMode && !isEditing);

  const showAddButton = isCreateMode || isEditing;
  const showRemoveButton = isCreateMode || isEditing;
  const showCreateButton = isCreateMode;
  const showEditButton = canEdit && !isEditing;
  const showSaveButton = isEditing;

  // Medicines list từ API (cho FormChoseMedicine)
  const [medicineList, setMedicineList] = useState([]);
  useEffect(() => {
    getMedicines({ page: 0, size: 100 })
      .then((res) =>
        setMedicineList(
          res.content.map((m) => ({ id: m.id, name: m.name, unit: m.unit })),
        ),
      )
      .catch(() => {});
  }, []);

  // Realtime auto-fill thông tin sinh viên theo MSSV (debounce 400ms)
  useEffect(() => {
    if (isReadOnly) return;
    if (!studentId.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const res = await getStudentByCode(studentId.trim());
        if (res) {
          setFullname(res.fullName ?? "");
          setClassCode(res.classCode ?? "");
          setInsurance(res.insuranceCode ?? "");
          setStudentError("");
          setErrors((prev) => ({ ...prev, studentId: "" }));
        }
      } catch (err) {
        setFullname("");
        setClassCode("");
        setInsurance("");
        const apiMessage = err?.response?.data?.message;
        setStudentError(apiMessage || "Sinh viên không tồn tại.");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [studentId, isReadOnly]);

  const validate = () => {
    const newErrors = {};

    if (!studentId.trim()) {
      newErrors.studentId = "Vui lòng nhập mã số sinh viên.";
    } else if (studentError) {
      newErrors.studentId = studentError;
    }

    if (!diagnosis.trim()) {
      newErrors.diagnosis = "Vui lòng nhập chẩn đoán.";
    }

    if (medicines.length === 0) {
      newErrors.medicines = "Vui lòng thêm ít nhất một loại thuốc.";
    } else if (
      medicines.some(
        (med) =>
          med.quantity === "" ||
          med.quantity === null ||
          Number(med.quantity) < 1,
      )
    ) {
      newErrors.medicines =
        "Vui lòng nhập số lượng hợp lệ cho tất cả thuốc (tối thiểu 1).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmMedicine = (selected) => {
    const newMedicines = selected.map((med) => ({ ...med, quantity: 1 }));
    setMedicines((prev) => [...prev, ...newMedicines]);
    setErrors((prev) => ({ ...prev, medicines: "" }));
    setShowChoose(false);
  };

  const updateQuantity = (id, quantity) => {
    const value = quantity === "" ? "" : Math.max(1, Number(quantity));
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, quantity: value } : med)),
    );
  };

  const handleEdit = () => {
    setSnapshot(medicines);
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    if (!validate()) return;
    onSave({ studentCode: studentId, diagnosis, note: notes, medicines });
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ studentCode: studentId, diagnosis, note: notes, medicines });
  };

  const handleCancel = () => {
    if (isEditing) {
      setMedicines(snapshot);
      setIsEditing(false);
    } else {
      onBack();
    }
  };

  const getCancelButtonText = () => {
    if (isEditing) return "HỦY SỬA";
    if (isViewMode || isEditMode) return "QUAY LẠI";
    return "HỦY TẠO ĐƠN";
  };

  const inputClass = (readOnly) =>
    `peer focus:shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)] w-full h-12 rounded-sm bg-[linear-gradient(90deg,#F7F7F7_80.29%,#98BBFF_100%)] px-3 pt-5 text-sm outline-none font-bold ${
      readOnly ? "cursor-not-allowed opacity-75" : ""
    }`;

  const labelClass =
    "absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none transition-all duration-200 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-gray-500 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-gray-500";

  return (
    <>
      <div className="w-3/4 bg-white absolute top-18 left-105 h-[90%] rounded-2xl shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between py-2 px-5">
          <div className="flex flex-col justify-center">
            <h2 className="text-sm font-bold text-[#264580]">
              Cán bộ y tế: {initialData.doctorName || "Lê Thành Đạt"}
            </h2>
            <p className="text-xs italic">
              Ca trực : {initialData.shift || "sáng 12/01/2026"}
            </p>
          </div>
          <p className="text-xs italic">
            Thời gian bắt đầu kê đơn:{" "}
            {initialData.startTime || "14:15 | 12/01/2005"}
          </p>
        </div>
        <h1 className="text-center pt-5 font-bold text-2xl pb-3">
          PHIẾU KÊ ĐƠN THUỐC
        </h1>
        <form
          className="flex flex-col items-center justify-center gap-3"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between gap-10 w-9/10 px-18">
            <div className="w-[55%] bg-[#F7F7F7] rounded-sm p-10 flex flex-col items-center justify-center gap-5 shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)]">
              <h2 className="font-bold text-sm">👤 THÔNG TIN BỆNH NHÂN</h2>
              <div className="flex items-center justify-between gap-10 pb-6">
                <div className="relative shadow-sm w-full">
                  <input
                    type="text"
                    id="fullname"
                    placeholder=" "
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    disabled={isReadOnly}
                    className={inputClass(isReadOnly)}
                  />
                  <label htmlFor="fullname" className={labelClass}>
                    HỌ VÀ TÊN
                  </label>
                </div>
                <div className="relative shadow-sm w-full">
                  <input
                    type="text"
                    id="studentId"
                    placeholder=" "
                    value={studentId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStudentId(val);
                      setErrors((prev) => ({ ...prev, studentId: "" }));
                      if (!val.trim()) {
                        setFullname("");
                        setClassCode("");
                        setInsurance("");
                        setStudentError("");
                      }
                    }}
                    disabled={isReadOnly}
                    className={`${inputClass(isReadOnly)} ${
                      errors.studentId ? "border border-red-400" : ""
                    }`}
                  />
                  <label htmlFor="studentId" className={labelClass}>
                    MÃ SỐ SINH VIÊN
                  </label>
                  {errors.studentId && (
                    <p className="absolute left-0 -bottom-5 text-red-500 text-[10px] whitespace-nowrap">
                      {errors.studentId}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-10">
                <div className="relative shadow-sm w-full">
                  <input
                    type="text"
                    id="classCode"
                    placeholder=" "
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    disabled={isReadOnly}
                    className={inputClass(isReadOnly)}
                  />
                  <label htmlFor="classCode" className={labelClass}>
                    MÃ LỚP
                  </label>
                </div>
                <div className="relative shadow-sm w-full">
                  <input
                    type="text"
                    id="insurance"
                    placeholder=" "
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    disabled={isReadOnly}
                    className={inputClass(isReadOnly)}
                  />
                  <label htmlFor="insurance" className={labelClass}>
                    MÃ SỐ BẢO HIỂM Y TẾ
                  </label>
                </div>
              </div>
            </div>
            <div className="w-[40%] bg-[#F7F7F7] rounded-sm p-10 flex flex-col items-center justify-center gap-5 shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)]">
              <h2 className="font-bold text-sm">🩺 CHẨN ĐOÁN</h2>
              <div className="relative shadow-sm w-full">
                <input
                  type="text"
                  id="finalDiagnosis"
                  placeholder=" "
                  value={diagnosis}
                  onChange={(e) => {
                    setDiagnosis(e.target.value);
                    setErrors((prev) => ({ ...prev, diagnosis: "" }));
                  }}
                  disabled={isReadOnly}
                  className={`${inputClass(isReadOnly)} ${
                    errors.diagnosis ? "border border-red-400" : ""
                  }`}
                />
                <label htmlFor="finalDiagnosis" className={labelClass}>
                  KẾT LUẬN CHUẨN ĐOÁN
                </label>
              </div>
              {errors.diagnosis && (
                <p className="text-red-500 text-xs w-full">
                  {errors.diagnosis}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-5 w-8/10 min-h-50 bg-[#F7F7F7] rounded-sm shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)] p-5">
            <h2 className="font-bold text-sm">💊 ĐƠN THUỐC</h2>
            {showAddButton && (
              <Button
                type="button"
                className="bg-[#264580] h-6 text-xs flex justify-self-end items-center text-white font-bold"
                onClick={() => setShowChoose(true)}
              >
                <img src={add} alt="Add Icon" className="w-3 h-3 mr-1" />
                Thêm thuốc
              </Button>
            )}
            {medicines.length > 0 && (
              <div className="w-full flex flex-col gap-3">
                {medicines.map((med) => (
                  <FormListMedicine
                    key={med.id}
                    medicine={med}
                    onQuantityChange={updateQuantity}
                    onRemove={(id) =>
                      setMedicines((prev) => prev.filter((m) => m.id !== id))
                    }
                    showRemoveButton={showRemoveButton}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            )}
            {errors.medicines && (
              <p className="text-red-500 text-xs">{errors.medicines}</p>
            )}
          </div>
          <div className="flex flex-col items-center justify-center gap-3 w-8/10 h-40 px-20 bg-[#F7F7F7] rounded-sm p-10 shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)]">
            <h2 className="font-bold text-sm">📝 GHI CHÚ VÀ LỜI DẶN</h2>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isReadOnly}
              className={`outline-none bg-white w-4/5 h-15 ${
                isReadOnly ? "cursor-not-allowed opacity-75" : ""
              }`}
            />
          </div>

          <div className="flex items-center justify-center gap-50 pt-5 pb-10">
            <Button
              type="button"
              className="bg-[#D21013] w-50 h-10 text-sm font-bold text-white shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)]"
              onClick={handleCancel}
            >
              {getCancelButtonText()}
            </Button>

            {showCreateButton && (
              <Button
                type="submit"
                className="bg-[#14B319] w-50 h-10 text-sm font-bold text-white shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)]"
              >
                TẠO ĐƠN THUỐC
              </Button>
            )}

            {showEditButton && (
              <Button
                type="button"
                className="bg-[#FFA500] w-50 h-10 text-sm font-bold text-white shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)]"
                onClick={handleEdit}
              >
                SỬA ĐƠN THUỐC
              </Button>
            )}

            {showSaveButton && (
              <Button
                type="button"
                className="bg-[#14B319] w-50 h-10 text-sm font-bold text-white shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)]"
                onClick={handleSaveChanges}
              >
                LƯU THAY ĐỔI
              </Button>
            )}
          </div>
        </form>
      </div>

      {showChoose && (
        <div className="fixed inset-0 left-100 bg-opacity-50 flex items-center justify-center z-50">
          <FormChoseMedicine
            data={medicineList}
            selectedMedicines={medicines}
            onCancel={() => setShowChoose(false)}
            onConfirm={handleConfirmMedicine}
          />
        </div>
      )}
    </>
  );
}
