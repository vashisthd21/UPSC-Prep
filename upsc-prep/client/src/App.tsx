import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute, AdminRoute } from "@/routes/ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import { Landing } from "@/pages/public/Landing";
import { Login } from "@/pages/public/Login";
import { Register } from "@/pages/public/Register";
import { About } from "@/pages/public/About";
import { MockTests } from "@/pages/public/MockTests";
import { PYQs } from "@/pages/public/PYQs";
import { Practice } from "@/pages/public/Practice";
import { NotFound } from "@/pages/public/NotFound";

import { Dashboard } from "@/pages/student/Dashboard";
import { TestInterface } from "@/pages/student/TestInterface";
import { Result } from "@/pages/student/Result";
import { Review } from "@/pages/student/Review";
import { Bookmarks } from "@/pages/student/Bookmarks";
import { History } from "@/pages/student/History";
import { Analytics } from "@/pages/student/Analytics";
import { Profile } from "@/pages/student/Profile";

import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminQuestions } from "@/pages/admin/AdminQuestions";
import { AdminTests } from "@/pages/admin/AdminTests";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminAnalytics } from "@/pages/admin/AdminAnalytics";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/mock-tests" element={<MockTests />} />
          <Route path="/pyqs" element={<PYQs />} />
          <Route path="/practice" element={<Practice />} />
        </Route>

        {/* Full-screen test-taking (no chrome) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/test/:testId" element={<TestInterface />} />
        </Route>

        {/* Authenticated student area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/result/:attemptId" element={<Result />} />
            <Route path="/review/:attemptId" element={<Review />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/tests" element={<AdminTests />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </ToastProvider>
  );
}
