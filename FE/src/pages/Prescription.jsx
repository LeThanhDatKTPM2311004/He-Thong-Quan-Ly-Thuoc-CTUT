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
    size: 8,
    totalPages: 0,
    totalElements: 0,
  });

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [showInsufficientAlert, setShowInsufficientAlert] = useState(false);
  const [insufficientMessage, setInsufficientMessage] = useState("");
  const [pendingDispenseRow, setPendingDispenseRow] = useState(null);

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
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePrescription(pendingDelete.prescriptionCode);
      setShowDeleteAlert(false);
      setPendingDelete(null);
      fetchPrescriptions(pagination.page, keyword ?? "");
    } catch (err) {
      setError(err.message || "Xóa đơn thuốc thất bại.");
      setShowDeleteAlert(false);
    }
  };

  const handleDispense = async (row) => {
    try {
      await dispensePrescription(row.prescriptionCode);
      fetchPrescriptions(pagination.page, keyword ?? "");
    } catch (err) {
      const msg = err.message || "";
      // Nếu lỗi liên quan đến số lượng thuốc → hiện Alert cảnh báo
      if (
        msg.toLowerCase().includes("số lượng") ||
        msg.toLowerCase().includes("không đủ")
      ) {
        setInsufficientMessage(msg);
        setPendingDispenseRow(row);
        setShowInsufficientAlert(true);
      } else {
        setError(msg || "Cấp thuốc thất bại.");
      }
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

  const handlePrint = () => {
    navigate("/prescription/report");
  };

  return (
    <>
      {/* Wrapper co dãn — Responsive wrapper */}
      <div
        style={{ padding: "30px" }}
        className="relative w-full h-9/10 flex flex-col min-h-0"
      >
        <div className="bg-white flex-1 min-h-0 rounded-2xl shadow-xl flex flex-col">
          {/* Header: title + nút kê đơn — Title + create button */}
          <div className="relative flex items-center justify-end px-8 py-5 flex-shrink-0">
            <h1 className="absolute left-1/2 -translate-x-1/2 text-black font-bold text-2xl tracking-wide">
              DANH SÁCH ĐƠN THUỐC
            </h1>
            <Button
              className="bg-[#CA20A5] h-10 flex items-center text-white font-bold px-4 rounded-lg"
              onClick={() => navigate("/prescription/create")}
            >
              <img src={add} alt="Add Icon" className="w-3 h-3 mr-1" />
              KÊ ĐƠN THUỐC
            </Button>
          </div>
          <div className="border-t border-gray-100 flex-shrink-0" />

          {error && (
            <p className="text-red-500 text-sm text-center px-8 pt-2">
              {error}
            </p>
          )}

          {/* Bảng dữ liệu cuộn — Scrollable table */}
          {loading ? (
            <p className="text-center text-gray-400 mt-10">Đang tải...</p>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto px-8 py-4">
              <Table
                columns={columns}
                data={data}
                type="prescription"
                onView={handleView}
                onDelete={handleDelete}
                onDispense={handleDispense}
                onReturn={handleReturn}
                onPrint={handlePrint}
              />
            </div>
          )}

          {/* Phân trang ghim đáy — Pinned pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-10 flex-shrink-0 border-t border-gray-100">
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
      </div>

      <Alert
        show={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onCancel={() => setShowDeleteAlert(false)}
        onEnter={handleConfirmDelete}
        textPart1="Bạn chắc chắn muốn xóa đơn thuốc của"
        main={pendingDelete?.fullName ?? ""}
        textPart2="khỏi danh sách không?"
        Cancel="Hủy bỏ"
        Enter="Tiến hành xóa"
      />

      <Alert
        show={showInsufficientAlert}
        onClose={() => setShowInsufficientAlert(false)}
        onCancel={() => setShowInsufficientAlert(false)}
        onEnter={() => {
          setShowInsufficientAlert(false);
          navigate("/prescription/view", {
            state: { prescriptionCode: pendingDispenseRow?.prescriptionCode },
          });
        }}
        color="#B51C1C"
        textPart1=""
        main={insufficientMessage}
        textPart2=""
        hidden="unhidden"
        Cancel="Hủy"
        Enter="Xem chi tiết"
      />
    </>
  );
}
