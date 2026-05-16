import Button from "../../Button.jsx";

export default function TableAction({
  rowData,
  type,
  onEdit,
  onResetPassword,
  onLock,
  onUnlock,
  onAccess,
  onAdd,
  onUpdate,
  onRemove,
  onLockMedicine,
  onUnlockMedicine,
  onView,
  onDelete,
  onDispense,
  onReturn,
}) {
  const handleAccess = () => {
    if (onAccess) {
      onAccess(rowData);
    } else {
      console.log("Truy xuất", rowData);
    }
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd(rowData);
    } else {
      console.log("Thêm thuốc", rowData);
    }
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(rowData);
    } else {
      console.log("Cập nhật thuốc", rowData);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(rowData);
    } else {
      console.log("Xóa thuốc", rowData);
    }
  };

  const handleLockMedicine = () => {
    if (onLockMedicine) {
      onLockMedicine(rowData);
    } else {
      console.log("Khóa thuốc:", rowData);
    }
  };

  const handleUnlockMedicine = () => {
    if (onUnlockMedicine) {
      onUnlockMedicine(rowData);
    } else {
      console.log("Mở khóa thuốc:", rowData);
    }
  };

  const handleResetPassword = () => {
    if (onResetPassword) {
      onResetPassword(rowData);
    } else {
      console.log("Đặt lại mật khẩu:", rowData);
    }
  };

  const handleLock = () => {
    if (onLock) {
      onLock(rowData);
    } else {
      console.log("Khóa tài khoản:", rowData);
    }
  };

  const handleUnlock = () => {
    if (onUnlock) {
      onUnlock(rowData);
    } else {
      console.log("Mở khóa:", rowData);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(rowData);
    } else {
      console.log("Sửa thông tin:", rowData);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(rowData);
    } else {
      console.log("Xem chi tiết:", rowData);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(rowData);
    } else {
      console.log("Xóa đơn:", rowData);
    }
  };

  const handleDispense = () => {
    if (onDispense) {
      onDispense(rowData);
    } else {
      console.log("Cấp thuốc:", rowData);
    }
  };

  const handleReturn = () => {
    if (onReturn) {
      onReturn(rowData);
    } else {
      console.log("Hoàn thuốc:", rowData);
    }
  };

  // TYPE: ACCOUNT - Quản lý tài khoản
  if (type === "account") {
    if (rowData.status === "inactive") {
      return (
        <div className="flex items-center justify-self-start gap-2">
          <Button
            onClick={handleUnlock}
            className="bg-[#264580] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
          >
            Mở khóa
          </Button>
        </div>
      );
    }

    if (rowData.status === "active") {
      return (
        <div className="flex items-center justify-self-start gap-2">
          <Button
            onClick={handleResetPassword}
            className="bg-[#3D8E10] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
          >
            Đặt lại mật khẩu
          </Button>

          <Button
            onClick={handleLock}
            className="bg-[#B51C1C] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
          >
            Khóa tài khoản
          </Button>

          <Button
            onClick={handleEdit}
            className="bg-[#BC5B1A] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
          >
            Sửa thông tin
          </Button>
        </div>
      );
    }
  }

  // TYPE: MEDICINE - Quản lý thuốc
  if (type === "medicine") {
    const isLocked = rowData.lockedStatus === "lockMedicine";

    return (
      <div className="flex items-center justify-self-start gap-2">
        {/* Luôn hiển thị */}
        {isLocked ? (
          <Button
            onClick={handleUnlockMedicine}
            className="bg-[#264580] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
          >
            Mở khóa thuốc
          </Button>
        ) : (
          <>
            <Button
              onClick={handleLockMedicine}
              className="bg-[#B51C1C] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
            >
              Khóa thuốc
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-[#264580] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
            >
              Nhập thuốc
            </Button>
            <Button
              onClick={handleAccess}
              className="bg-[#3D8E10] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
            >
              Truy xuất
            </Button>
          </>
        )}

        {/* Chỉ hiển thị sau khi chọn lô */}
        {rowData.status && (
          <>
            {rowData.status === "unexported" && (
              <>
                <Button
                  onClick={handleUpdate}
                  className="bg-[#BC5B1A] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
                >
                  Cập nhật
                </Button>

                <Button
                  onClick={handleRemove}
                  className="bg-[#B51C1C] h-6 text-xs flex justify-self-end items-center text-white font-medium mr hover:opacity-80 transition"
                >
                  Xóa
                </Button>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  // TYPE: PRESCRIPTION - Quản lý đơn thuốc
  if (type === "prescription") {
    if (rowData.status === "waiting") {
      return (
        <div className="flex items-center justify-self-start gap-2">
          <Button
            onClick={handleView}
            className="bg-[#3D8E10] h-6 w-30 text-xs flex justify-center items-center text-white font-medium hover:opacity-80 transition"
          >
            Xem chi tiết
          </Button>

          <Button
            onClick={handleDispense}
            className="bg-[#264580] h-6 w-25 text-xs flex justify-center items-center text-white font-medium hover:opacity-80 transition"
          >
            Cấp thuốc
          </Button>

          <Button
            onClick={handleDelete}
            className="bg-[#8E1010] h-6 w-15 text-xs flex justify-center items-center text-white font-medium hover:opacity-80 transition"
          >
            Xóa
          </Button>
        </div>
      );
    }

    if (rowData.status === "completed") {
      return (
        <div className="flex items-center justify-self-start gap-2">
          <Button
            onClick={handleView}
            className="bg-[#3D8E10] h-6 w-30 text-xs flex justify-center items-center text-white font-medium hover:opacity-80 transition"
          >
            Xem chi tiết
          </Button>
        </div>
      );
    }

    if (rowData.status === "dispensed") {
      return (
        <div className="flex items-center justify-self-start gap-2">
          <Button
            onClick={handleView}
            className="bg-[#3D8E10] h-6 w-30 text-xs flex justify-center items-center text-white font-medium hover:opacity-80 transition"
          >
            Xem chi tiết
          </Button>
          <Button
            onClick={handleReturn}
            className="bg-[#C0D204] h-6 w-25 text-xs flex justify-center items-center text-white font-medium hover:opacity-80 transition"
          >
            Hoàn thuốc
          </Button>
        </div>
      );
    }
  }

  // TYPE
}
