import { useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Edit,
  Eye,
  Loader2,
  Send,
  Archive,
  Undo2,
  BookOpen,
  CheckCircle2,
  Users,
  DollarSign,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { usePageTitle } from "../../hooks/usePageTitle";

interface Course {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

// Khớp InstructorStatsDto ở backend (GET /api/v1/instructor/stats)
interface InstructorStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  courses: {
    id: string;
    title: string;
    status: Course["status"];
    students: number;
    revenue: number;
  }[];
  monthly: { month: string; enrollments: number; revenue: number }[];
}

const STATUS_STYLE: Record<Course["status"], string> = {
  PUBLISHED: "bg-success-100 text-success-700",
  DRAFT: "bg-warning-100 text-warning-700",
  ARCHIVED: "bg-slate-200 text-slate-600",
};

const money = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${Math.round(v * 100) / 100}`;

// "2026-02" -> "Feb"
const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en", { month: "short" });
};

// Round up to a clean axis maximum (1/2/5 × 10^n).
const niceCeil = (v: number) => {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const f = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return f * pow;
};

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center text-slate-500 text-sm">
        <Icon className="w-4 h-4 mr-2 text-primary-600" />
        {label}
      </div>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

/**
 * Single-series column chart (last 6 months). One hue, thin rounded-top bars,
 * hairline gridlines, hover tooltip per column — no legend needed for one series.
 */
function ColumnChart({
  points,
  format,
}: {
  points: { label: string; value: number }[];
  format: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 480;
  const H = 200;
  const PAD_L = 44;
  const PAD_R = 8;
  const PAD_T = 12;
  const PAD_B = 26;
  const plotH = H - PAD_T - PAD_B;
  const plotW = W - PAD_L - PAD_R;

  const maxValue = niceCeil(Math.max(...points.map((p) => p.value), 0));
  const ticks = [0, maxValue / 2, maxValue];
  const band = plotW / Math.max(points.length, 1);
  const barW = Math.min(24, band * 0.55);
  const yOf = (v: number) => PAD_T + (1 - v / maxValue) * plotH;

  // Bar path: square at the baseline, 4px rounded data-end on top.
  const barPath = (i: number, v: number) => {
    const h = (v / maxValue) * plotH;
    if (h <= 0) return null;
    const x = PAD_L + band * i + (band - barW) / 2;
    const yTop = PAD_T + plotH - h;
    const r = Math.min(4, barW / 2, h);
    return `M ${x} ${PAD_T + plotH} V ${yTop + r} Q ${x} ${yTop} ${x + r} ${yTop} H ${x + barW - r} Q ${x + barW} ${yTop} ${x + barW} ${yTop + r} V ${PAD_T + plotH} Z`;
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={yOf(t)}
              y2={yOf(t)}
              className="stroke-slate-200"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 8}
              y={yOf(t)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              className="fill-slate-500"
            >
              {format(t)}
            </text>
          </g>
        ))}

        {points.map((p, i) => {
          const d = barPath(i, p.value);
          return (
            <g key={p.label}>
              {d && (
                <path
                  d={d}
                  className={
                    hover === i ? "fill-primary-700" : "fill-primary-600"
                  }
                />
              )}
              <text
                x={PAD_L + band * i + band / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize="11"
                className="fill-slate-500"
              >
                {p.label}
              </text>
              {/* Hit target: whole column band, larger than the bar itself */}
              <rect
                x={PAD_L + band * i}
                y={PAD_T}
                width={band}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full pointer-events-none bg-slate-900 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg"
          style={{
            left: `${((PAD_L + band * (hover + 0.5)) / W) * 100}%`,
            top: `${(Math.max(yOf(points[hover].value) - 6, 14) / H) * 100}%`,
          }}
        >
          <span className="text-slate-300">{points[hover].label}:</span>{" "}
          <span className="font-semibold">{format(points[hover].value)}</span>
        </div>
      )}
    </div>
  );
}

export default function InstructorDashboardPage() {
  usePageTitle("Instructor Dashboard");
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: async () => {
      const res = await api.get<Course[]>("/courses/instructor");
      return res.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["instructor-stats"],
    queryFn: async () => {
      const res = await api.get<InstructorStats>("/instructor/stats");
      return res.data;
    },
  });

  // Per-course students/revenue for the list rows.
  const courseStats = new Map(stats?.courses.map((c) => [c.id, c]) ?? []);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/courses/${id}/status`, null, { params: { status } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-stats"] });
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
            Manage your courses and track how they perform.
          </p>
        </div>
        <Link
          to="/instructor/course/new"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Course
        </Link>
      </div>

      {stats && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              icon={BookOpen}
              label="Total courses"
              value={String(stats.totalCourses)}
            />
            <StatTile
              icon={CheckCircle2}
              label="Published"
              value={String(stats.publishedCourses)}
            />
            <StatTile
              icon={Users}
              label="Total students"
              value={stats.totalStudents.toLocaleString()}
            />
            <StatTile
              icon={DollarSign}
              label="Total revenue"
              value={money(stats.totalRevenue)}
            />
          </div>

          {/* Last-6-months charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800">Revenue</h2>
              <p className="text-sm text-slate-500 mb-4">Last 6 months</p>
              <ColumnChart
                points={stats.monthly.map((m) => ({
                  label: monthLabel(m.month),
                  value: m.revenue,
                }))}
                format={money}
              />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800">New enrollments</h2>
              <p className="text-sm text-slate-500 mb-4">Last 6 months</p>
              <ColumnChart
                points={stats.monthly.map((m) => ({
                  label: monthLabel(m.month),
                  value: m.enrollments,
                }))}
                format={(v) => v.toLocaleString()}
              />
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">My Courses</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-danger-600 mb-4">
              Couldn't load your courses. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Retry
            </button>
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
                    {courseStats.has(course.id) && (
                      <>
                        <span className="flex items-center">
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {courseStats.get(course.id)!.students.toLocaleString()}{" "}
                          students
                        </span>
                        <span>
                          {money(courseStats.get(course.id)!.revenue)} earned
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4 shrink-0">
                  {course.status === "PUBLISHED" ? (
                    <button
                      onClick={() =>
                        statusMutation.mutate({ id: course.id, status: "DRAFT" })
                      }
                      disabled={statusMutation.isPending}
                      className="flex items-center px-3 py-1.5 text-sm text-warning-700 hover:bg-warning-50 rounded-lg transition-colors"
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
                      className="flex items-center px-3 py-1.5 text-sm text-success-700 hover:bg-success-50 rounded-lg transition-colors"
                      title="Publish"
                    >
                      <Send className="w-4 h-4 mr-1" /> Publish
                    </button>
                  )}
                  <Link
                    to={`/courses/${course.slug}`}
                    className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                    title="View as student"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link
                    to={`/instructor/course/${course.id}`}
                    className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                    title="Edit course"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  {course.status !== "ARCHIVED" && (
                    <button
                      onClick={() => {
                        // "Xoá" = archive (đổi status). Hard-delete sẽ vướng khoá
                        // ngoại khi khoá đã có enrollment; archive an toàn hơn và
                        // vẫn có thể Publish lại để khôi phục.
                        if (
                          window.confirm(
                            `Archive "${course.title}"? It will be hidden from the catalog. You can publish it again later.`,
                          )
                        ) {
                          statusMutation.mutate({
                            id: course.id,
                            status: "ARCHIVED",
                          });
                        }
                      }}
                      disabled={statusMutation.isPending}
                      className="p-2 text-slate-400 hover:text-danger-600 transition-colors"
                      title="Delete (archive) course"
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
