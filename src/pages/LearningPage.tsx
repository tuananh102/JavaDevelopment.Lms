import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Progress Tracking Focus Area
export default function LearningPage() {
  const { courseId, lessonId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<
    Record<string, boolean>
  >({ l1: true });

  // Mock
  const courseTitle = "Full-Stack Development with Spring Boot 4 & React 19";
  const progressPercent = 25; // derived from completed lessons / total lessons

  const markComplete = () => {
    if (lessonId) {
      setCompletedLessons((prev) => ({ ...prev, [lessonId]: true }));
      // API call: POST /api/v1/lessons/{id}/complete
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
          <Link
            to={`/courses/spring-boot-react-fullstack`}
            className="text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-sm md:text-base hidden sm:block truncate max-w-md">
            {courseTitle}
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-3 w-48">
            <Progress.Root
              className="relative overflow-hidden bg-slate-700 rounded-full w-full h-2"
              value={progressPercent}
            >
              <Progress.Indicator
                className="bg-indigo-500 w-full h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${100 - progressPercent}%)` }}
              />
            </Progress.Root>
            <span className="text-xs font-medium text-slate-300">
              {progressPercent}%
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-y-auto bg-slate-50">
          <div className="w-full aspect-video bg-black flex items-center justify-center shrink-0">
            {/* Video Player Placeholder */}
            <div className="text-white text-center">
              <p className="text-slate-400 mb-2">Video Player</p>
              <p className="font-mono text-sm bg-slate-800 px-3 py-1 rounded">
                Update Progress API will track last_position
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto w-full px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                1. Setting up the Environment
              </h2>
              <button
                onClick={markComplete}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors border",
                  completedLessons[lessonId || ""]
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
                )}
              >
                {completedLessons[lessonId || ""] ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />{" "}
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 mr-2 text-slate-400" /> Mark as
                    Complete
                  </>
                )}
              </button>
            </div>

            <div className="prose prose-slate max-w-none">
              <p>
                In this lesson, we will cover how to install Java 25, configure
                Maven, and set up your IDE.
              </p>
              <h3>Prerequisites</h3>
              <ul>
                <li>Ensure you have admin rights on your machine.</li>
                <li>Download IntelliJ IDEA or VS Code.</li>
              </ul>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-auto border-t border-slate-200 bg-white p-4 flex justify-between items-center">
            <button className="flex items-center text-slate-600 hover:text-slate-900 font-medium text-sm">
              <ChevronLeft className="w-5 h-5 mr-1" /> Previous Lesson
            </button>
            <button className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              Next Lesson <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className={cn(
            "w-80 bg-white border-l border-slate-200 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out absolute md:relative h-full z-20",
            sidebarOpen ? "right-0" : "-right-80 md:right-0 md:w-0 md:hidden",
          )}
        >
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Course Content</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Section 1 */}
            <div className="border-b border-slate-100">
              <div className="px-4 py-3 bg-white font-semibold text-sm text-slate-800">
                1. Getting Started
              </div>
              <div>
                <Link
                  to="/learn/1/lesson/l1"
                  className="flex items-center px-4 py-3 hover:bg-slate-50 border-l-2 border-transparent"
                >
                  {completedLessons["l1"] ? (
                    <CheckCircle className="w-4 h-4 mr-3 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 mr-3 text-slate-300 shrink-0" />
                  )}
                  <span className="text-sm text-slate-600 line-clamp-2">
                    1. Course Introduction
                  </span>
                </Link>
                <Link
                  to="/learn/1/lesson/l2"
                  className="flex items-center px-4 py-3 bg-indigo-50 border-l-2 border-indigo-600"
                >
                  {completedLessons["l2"] ? (
                    <CheckCircle className="w-4 h-4 mr-3 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 mr-3 text-slate-300 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-indigo-900 line-clamp-2">
                    2. Setting up the Environment
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
