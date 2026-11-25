import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireRole = vi.fn();
const mockRecordStudyActivity = vi.fn().mockResolvedValue({
  dateKey: "2026-11-25",
  recordedNew: true,
});

const mockPrisma = {
  roadmap: { findMany: vi.fn(), findFirst: vi.fn() },
  course: { findFirst: vi.fn(), findMany: vi.fn() },
  module: { findFirst: vi.fn() },
  moduleProgress: { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
  courseProgress: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
  quizQuestion: { findMany: vi.fn() },
  quizAttempt: { create: vi.fn() },
  courseRating: { upsert: vi.fn() },
  workspaceTask: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
  note: { findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
  dailyActivity: { findMany: vi.fn() },
  appSettings: { findUnique: vi.fn() },
};

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    requireRole: (...args: unknown[]) => mockRequireRole(...args),
  };
});

vi.mock("@/lib/streak", async () => {
  const actual = await vi.importActual<typeof import("@/lib/streak")>("@/lib/streak");
  return {
    ...actual,
    recordStudyActivity: (...args: unknown[]) => mockRecordStudyActivity(...args),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("student API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({
      userId: "student_1",
      username: "viona",
      name: "Viona",
      role: "STUDENT",
    });
  });

  it("strips correctOptionId and explanation in GET quiz before passing", async () => {
    mockPrisma.course.findFirst.mockResolvedValue({
      id: "c1",
      roadmapId: "r1",
      orderIndex: 1,
      passingScore: 70,
      status: "PUBLISHED",
      roadmap: { status: "PUBLISHED" },
      quizQuestions: [
        {
          id: "q1",
          prompt: "Apa itu JSX?",
          options: [{ id: "a", text: "Syntax" }, { id: "b", text: "DB" }],
          correctOptionId: "a",
          explanation: "JSX adalah syntax extension",
          orderIndex: 1,
        },
      ],
    });
    mockPrisma.course.findMany.mockResolvedValue([
      { id: "c1", orderIndex: 1, status: "PUBLISHED" },
    ]);
    mockPrisma.courseProgress.findMany.mockResolvedValue([]);
    mockPrisma.module.findFirst.mockResolvedValue(null);
    mockPrisma.moduleProgress.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/student/courses/[id]/quiz/route");
    const res = await GET(new Request("http://localhost/api/student/courses/c1/quiz"), {
      params: Promise.resolve({ id: "c1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.questions[0]).not.toHaveProperty("correctOptionId");
    expect(body.questions[0]).not.toHaveProperty("explanation");
  });

  it("rejects quiz submission with 400 if published modules are incomplete", async () => {
    mockPrisma.course.findFirst.mockResolvedValue({
      id: "c1",
      roadmapId: "r1",
      orderIndex: 1,
      passingScore: 70,
      status: "PUBLISHED",
      roadmap: { status: "PUBLISHED" },
      modules: [{ id: "m1", estimatedMinutes: 10 }],
      quizQuestions: [
        {
          id: "q1",
          correctOptionId: "a",
          explanation: "Karena A",
        },
      ],
    });
    mockPrisma.course.findMany.mockResolvedValue([
      { id: "c1", orderIndex: 1, status: "PUBLISHED" },
    ]);
    mockPrisma.courseProgress.findMany.mockResolvedValue([]);
    mockPrisma.moduleProgress.findMany.mockResolvedValue([]); // 0 completed

    const { POST } = await import("@/app/api/student/courses/[id]/quiz/submit/route");
    const res = await POST(
      new Request("http://localhost/api/student/courses/c1/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { q1: "a" } }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(400);
  });

  it("blocks rating submission with 403 before course is PASSED", async () => {
    mockPrisma.courseProgress.findUnique.mockResolvedValue({
      status: "UNLOCKED",
    });

    const { PUT } = await import("@/app/api/student/courses/[id]/rating/route");
    const res = await PUT(
      new Request("http://localhost/api/student/courses/c1/rating", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: 5, review: "Seru!" }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(403);
  });

  it("scopes student tasks strictly to userId", async () => {
    mockPrisma.workspaceTask.findMany.mockResolvedValue([]);
    const { GET } = await import("@/app/api/student/tasks/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockPrisma.workspaceTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "student_1" },
      })
    );
  });
});
