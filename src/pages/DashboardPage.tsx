import { Link } from "react-router";
import { BookOpen, CheckCircle, PlayCircle } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";

const MOCK_ENROLLMENTS = [
  {
    id: "e1",
    courseId: "1",
    courseSlug: "spring-boot-react-fullstack",
    courseTitle: "Full-Stack Development with Spring Boot 4 & React 19",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
    progressPercent: 25,
    completedLessons: 10,
    totalLessons: 40,
    lastLessonId: "l2",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Learning</h1>
        <p className="mt-2 text-slate-600">
          Track your progress and continue learning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ENROLLMENTS.map((enrollment) => (
          <div
            key={enrollment.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="aspect-video w-full overflow-hidden relative">
              <img
                src={enrollment.thumbnail}
                alt={enrollment.courseTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Link
                  to={`/learn/${enrollment.courseId}/lesson/${enrollment.lastLessonId}`}
                  className="bg-white text-slate-900 rounded-full p-3 shadow-lg"
                >
                  <PlayCircle className="w-8 h-8 text-indigo-600" />
                </Link>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <Link
                to={`/courses/${enrollment.courseSlug}`}
                className="font-bold text-lg text-slate-900 line-clamp-2 mb-4 hover:text-indigo-600 transition-colors"
              >
                {enrollment.courseTitle}
              </Link>

              <div className="mt-auto space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{enrollment.progressPercent}% Complete</span>
                  <span>
                    {enrollment.completedLessons} / {enrollment.totalLessons}{" "}
                    Lessons
                  </span>
                </div>
                <Progress.Root
                  className="relative overflow-hidden bg-slate-100 rounded-full w-full h-2"
                  value={enrollment.progressPercent}
                >
                  <Progress.Indicator
                    className="bg-indigo-600 w-full h-full transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${100 - enrollment.progressPercent}%)`,
                    }}
                  />
                </Progress.Root>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
