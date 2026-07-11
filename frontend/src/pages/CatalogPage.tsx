import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, AlertCircle, Search } from "lucide-react";
import api from "../lib/api";
import { usePageTitle } from "../hooks/usePageTitle";

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Newest" },
  { value: "title,asc", label: "Title A–Z" },
  { value: "price,asc", label: "Price: Low to High" },
  { value: "price,desc", label: "Price: High to Low" },
] as const;

const LEVEL_LABEL: Record<Course["level"], string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "Mixed",
};

// Thứ tự chip filter level trên catalog (null = không lọc).
const LEVEL_OPTIONS = Object.keys(LEVEL_LABEL) as Course["level"][];

const chipCls = (active: boolean) =>
  active
    ? "px-4 py-1.5 rounded-full text-sm font-medium bg-primary-600 text-white"
    : "px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-slate-300 text-slate-600 hover:bg-slate-50";

const FALLBACK_THUMB =
  "https://placehold.co/600x400/e2e8f0/64748b?text=Course";

export default function CatalogPage() {
  usePageTitle("Explore Courses");
  const [search, setSearch] = useState("");
  // Debounced copy of `search` — the query only refetches when the user pauses
  // typing, instead of on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [level, setLevel] = useState<Course["level"] | null>(null);
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0].value);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<Category[]>("/categories");
      return res.data;
    },
  });

  const {
    data,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["courses", { q: debouncedSearch, categoryId, level, sort }],
    queryFn: async ({ pageParam }) => {
      const res = await api.get<Page<Course>>("/courses", {
        params: {
          page: pageParam,
          size: PAGE_SIZE,
          sort,
          q: debouncedSearch || undefined,
          categoryId: categoryId ?? undefined,
          level: level ?? undefined,
        },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const next = allPages.length;
      return next < lastPage.totalPages ? next : undefined;
    },
  });

  const courses = data?.pages.flatMap((p) => p.content) ?? [];
  const totalResults = data?.pages[0]?.totalElements ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Courses</h1>
          <p className="mt-2 text-slate-600">
            Find the right course to advance your career.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters: one row per dimension */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 text-sm font-medium text-slate-500">
            Category
          </span>
          <button
            onClick={() => setCategoryId(null)}
            className={chipCls(categoryId === null)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setCategoryId(categoryId === cat.id ? null : cat.id)
              }
              className={chipCls(categoryId === cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 text-sm font-medium text-slate-500">
            Level
          </span>
          <button
            onClick={() => setLevel(null)}
            className={chipCls(level === null)}
          >
            All
          </button>
          {LEVEL_OPTIONS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(level === lvl ? null : lvl)}
              className={chipCls(level === lvl)}
            >
              {LEVEL_LABEL[lvl]}
            </button>
          ))}
          {!isLoading && !isError && (
            <span className="ml-auto text-sm text-slate-500 flex items-center">
              {isFetching && !isFetchingNextPage && (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              )}
              {totalResults} course{totalResults === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading courses...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-24 text-danger-600">
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
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {LEVEL_LABEL[course.level] ?? course.level}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <span className="font-bold text-lg text-slate-900">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </span>
                  <span className="text-sm font-medium text-primary-600 group-hover:underline">
                    View details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && !isError && hasNextPage && (
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
