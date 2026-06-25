import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
import { BookOpen, User, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, id, fullName, role } = response.data;
      setAuth({ id, email, fullName, role }, token);
      navigate(role === "INSTRUCTOR" ? "/instructor" : "/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  const demoLogin = (role: "STUDENT" | "INSTRUCTOR" | "ADMIN") => {
    const user = {
      id: role === "INSTRUCTOR" ? "222" : role === "ADMIN" ? "111" : "333",
      email: role === "INSTRUCTOR" ? "instructor@lms.com" : role === "ADMIN" ? "admin@lms.com" : "student@lms.com",
      fullName: role === "INSTRUCTOR" ? "Alex Instructor" : role === "ADMIN" ? "System Admin" : "John Student",
      role: role
    };
    setAuth(user, "demo-jwt-token");
    navigate(role === "INSTRUCTOR" ? "/instructor" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BookOpen className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          
          <div className="mb-6 space-y-3">
            <p className="text-sm font-medium text-slate-500 text-center mb-2">Demo Access (No Backend Required)</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => demoLogin('STUDENT')} className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4 mr-2 text-indigo-600" /> Student
              </button>
              <button type="button" onClick={() => demoLogin('INSTRUCTOR')} className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                <GraduationCap className="w-4 h-4 mr-2 text-emerald-600" /> Instructor
              </button>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or use real API</span></div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Don't have an account? </span>
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
