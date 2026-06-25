import { Link } from "react-router";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

const MOCK_INSTRUCTOR_COURSES = [
  {
    id: "1",
    title: "Full-Stack Development with Spring Boot 4 & React 19",
    status: "PUBLISHED",
    price: 49.99,
    students: 120,
    rating: 4.8,
  },
  {
    id: "2",
    title: "Advanced Java 25 & Project Loom",
    status: "DRAFT",
    price: 0,
    students: 0,
    rating: 0,
  },
];

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Instructor Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your courses and view your performance.
          </p>
        </div>
        <Link
          to="/instructor/course/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Course
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">My Courses</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {MOCK_INSTRUCTOR_COURSES.map((course) => (
            <div
              key={course.id}
              className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">
                  {course.title}
                </h3>
                <div className="flex space-x-4 mt-2 text-sm text-slate-500">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      course.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {course.status}
                  </span>
                  <span>${course.price}</span>
                  <span>{course.students} students</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  to={`/courses/${course.id}`}
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="View as student"
                >
                  <Eye className="w-5 h-5" />
                </Link>
                <Link
                  to={`/instructor/course/${course.id}`}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Edit course"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <button
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete course"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
