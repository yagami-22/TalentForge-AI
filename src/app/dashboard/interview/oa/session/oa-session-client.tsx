"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  OA_ANSWERS_STORAGE_KEY,
  INTERVIEW_HISTORY_STORAGE_KEY,
  OA_REPORT_STORAGE_KEY,
  OA_SESSION_STORAGE_KEY,
} from "@/app/dashboard/interview/interview-storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createOAHistoryAttempt,
  mergeHistoryAttempts,
  type InterviewHistoryAttempt,
} from "@/lib/interview-history";
import { generateOAReport } from "@/lib/oa-evaluation";
import type { OAAnswer, OASession, OASessionQuestion } from "@/lib/oa-session";
import { forge } from "@/lib/talentforge-design";

function isStoredOASession(value: unknown): value is OASession {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "questions" in value &&
    Array.isArray((value as { questions?: unknown }).questions)
  );
}

function isStoredOAAnswers(value: unknown): value is OAAnswer[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "questionId" in item &&
        "answer" in item &&
        "elapsedSeconds" in item
    )
  );
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(OA_SESSION_STORAGE_KEY);
    const parsedSession = rawSession ? JSON.parse(rawSession) : null;

    return isStoredOASession(parsedSession) ? parsedSession : null;
  } catch {
    window.localStorage.removeItem(OA_SESSION_STORAGE_KEY);
    return null;
  }
}

function readStoredAnswers() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawAnswers = window.localStorage.getItem(OA_ANSWERS_STORAGE_KEY);
    const parsedAnswers = rawAnswers ? JSON.parse(rawAnswers) : [];

    return isStoredOAAnswers(parsedAnswers) ? parsedAnswers : [];
  } catch {
    window.localStorage.removeItem(OA_ANSWERS_STORAGE_KEY);
    return [];
  }
}

function readHistoryAttempts() {
  try {
    const rawHistory = window.localStorage.getItem(INTERVIEW_HISTORY_STORAGE_KEY);
    const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];

    return Array.isArray(parsedHistory)
      ? parsedHistory.filter(
          (attempt): attempt is InterviewHistoryAttempt =>
            typeof attempt === "object" &&
            attempt !== null &&
            "id" in attempt &&
            "overallScore" in attempt
        )
      : [];
  } catch {
    window.localStorage.removeItem(INTERVIEW_HISTORY_STORAGE_KEY);
    return [];
  }
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function difficultyClass(difficulty: string) {
  const normalizedDifficulty = difficulty.toLowerCase();

  if (normalizedDifficulty === "easy") {
    return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  }

  if (normalizedDifficulty === "hard" || normalizedDifficulty === "veryhard") {
    return "border-rose-300/25 bg-rose-400/10 text-rose-100";
  }

  return "border-amber-300/25 bg-amber-400/10 text-amber-100";
}

function upsertElapsedAnswer({
  answers,
  question,
  elapsedSeconds,
}: {
  answers: OAAnswer[];
  question: OASessionQuestion | null;
  elapsedSeconds: number;
}) {
  if (!question) {
    return answers;
  }

  const existing = answers.find((item) => item.questionId === question.id);

  if (existing) {
    return answers.map((item) =>
      item.questionId === question.id
        ? { ...item, elapsedSeconds, savedAt: new Date().toISOString() }
        : item
    );
  }

  return [
    ...answers,
    {
      questionId: question.id,
      answer: "",
      elapsedSeconds,
      savedAt: new Date().toISOString(),
    },
  ];
}

