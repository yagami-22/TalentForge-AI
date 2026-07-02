"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lightbulb, MessageSquarePlus, SkipForward } from "lucide-react";

import { evaluateMockInterview } from "@/app/dashboard/interview/actions";
import {
  INTERVIEW_ANSWERS_STORAGE_KEY,
  INTERVIEW_EVALUATION_STORAGE_KEY,
  INTERVIEW_HISTORY_STORAGE_KEY,
  INTERVIEW_SESSION_STORAGE_KEY,
  INTERVIEW_SIMULATOR_CONFIG_STORAGE_KEY,
  type StoredInterviewSimulatorConfig,
} from "@/app/dashboard/interview/interview-storage";
import {
  InterviewProgress,
  InterviewSessionCard,
  InterviewTimer,
  SessionActionButton,
} from "@/app/dashboard/interview/interview-simulator-ui";
import { initialInterviewEvaluationState } from "@/app/dashboard/interview/state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createMockInterviewHistoryAttempt,
  mergeHistoryAttempts,
  type InterviewHistoryAttempt,
} from "@/lib/interview-history";
import type {
  InterviewAnswer,
  InterviewSession,
} from "@/lib/interview-prep";
import { getInterviewModeTitle } from "@/lib/interview-prep";
import { forge } from "@/lib/talentforge-design";

function isStoredSession(value: unknown): value is InterviewSession {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "questions" in value &&
    Array.isArray((value as { questions?: unknown }).questions)
  );
}

function isStoredAnswers(value: unknown): value is InterviewAnswer[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "questionId" in item &&
        "answer" in item
    )
  );
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(INTERVIEW_SESSION_STORAGE_KEY);
    const parsedSession = rawSession ? JSON.parse(rawSession) : null;

    return isStoredSession(parsedSession) ? parsedSession : null;
  } catch {
    window.localStorage.removeItem(INTERVIEW_SESSION_STORAGE_KEY);
    return null;
  }
}

function readStoredAnswers() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawAnswers = window.localStorage.getItem(INTERVIEW_ANSWERS_STORAGE_KEY);
    const parsedAnswers = rawAnswers ? JSON.parse(rawAnswers) : [];

    return isStoredAnswers(parsedAnswers) ? parsedAnswers : [];
  } catch {
    window.localStorage.removeItem(INTERVIEW_ANSWERS_STORAGE_KEY);
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

function readSimulatorConfig() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawConfig = window.localStorage.getItem(
      INTERVIEW_SIMULATOR_CONFIG_STORAGE_KEY
    );
    const parsedConfig = rawConfig ? JSON.parse(rawConfig) : null;

    return parsedConfig &&
      typeof parsedConfig === "object" &&
      "mode" in parsedConfig &&
      "company" in parsedConfig
      ? (parsedConfig as StoredInterviewSimulatorConfig)
      : null;
  } catch {
    window.localStorage.removeItem(INTERVIEW_SIMULATOR_CONFIG_STORAGE_KEY);
    return null;
  }
}

function buildFollowUp(
  question: NonNullable<InterviewSession["questions"][number]>,
  config: StoredInterviewSimulatorConfig | null
) {
  if (/behavioral|hr/i.test(config?.mode ?? "") || question.mode === "BehavioralHR") {
    return "Follow-up: answer this again using Situation, Task, Action, and Result, then add what you learned.";
  }

  if (/project/i.test(config?.mode ?? "") || question.mode === "ProjectDeepDive") {
    return "Follow-up: explain the architecture tradeoff you would defend if an interviewer challenged this decision.";
  }

  if (/system design|backend/i.test(config?.mode ?? "")) {
    return "Follow-up: how would your answer change at 10x traffic, and what would fail first?";
  }

  return "Follow-up: state the edge cases, complexity, and one alternative approach.";
}

function buildHint(question: NonNullable<InterviewSession["questions"][number]>) {
  return [
    question.focus,
    ...question.expectedSignals.slice(0, 3),
    ...question.resumeEvidence.slice(0, 2),
  ].filter(Boolean);
}

