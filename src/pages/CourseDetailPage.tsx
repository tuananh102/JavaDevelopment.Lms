import { useParams, Link, useNavigate } from "react-router";
import { PlayCircle, CheckCircle2, Clock, Lock } from "lucide-react";

const MOCK_COURSE = {
  id: "1",
  slug: "spring-boot-react-fullstack",
  title: "Full-Stack Development with Spring Boot 4 & React 19",
  description:
    "Learn how to build production-ready full-stack applications using the latest tech stack. We cover Java 25, Spring Boot 4, React 19, Tailwind CSS v4, and PostgreSQL.",
  price: 49.99,
  instructor: "Alex Developer",
  isEnrolled: false,
  sections: [
    {
      id: "s1",
      title: "Getting Started",
      orderIndex: 1,
      lessons: [
        {
          id: "l1",
          title: "Course Introduction",
          duration: "5m",
          type: "VIDEO",
          isFree: true,
        },
        {
          id: "l2",
          title: "Setting up the Environment",
          duration: "12m",
          type: "ARTICLE",
          isFree: true,
        },
      ],
    },
    {
      id: "s2",
      title: "Backend: Spring Boot Basics",
      orderIndex: 2,
      lessons: [
        {
          id: "l3",
          title: "Creating the Spring Boot project",
          duration: "15m",
          type: "VIDEO",
          isFree: false,
        },
        {
          id: "l4",
          title: "Understanding Spring Data JPA",
          duration: "20m",
          type: "VIDEO",
          isFree: false,
        },
      ],
    },
  ],
};

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  // Fetch course detail by slug using React Query here...

  const handleEnroll = () => {
    // Call enroll API
    navigate(
      `/learn/${MOCK_COURSE.id}/lesson/${MOCK_COURSE.sections[0].lessons[0].id}`,
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {MOCK_COURSE.title}
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            {MOCK_COURSE.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span className="font-medium">
              Created by{" "}
              <span className="text-indigo-600">{MOCK_COURSE.instructor}</span>
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" /> 15h 30m total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Course Content
          </h2>
          <div className="space-y-4">
            {MOCK_COURSE.sections.map((section) => (
              <div
                key={section.id}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
                  Section {section.orderIndex}: {section.title}
                </div>
                <div className="divide-y divide-slate-100">
                  {section.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {lesson.type === "VIDEO" ? (
                          <PlayCircle className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <BookOpenIcon className="w-5 h-5 text-indigo-500" />
                        )}
                        <span className="text-slate-700">
                          {idx + 1}. {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-slate-500">
                        <span>{lesson.duration}</span>
                        {!lesson.isFree && !MOCK_COURSE.isEnrolled && (
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
              src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop"
              alt="Thumbnail"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white opacity-90 drop-shadow-lg" />
            </div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-slate-900 mb-6">
              ${MOCK_COURSE.price}
            </div>
            <button
              onClick={handleEnroll}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              Enroll Now
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
