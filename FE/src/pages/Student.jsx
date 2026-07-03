import Button from "../components/Button";
import excelIcon from "../assets/images/excelIcon.png";
import Table from "../components/Table/Table";
import LogoCTUT from "../assets/images/LogoCTUT.png";
import CheckIcon from "../assets/svg/CheckIcon";
import { useState, useRef, useEffect } from "react";
import { importStudents, getAllStudents } from "../services/studentService";

// Nhóm danh sách sinh viên theo classCode
function groupByClass(students) {
  const grouped = {};
  (students ?? []).forEach((s) => {
    const key = s.classCode ?? "Không rõ";
    if (!grouped[key]) grouped[key] = { className: key, studentCount: 0 };
    grouped[key].studentCount += 1;
  });
  return Object.values(grouped).map((g, i) => ({ id: i + 1, ...g }));
}

// Component hiển thị trạng thái import
const ImportStatus = ({ status, fileName, onDismiss }) => {
  if (!status) return null;

  const isSuccess = status === "success";

  return (
    <div
      className={`flex items-center gap-4 mt-4 px-6 py-4 rounded-2xl shadow-md transition-all duration-500 ${
        isSuccess
          ? "bg-[#E6F9F1] border border-[#1E6D41]"
          : "bg-[#FEF2F2] border border-red-400"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold ${
          isSuccess ? "bg-[#00C86D]" : "bg-red-500"
        }`}
      >
        {isSuccess ? "✓" : "✕"}
      </div>

      {/* Message */}
      <div className="flex flex-col">
        <p
          className={`font-bold text-sm ${
            isSuccess ? "text-[#1E6D41]" : "text-red-600"
          }`}
        >
          {isSuccess ? "Nhập dữ liệu thành công!" : "Nhập dữ liệu thất bại!"}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[260px]">
          {fileName}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none"
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
  );
};

export default function Account() {
  const [importStatus, setImportStatus] = useState(null); // null | "success" | "failed"
  const [importedFileName, setImportedFileName] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const fileInputRef = useRef(null);

  // Load tất cả sinh viên từ API khi mount
  useEffect(() => {
    setLoadingStudents(true);
    getAllStudents()
      .then((data) => {
        const students = Array.isArray(data) ? data : (data?.data ?? []);
        setClasses(groupByClass(students));
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách sinh viên:", err);
      })
      .finally(() => setLoadingStudents(false));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImportStatus(null);
    setImportedFileName(file.name);

    try {
      await importStudents(file);
      setImportStatus("success");

      // Reload danh sách sinh viên
      const freshStudents = await getAllStudents();
      const students = Array.isArray(freshStudents)
        ? freshStudents
        : (freshStudents?.data ?? []);
      setClasses(groupByClass(students));
    } catch {
      setImportStatus("failed");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const ClassCard = ({ className, studentCount }) => {
    return (
      <div className="flex items-center justify-center gap-5">
        <div className="w-20 h-15 bg-white shadow-2xl rounded-[1.875rem_0_0_0.625rem] flex items-center justify-center mr-[-10px]">
          <p className="text-[#264580] font-bold text-2xl">{studentCount}</p>
        </div>
        <div className="rounded-[0.9375rem] bg-[linear-gradient(270deg,_#2C4B84_24.04%,_#FFF_100%)] shadow-[inset_3px_3px_4px_0_rgba(0,0,0,0.25)] w-70 h-15 flex items-center justify-center gap-5 px-5">
          <img src={LogoCTUT} alt="LogoCTUT" className="w-10 h-10" />
          <p className="font-bold text-xl text-white">{className}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#00C86D] flex items-center justify-center">
          <CheckIcon />
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ padding: "30px" }}
      className="w-full h-9/10 flex flex-col min-h-0"
    >
      <div className="bg-white flex-1 min-h-0 rounded-2xl shadow-xl flex flex-col items-center overflow-y-auto">
        <h1 className="text-black text-center font-bold text-2xl pt-10 pb-3 flex-shrink-0">
          NHẬP DỮ LIỆU SINH VIÊN
        </h1>
        <h2 className="text-center font-bold pt-6">Tải lên file excel</h2>
        <p className="text-center">👇</p>

        {/* Khu vực upload — Upload area */}
        <div className="flex items-center justify-center w-1/2 rounded-2xl border border-dashed border-[#1E6D41] h-30 p-10 bg-white">
          <Button className="rounded-md w-80 h-10 text-sm font-bold text-white bg-[linear-gradient(90deg,_#FFF_0%,_#1E6D41_57.21%)] shadow-[inset_0_1px_0.75px_0_rgba(255,255,255,0.07),_0_4px_4px_0_rgba(0,0,0,0.25)] flex items-center justify-center gap-5">
            <img src={excelIcon} alt="excelIcon" />
            <label htmlFor="import">
              {loading ? "ĐANG NHẬP..." : "NHẬP DỮ LIỆU TỪ FILE EXCEL"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              name="import"
              id="import"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </Button>
        </div>

        <ImportStatus
          status={importStatus}
          fileName={importedFileName}
          onDismiss={() => setImportStatus(null)}
        />

        {/* Danh sách lớp — Class list */}
        <div className="flex items-center justify-center p-10 w-2/3">
          {loadingStudents ? (
            <p className="text-gray-400 text-sm">Đang tải danh sách lớp...</p>
          ) : classes.length === 0 ? (
            <p className="text-gray-400 text-sm">Chưa có dữ liệu sinh viên.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  className={classItem.className}
                  studentCount={classItem.studentCount}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
