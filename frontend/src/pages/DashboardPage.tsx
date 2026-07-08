import { Link } from "react-router";
import { BookOpen, Award, Clock } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export default function DashboardPage() {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const res = await api.get("/enrollments");
      return res.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Continue your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Enrolled Courses</p>
            <p className="text-2xl font-bold text-slate-900">{enrollments?.length || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completed Courses</p>
            <p className="text-2xl font-bold text-slate-900">
              {enrollments?.filter((e: any) => e.isCompleted).length || 0}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments?.map((enrollment: any) => (
            <div key={enrollment.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <img
                src={enrollment.course.thumbnailUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop"}
                alt={enrollment.course.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                  {enrollment.course.title}
                </h3>
                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-slate-600 font-medium">Progress</span>
                    <span className="text-indigo-600 font-bold">
                      {enrollment.course.sections ? 
                        Math.round((enrollment.completedLessonsCount / 3) * 100) : 0}%
                    </span>
                  </div>
                  <Progress.Root
                    className="relative overflow-hidden bg-slate-100 rounded-full w-full h-2 mb-4"
                    value={enrollment.course.sections ? (enrollment.completedLessonsCount / 3) * 100 : 0}
                  >
                    <Progress.Indicator
                      className="bg-indigo-600 w-full h-full transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${100 - (enrollment.course.sections ? (enrollment.completedLessonsCount / 3) * 100 : 0)}%)` }}
                    />
                  </Progress.Root>
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
          {enrollments?.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              You haven't enrolled in any courses yet.
              <br />
              <Link to="/catalog" className="text-indigo-600 hover:underline mt-2 inline-block font-medium">Browse Catalog</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
