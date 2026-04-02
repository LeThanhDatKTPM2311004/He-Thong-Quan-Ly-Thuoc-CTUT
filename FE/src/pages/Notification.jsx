import FormNotification from "../components/FormNotification";
export default function Notification() {
  return (
    <div className="w-3/4 bg-white absolute top-20 left-105 h-5/6 rounded-2xl shadow-xl flex flex-col gap-5 py-20 pl-30 pr-50">
      <h1 className="text-lg font-bold">Thông báo</h1>
      <div className="overflow-y-auto max-h-95%">
        <FormNotification
          type="refusal"
          message="Chào mừng bạn đã đến với hệ thống"
          source="hệ thống"
          dateTime="11:00 23/05/2025"
          typeText="Ban da bi tu choi yeu cau hoan thuoc !"
        />
        <FormNotification
          type="warning"
          message="Chào mừng bạn đã đến với hệ thống"
          source="hệ thống"
          dateTime="11:00 23/05/2025"
          typeText="Thuoc chuot da het han vui long bo thuoc !"
        />
        <FormNotification
          type="pending"
          message="Chào mừng bạn đã đến với hệ thống"
          source="hệ thống"
          dateTime="11:00 23/05/2025"
          typeText="Yeu cau hoan thuoc da duoc gui di vui long cho !"
        />
        <FormNotification type="success" />
        <FormNotification type="success" />
        <FormNotification type="success" />
        <FormNotification type="success" />
      </div>
    </div>
  );
}
