import { useState } from "react";
import { Link } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";
import api from "../lib/api";

const PAGE_SIZE = 12;

// Khớp với CourseDto ở backend (GET /api/v1/courses trả Page<CourseDto>)
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  categoryId: string | null;
  instructorId: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

const LEVEL_LABEL: Record<Course["level"], string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All levels",
};

const FALLBACK_THUMB =
  "https://placehold.co/600x400/e2e8f0/64748b?text=Course";

export default function CatalogPage() {
  const [search, setSearch] = useState("");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["courses"],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<Page<Course>>("/courses", {
        params: { page: pageParam, size: PAGE_SIZE, sort: "createdAt,desc" },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const next = allPages.length;
      return next < lastPage.totalPages ? next : undefined;
    },
  });

  const allCourses = data?.pages.flatMap((p) => p.content) ?? [];
  const courses = allCourses.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Courses</h1>
          <p className="mt-2 text-slate-600">
            Find the right course to advance your career.
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading courses...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-24 text-red-600">
          <AlertCircle className="w-6 h-6 mr-2" /> Failed to load courses. Please
          try again later.
        </div>
      )}

      {!isLoading && !isError && courses.length === 0 && (
        <div className="text-center py-24 text-slate-500">
          No courses found.
        </div>
      )}

      {!isLoading && !isError && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              to={`/courses/${course.slug}`}
              key={course.id}
              className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnailUrl || FALLBACK_THUMB}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {LEVEL_LABEL[course.level] ?? course.level}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <span className="font-bold text-lg text-slate-900">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </span>
                  <span className="text-sm font-medium text-indigo-600 group-hover:underline">
                    View details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && !isError && hasNextPage && !search.trim() && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center px-6 py-2.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