export function InterviewSessionClient() {
  const router = useRouter();
  const [session] = useState<InterviewSession | null>(() => readStoredSession());
  const [simulatorConfig] = useState<StoredInterviewSimulatorConfig | null>(() =>
    readSimulatorConfig()
  );
  const [answers, setAnswers] = useState<InterviewAnswer[]>(() =>
    readStoredAnswers()
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [hintVisible, setHintVisible] = useState(false);
  const [followUpVisible, setFollowUpVisible] = useState(false);
  const [state, formAction, pending] = useActionState(
    evaluateMockInterview,
    initialInterviewEvaluationState
  );
  const savedEvaluationRef = useRef("");

  useEffect(() => {
    if (!timerRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!answers.length) {
      return;
    }

    window.localStorage.setItem(INTERVIEW_ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (state.status !== "success" || !state.evaluation || !session) {
      return;
    }

    if (savedEvaluationRef.current === state.evaluation.sessionId) {
      return;
    }

    savedEvaluationRef.current = state.evaluation.sessionId;

    const completedSession = {
      ...session,
      answers,
      status: "completed" as const,
    };

    window.localStorage.setItem(
      INTERVIEW_SESSION_STORAGE_KEY,
      JSON.stringify(completedSession)
    );
    window.localStorage.setItem(
      INTERVIEW_EVALUATION_STORAGE_KEY,
      JSON.stringify(state.evaluation)
    );
    window.localStorage.setItem(
      INTERVIEW_HISTORY_STORAGE_KEY,
      JSON.stringify(
        mergeHistoryAttempts(
          readHistoryAttempts(),
          createMockInterviewHistoryAttempt({
            evaluation: state.evaluation,
            session: completedSession,
            answers,
          })
        )
      )
    );
    router.push("/dashboard/interview/report");
  }, [answers, router, session, state.evaluation, state.status]);

  const currentQuestion = session?.questions[currentIndex] ?? null;
  const currentAnswer = currentQuestion
    ? answers.find((item) => item.questionId === currentQuestion.id)?.answer ?? ""
    : "";
  const answeredCount = useMemo(
    () => answers.filter((answer) => answer.answer.trim().length > 0).length,
    [answers]
  );
  const allAnswered = Boolean(
    session && answeredCount === session.questions.length && session.questions.length > 0
  );

  function updateAnswer(value: string) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((previous) => {
      const existing = previous.find((item) => item.questionId === currentQuestion.id);

      if (existing) {
        return previous.map((item) =>
          item.questionId === currentQuestion.id
            ? { ...item, answer: value, answeredAt: new Date().toISOString() }
            : item
        );
      }

      return [
        ...previous,
        {
          questionId: currentQuestion.id,
          answer: value,
          answeredAt: new Date().toISOString(),
        },
      ];
    });
  }

  function goNext() {
    if (!session) {
      return;
    }

    setHintVisible(false);
    setFollowUpVisible(false);
    setCurrentIndex((index) => Math.min(session.questions.length - 1, index + 1));
  }

  function goPrevious() {
    setHintVisible(false);
    setFollowUpVisible(false);
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function skipQuestion() {
    updateAnswer("[Skipped]");
    goNext();
  }

  if (!session || !currentQuestion) {
    return (
      <EmptyState
        title="No active interview session"
        description="Generate a mock interview first, then return here to answer questions."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className={`p-5 ${forge.cardStrong}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-100">
              {simulatorConfig?.mode ?? getInterviewModeTitle(session.mode)} Session
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {session.targetRole}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Resume: {session.resumeTitle} · {simulatorConfig?.company ?? session.detectedDomain} · {simulatorConfig?.difficulty ?? "Adaptive"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(simulatorConfig?.smartSignals.length
              ? simulatorConfig.smartSignals
              : ["Resume skills", "JD signals", "Previous feedback"]
            ).slice(0, 4).map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-3 py-1 text-xs text-cyan-50"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <InterviewProgress
            current={currentIndex + 1}
            total={session.questions.length}
            answered={answeredCount}
          />
          <InterviewTimer
            elapsedSeconds={elapsedSeconds}
            running={timerRunning}
            onToggle={() => setTimerRunning((running) => !running)}
            onReset={() => setElapsedSeconds(0)}
          />
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="session" value={JSON.stringify(session)} />
        <input type="hidden" name="answers" value={JSON.stringify(answers)} />

        <InterviewSessionCard
          eyebrow={`Question ${currentIndex + 1} of ${session.questions.length}`}
          title={currentQuestion.prompt}
          badge={currentQuestion.difficulty}
        >
          <div className="space-y-4 p-5">
            <div className="grid gap-3 lg:grid-cols-3">
              <InfoBlock title="Focus" items={[currentQuestion.focus]} />
              <InfoBlock
                title="Expected signals"
                items={currentQuestion.expectedSignals}
              />
              <InfoBlock
                title="Resume evidence"
                items={
                  currentQuestion.resumeEvidence.length
                    ? currentQuestion.resumeEvidence
                    : ["No direct resume evidence detected for this prompt."]
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <SessionActionButton
                onClick={() => setHintVisible((visible) => !visible)}
                icon={Lightbulb}
              >
                {hintVisible ? "Hide Hint" : "Show Hint"}
              </SessionActionButton>
              <SessionActionButton
                onClick={() => setFollowUpVisible((visible) => !visible)}
                icon={MessageSquarePlus}
              >
                Follow-up Question
              </SessionActionButton>
              <SessionActionButton onClick={skipQuestion} icon={SkipForward}>
                Skip
              </SessionActionButton>
            </div>

            {hintVisible ? (
              <InfoBlock title="Hint" items={buildHint(currentQuestion)} />
            ) : null}

            {followUpVisible ? (
              <div className="rounded-2xl border border-purple-300/20 bg-purple-300/10 p-4 text-sm leading-6 text-purple-100">
                {buildFollowUp(currentQuestion, simulatorConfig)}
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
              <label htmlFor="answer" className="text-sm font-medium text-zinc-200">
                Your answer
              </label>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Use a concise situation, action, and result. Mention resume-backed evidence where possible.
              </p>
              <Textarea
                id="answer"
                value={currentAnswer}
                onChange={(event) => updateAnswer(event.target.value)}
                rows={9}
                placeholder="Type your answer here..."
                className={`mt-3 max-h-[48vh] min-h-52 resize-y overflow-y-auto p-4 ${forge.input}`}
              />
            </div>
          </div>
        </InterviewSessionCard>

        {state.message ? (
          <p
            aria-live="polite"
            className={
              state.status === "error"
                ? forge.statusError
                : forge.statusSuccess
            }
          >
            {state.message}
          </p>
        ) : null}

        <div className={`${forge.panel} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex gap-3">
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
              variant="outline"
              onClick={goNext}
              disabled={currentIndex === session.questions.length - 1}
              className={forge.secondaryButton}
            >
              Next Question
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="submit"
            disabled={pending || !allAnswered}
            className={`h-12 px-6 ${forge.primaryButton}`}
          >
            {pending ? "Evaluating..." : "Submit for Evaluation"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={forge.metric}>
      <p className="text-xs font-medium uppercase text-cyan-100">{title}</p>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-400">
        {items.slice(0, 4).map((item) => (
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
      <Button
        asChild
        className={`mt-5 ${forge.primaryButton}`}
      >
        <Link href="/dashboard/interview">Create Interview</Link>
      </Button>
    </div>
  );
}
