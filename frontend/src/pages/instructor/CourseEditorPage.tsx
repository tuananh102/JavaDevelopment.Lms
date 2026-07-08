import { useEffect, useState, type ReactNode } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Save, Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CourseEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [price, setPrice] = useState(0);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("BEGINNER");

  // Curriculum add-forms
  const [newSection, setNewSection] = useState("");
  const [newLesson, setNewLesson] = useState<
    Record<string, { title: string; type: string }>
  >({});

  const { data: course, isLoading } = useQuery({
    queryKey: ["editor-course", id],
    queryFn: async () => {
      const res = await api.get(`/courses/by-id/${id}`);
      return res.data;
    },
    enabled: !isNew,
  });

  // Nạp dữ liệu vào form khi tải xong (chế độ edit)
  useEffect(() => {
    if (course) {
      setTitle(course.title ?? "");
      setSlug(course.slug ?? "");
      setDescription(course.description ?? "");
      setThumbnailUrl(course.thumbnailUrl ?? "");
      setPrice(Number(course.price ?? 0));
      setLevel(course.level ?? "BEGINNER");
    }
  }, [course]);

  const effectiveSlug = isNew && !slugTouched ? slugify(title) : slug;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        title,
        slug: effectiveSlug,
        description,
        thumbnailUrl: thumbnailUrl || null,
        price,
        level,
      };
      if (isNew) {
        const res = await api.post("/courses", body);
        return res.data;
      }
      const res = await api.put(`/courses/${id}`, body);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      if (isNew) {
        // Chuyển sang chế độ edit để thêm curriculum
        navigate(`/instructor/course/${data.id}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ["editor-course", id] });
      }
    },
  });

  const addSectionMutation = useMutation({
    mutationFn: async (sectionTitle: string) => {
      await api.post(`/courses/${id}/sections`, {
        title: sectionTitle,
        orderIndex: (course?.sections?.length ?? 0) + 1,
      });
    },
    onSuccess: () => {
      setNewSection("");
      queryClient.invalidateQueries({ queryKey: ["editor-course", id] });
    },
  });

  const addLessonMutation = useMutation({
    mutationFn: async ({
      sectionId,
      title: lessonTitle,
      type,
      order,
    }: {
      sectionId: string;
      title: string;
      type: string;
      order: number;
    }) => {
      await api.post(`/courses/sections/${sectionId}/lessons`, {
        title: lessonTitle,
        type,
        durationSeconds: 0,
        orderIndex: order,
      });
    },
    onSuccess: (_data, vars) => {
      setNewLesson((prev) => ({
        ...prev,
        [vars.sectionId]: { title: "", type: "VIDEO" },
      }));
      queryClient.invalidateQueries({ queryKey: ["editor-course", id] });
    },
  });

  if (!isNew && isLoading)
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading course...
      </div>
    );

  const canSave = title.trim() && effectiveSlug.trim() && !saveMutation.isPending;

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
          onClick={() => saveMutation.mutate()}
          disabled={!canSave}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {isNew ? "Create Course" : "Save Changes"}
        </button>
      </div>

      {saveMutation.isError && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          Save failed. Check that the slug is unique and all required fields are
          filled.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">
              Basic Info
            </h2>
            <Field label="Course Title">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
                placeholder="E.g. Advanced React Patterns"
              />
            </Field>
            <Field label="Slug (URL)">
              <input
                type="text"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className={inputCls}
                placeholder="advanced-react-patterns"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={inputCls}
                placeholder="What will students learn?"
              />
            </Field>
            <Field label="Thumbnail URL">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price ($)">
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className={inputCls}
                />
              </Field>
              <Field label="Level">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className={inputCls}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 text-lg mb-6">
              Curriculum
            </h2>

            {isNew ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                Save the course first to start adding sections and lessons.
              </div>
            ) : (
              <div className="space-y-4">
                {(course?.sections ?? []).map((section: any) => {
                  const draft = newLesson[section.id] ?? {
                    title: "",
                    type: "VIDEO",
                  };
                  return (
                    <div
                      key={section.id}
                      className="border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <div className="p-4 border-b border-slate-200 font-semibold text-slate-800">
                        Section {section.orderIndex}: {section.title}
                      </div>
                      <div className="p-4 space-y-2">
                        {(section.lessons ?? []).map(
                          (lesson: any, idx: number) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-md"
                            >
                              <span className="text-sm text-slate-700">
                                {idx + 1}. {lesson.title}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                                {lesson.type}
                              </span>
                            </div>
                          ),
                        )}
                        {/* Add lesson */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(e) =>
                              setNewLesson((prev) => ({
                                ...prev,
                                [section.id]: {
                                  ...draft,
                                  title: e.target.value,
                                },
                              }))
                            }
                            placeholder="New lesson title"
                            className={`${inputCls} flex-1`}
                          />
                          <select
                            value={draft.type}
                            onChange={(e) =>
                              setNewLesson((prev) => ({
                                ...prev,
                                [section.id]: {
                                  ...draft,
                                  type: e.target.value,
                                },
                              }))
                            }
                            className={inputCls}
                          >
                            <option value="VIDEO">VIDEO</option>
                            <option value="ARTICLE">ARTICLE</option>
                          </select>
                          <button
                            onClick={() =>
                              draft.title.trim() &&
                              addLessonMutation.mutate({
                                sectionId: section.id,
                                title: draft.title.trim(),
                                type: draft.type,
                                order: (section.lessons?.length ?? 0) + 1,
                              })
                            }
                            disabled={addLessonMutation.isPending}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md shrink-0"
                            title="Add lesson"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add section */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="New section title"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    onClick={() =>
                      newSection.trim() &&
                      addSectionMutation.mutate(newSection.trim())
                    }
                    disabled={addSectionMutation.isPending}
                    className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Section
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
