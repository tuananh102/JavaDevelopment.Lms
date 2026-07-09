import { useEffect, useRef, useState } from "react";
import {
  useParams,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router";
import { useAuthStore } from "../store/authStore";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PlayCircle,
} from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- YouTube IFrame API integration -------------------------------------
// A plain <iframe> embed never reports playback state, so the page can't
// know when a video finishes. The official IFrame Player API does: we load
// it once, let it create the player, and listen for the ENDED state.

let ytApiPromise: Promise<any> | null = null;
function loadYouTubeApi(): Promise<any> {
  const w = window as any;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(w.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return ytApiPromise;
}

function getYouTubeVideoId(url: string): string | null {
  return url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/)?.[1] ?? null;
}

function YouTubeLessonPlayer({
  videoId,
  autoplay,
  onEnded,
}: {
  videoId: string;
  autoplay: boolean;
  onEnded: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the latest callback without re-creating the player on each render.
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // YT.Player replaces this node with an iframe, so give it a child that
    // React doesn't manage.
    const mount = document.createElement("div");
    container.appendChild(mount);
    let player: any;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      player = new YT.Player(mount, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: autoplay ? 1 : 0, rel: 0 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.ENDED) onEndedRef.current();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        player?.destroy();
      } catch {
        // ignore — player may not have finished initializing
      }
      while (container.firstChild) container.removeChild(container.firstChild);
    };
    // autoplay is intentionally read only on mount for a given video
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return <div ref={containerRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />;
}

