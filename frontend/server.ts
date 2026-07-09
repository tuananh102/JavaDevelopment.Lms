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
  const PORT = Number(process.env.PORT ?? 3000);

  app.use(express.json());

  // --- Real-backend proxy mode -------------------------------------------
  // Set BACKEND_URL (e.g. https://hcmute-lms.azurewebsites.net) to forward every
  // /api/v1/* call to the real backend instead of the mocks below. Because the
  // browser still talks to localhost:3000 (same origin), the backend's CORS
  // allowlist doesn't matter here. `npm run dev:remote` uses this.
  const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/+$/, "");
  if (BACKEND_URL) {
    console.log(`[proxy] /api/v1/* -> ${BACKEND_URL}`);
    app.use("/api/v1", async (req, res) => {
      try {
        // req.url is the path after the /api/v1 mount, query string included.
        const target = `${BACKEND_URL}/api/v1${req.url}`;
        const headers: Record<string, string> = {};
        if (req.headers.authorization)
          headers.authorization = String(req.headers.authorization);
        const isJson = String(req.headers["content-type"] ?? "").includes(
          "application/json",
        );
        if (isJson) headers["content-type"] = "application/json";
        const upstream = await fetch(target, {
          method: req.method,
          headers,
          body:
            !["GET", "HEAD"].includes(req.method) && isJson
              ? JSON.stringify(req.body ?? {})
              : undefined,
        });
        res.status(upstream.status);
        const ct = upstream.headers.get("content-type");
        if (ct) res.setHeader("content-type", ct);
        res.send(Buffer.from(await upstream.arrayBuffer()));
      } catch (e: any) {
        res.status(502).json({
          message: `Proxy to ${BACKEND_URL} failed: ${e?.message ?? e}`,
        });
      }
    });
  }

  // Mock user directory for the admin area.
  const MOCK_USERS: any[] = [
    { id: "u1", email: "admin@lms.com", fullName: "Admin User", role: "ADMIN", active: true },
    { id: "u2", email: "instructor@lms.com", fullName: "Instructor User", role: "INSTRUCTOR", active: true },
    { id: "u3", email: "student@lms.com", fullName: "Student User", role: "STUDENT", active: true },
  ];

  const roleFor = (email: string) => {
    if (email?.includes("admin")) return "ADMIN";
    if (email?.includes("instructor")) return "INSTRUCTOR";
    return "STUDENT";
  };

  // Mock "session": remembered from the last login so /users/me can echo the same
  // role back on refresh (mirrors the real backend, which reads it from the JWT).
  let currentUser: any = { ...MOCK_USERS[2] };

  app.post("/api/v1/auth/login", (req, res) => {
    const email = req.body.email ?? "student@lms.com";
    const role = roleFor(email);
    currentUser = {
      id: role === "ADMIN" ? "u1" : role === "INSTRUCTOR" ? "u2" : "u3",
      email,
      fullName: `${role.charAt(0)}${role.slice(1).toLowerCase()} User`,
      role,
      active: true,
    };
    res.json({
      token: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      ...currentUser,
    });
  });

  app.post("/api/v1/auth/refresh", (req, res) => {
    if (!req.body?.refreshToken) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    res.json({
      token: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      ...currentUser,
    });
  });

  app.post("/api/v1/auth/register", (_req, res) => {
    res.status(201).json({ message: "User registered successfully" });
  });

  // Current authenticated user — used by the frontend to rehydrate after refresh.
  app.get("/api/v1/users/me", (_req, res) => {
    res.json(currentUser);
  });

  app.put("/api/v1/users/me", (req, res) => {
    currentUser = { ...currentUser, fullName: req.body.fullName };
    res.json(currentUser);
  });

  app.put("/api/v1/users/me/password", (_req, res) => {
    res.status(204).end();
  });

  // Admin user management
  app.get("/api/v1/users", (_req, res) => {
    res.json(MOCK_USERS);
  });

  app.patch("/api/v1/users/:id/status", (req, res) => {
    const user = MOCK_USERS.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.active = req.query.active === "true";
    res.json(user);
  });

  // Admin promotes/demotes a user (e.g. STUDENT -> INSTRUCTOR).
  app.patch("/api/v1/users/:id/role", (req, res) => {
    const user = MOCK_USERS.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const role = String(req.query.role ?? "");
    if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid value for parameter 'role'" });
    }
    user.role = role;
    res.json(user);
  });

  const mkSlug = (s: string) =>
    s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+)|(-+$)/g, "");

  app.get("/api/v1/categories", (_req, res) => {
    res.json(MOCK_CATEGORIES);
  });

  app.post("/api/v1/categories", (req, res) => {
    const category = {
      id: nextId("cat"),
      name: req.body.name,
      slug: req.body.slug?.trim() ? mkSlug(req.body.slug) : mkSlug(req.body.name),
    };
    MOCK_CATEGORIES.push(category);
    res.status(201).json(category);
  });

  app.put("/api/v1/categories/:id", (req, res) => {
    const cat = MOCK_CATEGORIES.find((c) => c.id === req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    cat.name = req.body.name;
    cat.slug = req.body.slug?.trim() ? mkSlug(req.body.slug) : mkSlug(req.body.name);
    res.json(cat);
  });

  app.delete("/api/v1/categories/:id", (req, res) => {
    const i = MOCK_CATEGORIES.findIndex((c) => c.id === req.params.id);
    if (i < 0) return res.status(404).json({ message: "Category not found" });
    MOCK_CATEGORIES.splice(i, 1);
    res.status(204).end();
  });

  // API Routes
  // Mirrors backend GET /courses: ?q (keyword in title/description), ?categoryId,
  // ?page&size, ?sort=field,dir (whitelisted fields).
  app.get("/api/v1/courses", (req, res) => {
    const q = String(req.query.q ?? "").trim().toLowerCase();
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : null;
    const level = req.query.level ? String(req.query.level) : null;
    const page = Math.max(parseInt(String(req.query.page ?? "0"), 10) || 0, 0);
    const size = Math.min(Math.max(parseInt(String(req.query.size ?? "10"), 10) || 10, 1), 100);
    const [sortField, sortDir] = String(req.query.sort ?? "createdAt,desc").split(",");

    let list = MOCK_COURSES.filter((c) => c.status === "PUBLISHED");
    if (categoryId) list = list.filter((c) => c.categoryId === categoryId);
    if (level) list = list.filter((c) => c.level === level);
    if (q)
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );

    const SORTABLE = new Set(["createdAt", "updatedAt", "title", "price"]);
    const field = SORTABLE.has(sortField) ? sortField : "createdAt";
    const dir = sortDir?.toLowerCase() === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const av = a[field] ?? "";
      const bv = b[field] ?? "";
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
    });

    const start = page * size;
    res.json({
      content: list.slice(start, start + size),
      totalElements: list.length,
      totalPages: Math.ceil(list.length / size),
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
    res.status(201).json(course);
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
    res.status(201).json({ id: section.id });
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
    res.status(201).json({ id: lesson.id });
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
    const course = MOCK_COURSES.find((c) => c.id === courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (MOCK_ENROLLMENTS.find((e) => e.course.id === courseId)) {
      return res.status(409).json({ message: "User is already enrolled in this course" });
    }
    // Paid courses must go through the payment flow (mirrors the backend gate).
    if (Number(course.price ?? 0) > 0) {
      return res.status(409).json({
        message: "This course requires payment. Please complete checkout to enroll.",
      });
    }
    const enrollment = {
      id: "e" + Date.now(),
      // Use the ACTUAL course being enrolled in (not always MOCK_COURSE), and the
      // `completed` field name Jackson emits for EnrollmentDto.isCompleted.
      course,
      enrolledAt: new Date().toISOString(),
      completedLessonsCount: 0,
      completed: false,
    };
    MOCK_ENROLLMENTS.push(enrollment);
    res.status(201).json(enrollment);
  });

  app.get("/api/v1/enrollments", (req, res) => {
    res.json(MOCK_ENROLLMENTS);
  });

  app.get("/api/v1/enrollments/courses/:courseId/check", (req, res) => {
    const enrolled = !!MOCK_ENROLLMENTS.find(e => e.course.id === req.params.courseId);
    res.json({ enrolled });
  });

  // --- Simulated payments ---
  const MOCK_PAYMENTS: any[] = [];
  const orderDto = (p: any) => ({
    id: p.id,
    courseId: p.course.id,
    courseTitle: p.course.title,
    courseSlug: p.course.slug,
    amount: p.amount,
    status: p.status,
    createdAt: p.createdAt,
    paidAt: p.paidAt ?? null,
  });

  app.post("/api/v1/payments/courses/:courseId", (req, res) => {
    const course = MOCK_COURSES.find((c) => c.id === req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (Number(course.price ?? 0) <= 0) {
      return res.status(409).json({ message: "This course is free — enroll directly, no payment needed" });
    }
    if (MOCK_ENROLLMENTS.find((e) => e.course.id === course.id)) {
      return res.status(409).json({ message: "You are already enrolled in this course" });
    }
    let order = MOCK_PAYMENTS.find((p) => p.course.id === course.id && p.status === "PENDING");
    if (!order) {
      order = {
        id: nextId("pay"),
        course,
        amount: course.price,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        paidAt: null,
      };
      MOCK_PAYMENTS.push(order);
    }
    res.status(201).json(orderDto(order));
  });

  app.get("/api/v1/payments/:orderId", (req, res) => {
    const order = MOCK_PAYMENTS.find((p) => p.id === req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(orderDto(order));
  });

  app.get("/api/v1/payments", (_req, res) => {
    res.json(MOCK_PAYMENTS.map(orderDto));
  });

  app.post("/api/v1/payments/:orderId/confirm", (req, res) => {
    const order = MOCK_PAYMENTS.find((p) => p.id === req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "PENDING") {
      return res.status(409).json({ message: "This order can no longer be paid" });
    }
    order.status = "PAID";
    order.paidAt = new Date().toISOString();
    if (!MOCK_ENROLLMENTS.find((e) => e.course.id === order.course.id)) {
      MOCK_ENROLLMENTS.push({
        id: "e" + Date.now(),
        course: order.course,
        enrolledAt: new Date().toISOString(),
        completedLessonsCount: 0,
        completed: false,
      });
    }
    res.json(orderDto(order));
  });

  // --- Instructor analytics (mirrors GET /api/v1/instructor/stats) ---
  // The mock treats every course as owned by the logged-in instructor. A seeded
  // baseline keeps the dashboard populated before any interaction; enrollments
  // and payments made during the session are added on top.
  app.get("/api/v1/instructor/stats", (_req, res) => {
    const paid = MOCK_PAYMENTS.filter((p) => p.status === "PAID");
    const courses = MOCK_COURSES.map((c, i) => {
      const seedStudents = c.status === "PUBLISHED" ? 34 + i * 13 : 0;
      const students =
        seedStudents + MOCK_ENROLLMENTS.filter((e) => e.course.id === c.id).length;
      const revenue =
        Math.round(
          (seedStudents * Number(c.price ?? 0) +
            paid
              .filter((p) => p.course.id === c.id)
              .reduce((sum, p) => sum + Number(p.amount), 0)) * 100,
        ) / 100;
      return { id: c.id, title: c.title, status: c.status, students, revenue };
    });

    const ENROLL_SEED = [5, 9, 7, 12, 15, 11];
    const now = new Date();
    const monthly = ENROLL_SEED.map((enrollments, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (ENROLL_SEED.length - 1 - k), 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        month,
        enrollments,
        revenue: Math.round(enrollments * 49.99 * 100) / 100,
      };
    });

    res.json({
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === "PUBLISHED").length,
      totalStudents: courses.reduce((sum, c) => sum + c.students, 0),
      totalRevenue:
        Math.round(courses.reduce((sum, c) => sum + c.revenue, 0) * 100) / 100,
      courses,
      monthly,
    });
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
