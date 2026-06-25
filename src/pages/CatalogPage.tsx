import { Link } from "react-router";
import { Clock, BookOpen, Star } from "lucide-react";

// Mock data to visualize the UI
const MOCK_COURSES = [
  {
    id: "1",
    slug: "spring-boot-react-fullstack",
    title: "Full-Stack Development with Spring Boot 4 & React 19",
    description:
      "Learn how to build production-ready full-stack applications using the latest tech stack.",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
    price: 49.99,
    level: "INTERMEDIATE",
    lessonsCount: 42,
    duration: "15h 30m",
    category: "Web Development",
  },
  {
    id: "2",
    slug: "advanced-java-25",
    title: "Advanced Java 25 & Project Loom",
    description:
      "Master virtual threads, pattern matching, and record patterns in the newest LTS release.",
    thumbnail:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
    price: 0,
    level: "ADVANCED",
    lessonsCount: 18,
    duration: "5h 45m",
    category: "Backend",
  },
];

export default function CatalogPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Courses</h1>
          <p className="mt-2 text-slate-600">
            Find the right course to advance your career.
          </p>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search courses..."
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option>All Categories</option>
            <option>Web Development</option>
            <option>Backend</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COURSES.map((course) => (
          <Link
            to={`/courses/${course.slug}`}
            key={course.id}
            className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                  {course.category}
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center">
                  <Star className="w-3 h-3 text-amber-400 mr-1 fill-amber-400" />
                  4.8
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                {course.description}
              </p>

              <div className="flex items-center text-sm text-slate-500 space-x-4 mb-4">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" /> {course.duration}
                </span>
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" /> {course.lessonsCount}{" "}
                  lessons
                </span>
              </div>

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
    </div>
  );
}
