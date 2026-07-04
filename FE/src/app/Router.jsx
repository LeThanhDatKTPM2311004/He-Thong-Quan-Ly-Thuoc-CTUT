import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Account from "../pages/Account";
import MainLayout from "../layouts/MainLayout";
import CreateAccount from "../pages/CreateAccount.jsx";
import UpdateAccount from "../pages/UpdateAccount.jsx";
import Personal from "../pages/Personal.jsx";
import Medicine from "../pages/Medicine.jsx";
import MedicineExport from "../pages/MedicineExport.jsx";
import CreateMedicine from "../pages/CreateMedicine.jsx";
import UpdateMedicine from "../pages/UpdateMedicine.jsx";
import MedicineReport from "../pages/MedicineReport.jsx";
import Prescription from "../pages/Prescription.jsx";
import CreatePrescription from "../pages/CreatePrescription.jsx";
import ViewPrescription from "../pages/ViewPrescription.jsx";
import Student from "../pages/Student.jsx";
import Notification from "../pages/Notification.jsx";
import Statistics from "../pages/Statistics.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import PrescriptionReport from "../pages/PrescriptionReport.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        {/* ── ADMIN ONLY ── */}
        <Route element={<MainLayout />}>
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Account />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route element={<MainLayout hideHeader={false} />}>
          <Route
            path="/account/create"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CreateAccount />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route element={<MainLayout hideHeader={false} />}>
          <Route
            path="/account/update"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UpdateAccount />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ── ADMIN + STAFF ── */}
        <Route
          element={
            <MainLayout hideHeader={false} title="Quản Lí Thông Tin Cá Nhân" />
          }
        >
          <Route
            path="/personal"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <Personal />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route element={<MainLayout hideHeader={true} title="Quản Lí Thuốc" />}>
          <Route
            path="/medicine"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <Medicine />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<MainLayout hideHeader={false} title="Quản Lí Thuốc" />}
        >
          <Route
            path="/medicine/export"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <MedicineExport />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<MainLayout hideHeader={false} title="Quản Lí Thuốc" />}
        >
          <Route
            path="/medicine/create"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <CreateMedicine />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<MainLayout hideHeader={false} title="Quản Lí Thuốc" />}
        >
          <Route
            path="/medicine/update"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <UpdateMedicine />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<MainLayout hideHeader={false} title="Quản Lí Thuốc" />}
        >
          <Route
            path="/medicine/report"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <MedicineReport />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<MainLayout hideHeader={true} title="Quản Lí Đơn Thuốc" />}
        >
          <Route
            path="/prescription"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <Prescription />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<MainLayout hideHeader={false} title="Quản Lí Đơn Thuốc" />}
        >
          <Route
            path="/prescription/create"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <CreatePrescription />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<MainLayout hideHeader={false} title="Quản Lí Đơn Thuốc" />}
        >
          <Route
            path="/prescription/view"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <ViewPrescription />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route element={<MainLayout hideHeader={false} title="In Đơn Thuốc" />}>
          <Route
            path="/prescription/report"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <PrescriptionReport />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={
            <MainLayout hideHeader={false} title="Thông tin sinh viên" />
          }
        >
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <Student />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route element={<MainLayout hideHeader={true} title="Thông báo" />}>
          <Route
            path="/notification"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <Notification />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<MainLayout hideHeader={false} title="Số Liệu Thống Kê" />}
        >
          <Route
            path="/statistics"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
                <Statistics />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
