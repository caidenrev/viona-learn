import { describe, it, expect } from "vitest";
import {
  computeRoadmapCourseStates,
  gradeQuizSubmission,
  QuizError,
} from "@/lib/progression";

describe("roadmap progression and quiz grading", () => {
  it("ignores DRAFT courses, unlocks first published course, and keeps passed courses passed", () => {
    const courses = [
      { id: "c0", orderIndex: 0, status: "DRAFT" as const },
      { id: "c1", orderIndex: 1, status: "PUBLISHED" as const },
      { id: "c2", orderIndex: 2, status: "PUBLISHED" as const },
      { id: "c3", orderIndex: 3, status: "PUBLISHED" as const },
    ];
    const progress = new Map([
      ["c1", { status: "PASSED" as const, bestScore: 90 }],
      ["c3", { status: "PASSED" as const, bestScore: 80 }],
    ]);

    const states = computeRoadmapCourseStates(courses, progress);
    expect(states).toEqual([
      { courseId: "c1", effectiveStatus: "PASSED", bestScore: 90 },
      { courseId: "c2", effectiveStatus: "UNLOCKED", bestScore: 0 },
      { courseId: "c3", effectiveStatus: "PASSED", bestScore: 80 },
    ]);
  });

  it("rejects 0-question quizzes instead of dividing by zero or auto-passing", () => {
    expect(() =>
      gradeQuizSubmission({
        questions: [],
        answers: {},
        passingScore: 70,
      })
    ).toThrowError(QuizError);
  });

  it("withholds explanations on failed attempt and reveals them when passed", () => {
    const questions = [
      { id: "q1", correctOptionId: "a", explanation: "Because A is semantic" },
      { id: "q2", correctOptionId: "b", explanation: "Because B is pure" },
    ];

    const failResult = gradeQuizSubmission({
      questions,
      answers: { q1: "a", q2: "c" },
      passingScore: 70,
    });
    expect(failResult.score).toBe(50);
    expect(failResult.passed).toBe(false);
    expect(failResult.incorrectQuestionIds).toEqual(["q2"]);
    expect(failResult.explanationsByQuestionId).toBeUndefined();

    const passResult = gradeQuizSubmission({
      questions,
      answers: { q1: "a", q2: "b" },
      passingScore: 70,
    });
    expect(passResult.score).toBe(100);
    expect(passResult.passed).toBe(true);
    expect(passResult.incorrectQuestionIds).toEqual([]);
    expect(passResult.explanationsByQuestionId).toEqual({
      q1: "Because A is semantic",
      q2: "Because B is pure",
    });
  });
});