export default function LearningPage() {
  const { slug, lessonId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAuthStore((s) => s.user?.role);

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const res = await api.get(`/courses/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

  const courseId = course?.id;

  // Enrollment gate: a student may only open the learning view for a course they're
  // enrolled in. Instructors/admins can preview (the backend still decides whether to
  // include the actual lesson content). Without this the lesson video/text was reachable
  // just by knowing the URL.
  const canPreviewWithoutEnrollment = role === "INSTRUCTOR" || role === "ADMIN";
  const { data: enrollmentInfo, isLoading: loadingEnrollment } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: async () => {
      const res = await api.get(`/enrollments/courses/${courseId}/check`);
      return res.data as { enrolled: boolean };
    },
    enabled: !!courseId && !canPreviewWithoutEnrollment,
  });

  const { data: completedLessonIds = [], isLoading: loadingProgress } =
    useQuery({
      queryKey: ["progress", courseId],
      queryFn: async () => {
        const res = await api.get(`/progress/courses/${courseId}/completed`);
        return res.data as string[];
      },
      enabled: !!courseId,
    });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/progress/courses/${courseId}/lessons/${id}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (err: any) =>
      alert(
        err?.response?.data?.message ??
          "Could not mark this lesson complete. Please try again.",
      ),
  });

  if (loadingCourse || loadingProgress || loadingEnrollment)
    return (
      <div className="p-8 text-white bg-slate-900 h-screen">
        Loading lesson...
      </div>
    );
  if (!course)
    return (
      <div className="p-8 text-white bg-slate-900 h-screen">
        Course not found
      </div>
    );

  // Not enrolled (and not an instructor/admin previewing) → bounce to the course
  // landing page where they can enroll.
  if (!canPreviewWithoutEnrollment && !enrollmentInfo?.enrolled)
    return <Navigate to={`/courses/${slug}`} replace />;

  let allLessons: any[] = [];
  (course.sections ?? []).forEach((s: any) => {
    allLessons = [...allLessons, ...(s.lessons ?? [])];
  });

  if (allLessons.length === 0)
    return (
      <div className="p-8 text-white bg-slate-900 h-screen">
        This course has no lessons yet.
      </div>
    );

  const currentLessonIndex = Math.max(
    0,
    allLessons.findIndex((l) => l.id === lessonId),
  );
  const currentLesson = allLessons[currentLessonIndex];

  const isCompleted = completedLessonIds.includes(currentLesson.id);
  const totalLessons = allLessons.length;
  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessonIds.length / totalLessons) * 100)
      : 0;

  const markComplete = () => {
    if (!isCompleted) {
      completeMutation.mutate(currentLesson.id);
    }
  };

  const prevLesson =
    currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  // When the video finishes: mark the lesson done and move on to the next
  // one. Instructors/admins previewing without an enrollment skip the
  // complete call (the backend would reject it) but still advance.
  const handleVideoEnded = () => {
    if (!isCompleted && !canPreviewWithoutEnrollment) {
      completeMutation.mutate(currentLesson.id);
    }
    if (nextLesson) {
      navigate(`/learn/${slug}/lesson/${nextLesson.id}`, {
        state: { autoplay: true },
      });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
          <Link
            to={`/dashboard`}
            className="text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-sm md:text-base hidden sm:block truncate max-w-md">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-3 w-48">
            <Progress.Root
              className="relative overflow-hidden bg-slate-700 rounded-full w-full h-2"
              value={progressPercent}
            >
              <Progress.Indicator
                className="bg-primary-500 w-full h-full transition-transform duration-500 ease-out"
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
          {currentLesson.type === "VIDEO" && (
            <div className="w-full aspect-video bg-black flex items-center justify-center shrink-0">
              {currentLesson.contentUrl &&
              getYouTubeVideoId(currentLesson.contentUrl) ? (
                <YouTubeLessonPlayer
                  videoId={getYouTubeVideoId(currentLesson.contentUrl)!}
                  autoplay={Boolean(location.state?.autoplay)}
                  onEnded={handleVideoEnded}
                />
              ) : currentLesson.contentUrl ? (
                <iframe
                  src={currentLesson.contentUrl}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-white text-center flex flex-col items-center">
                  <PlayCircle className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400 mb-2">No video for this lesson</p>
                  <p className="font-mono text-sm bg-slate-800 px-3 py-1 rounded">
                    {currentLesson.title}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="max-w-4xl mx-auto w-full px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {currentLesson.title}
              </h2>
              <button
                onClick={markComplete}
                disabled={completeMutation.isPending || isCompleted}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors border shrink-0",
                  isCompleted
                    ? "bg-success-50 text-success-700 border-success-200 cursor-default"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
                )}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-success-600" />{" "}
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

            <div className="prose prose-slate max-w-none whitespace-pre-line">
              {currentLesson.contentText ? (
                <p>{currentLesson.contentText}</p>
              ) : (
                <p>
                  Welcome to this lesson on{" "}
                  <strong>{currentLesson.title}</strong>. Xem video phía trên
                  hoặc đọc tài liệu để nắm nội dung.
                </p>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-auto border-t border-slate-200 bg-white p-4 flex justify-between items-center shrink-0">
            {prevLesson ? (
              <Link
                to={`/learn/${slug}/lesson/${prevLesson.id}`}
                className="flex items-center text-slate-600 hover:text-slate-900 font-medium text-sm px-4 py-2"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Previous Lesson
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                to={`/learn/${slug}/lesson/${nextLesson.id}`}
                className="flex items-center text-primary-600 hover:text-primary-800 font-medium text-sm px-4 py-2 bg-primary-50 rounded-lg"
              >
                Next Lesson <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className={cn(
            "w-80 bg-white border-l border-slate-200 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out absolute md:relative h-full z-20",
            sidebarOpen
              ? "right-0"
              : "-right-80 md:right-0 md:w-0 md:hidden",
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
            {(course.sections ?? []).map((section: any) => (
              <div key={section.id} className="border-b border-slate-100">
                <div className="px-4 py-3 bg-white font-semibold text-sm text-slate-800">
                  Section {section.orderIndex}: {section.title}
                </div>
                <div>
                  {(section.lessons ?? []).map((lesson: any) => {
                    const isLessonComplete = completedLessonIds.includes(
                      lesson.id,
                    );
                    const isActive = currentLesson.id === lesson.id;

                    return (
                      <Link
                        key={lesson.id}
                        to={`/learn/${slug}/lesson/${lesson.id}`}
                        className={cn(
                          "flex items-center px-4 py-3 border-l-2",
                          isActive
                            ? "bg-primary-50 border-primary-600"
                            : "hover:bg-slate-50 border-transparent",
                        )}
                      >
                        {isLessonComplete ? (
                          <CheckCircle className="w-4 h-4 mr-3 text-success-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 mr-3 text-slate-300 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "text-sm line-clamp-2",
                            isActive
                              ? "font-medium text-primary-900"
                              : "text-slate-600",
                          )}
                        >
                          {lesson.orderIndex}. {lesson.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
