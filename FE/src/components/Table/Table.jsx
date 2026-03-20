import TableHeader from "./TableHeader.jsx";
import TableRow from "./TableRow/TableRow.jsx";

export default function Table({
  columns,
  data,
  type,
  onEdit,
  onResetPassword,
  onLock,
  onUnlock,
  onUpdate,
  onAdd,
  onRemove,
  onLockMedicine,
  onUnlockMedicine,
  selectedBatches,
  onSelectBatch,
  onAccess,
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <TableHeader columns={columns} />
      </thead>

      <tbody>
        {data.map((row, index) => (
          <TableRow
            key={row.id || index}
            row={row}
            columns={columns}
            index={index}
            type={type}
            onEdit={onEdit}
            onResetPassword={onResetPassword}
            onLock={onLock}
            onUnlock={onUnlock}
            onUpdate={onUpdate}
            onAdd={onAdd}
            onRemove={onRemove}
            onLockMedicine={onLockMedicine}
            onAccess={onAccess}
            onUnlockMedicine={onUnlockMedicine}
            selectedBatch={selectedBatches?.[row.id]}
            onSelectBatch={onSelectBatch}
          />
        ))}
      </tbody>
    </table>
  );
}
