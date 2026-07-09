import { Outlet, Link, useNavigate } from "react-router";
import { BookOpen, UserCircle, LayoutDashboard, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-xl text-slate-900">
                LMS Platform
              </span>
            </Link>
            <nav className="flex space-x-8 items-center">
              <Link
                to="/"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Catalog
              </Link>
              {isAuthenticated() ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center text-slate-600 hover:text-slate-900 font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                  {user?.role === 'INSTRUCTOR' && (
                    <Link to="/instructor" className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                      Instructor Area
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center text-purple-600 hover:text-purple-800 font-medium">
                      Admin Area
                    </Link>
                  )}
                  <div className="flex items-center space-x-4 border-l border-slate-200 pl-4">
                    <Link
                      to="/profile"
                      className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                    >
                      {user?.fullName}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-slate-600 hover:text-red-600 font-medium transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-1" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center text-slate-600 hover:text-slate-900 font-medium"
                >
                  <UserCircle className="h-5 w-5 mr-1" />
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
