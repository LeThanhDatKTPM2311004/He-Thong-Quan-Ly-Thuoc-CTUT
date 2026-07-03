import TableStatus from "./TableStatus.jsx";
import TableAction from "./TableAction.jsx";

export default function TableRow({
  row,
  columns,
  index,
  type,
  selectedBatch,
  onSelectBatch,
  onEdit,
  onResetPassword,
  onLock,
  onUnlock,
  onUpdate,
  onAdd,
  onRemove,
  onAccess,
  onLockMedicine,
  onUnlockMedicine,
  onView,
  onDelete,
  onDispense,
  onReturn,
}) {
  const isEven = index % 2 === 0;

  const getRowBackground = () => {
    if (row.status === "success") return "bg-[#E8F5E9] font-bold";
    if (row.status === "failed") return "bg-[#FFEBEE] font-bold";
    return isEven ? "bg-white" : "bg-[#FAFAFA]";
  };

  const getPX = () => {
    if (["waiting", "completed", "dispensed"].includes(row.status))
      return "px-1";
    return "px-4";
  };

  return (
    <tr className={`border-b border-[#EEEEEE] ${getRowBackground()}`}>
      {columns.map((col, colIndex) => (
        <td
          key={colIndex}
          className={`${getPX()} py-4 ${
            col.align === "center" ? "text-center" : "text-left"
          }`}
        >
          {col.key === "status" ? (
            <TableStatus status={row[col.key]} />
          ) : col.key === "quantity" && type === "medicine" ? (
            <span>{selectedBatch?.quantity ?? "-"}</span>
          ) : col.key === "batch" ? (
            <select
              className="border rounded px-2 py-0.5 text-xs"
              value={selectedBatch?.batchId ?? ""}
              onChange={(e) => {
                const batch = (row.batches ?? []).find(
                  (b) => b.batchId === e.target.value,
                );
                onSelectBatch?.(row.id, batch);
              }}
            >
              <option value="">-- Chọn lô --</option>
              {(row.batches ?? []).map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId} | HSD: {b.expiry}
                </option>
              ))}
            </select>
          ) : col.key === "action" ? (
            <TableAction
              rowData={
                type === "medicine"
                  ? { ...row, status: selectedBatch?.status ?? null }
                  : row
              }
              type={type}
              onEdit={onEdit}
              onResetPassword={onResetPassword}
              onLock={onLock}
              onUnlock={onUnlock}
              onUpdate={onUpdate}
              onAdd={onAdd}
              onRemove={onRemove}
              onAccess={onAccess}
              onLockMedicine={onLockMedicine}
              onUnlockMedicine={onUnlockMedicine}
              onView={onView}
              onDelete={onDelete}
              onDispense={onDispense}
              onReturn={onReturn}
            />
          ) : (
            <span>{row[col.key]}</span>
          )}
        </td>
      ))}
    </tr>
  );
}
