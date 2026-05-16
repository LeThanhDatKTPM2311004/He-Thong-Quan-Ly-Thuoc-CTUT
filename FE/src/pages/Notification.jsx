import { useEffect, useState } from "react";
import { getNotifications } from "../services/notificationService";
import FormNotification from "../components/FormNotification";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await getNotifications();
        setNotifications(result ?? []);
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  return (
    <div className="w-3/4 bg-white absolute top-20 left-105 h-5/6 rounded-2xl shadow-xl flex flex-col gap-5 py-20 pl-30 pr-50">
      <h1 className="text-lg font-bold">Thông báo</h1>
      <div className="overflow-y-auto max-h-95%">
        {loading ? (
          <p className="text-gray-400 italic">Đang tải thông báo...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-400 italic">Không có thông báo nào.</p>
        ) : (
          notifications.map((noti) => (
            <FormNotification
              key={noti.id}
              type={noti.type.toLowerCase()} // ← thêm .toLowerCase()
              typeText={noti.title}
              message={noti.message}
              dateTime={formatDateTime(noti.createdAt)}
              source="hệ thống"
              batchId={noti.batchId}
            />
          ))
        )}
      </div>
    </div>
  );
}
