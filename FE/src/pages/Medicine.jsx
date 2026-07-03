import Table from "../components/Table/Table.jsx";
import add from "../assets/images/add.png";
import Button from "../components/Button.jsx";
import ReportIcon from "../assets/svg/ReportIcon.jsx";
import FormMedicine from "../components/FormMedicine";
import Alert from "../components/Alert.jsx";
import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  getMedicines,
  addBatch,
  lockMedicine,
  unlockMedicine,
  deleteBatch,
} from "../services/medicineService";
import { Loader2 } from "lucide-react";

export default function Medicine() {
  const navigate = useNavigate();
  const [selectedBatches, setSelectedBatches] = useState({});

  const { keyword, searchBatch } = useOutletContext() ?? {};

  const columns = [
    { key: "stt", label: "STT", align: "center" },
    { key: "medicine", label: "TÊN THUỐC", align: "left" },
    { key: "quantity", label: "SỐ LƯỢNG", align: "left" },
    { key: "unit", label: "ĐƠN VỊ TÍNH", align: "left" },
    { key: "batch", label: "CHỌN LÔ", align: "left" },
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

  const [show, setShow] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);
  const [batchForm, setBatchForm] = useState({});
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [pendingDeleteBatchId, setPendingDeleteBatchId] = useState(null);
  const [pendingDeleteBatchName, setPendingDeleteBatchName] = useState("");
  const [pendingDeleteMedicineId, setPendingDeleteMedicineId] = useState(null);

  const fetchMedicines = async (page = 0, kw = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getMedicines({
        page,
        size: pagination.size,
        sortBy: "id",
        sortDir: "asc",
        keyword: kw,
      });

      const mapped = res.content.map((item, index) => ({
        ...item,
        stt: page * pagination.size + index + 1,
        medicine: item.name,
        quantity: item.totalQuantity,
        lockedStatus:
          item.status === "Đang sử dụng" ? "unlockMedicine" : "lockMedicine",
        batches: item.batches.map((b) => ({
          batchId: b.batchNumber,
          quantity: b.remainingQuantity,
          expiry: b.expiryDate,
          status: b.hasBeenExported ? "exported" : "unexported",
          _id: b.id,
        })),
      }));

      setData(mapped);

      // Auto-select lô nếu có searchBatch — MainLayout đã resolve tên thuốc,
      // nên kw lúc này đã đúng, chỉ cần tìm và chọn lô trong kết quả
      if (searchBatch) {
        mapped.forEach((item) => {
          const targetBatch = item.batches.find((b) => b._id === searchBatch);
          if (targetBatch) {
            setSelectedBatches((prev) => ({
              ...prev,
              [item.id]: targetBatch,
            }));
          }
        });
      }

      setPagination((prev) => ({
        ...prev,
        page: res.pageable.pageNumber,
        totalPages: res.totalPages,
        totalElements: res.totalElements,
      }));
    } catch (err) {
      setError(err.message || "Không thể tải danh sách thuốc.");
    } finally {
      setLoading(false);
    }
  };

  // MainLayout đã resolve searchBatch → tên thuốc → keyword
  // nên Medicine chỉ cần watch keyword và searchBatch, gọi thẳng fetchMedicines
  useEffect(() => {
    fetchMedicines(0, keyword ?? "");
  }, [keyword, searchBatch]);

  const handleAdd = (row) => {
    setSelectedMedicineId(row.id);
    setBatchForm({});
    setBatchError("");
    setShow(true);
  };

  const handleUpdate = (row) => {
    const selectedBatch = selectedBatches[row.id];
    if (!selectedBatch) return;
    navigate("/medicine/update", {
      state: { _id: selectedBatch._id, medicineId: row.id },
    });
  };

  const handleRemove = (row) => {
    const selectedBatch = selectedBatches[row.id];
    if (!selectedBatch) return;
    setPendingDeleteBatchId(selectedBatch._id);
    setPendingDeleteBatchName(selectedBatch.batchId);
    setPendingDeleteMedicineId(row.id);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteBatchId) return;
    try {
      setData((prev) =>
        prev.map((item) => {
          if (item.id !== pendingDeleteMedicineId) return item;
          return {
            ...item,
            batches: item.batches.filter((b) => b._id !== pendingDeleteBatchId),
          };
        }),
      );
      setSelectedBatches((prev) => {
        const next = { ...prev };
        delete next[pendingDeleteMedicineId];
        return next;
      });
      setShowAlert(false);
      setPendingDeleteBatchId(null);
      setPendingDeleteBatchName("");
      setPendingDeleteMedicineId(null);
      await deleteBatch(pendingDeleteBatchId);
      fetchMedicines(pagination.page, keyword ?? "");
    } catch (err) {
      setError(err.message || "Xóa lô thuốc thất bại.");
      fetchMedicines(pagination.page, keyword ?? "");
    }
  };

  const handleLockMedicine = async (row) => {
    try {
      await lockMedicine(row.id);
      fetchMedicines(pagination.page, keyword ?? "");
    } catch (err) {
      setError(err.message || "Khóa thuốc thất bại.");
    }
  };

  const handleUnlockMedicine = async (row) => {
    try {
      await unlockMedicine(row.id);
      fetchMedicines(pagination.page, keyword ?? "");
    } catch (err) {
      setError(err.message || "Mở khóa thuốc thất bại.");
    }
  };

  const handleBatchSubmit = async () => {
    setBatchError("");
    if (!batchForm.soLuong || Number(batchForm.soLuong) <= 0) {
      setBatchError("Vui lòng nhập số lượng hợp lệ.");
      return;
    }
    if (!batchForm.hanSuDung) {
      setBatchError("Vui lòng nhập hạn sử dụng.");
      return;
    }
    setBatchLoading(true);
    try {
      await addBatch(selectedMedicineId, {
        quantity: Number(batchForm.soLuong),
        expiryDate: batchForm.hanSuDung,
      });
      setShow(false);
      setSelectedMedicineId(null);
      fetchMedicines(pagination.page, keyword ?? "");
    } catch (err) {
      setBatchError(err.message || "Nhập thuốc thất bại.");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleTrace = (row) => {
    navigate("/medicine/export", { state: { medicineId: row.id } });
  };

  const handleReport = () => {
    navigate("/medicine/report");
  };

  const fields = [
    { name: "soLuong", label: "Số lượng:", width: "full", type: "number" },
    { name: "hanSuDung", label: "Hạn sử dụng:", width: "full", type: "date" },
  ];

  return (
    <>
      {/* Wrapper co dãn theo viewport, giữ tỉ lệ 16:9 — Responsive wrapper */}
      <div
        style={{ padding: "30px" }}
        className="relative w-full h-9/10 flex flex-col min-h-0"
      >
        <div className="bg-white flex-1 min-h-0 rounded-2xl shadow-xl flex flex-col">
          {/* Header: title + buttons — Tiêu đề + nút thao tác */}
          <div className="relative flex items-center justify-end px-8 py-5 flex-shrink-0 gap-3">
            <h1 className="absolute left-1/2 -translate-x-1/2 text-black font-bold text-2xl tracking-wide">
              DANH SÁCH THUỐC
            </h1>
            <Button
              className="bg-[#5E5E5E] h-10 flex items-center text-white font-bold px-4 rounded-lg text-sm gap-1"
              onClick={handleReport}
            >
              <ReportIcon />
              Xuất báo cáo
            </Button>
            <Button
              className="bg-[#CA20A5] h-10 flex items-center text-white font-bold px-4 rounded-lg text-sm"
              onClick={() => navigate("/medicine/create")}
            >
              <img src={add} alt="Add Icon" className="w-3 h-3 mr-1" />
              Thêm thuốc mới
            </Button>
          </div>
          <div className="border-t border-gray-100 flex-shrink-0" />

          {error && (
            <p className="text-red-500 text-sm text-center px-8 pt-2">
              {error}
            </p>
          )}

          {/* Bảng dữ liệu cuộn — Scrollable table area */}
          {loading ? (
            <p className="text-center text-gray-400 mt-10">Đang tải...</p>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto px-8 py-4">
              <Table
                type="medicine"
                columns={columns}
                data={data}
                selectedBatches={selectedBatches}
                onSelectBatch={(rowId, batch) =>
                  setSelectedBatches((prev) => ({ ...prev, [rowId]: batch }))
                }
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onLockMedicine={handleLockMedicine}
                onUnlockMedicine={handleUnlockMedicine}
                onAccess={handleTrace}
              />
            </div>
          )}

          {/* Phân trang ghim đáy — Pinned pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-10 flex-shrink-0 border-t border-gray-100">
              <button
                disabled={pagination.page === 0}
                onClick={() =>
                  fetchMedicines(pagination.page - 1, keyword ?? "")
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
                  fetchMedicines(pagination.page + 1, keyword ?? "")
                }
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-sm"
              >
                Tiếp &raquo;
              </button>
            </div>
          )}
        </div>
        {/* Modal nhập thuốc — Batch input modal */}
        {show && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="bg-white w-[520px] rounded-2xl shadow-2xl flex flex-col gap-8 py-8 px-12">
              <h1 className="text-black font-bold text-2xl w-full text-center">
                NHẬP THUỐC
              </h1>
              <div className="w-full flex justify-center">
                <div className="w-[80%]">
                  <FormMedicine
                    fields={fields}
                    onChange={(data) => setBatchForm(data)}
                    variant="primary"
                    readOnly={false}
                  />
                </div>
              </div>
              {batchError && (
                <p className="text-red-500 text-sm text-center -mt-4">
                  {batchError}
                </p>
              )}
              <div className="flex items-center justify-center gap-12 font-bold text-white">
                <Button
                  className="bg-[#951010] hover:bg-red-600 w-30 h-10"
                  onClick={() => setShow(false)}
                  disabled={batchLoading}
                >
                  HỦY BỎ
                </Button>
                <Button
                  className="bg-[#268037] hover:bg-green-600 w-30 h-10 flex items-center justify-center gap-2"
                  onClick={handleBatchSubmit}
                  disabled={batchLoading}
                >
                  {batchLoading ? (
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
        )}
      </div>

      <Alert
        show={showAlert}
        onClose={() => setShowAlert(false)}
        onCancel={() => setShowAlert(false)}
        onEnter={handleConfirmDelete}
        textPart1="Bạn chắc chắn muốn xóa lô thuốc"
        main={pendingDeleteBatchName}
        textPart2="khỏi danh sách không?"
      />
    </>
  );
}
