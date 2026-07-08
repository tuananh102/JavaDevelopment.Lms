import { Link } from "react-router";
import { Plus, Edit, Eye, Loader2, Send, Archive, Undo2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

interface Course {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

const STATUS_STYLE: Record<Course["status"], string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-amber-100 text-amber-700",
  ARCHIVED: "bg-slate-200 text-slate-600",
};

export default function InstructorDashboardPage() {
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: async () => {
      const res = await api.get<Course[]>("/courses/instructor");
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/courses/${id}/status`, null, { params: { status } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Instructor Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your courses and their status.
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

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            You haven't created any courses yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-900 truncate">
                    {course.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[course.status]}`}
                    >
                      {course.status}
                    </span>
                    <span>{course.price === 0 ? "Free" : `$${course.price}`}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4 shrink-0">
                  {course.status === "PUBLISHED" ? (
                    <button
                      onClick={() =>
                        statusMutation.mutate({ id: course.id, status: "DRAFT" })
                      }
                      disabled={statusMutation.isPending}
                      className="flex items-center px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Unpublish"
                    >
                      <Undo2 className="w-4 h-4 mr-1" /> Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          id: course.id,
                          status: "PUBLISHED",
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="flex items-center px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Publish"
                    >
                      <Send className="w-4 h-4 mr-1" /> Publish
                    </button>
                  )}
                  <Link
                    to={`/courses/${course.slug}`}
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
                  {course.status !== "ARCHIVED" && (
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          id: course.id,
                          status: "ARCHIVED",
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Archive course"
                    >
                      <Archive className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
