import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Save, Plus, GripVertical, Trash2, Edit } from "lucide-react";
import { Link } from "react-router";

// Mock structure for UI purposes
const MOCK_COURSE = {
  id: "1",
  title: "Full-Stack Development with Spring Boot 4 & React 19",
  description: "Learn how to build production-ready full-stack applications...",
  price: 49.99,
  level: "INTERMEDIATE",
  sections: [
    {
      id: "s1",
      title: "Getting Started",
      orderIndex: 1,
      lessons: [
        {
          id: "l1",
          title: "Course Introduction",
          durationSeconds: 300,
          type: "VIDEO",
        },
        {
          id: "l2",
          title: "Setting up the Environment",
          durationSeconds: 720,
          type: "ARTICLE",
        },
      ],
    },
  ],
};

export default function CourseEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [title, setTitle] = useState(isNew ? "" : MOCK_COURSE.title);
  const [description, setDescription] = useState(
    isNew ? "" : MOCK_COURSE.description,
  );
  const [price, setPrice] = useState(isNew ? 0 : MOCK_COURSE.price);

  const handleSave = () => {
    // API Call to save
    navigate("/instructor");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/instructor"
            className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isNew ? "Create New Course" : "Edit Course"}
          </h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">
              Basic Info
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="E.g. Advanced React Patterns"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="What will students learn?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Curriculum Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-slate-800 text-lg">
                Curriculum
              </h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Section
              </button>
            </div>

            {!isNew &&
              MOCK_COURSE.sections.map((section) => (
                <div
                  key={section.id}
                  className="border border-slate-200 rounded-lg mb-4 bg-slate-50"
                >
                  <div className="p-4 flex items-center justify-between border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-5 h-5 text-slate-400 cursor-move" />
                      <span className="font-semibold text-slate-800">
                        Section {section.orderIndex}: {section.title}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-slate-400 hover:text-indigo-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {section.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                          <span className="text-sm text-slate-700">
                            Lesson {idx + 1}: {lesson.title}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                            {lesson.type}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 text-slate-400 hover:text-indigo-600">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="mt-2 text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center px-2 py-1">
                      <Plus className="w-4 h-4 mr-1" /> Add Lesson
                    </button>
                  </div>
                </div>
              ))}

            {isNew && (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                Save the course first to start adding sections and lessons.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
