import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const MOCK_COURSE = {
  id: "c1",
  slug: "spring-boot-react-fullstack",
  title: "Full-Stack Development with Spring Boot 4 & React 19",
  description: "Learn how to build production-ready full-stack applications using the latest tech stack.",
  price: 49.99,
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

  // API Routes
  app.get("/api/v1/courses", (req, res) => {
    res.json({
      content: [MOCK_COURSE],
      totalElements: 1,
      totalPages: 1
    });
  });

  app.get("/api/v1/courses/:slug", (req, res) => {
    if (req.params.slug === MOCK_COURSE.slug) {
      res.json(MOCK_COURSE);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
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
