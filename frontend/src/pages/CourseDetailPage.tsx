import { useParams, useNavigate } from "react-router";
import { PlayCircle, Clock, Lock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const res = await api.get(`/courses/${slug}`);
      return res.data;
    },
  });

  const { data: enrollmentInfo } = useQuery({
    queryKey: ["enrollment", course?.id],
    queryFn: async () => {
      const res = await api.get(`/enrollments/courses/${course.id}/check`);
      return res.data;
    },
    // Endpoint yêu cầu đăng nhập -> chỉ gọi khi đã auth, tránh 401 làm đá về login.
    enabled: !!course?.id && isAuthenticated,
  });

  const firstLessonId = course?.sections?.[0]?.lessons?.[0]?.id;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/enrollments/courses/${course.id}`);
      return res.data;
    },
    onSuccess: () => {
      // Refresh the enrollment check + dashboard list so the UI reflects the new state.
      queryClient.invalidateQueries({ queryKey: ["enrollment", course.id] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      if (firstLessonId) {
        navigate(`/learn/${course.slug}/lesson/${firstLessonId}`);
      } else {
        alert("You're enrolled! This course doesn't have any lessons yet.");
      }
    },
    onError: (err: any) =>
      alert(
        err?.response?.data?.message ??
          "Enrollment failed. Please try again.",
      ),
  });

  const isPaid = Number(course?.price ?? 0) > 0;

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (enrollmentInfo?.enrolled) {
      if (firstLessonId)
        navigate(`/learn/${course.slug}/lesson/${firstLessonId}`);
      return;
    }
    if (isPaid) {
      // Paid course -> go through the (simulated) checkout instead of enrolling directly.
      navigate(`/checkout/${course.id}`);
    } else {
      enrollMutation.mutate();
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading course...</div>;
  if (!course) return <div className="p-8 text-center text-danger-500">Course not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            {course.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span className="font-medium">
              Created by <span className="text-primary-600">Instructor</span>
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Self-paced
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Course Content
          </h2>
          <div className="space-y-4">
            {course.sections?.map((section: any) => (
              <div
                key={section.id}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
                  Section {section.orderIndex}: {section.title}
                </div>
                <div className="divide-y divide-slate-100">
                  {section.lessons?.map((lesson: any, idx: number) => (
                    <div
                      key={lesson.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {lesson.type === "VIDEO" ? (
                          <PlayCircle className="w-5 h-5 text-primary-500" />
                        ) : (
                          <BookOpenIcon className="w-5 h-5 text-primary-500" />
                        )}
                        <span className="text-slate-700">
                          {idx + 1}. {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-500">
                        <span>{Math.floor(lesson.durationSeconds / 60)}m</span>
                        {!enrollmentInfo?.enrolled && (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="aspect-video w-full bg-slate-800 relative">
            <img
              src={course.thumbnailUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop"}
              alt="Thumbnail"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white opacity-90 drop-shadow-lg" />
            </div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-slate-900 mb-6">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </div>
            <button
              onClick={handleEnroll}
              disabled={enrollMutation.isPending}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              {enrollmentInfo?.enrolled
                ? "Continue Learning"
                : isPaid
                  ? `Buy for $${course.price}`
                  : "Enroll for Free"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              Full lifetime access. 30-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