export function OASessionClient() {
  const router = useRouter();
  const [session] = useState<OASession | null>(() => readStoredSession());
  const [answers, setAnswers] = useState<OAAnswer[]>(() => readStoredAnswers());
  const [currentIndex, setCurrentIndex] = useState(() => {
    const stored = readStoredSession();
    return stored?.currentQuestionIndex ?? 0;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const stored = readStoredSession();
    const storedAnswers = readStoredAnswers();
    const question = stored?.questions[stored.currentQuestionIndex ?? 0];
    return question
      ? storedAnswers.find((item) => item.questionId === question.id)?.elapsedSeconds ?? 0
      : 0;
  });
  const [completionMessage, setCompletionMessage] = useState("");

  const currentQuestion = session?.questions[currentIndex] ?? null;
  const currentAnswerRecord = currentQuestion
    ? answers.find((item) => item.questionId === currentQuestion.id) ?? null
    : null;
  const currentAnswer = currentAnswerRecord?.answer ?? "";
  const timeLimitSeconds = (currentQuestion?.timeLimitMinutes ?? 0) * 60;
  const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);
  const answeredCount = useMemo(
    () => answers.filter((answer) => answer.answer.trim().length > 0).length,
    [answers]
  );

  useEffect(() => {
    if (!answers.length) {
      window.localStorage.removeItem(OA_ANSWERS_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(OA_ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (!session) {
      return;
    }

    window.localStorage.setItem(OA_SESSION_STORAGE_KEY, JSON.stringify({
      ...session,
      currentQuestionIndex: currentIndex,
      status: completionMessage ? ("completed" as const) : ("in_progress" as const),
    }));
  }, [completionMessage, currentIndex, session]);

  useEffect(() => {
    if (!currentQuestion || completionMessage) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) =>
        timeLimitSeconds ? Math.min(timeLimitSeconds, seconds + 1) : seconds + 1
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [completionMessage, currentQuestion, timeLimitSeconds]);

  function updateAnswer(value: string) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((previous) => {
      const existing = previous.find((item) => item.questionId === currentQuestion.id);

      if (existing) {
        return previous.map((item) =>
          item.questionId === currentQuestion.id
            ? {
                ...item,
                answer: value,
                elapsedSeconds,
                savedAt: new Date().toISOString(),
              }
            : item
        );
      }

      return [
        ...previous,
        {
          questionId: currentQuestion.id,
          answer: value,
          elapsedSeconds,
          savedAt: new Date().toISOString(),
        },
      ];
    });
  }

  function getElapsedForQuestion(questionId: string) {
    return answers.find((item) => item.questionId === questionId)?.elapsedSeconds ?? 0;
  }

  function persistElapsedForCurrent() {
    if (!currentQuestion) {
      return;
    }

    setAnswers((previous) => {
      const existing = previous.find((item) => item.questionId === currentQuestion.id);

      if (existing) {
        return previous.map((item) =>
          item.questionId === currentQuestion.id
            ? { ...item, elapsedSeconds, savedAt: new Date().toISOString() }
            : item
        );
      }

      return [
        ...previous,
        {
          questionId: currentQuestion.id,
          answer: "",
          elapsedSeconds,
          savedAt: new Date().toISOString(),
        },
      ];
    });
  }

  function goNext() {
    if (!session) {
      return;
    }

    const nextIndex = Math.min(session.questions.length - 1, currentIndex + 1);
    const nextQuestion = session.questions[nextIndex];

    persistElapsedForCurrent();
    setCompletionMessage("");
    setCurrentIndex(nextIndex);
    setElapsedSeconds(nextQuestion ? getElapsedForQuestion(nextQuestion.id) : 0);
  }

  function goPrevious() {
    if (!session) {
      return;
    }

    const previousIndex = Math.max(0, currentIndex - 1);
    const previousQuestion = session.questions[previousIndex];

    persistElapsedForCurrent();
    setCompletionMessage("");
    setCurrentIndex(previousIndex);
    setElapsedSeconds(previousQuestion ? getElapsedForQuestion(previousQuestion.id) : 0);
  }

  function finishSession() {
    if (!session) {
      return;
    }

    persistElapsedForCurrent();
    const finalAnswers = upsertElapsedAnswer({
      answers,
      question: currentQuestion,
      elapsedSeconds,
    });
    const report = generateOAReport(session, finalAnswers);
    const historyAttempt = createOAHistoryAttempt({
      report,
      session,
      answers: finalAnswers,
    });

    window.localStorage.setItem(OA_ANSWERS_STORAGE_KEY, JSON.stringify(finalAnswers));
    window.localStorage.setItem(OA_REPORT_STORAGE_KEY, JSON.stringify(report));
    window.localStorage.setItem(
      INTERVIEW_HISTORY_STORAGE_KEY,
      JSON.stringify(mergeHistoryAttempts(readHistoryAttempts(), historyAttempt))
    );
    setCompletionMessage("OA report generated and saved locally.");
    router.push("/dashboard/interview/oa/results");
  }

  if (!session || !currentQuestion) {
    return (
      <EmptyState
        title="No active OA assessment"
        description="Create an OA Assessment from the interview dashboard to start answering selected questions."
      />
    );
  }

  const progressValue = Math.round(((currentIndex + 1) / session.questions.length) * 100);

  return (
    <div className="space-y-6">
      <section className={`p-5 ${forge.cardStrong}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-100">
              OA Assessment Session
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {session.targetRole}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Resume: {session.resumeTitle} · {answeredCount}/{session.questions.length} answers saved locally
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric title="Timer" value={formatTime(remainingSeconds)} />
            <Metric title="Progress" value={`${progressValue}%`} />
            <Metric title="Total score" value={`${session.questions.reduce((sum, question) => sum + question.scoreValue, 0)} pts`} />
          </div>
        </div>
        <div className={`mt-5 h-2 ${forge.progressTrack}`}>
          <div className={forge.progressFill} style={{ width: `${progressValue}%` }} />
        </div>
      </section>

      <section className={forge.cardStrong}>
        <div className="border-b border-white/10 bg-[#070B1F]/60 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-cyan-100">
                Question {currentIndex + 1} / {session.questions.length}
              </p>
              <h2 className="mt-2 text-2xl font-semibold leading-8">
                {currentQuestion.title}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${difficultyClass(
                  currentQuestion.difficulty
                )}`}
              >
                {currentQuestion.difficulty}
              </span>
              <span className="rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium text-cyan-100">
                {currentQuestion.scoreValue} pts
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                {currentQuestion.type}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
            <p className="text-sm leading-7 text-zinc-200">{currentQuestion.prompt}</p>
          </div>

          {currentQuestion.options.length ? (
            <div className="grid gap-2 md:grid-cols-2">
              {currentQuestion.options.map((option) => (
                <div key={option.label} className={forge.metric}>
                  <p className="text-xs font-semibold text-cyan-100">
                    Option {option.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{option.text}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-3">
            <InfoBlock title="Skills covered" items={currentQuestion.skills} />
            <InfoBlock
              title="Selection reasons"
              items={currentQuestion.selectionReasons}
            />
            <InfoBlock
              title="Hints"
              items={
                currentQuestion.hints.length
                  ? currentQuestion.hints
                  : ["No hint available for this question."]
              }
            />
          </div>

          {currentQuestion.constraints.length ? (
            <InfoBlock title="Constraints" items={currentQuestion.constraints} />
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label htmlFor="oa-answer" className="text-sm font-medium text-zinc-200">
                  Your answer
                </label>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Answers autosave locally on this browser. Report scoring is deterministic and does not use AI yet.
                </p>
              </div>
              <p className="text-xs text-cyan-100">
                Saved {currentAnswerRecord ? "locally" : "after you start typing"}
              </p>
            </div>
            <Textarea
              id="oa-answer"
              value={currentAnswer}
              onChange={(event) => updateAnswer(event.target.value)}
              rows={10}
              placeholder="Type your solution, SQL query, MCQ choice, or explanation here..."
              className={`mt-3 max-h-[48vh] min-h-56 resize-y overflow-y-auto p-4 ${forge.input}`}
            />
          </div>

          {completionMessage ? (
            <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {completionMessage}
            </p>
          ) : null}
        </div>
      </section>

      <div className={`${forge.panel} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className={forge.secondaryButton}
          >
            Previous
          </Button>
          <Button
            type="button"
            onClick={goNext}
            disabled={currentIndex === session.questions.length - 1}
            className={forge.primaryButton}
          >
            Next
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={finishSession}
          className={forge.secondaryButton}
        >
          Finish & Save Locally
        </Button>
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-4 py-3 text-right shadow-[0_0_24px_rgba(0,229,255,0.1)]">
      <p className="text-xs font-medium uppercase text-cyan-100">{title}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={forge.metric}>
      <p className="text-xs font-medium uppercase text-cyan-100">{title}</p>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-400">
        {items.slice(0, 5).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={`${forge.card} rounded-3xl p-8 text-center`}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
        {description}
      </p>
      <Button asChild className={`mt-5 ${forge.primaryButton}`}>
        <Link href="/dashboard/interview">Create OA Assessment</Link>
      </Button>
    </div>
  );
}
