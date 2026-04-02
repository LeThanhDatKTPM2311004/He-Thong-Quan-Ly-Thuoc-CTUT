import Button from "../components/Button";
import excelIcon from "../assets/images/excelIcon.png";
import FillTime from "../components/FillTime";
import Table from "../components/Table/Table";
import LogoCTUT from "../assets/images/LogoCTUT.png";
import CheckIcon from "../assets/svg/CheckIcon";
import { useState, useRef } from "react";
import { importStudents } from "../services/studentService";

const getDefaultRange = () => {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-01-01`,
    to: now.toISOString().split("T")[0],
  };
};

export default function Account() {
  const columns = [
    { key: "time", label: "Thời gian", align: "left" },
    { key: "name", label: "Tên File", align: "left" },
    { key: "status", label: "Trạng thái", align: "left" },
  ];

  const [history, setHistory] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    const now = new Date();
    const timeStr = now.toLocaleString("vi-VN");
    try {
      const data = await importStudents(file);
      setHistory((prev) => [
        { time: timeStr, name: file.name, status: "success", _date: now },
        ...prev,
      ]);
      const grouped = {};
      (data ?? []).forEach((s) => {
        const key = s.classCode ?? "Không rõ";
        if (!grouped[key]) grouped[key] = { className: key, studentCount: 0 };
        grouped[key].studentCount += 1;
      });
      setClasses(Object.values(grouped).map((g, i) => ({ id: i + 1, ...g })));
    } catch (err) {
      setHistory((prev) => [
        { time: timeStr, name: file.name, status: "failed", _date: now },
        ...prev,
      ]);
      setError(err.message || "Import thất bại.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFilterHistory = ({ from, to }) => {
    if (!from && !to) {
      setFilteredHistory(null);
      return;
    }
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to + "T23:59:59") : null;
    setFilteredHistory(
      history.filter((h) => {
        const d = h._date;
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
        return true;
      }),
    );
  };

  const displayHistory = filteredHistory ?? history;

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
    <div className="w-3/4 bg-white absolute top-20 left-105 max-h-5/6  rounded-2xl shadow-xl flex items-center flex-col overflow-y-auto">
      <h1 className="text-black text-center font-bold text-2xl pt-10 pb-3">
        NHẬP DỮ LIỆU SINH VIÊN
      </h1>
      <h2 className="text-center font-bold pt-10">Tải lên file excel</h2>
      <p className="text-center">👇</p>
      <div className="flex items-center justify-center w-1/2 rounded-2xl border border-dashed border-1.5 border-[#1E6D41] h-30 p-10 bg-white">
        <Button className="rounded-md w-80 h-10 text-sm font-bold text-white bg-[linear-gradient(90deg,_#FFF_0%,_#1E6D41_57.21%)] shadow-[inset_0_1px_0.75px_0_rgba(255,255,255,0.07),_0_4px_4px_0_rgba(0,0,0,0.25),_0_4px_4px_0_rgba(0,0,0,0.25),_0_9.965px_9.675px_0_rgba(15,15,15,0.25)] flex items-center justify-center gap-5">
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
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
      <div
        className="p-5 bg-[#F8F8F8] 
       shadow-[-4px_4px_4px_0_rgba(0,0,0,0.25),_4px_4px_4px_0_rgba(0,0,0,0.25)] w-2/3 mt-5"
      >
        <h1 className="text-black text-center font-bold text-2xl pt-5 pb-3 ">
          LỊCH SỬ NHẬP LIỆU
        </h1>
        <FillTime
          label="Lọc lịch sử nhập liệu từ:"
          button="Xác nhận lọc"
          defaultFrom={getDefaultRange().from}
          defaultTo={getDefaultRange().to}
          onChange={handleFilterHistory}
        />
        <div className="overflow-y-auto max-h-[200px]">
          <Table columns={columns} data={displayHistory}></Table>
        </div>
      </div>
      <div className="flex items-center justify-center p-10 w-2/3 gap-5">
        <div className="grid grid-cols-2 gap-5">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              className={classItem.className}
              studentCount={classItem.studentCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
