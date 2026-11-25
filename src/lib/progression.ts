export type CourseStatus = "LOCKED" | "UNLOCKED" | "PASSED";

export class QuizError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Evaluates sequential unlock status across PUBLISHED courses in a roadmap.
 * Preserves already-PASSED courses even if earlier courses are added/reordered.
 */
export function computeRoadmapCourseStates(
  courses: Array<{
    id: string;
    orderIndex: number;
    status: "DRAFT" | "PUBLISHED";
  }>,
  progressByCourseId: Map<string, { status: CourseStatus; bestScore: number }>
): Array<{
  courseId: string;
  effectiveStatus: CourseStatus;
  bestScore: number;
}> {
  const published = [...courses]
    .filter((course) => course.status === "PUBLISHED")
    .sort((a, b) => a.orderIndex - b.orderIndex);

  let previousPassed = true;
  return published.map((course) => {
    const existing = progressByCourseId.get(course.id);
    const bestScore = existing?.bestScore ?? 0;

    if (existing?.status === "PASSED") {
      previousPassed = true;
      return {
        courseId: course.id,
        effectiveStatus: "PASSED",
        bestScore,
      };
    }

    const effectiveStatus: CourseStatus = previousPassed
      ? "UNLOCKED"
      : "LOCKED";
    previousPassed = false;
    return {
      courseId: course.id,
      effectiveStatus,
      bestScore,
    };
  });
}

/**
 * Server-side Mini Quiz grading. Withholds explanations on failed attempts.
 */
export function gradeQuizSubmission(input: {
  questions: Array<{
    id: string;
    correctOptionId: string;
    explanation: string | null;
  }>;
  answers: Record<string, string>;
  passingScore: number;
}): {
  score: number;
  passed: boolean;
  incorrectQuestionIds: string[];
  explanationsByQuestionId?: Record<string, string | null>;
} {
  if (input.questions.length === 0) {
    throw new QuizError(
      400,
      "Mini quiz belum memiliki pertanyaan dari Teacher."
    );
  }

  let correctCount = 0;
  const incorrectQuestionIds: string[] = [];

  for (const question of input.questions) {
    if (input.answers[question.id] === question.correctOptionId) {
      correctCount += 1;
    } else {
      incorrectQuestionIds.push(question.id);
    }
  }

  const score = Math.round((correctCount / input.questions.length) * 100);
  const passed = score >= input.passingScore;

  if (!passed) {
    return {
      score,
      passed: false,
      incorrectQuestionIds,
    };
  }

  const explanationsByQuestionId: Record<string, string | null> = {};
  for (const question of input.questions) {
    explanationsByQuestionId[question.id] = question.explanation;
  }

  return {
    score,
    passed: true,
    incorrectQuestionIds,
    explanationsByQuestionId,
  };
}
