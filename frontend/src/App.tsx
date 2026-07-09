import { Routes, Route } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import CatalogPage from "./pages/CatalogPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LearningPage from "./pages/LearningPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import InstructorDashboardPage from "./pages/instructor/InstructorDashboardPage";
import CourseEditorPage from "./pages/instructor/CourseEditorPage";
import AdminPage from "./pages/instructor/AdminPage";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";

export default function App() {
  // Re-validate the persisted session against the backend on load.
  useAuthBootstrap();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<CatalogPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />

        {/* Requires login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout/:courseId" element={<CheckoutPage />} />
        </Route>

        {/* Requires INSTRUCTOR (or ADMIN) */}
        <Route element={<ProtectedRoute role="INSTRUCTOR" />}>
          <Route path="/instructor" element={<InstructorDashboardPage />} />
          <Route path="/instructor/course/:id" element={<CourseEditorPage />} />
        </Route>

        {/* Requires ADMIN */}
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      {/* Standalone learning view — requires login (enrollment gate lives in the page) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/learn/:slug/lesson/:lessonId"
          element={<LearningPage />}
        />
      </Route>
    </Routes>
  );
}
