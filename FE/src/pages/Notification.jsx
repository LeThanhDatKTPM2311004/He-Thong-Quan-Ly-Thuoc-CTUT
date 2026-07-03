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
    <div
      style={{ padding: "30px" }}
      className="w-full h-9/10 flex flex-col min-h-0"
    >
      <div className="bg-white flex-1 min-h-0 rounded-2xl shadow-xl flex flex-col px-10 py-8">
        <h1 className="text-lg font-bold flex-shrink-0 mb-4">Thông báo</h1>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <p className="text-gray-400 italic">Đang tải thông báo...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-400 italic">Không có thông báo nào.</p>
          ) : (
            notifications.map((noti) => (
              <FormNotification
                key={noti.id}
                type={noti.type.toLowerCase()}
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
    </div>
  );
}
