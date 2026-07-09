import { Link } from "react-router";
import { BookOpen, Users, GraduationCap, Rocket } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";

const STATS = [
  { icon: BookOpen, label: "Courses across many topics" },
  { icon: Users, label: "A growing community of learners" },
  { icon: GraduationCap, label: "Taught by experienced instructors" },
];

export default function AboutPage() {
  usePageTitle("About Us");

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">About Us</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          LMS Platform is an online learning platform built as part of the
          HCMUTE Web Development course. Our mission is simple: make quality
          education accessible to everyone — learn anywhere, anytime, at your
          own pace.
        </p>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Students can browse the course catalog, enroll in free or paid
          courses, and track their learning progress lesson by lesson.
          Instructors get a full set of tools to create courses, organize
          sections and lessons, and follow how their courses perform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-5 text-center"
          >
            <Icon className="w-6 h-6 text-primary-600 mx-auto" />
            <p className="mt-3 text-sm text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <Rocket className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Want to teach on LMS Platform?
          </h2>
        </div>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Anyone can become an instructor. Here's how it works:
        </p>
        <ol className="mt-3 space-y-2 text-slate-600 list-decimal list-inside">
          <li>
            <Link to="/register" className="text-primary-600 hover:underline font-medium">
              Create an account
            </Link>{" "}
            (all new accounts start as students).
          </li>
          <li>
            <Link to="/contact" className="text-primary-600 hover:underline font-medium">
              Contact us
            </Link>{" "}
            and tell us about the course you'd like to teach.
          </li>
          <li>
            Once approved, an administrator upgrades your account to
            Instructor and the Instructor Area appears in your navigation —
            you can start building your first course right away.
          </li>
        </ol>
      </div>
    </div>
  );
}
