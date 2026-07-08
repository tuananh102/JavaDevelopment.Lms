import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const MOCK_CATEGORIES = [
  { id: "cat1", name: "Web Development", slug: "web-development" },
  { id: "cat2", name: "Backend", slug: "backend" },
];

const MOCK_COURSE: any = {
  id: "c1",
  slug: "spring-boot-react-fullstack",
  title: "Full-Stack Development with Spring Boot 4 & React 19",
  description: "Learn how to build production-ready full-stack applications using the latest tech stack.",
  price: 49.99,
  level: "INTERMEDIATE",
  status: "PUBLISHED",
  categoryId: "cat1",
  thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
  instructorId: "u1",
  sections: [
    {
      id: "s1",
      title: "Getting Started",
      orderIndex: 1,
      lessons: [
        { id: "l1", title: "Course Introduction", type: "VIDEO", durationSeconds: 300, orderIndex: 1 },
        { id: "l2", title: "Setting up the Environment", type: "ARTICLE", durationSeconds: 720, orderIndex: 2 },
      ],
    },
    {
      id: "s2",
      title: "Backend: Spring Boot Basics",
      orderIndex: 2,
      lessons: [
        { id: "l3", title: "Creating the project", type: "VIDEO", durationSeconds: 900, orderIndex: 1 },
      ],
    },
  ],
};

// Kho khoá học in-memory cho mock instructor flow.
const MOCK_COURSES: any[] = [MOCK_COURSE];
let idSeq = 100;
const nextId = (prefix: string) => `${prefix}${++idSeq}`;

const findSection = (sectionId: string) => {
  for (const c of MOCK_COURSES) {
    const s = c.sections.find((x: any) => x.id === sectionId);
    if (s) return s;
  }
  return null;
};
const findLesson = (lessonId: string) => {
  for (const c of MOCK_COURSES)
    for (const s of c.sections) {
      const l = s.lessons.find((x: any) => x.id === lessonId);
      if (l) return { lesson: l, section: s };
    }
  return null;
};

