import Button from "./Button";
import add from "../assets/images/add.png";

/**
 * @param {Object} props
 * @param {Object} props.medicine - Thông tin thuốc (bao gồm stock, stockError)
 * @param {Function} props.onQuantityChange - Hàm thay đổi số lượng
 * @param {Function} props.onRemove - Hàm xóa thuốc
 * @param {boolean} props.showRemoveButton - Hiển thị nút xóa hay không
 * @param {boolean} props.isReadOnly - Chế độ chỉ đọc
 */
export default function FormListMedicine({
  medicine,
  onQuantityChange,
  onRemove,
  showRemoveButton = true,
  isReadOnly = false,
}) {
  const hasStockError = !!medicine.stockError;

  return (
    <div className="flex items-center justify-center gap-20">
      {/* Tên thuốc */}
      <div className="relative shadow-sm">
        <input
          type="text"
          id={`nameMedicine-${medicine.id}`}
          placeholder=" "
          value={medicine.name}
          readOnly
          className="peer focus:shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)] w-full h-12 rounded-sm bg-[linear-gradient(90deg,#F7F7F7_80.29%,#FFFB90_100%)] px-3 pt-5 text-sm outline-none font-bold"
        />
        <label
          htmlFor={`nameMedicine-${medicine.id}`}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none transition-all duration-200 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-gray-500 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-gray-500"
        >
          TÊN THUỐC
        </label>
      </div>

      {/* Đơn vị tính */}
      <div className="relative shadow-sm">
        <input
          type="text"
          id={`unit-${medicine.id}`}
          placeholder=" "
          value={medicine.unit}
          readOnly
          className="peer focus:shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)] w-full h-12 rounded-sm bg-[linear-gradient(90deg,#F7F7F7_80.29%,#FFFB90_100%)] px-3 pt-5 text-sm outline-none font-bold"
        />
        <label
          htmlFor={`unit-${medicine.id}`}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none transition-all duration-200 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-gray-500 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-gray-500"
        >
          ĐƠN VỊ TÍNH
        </label>
      </div>

      {/* Số lượng — có cảnh báo tồn kho realtime */}
      <div className="relative shadow-sm flex flex-col">
        <input
          type="number"
          id={`quantity-${medicine.id}`}
          placeholder=" "
          min={1}
          max={medicine.stock ?? undefined}
          value={medicine.quantity}
          onChange={(e) => onQuantityChange(medicine.id, e.target.value)}
          disabled={isReadOnly}
          className={`peer focus:shadow-[3px_3px_4px_0_rgba(0,0,0,0.25)] w-full h-12 rounded-sm px-3 pt-5 text-sm outline-none font-bold transition-all duration-200
            ${isReadOnly ? "cursor-not-allowed opacity-75" : ""}
            ${
              hasStockError
                ? "bg-[linear-gradient(90deg,#FFF0F0_80.29%,#FFB3B3_100%)] border border-red-400"
                : "bg-[linear-gradient(90deg,#F7F7F7_80.29%,#FFFB90_100%)]"
            }`}
        />
        <label
          htmlFor={`quantity-${medicine.id}`}
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none transition-all duration-200
            peer-focus:top-2 peer-focus:text-[10px]
            peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[10px]
            ${hasStockError ? "text-red-400 peer-focus:text-red-400 peer-not-placeholder-shown:text-red-400" : "text-gray-400 peer-focus:text-gray-500 peer-not-placeholder-shown:text-gray-500"}`}
        >
          SỐ LƯỢNG
        </label>

        {/* Cảnh báo tồn kho — hiện ngay khi nhập vượt */}
        {hasStockError && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-red-500 text-[10px]">⚠️</span>
            <p className="text-red-500 text-[10px] whitespace-nowrap font-medium">
              {medicine.stockError}
            </p>
          </div>
        )}

        {/* Hint tồn kho — hiện khi không có lỗi và có thông tin stock */}
        {!hasStockError && medicine.stock != null && !isReadOnly && (
          <p className="text-gray-400 text-[10px] mt-1 whitespace-nowrap">
            Tồn kho: {medicine.stock} {medicine.unit ?? ""}
          </p>
        )}
      </div>

      {/* Nút xóa */}
      {showRemoveButton && (
        <Button
          type="button"
          className="w-25 h-8 p-3 bg-[#B33C14] text-white font-bold text-sm flex items-center justify-center gap-5 !rounded-4xl"
          onClick={() => onRemove(medicine.id)}
        >
          <img src={add} alt="remove" className="rotate-[46.05deg]" />
          Xóa
        </Button>
      )}
    </div>
  );
}
