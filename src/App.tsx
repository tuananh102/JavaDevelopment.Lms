import { Routes, Route } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import CatalogPage from "./pages/CatalogPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LearningPage from "./pages/LearningPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route
        path="/learn/:courseId/lesson/:lessonId"
        element={<LearningPage />}
      />
    </Routes>
  );
}
