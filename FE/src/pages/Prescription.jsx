import Table from "../components/Table/Table.jsx";
import add from "../assets/images/add.png";
import Button from "../components/Button.jsx";
import Alert from "../components/Alert.jsx";
import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  getPrescriptions,
  deletePrescription,
  dispensePrescription,
  returnPrescription,
} from "../services/prescriptionService";

export default function Prescription() {
  const navigate = useNavigate();
  const { keyword } = useOutletContext() ?? {};

  const columns = [
    { key: "stt", label: "STT", align: "center" },
    { key: "prescriptionCode", label: "MÃ ĐƠN THUỐC", align: "left" },
    { key: "fullName", label: "HỌ VÀ TÊN", align: "left" },
    { key: "studentCode", label: "MSSV", align: "left" },
    { key: "insuranceCode", label: "MÃ BHYT", align: "left" },
    { key: "time", label: "THỜI GIAN", align: "center" },
    { key: "status", label: "TRẠNG THÁI", align: "center" },
    { key: "action", label: "THAO TÁC", align: "left" },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [showAlert, setShowAlert] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { prescriptionCode, fullName }

  const mapStatus = (s = "") => {
    if (s === "Chờ thuốc") return "waiting";
    if (s === "Đã cấp thuốc") return "dispensed";
    if (s === "Đã hoàn thuốc") return "completed";
    return s;
  };

  const fetchPrescriptions = async (page = 0, kw = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getPrescriptions({
        page,
        size: pagination.size,
        sortBy: "createdAt",
        sortDir: "desc",
        keyword: kw,
      });

      const mapped = res.content.map((item, index) => ({
        ...item,
        stt: page * pagination.size + index + 1,
        time: item.createdAt
          ? new Date(item.createdAt).toLocaleString("vi-VN")
          : "",
        status: mapStatus(item.status),
      }));

      setData(mapped);
      setPagination((prev) => ({
        ...prev,
        page: res.pageable.pageNumber,
        totalPages: res.totalPages,
        totalElements: res.totalElements,
      }));
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đơn thuốc.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions(0, keyword ?? "");
  }, [keyword]);

  const handleView = (row) => {
    navigate("/prescription/view", {
      state: { prescriptionCode: row.prescriptionCode },
    });
  };

  const handleDelete = (row) => {
    setPendingDelete({
      prescriptionCode: row.prescriptionCode,
      fullName: row.fullName,
    });
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePrescription(pendingDelete.prescriptionCode);
      setShowAlert(false);
      setPendingDelete(null);
      fetchPrescriptions(pagination.page, keyword ?? "");
    } catch (err) {
      setError(err.message || "Xóa đơn thuốc thất bại.");
      setShowAlert(false);
    }
  };

  const handleDispense = async (row) => {
    try {
      await dispensePrescription(row.prescriptionCode);
      fetchPrescriptions(pagination.page, keyword ?? "");
    } catch (err) {
      setError(err.message || "Cấp thuốc thất bại.");
    }
  };

  const handleReturn = async (row) => {
    try {
      await returnPrescription(row.prescriptionCode);
      fetchPrescriptions(pagination.page, keyword ?? "");
    } catch (err) {
      setError(err.message || "Hoàn thuốc thất bại.");
    }
  };

  return (
    <>
      <div className="w-3/4 bg-white absolute top-20 left-105 h-5/6 rounded-2xl shadow-xl">
        <h1 className="text-black text-center font-bold text-2xl pt-5 pb-3">
          DANH SÁCH THUỐC
        </h1>
        <Button
          className="bg-[#CA20A5] h-6 text-xs flex justify-self-end items-center text-white font-bold mr-15"
          onClick={() => navigate("/prescription/create")}
        >
          <img src={add} alt="Add Icon" className="w-3 h-3 mr-1" />
          KÊ ĐƠN THUỐC
        </Button>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        {loading ? (
          <p className="text-center text-gray-400 mt-10">Đang tải...</p>
        ) : (
          <div className="max-h-[650px] p-5">
            <Table
              columns={columns}
              data={data}
              type="prescription"
              onView={handleView}
              onDelete={handleDelete}
              onDispense={handleDispense}
              onReturn={handleReturn}
            />
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pb-4">
            <button
              disabled={pagination.page === 0}
              onClick={() =>
                fetchPrescriptions(pagination.page - 1, keyword ?? "")
              }
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-sm"
            >
              &laquo; Trước
            </button>
            <span className="text-sm text-gray-600">
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page + 1 >= pagination.totalPages}
              onClick={() =>
                fetchPrescriptions(pagination.page + 1, keyword ?? "")
              }
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-sm"
            >
              Tiếp &raquo;
            </button>
          </div>
        )}
      </div>

      <Alert
        show={showAlert}
        onClose={() => setShowAlert(false)}
        onCancel={() => setShowAlert(false)}
        onEnter={handleConfirmDelete}
        textPart1="Bạn chắc chắn muốn xóa đơn thuốc của"
        main={pendingDelete?.fullName ?? ""}
        textPart2="khỏi danh sách không?"
      />
    </>
  );
}
