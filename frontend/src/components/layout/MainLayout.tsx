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
              <BookOpen className="h-6 w-6 text-primary-600" />
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
                    <Link to="/instructor" className="flex items-center text-primary-600 hover:text-primary-800 font-medium">
                      Instructor Area
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center text-admin-600 hover:text-admin-800 font-medium">
                      Admin Area
                    </Link>
                  )}
                  <div className="flex items-center space-x-4 border-l border-slate-200 pl-4">
                    <Link
                      to="/profile"
                      className="text-sm font-medium text-slate-700 hover:text-primary-600"
                    >
                      {user?.fullName}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-slate-600 hover:text-danger-600 font-medium transition-colors"
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

      <footer className="bg-slate-900 text-slate-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary-400" />
                <span className="font-bold text-xl text-white">
                  LMS Platform
                </span>
              </Link>
              <p className="mt-3 text-sm text-slate-400 max-w-sm">
                Learn anywhere, anytime. Online courses built and taught by
                experienced instructors to help you advance your career.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Explore
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Course Catalog
                  </Link>
                </li>
                {isAuthenticated() && (
                  <li>
                    <Link
                      to="/dashboard"
                      className="hover:text-white transition-colors"
                    >
                      My Learning
                    </Link>
                  </li>
                )}
                {user?.role === "INSTRUCTOR" && (
                  <li>
                    <Link
                      to="/instructor"
                      className="hover:text-white transition-colors"
                    >
                      Instructor Area
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Account
              </h4>
              <ul className="space-y-2 text-sm">
                {isAuthenticated() ? (
                  <li>
                    <Link
                      to="/profile"
                      className="hover:text-white transition-colors"
                    >
                      My Profile
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="hover:text-white transition-colors"
                      >
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        className="hover:text-white transition-colors"
                      >
                        Create Account
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
            <p>
              © {new Date().getFullYear()} LMS Platform — HCMUTE Web
              Development Project.
            </p>
            <p>Built with Spring Boot & React.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
