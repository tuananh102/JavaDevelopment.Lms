import { Link } from "react-router";
import { BookOpen, Award, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

// Khớp EnrollmentDto: { id, course: CourseDto, enrolledAt, completedLessonsCount, completed }
interface Enrollment {
  id: string;
  course: {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
  };
  enrolledAt: string;
  completedLessonsCount: number;
  completed: boolean;
}

const FALLBACK_THUMB =
  "https://placehold.co/600x400/e2e8f0/64748b?text=Course";

export default function DashboardPage() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const res = await api.get<Enrollment[]>("/enrollments");
      return res.data;
    },
  });

  if (isLoading)
    return <div className="p-8 text-center">Loading dashboard...</div>;

  const completedCount = enrollments.filter((e) => e.completed).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome back! Continue your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Enrolled Courses
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {enrollments.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Completed Courses
            </p>
            <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Continue Learning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <img
                src={enrollment.course.thumbnailUrl || FALLBACK_THUMB}
                alt={enrollment.course.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                  {enrollment.course.title}
                </h3>
                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center mb-4 text-sm">
                    {enrollment.completed ? (
                      <span className="inline-flex items-center text-emerald-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
                      </span>
                    ) : (
                      <span className="text-slate-600 font-medium">
                        {enrollment.completedLessonsCount} lessons completed
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/courses/${enrollment.course.slug}`}
                    className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Resume Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {enrollments.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              You haven't enrolled in any courses yet.
              <br />
              <Link
                to="/"
                className="text-indigo-600 hover:underline mt-2 inline-block font-medium"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