const MOCK_ENROLLMENTS: any[] = [];
const MOCK_PROGRESS: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/v1/auth/login", (req, res) => {
    res.json({
      token: "mock-jwt-token",
      id: "u1",
      fullName: "Test User",
      role: req.body.email && req.body.email.includes("instructor") ? "INSTRUCTOR" : "STUDENT"
    });
  });

  app.post("/api/v1/auth/register", (req, res) => {
    res.json({ message: "User registered successfully" });
  });

  app.get("/api/v1/categories", (_req, res) => {
    res.json(MOCK_CATEGORIES);
  });

  // API Routes
  app.get("/api/v1/courses", (_req, res) => {
    const published = MOCK_COURSES.filter((c) => c.status === "PUBLISHED");
    res.json({
      content: published,
      totalElements: published.length,
      totalPages: 1,
    });
  });

  // --- Instructor course management (literal paths BEFORE /:slug) ---
  app.get("/api/v1/courses/instructor", (_req, res) => {
    res.json(MOCK_COURSES);
  });

  app.get("/api/v1/courses/by-id/:id", (req, res) => {
    const course = MOCK_COURSES.find((c) => c.id === req.params.id);
    if (course) res.json(course);
    else res.status(404).json({ error: "Course not found" });
  });

  app.post("/api/v1/courses", (req, res) => {
    const course = {
      id: nextId("c"),
      status: "DRAFT",
      instructorId: "u1",
      sections: [],
      ...req.body,
    };
    MOCK_COURSES.push(course);
    res.json(course);
  });

  app.put("/api/v1/courses/:id", (req, res) => {
    const course = MOCK_COURSES.find((c) => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    Object.assign(course, req.body);
    res.json(course);
  });

  app.patch("/api/v1/courses/:id/status", (req, res) => {
    const course = MOCK_COURSES.find((c) => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    course.status = req.query.status;
    res.json({});
  });

  // Sections
  app.post("/api/v1/courses/:courseId/sections", (req, res) => {
    const course = MOCK_COURSES.find((c) => c.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const section = {
      id: nextId("s"),
      title: req.body.title,
      orderIndex: req.body.orderIndex ?? course.sections.length + 1,
      lessons: [],
    };
    course.sections.push(section);
    res.json({ id: section.id });
  });

  app.put("/api/v1/courses/sections/:sectionId", (req, res) => {
    const section = findSection(req.params.sectionId);
    if (!section) return res.status(404).json({ error: "Section not found" });
    section.title = req.body.title;
    if (req.body.orderIndex != null) section.orderIndex = req.body.orderIndex;
    res.json({});
  });

  app.delete("/api/v1/courses/sections/:sectionId", (req, res) => {
    for (const c of MOCK_COURSES) {
      const i = c.sections.findIndex((s: any) => s.id === req.params.sectionId);
      if (i >= 0) {
        c.sections.splice(i, 1);
        return res.status(204).end();
      }
    }
    res.status(404).json({ error: "Section not found" });
  });

  // Lessons
  app.post("/api/v1/courses/sections/:sectionId/lessons", (req, res) => {
    const section = findSection(req.params.sectionId);
    if (!section) return res.status(404).json({ error: "Section not found" });
    const lesson = {
      id: nextId("l"),
      title: req.body.title,
      type: req.body.type,
      contentUrl: req.body.contentUrl ?? null,
      contentText: req.body.contentText ?? null,
      durationSeconds: req.body.durationSeconds ?? 0,
      orderIndex: req.body.orderIndex ?? section.lessons.length + 1,
    };
    section.lessons.push(lesson);
    res.json({ id: lesson.id });
  });

  app.put("/api/v1/courses/lessons/:lessonId", (req, res) => {
    const found = findLesson(req.params.lessonId);
    if (!found) return res.status(404).json({ error: "Lesson not found" });
    Object.assign(found.lesson, req.body);
    res.json({});
  });

  app.delete("/api/v1/courses/lessons/:lessonId", (req, res) => {
    const found = findLesson(req.params.lessonId);
    if (!found) return res.status(404).json({ error: "Lesson not found" });
    const i = found.section.lessons.indexOf(found.lesson);
    found.section.lessons.splice(i, 1);
    res.status(204).end();
  });

  app.get("/api/v1/courses/:slug", (req, res) => {
    const course = MOCK_COURSES.find((c) => c.slug === req.params.slug);
    if (course) res.json(course);
    else res.status(404).json({ error: "Course not found" });
  });

  app.post("/api/v1/enrollments/courses/:courseId", (req, res) => {
    const courseId = req.params.courseId;
    if (MOCK_ENROLLMENTS.find(e => e.course.id === courseId)) {
      return res.status(400).json({ error: "Already enrolled" });
    }
    const enrollment = {
      id: "e" + Date.now(),
      course: MOCK_COURSE,
      enrolledAt: new Date().toISOString(),
      completedLessonsCount: 0,
      isCompleted: false
    };
    MOCK_ENROLLMENTS.push(enrollment);
    res.json(enrollment);
  });

  app.get("/api/v1/enrollments", (req, res) => {
    res.json(MOCK_ENROLLMENTS);
  });

  app.get("/api/v1/enrollments/courses/:courseId/check", (req, res) => {
    const enrolled = !!MOCK_ENROLLMENTS.find(e => e.course.id === req.params.courseId);
    res.json({ enrolled });
  });

  app.post("/api/v1/progress/courses/:courseId/lessons/:lessonId/complete", (req, res) => {
    const { courseId, lessonId } = req.params;
    MOCK_PROGRESS.push({ courseId, lessonId });
    res.json({ message: "Lesson marked as complete" });
  });

  app.get("/api/v1/progress/courses/:courseId/completed", (req, res) => {
    const completed = MOCK_PROGRESS.filter(p => p.courseId === req.params.courseId).map(p => p.lessonId);
    res.json(completed);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
