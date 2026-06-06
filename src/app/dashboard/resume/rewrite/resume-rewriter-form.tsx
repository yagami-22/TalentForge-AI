"use client";

import { Check, Copy, Download } from "lucide-react";
import type { ReactNode } from "react";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { rewriteResumeForJD } from "@/app/dashboard/resume/rewrite/actions";
import { initialResumeRewriteState } from "@/app/dashboard/resume/rewrite/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeRewriteResult } from "@/lib/resume-rewriter";
import { forge } from "@/lib/talentforge-design";

type ResumeOption = {
  id: string;
  title: string;
  createdAtLabel: string;
};

type SavedResumeRewriteState = {
  selectedResumeId: string;
  jobDescription: string;
  generatedRewrite: ResumeRewriteResult;
  generatedAt: string;
};

const RESUME_REWRITE_STORAGE_KEY = "talentforge_resume_rewrite";
const RESUME_REWRITE_STORAGE_EVENT = "talentforge.resumeRewrite.storage";
const SHOW_REWRITE_DEBUG_PANELS = process.env.NODE_ENV === "development";

function subscribeToSavedRewrite(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(RESUME_REWRITE_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(RESUME_REWRITE_STORAGE_EVENT, callback);
  };
}

function getSavedRewriteSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(RESUME_REWRITE_STORAGE_KEY);
}

function getServerSavedRewriteSnapshot() {
  return null;
}

function notifySavedRewriteChanged() {
  window.dispatchEvent(new Event(RESUME_REWRITE_STORAGE_EVENT));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isResumeRewriteResult(value: unknown): value is ResumeRewriteResult {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ResumeRewriteResult>;
  const isEducationArray = (items: unknown) =>
    Array.isArray(items) &&
    items.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as { degree?: unknown }).degree === "string" &&
        typeof (item as { institution?: unknown }).institution === "string" &&
        typeof (item as { duration?: unknown }).duration === "string" &&
        isStringArray((item as { details?: unknown }).details)
    );
  const isProjectArray = (items: unknown) =>
    Array.isArray(items) &&
    items.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as { title?: unknown }).title === "string" &&
        typeof (item as { duration?: unknown }).duration === "string" &&
        isStringArray((item as { bullets?: unknown }).bullets)
    );
  const isExperienceArray = (items: unknown) =>
    Array.isArray(items) &&
    items.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as { title?: unknown }).title === "string" &&
        typeof (item as { organization?: unknown }).organization === "string" &&
        typeof (item as { duration?: unknown }).duration === "string" &&
        isStringArray((item as { bullets?: unknown }).bullets)
    );
  const isPortfolio = (item: unknown) =>
    !!item &&
    typeof item === "object" &&
    (!("github" in item) || typeof (item as { github?: unknown }).github === "string") &&
    (!("leetcode" in item) || typeof (item as { leetcode?: unknown }).leetcode === "string") &&
    (!("website" in item) || typeof (item as { website?: unknown }).website === "string");

  return (
    typeof candidate.professionalSummary === "string" &&
    isEducationArray(candidate.education) &&
    isExperienceArray(candidate.workExperience) &&
    isProjectArray(candidate.projects) &&
    isPortfolio(candidate.portfolio) &&
    isStringArray(candidate.experienceBullets) &&
    isStringArray(candidate.skillsSection) &&
    isStringArray(candidate.atsKeywords) &&
    isStringArray(candidate.missingSkills) &&
    !!candidate.debug &&
    typeof candidate.debug.rawText === "string" &&
    typeof candidate.debug.rawTextLength === "number" &&
    (!("candidateName" in candidate.debug) ||
      typeof candidate.debug.candidateName === "string") &&
    isStringArray(candidate.debug.parsedSectionNamesFound) &&
    isStringArray(candidate.debug.technicalSkills) &&
    typeof candidate.debug.technicalSkillCount === "number" &&
    typeof candidate.debug.educationCount === "number" &&
    (!("experienceCount" in candidate.debug) ||
      typeof candidate.debug.experienceCount === "number") &&
    typeof candidate.debug.projectCount === "number" &&
    typeof candidate.debug.portfolioDetected === "boolean" &&
    typeof candidate.debug.finalPrompt === "string"
  );
}

function SectionCard({
  title,
  children,
  copyText,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  copyText: string;
  tone?: "default" | "good" | "warn";
}) {
  const [copied, setCopied] = useState(false);
  const titleTone =
    tone === "good"
      ? "text-emerald-200"
      : tone === "warn"
        ? "text-amber-200"
        : "text-zinc-100";

  async function copySection() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className={`overflow-hidden ${forge.card} ${forge.hoverCard}`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className={`text-base ${titleTone}`}>{title}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copySection}
            className={`w-full sm:w-auto ${forge.secondaryButton}`}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BulletList({ items, tone = "default" }: { items: string[]; tone?: "default" | "good" | "warn" }) {
  const marker =
    tone === "good" ? "bg-[#00E5FF]" : tone === "warn" ? "bg-amber-300" : "bg-[#6A5CFF]";

  return (
    <ul className="space-y-2 text-sm leading-6 text-zinc-300">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${marker}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DebugAccordion({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-xl border border-white/10 bg-black/25 text-white shadow-inner">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-cyan-100">
        {title}
        {meta ? <span className="ml-2 font-normal text-zinc-500">{meta}</span> : null}
      </summary>
      <div className="border-t border-white/10 p-4">{children}</div>
    </details>
  );
}

function DebugCodeBlock({ value }: { value: string }) {
  return (
    <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-950/80 p-4 text-xs leading-5 text-zinc-300">
      {value}
    </pre>
  );
}

function RewriteDebugPanels({ rewrite }: { rewrite: ResumeRewriteResult }) {
  const { debug } = rewrite;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/10 p-4 text-sm text-cyan-50">
        <p className="font-semibold">Debug visibility</p>
        <p className="mt-1 text-zinc-300">
          Raw text length: {debug.rawTextLength.toLocaleString()} characters ·
          Parsed sections: {debug.parsedSectionNamesFound.length} · Extracted
          skills: {debug.technicalSkillCount} · Education entries:{" "}
          {debug.educationCount} · Projects: {debug.projectCount} · Portfolio:{" "}
          {debug.portfolioDetected ? "detected" : "not detected"}
        </p>
      </div>

      <DebugAccordion
        title="Raw PDF Extracted Text"
        meta={`${debug.rawTextLength.toLocaleString()} chars`}
      >
        <DebugCodeBlock value={debug.rawText} />
      </DebugAccordion>

      <DebugAccordion
        title="Parsed Resume Sections JSON"
        meta={
          debug.parsedSectionNamesFound.length
            ? debug.parsedSectionNamesFound.join(", ")
            : "No headings detected"
        }
      >
        <DebugCodeBlock value={JSON.stringify(debug.parsedSections, null, 2)} />
      </DebugAccordion>

      <DebugAccordion
        title="Extracted Technical Skills Array"
        meta={`${debug.technicalSkillCount} skills`}
      >
        <DebugCodeBlock value={JSON.stringify(debug.technicalSkills, null, 2)} />
      </DebugAccordion>

      <DebugAccordion title="Final Prompt Sent To AI Model">
        <DebugCodeBlock value={debug.finalPrompt} />
      </DebugAccordion>
    </div>
  );
}

async function loadJsPdf() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDF export must run in the browser.");
  }

  const { jsPDF } = await import("jspdf");

  if (typeof jsPDF !== "function") {
    throw new Error("jsPDF did not resolve to a callable constructor.");
  }

  return jsPDF;
}

function normalizePdfText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function getPdfLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/[–—]/g, "-")
        .replace(/^[•*]\s*/, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .filter((line) => !/\b(?:page\s*-?\s*\d|break|-{4,})\b/i.test(line));
}

function extractPdfContact(rewrite: ResumeRewriteResult) {
  const lines = getPdfLines(rewrite.debug.rawText);
  const rawText = rewrite.debug.rawText;
  const email = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone =
    rawText.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/)?.[0]?.replace(/\s+/g, " ") ?? "";
  const location = /\bDelhi\b/i.test(rawText) ? "Delhi" : "";
  const portfolioLinks = [
    rewrite.portfolio.github,
    rewrite.portfolio.leetcode,
    rewrite.portfolio.website,
  ]
    .map((item) => normalizePdfText(item ?? ""))
    .filter(Boolean);
  const emailLineIndex = email
    ? lines.findIndex((line) => line.toLowerCase().includes(email.toLowerCase()))
    : -1;
  const nearbyLines =
    emailLineIndex >= 0
      ? lines.slice(Math.max(0, emailLineIndex - 4), emailLineIndex + 5)
      : lines.slice(0, 12);
  const name =
    normalizePdfText(rewrite.debug.candidateName ?? "") ||
    (nearbyLines.find((line) =>
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(line)
    ) ??
      lines.find((line) => /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(line)) ??
      "Resume");

  return {
    name,
    contactLine: [email, phone, location].filter(Boolean).join(" | "),
    portfolioLine: portfolioLinks.join(" | "),
  };
}

function groupTechnicalSkills(skills: string[]) {
  const groups = {
    languages: new Set<string>(),
    frameworks: new Set<string>(),
    databases: new Set<string>(),
    tools: new Set<string>(),
    concepts: new Set<string>(),
    machineLearning: new Set<string>(),
  };
  const used = new Set<string>();

  function add(skill: string, group: keyof typeof groups) {
    const cleaned = normalizePdfText(skill);
    const key = cleaned.toLowerCase();

    if (!cleaned || used.has(key)) return;

    groups[group].add(cleaned);
    used.add(key);
  }

  skills.forEach((skill) => {
    if (/^(?:c\+\+|javascript|typescript|sql)$/i.test(skill)) {
      add(skill, "languages");
      return;
    }

    if (/^(?:react|next\.js)$/i.test(skill)) {
      add(skill, "frameworks");
      return;
    }

    if (/^(?:mysql)$/i.test(skill)) {
      add(skill, "databases");
      return;
    }

    if (/^(?:git|github)$/i.test(skill)) {
      add(skill, "tools");
      return;
    }

    if (/machine learning/i.test(skill)) {
      add(skill, "machineLearning");
      return;
    }

    if (/\b(?:dsa|algorithms|oop|apis?|rest api|software testing|ci\/cd|test automation|frontend development|backend development)\b/i.test(skill)) {
      add(skill, "concepts");
    }
  });

  return [
    { label: "Languages", items: Array.from(groups.languages) },
    { label: "Frameworks & Libraries", items: Array.from(groups.frameworks) },
    { label: "Databases", items: Array.from(groups.databases) },
    { label: "Tools", items: Array.from(groups.tools) },
    { label: "Concepts", items: Array.from(groups.concepts) },
    { label: "Machine Learning", items: Array.from(groups.machineLearning) },
  ].filter((group) => group.items.length > 0);
}

function extractResumeExportActivities(rewrite: ResumeRewriteResult) {
  const activityLines = Object.entries(rewrite.debug.parsedSections)
    .filter(([sectionName]) =>
      /\b(?:extra\s*curricular|extracurricular|activities|achievements|leadership)\b/i.test(
        sectionName
      )
    )
    .flatMap(([, lines]) => lines);

  return activityLines
    .map((line) => normalizePdfText(line.replace(/^[\-–]\s*/, "")))
    .filter(Boolean)
    .filter((line) => !/\b(?:page\s*-?\s*\d|break|-{4,}|rest api|test automation)\b/i.test(line))
    .filter((line) => line.length >= 20 && line.length <= 180)
    .slice(0, 5);
}

function writeResumeExportPdf(
  doc: InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>,
  rewrite: ResumeRewriteResult
) {
  const marginX = 54;
  const marginTop = 54;
  const marginBottom = 54;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginX * 2;
  const bodyLineHeight = 14;
  let y = marginTop;

  function ensureSpace(requiredHeight: number) {
    if (y + requiredHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  }

  function addHeader(name: string, contactLine: string, portfolioLine: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(17, 17, 17);
    ensureSpace(28);
    doc.text(name, pageWidth / 2, y, { align: "center" });
    y += 15;

    if (contactLine) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(contactLine, pageWidth / 2, y, { align: "center" });
      y += 10;
    }

    if (portfolioLine) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(portfolioLine, pageWidth / 2, y, { align: "center" });
      y += 10;
    }

    doc.setDrawColor(209, 213, 219);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 18;
  }

  function addHeading(title: string) {
    ensureSpace(28);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    doc.text(title.toUpperCase(), marginX, y);
    y += 7;
    doc.setDrawColor(209, 213, 219);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 14;
  }

  function addParagraph(text: string) {
    const cleaned = normalizePdfText(text);

    if (!cleaned) return;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(17, 17, 17);

    const lines = doc.splitTextToSize(cleaned, maxWidth) as string[];
    ensureSpace(lines.length * bodyLineHeight);
    doc.text(lines, marginX, y);
    y += lines.length * bodyLineHeight + 4;
  }

  function addBulletList(items: string[]) {
    const cleanedItems = items.map(normalizePdfText).filter(Boolean);

    if (!cleanedItems.length) return;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(17, 17, 17);

    cleanedItems.forEach((item) => {
      const lines = doc.splitTextToSize(item, maxWidth - 18) as string[];
      ensureSpace(lines.length * bodyLineHeight);
      doc.text("•", marginX, y);
      doc.text(lines, marginX + 18, y);
      y += lines.length * bodyLineHeight + 3;
    });
  }

  function addEducation() {
    const educationItems = rewrite.education.filter(
      (item) => item.degree || item.institution || item.duration || item.details.length
    );

    if (!educationItems.length) return;

    addHeading("Education");
    educationItems.forEach((item) => {
      const headline = [item.degree, item.institution, item.duration]
        .map(normalizePdfText)
        .filter(Boolean)
        .join(" | ");
      addParagraph(headline);
      if (item.details.length) {
        addBulletList(item.details);
      }
    });
  }

  function addProjects() {
    const projectItems = rewrite.projects.filter((item) => item.title || item.bullets.length);

    if (!projectItems.length) return;

    addHeading("Projects");
    projectItems.forEach((project) => {
      const title = [project.title, project.duration]
        .map(normalizePdfText)
        .filter(Boolean)
        .join(" | ");
      addParagraph(title);
      addBulletList(project.bullets);
    });
  }

  function addWorkExperience() {
    const experienceItems = rewrite.workExperience.filter(
      (item) => item.title || item.organization || item.duration || item.bullets.length
    );

    if (!experienceItems.length) return;

    addHeading("Work Experience");
    experienceItems.forEach((item) => {
      const headline = [item.title, item.organization, item.duration]
        .map(normalizePdfText)
        .filter(Boolean)
        .join(" | ");
      addParagraph(headline);
      addBulletList(item.bullets);
    });
  }

  function addPortfolio() {
    const portfolioItems = [
      rewrite.portfolio.github,
      rewrite.portfolio.leetcode,
      rewrite.portfolio.website,
    ]
      .map((item) => normalizePdfText(item ?? ""))
      .filter(Boolean);

    if (!portfolioItems.length) return;

    addHeading("Portfolio");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(17, 17, 17);
    portfolioItems.forEach((item) => {
      const isUrl = /^https?:\/\//i.test(item) || /^(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}\//i.test(item);
      const lines = doc.splitTextToSize(item, maxWidth - 18) as string[];

      ensureSpace(lines.length * bodyLineHeight);
      doc.text("•", marginX, y);

      if (isUrl) {
        doc.textWithLink(lines[0] ?? item, marginX + 18, y, {
          url: item.startsWith("http") ? item : `https://${item}`,
        });
        if (lines.length > 1) {
          doc.text(lines.slice(1), marginX + 18, y + bodyLineHeight);
        }
      } else {
        doc.text(lines, marginX + 18, y);
      }

      y += lines.length * bodyLineHeight + 3;
    });
  }

  function addTechnicalSkills() {
    const groupedSkills = groupTechnicalSkills(rewrite.skillsSection);

    if (!groupedSkills.length) return;

    addHeading("Technical Skills");
    groupedSkills.forEach((group) => {
      addParagraph(`${group.label}: ${group.items.join(", ")}`);
    });
  }

  function addActivities() {
    const activities = extractResumeExportActivities(rewrite);

    if (!activities.length) return;

    addHeading("Extra Curricular Activities");
    addBulletList(activities);
  }

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  const contact = extractPdfContact(rewrite);

  addHeader(contact.name, contact.contactLine, contact.portfolioLine);
  addHeading("Professional Summary");
  addParagraph(rewrite.professionalSummary);
  addEducation();
  addWorkExperience();
  addProjects();
  addTechnicalSkills();
  addActivities();
  addPortfolio();
}

export function ResumeRewriterForm({ resumes }: { resumes: ResumeOption[] }) {
  const [state, formAction, pending] = useActionState(
    rewriteResumeForJD,
    initialResumeRewriteState
  );
  const [hideCurrentActionResult, setHideCurrentActionResult] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");
  const lastSubmittedResumeId = useRef("");
  const lastSubmittedJobDescription = useRef("");
  const savedRewriteSnapshot = useSyncExternalStore(
    subscribeToSavedRewrite,
    getSavedRewriteSnapshot,
    getServerSavedRewriteSnapshot
  );
  const resumeIds = useMemo(() => new Set(resumes.map((resume) => resume.id)), [resumes]);
  const savedRewriteState = useMemo(() => {
    if (!savedRewriteSnapshot) return null;

    try {
      const parsed = JSON.parse(savedRewriteSnapshot) as Partial<SavedResumeRewriteState>;

      if (
        typeof parsed.selectedResumeId !== "string" ||
        typeof parsed.jobDescription !== "string" ||
        typeof parsed.generatedAt !== "string" ||
        !isResumeRewriteResult(parsed.generatedRewrite)
      ) {
        return null;
      }

      return parsed as SavedResumeRewriteState;
    } catch {
      return null;
    }
  }, [savedRewriteSnapshot]);
  const validSavedRewriteState =
    savedRewriteState && resumeIds.has(savedRewriteState.selectedResumeId)
      ? savedRewriteState
      : null;
  const rewrite = hideCurrentActionResult
    ? validSavedRewriteState?.generatedRewrite ?? null
    : state.rewrite ?? validSavedRewriteState?.generatedRewrite ?? null;

  useEffect(() => {
    if (savedRewriteSnapshot && !validSavedRewriteState) {
      window.localStorage.removeItem(RESUME_REWRITE_STORAGE_KEY);
      notifySavedRewriteChanged();
    }
  }, [savedRewriteSnapshot, validSavedRewriteState]);

  useEffect(() => {
    if (
      state.status !== "success" ||
      !state.rewrite ||
      !lastSubmittedResumeId.current
    ) {
      return;
    }

    const nextSavedState: SavedResumeRewriteState = {
      selectedResumeId: lastSubmittedResumeId.current,
      jobDescription: lastSubmittedJobDescription.current,
      generatedRewrite: state.rewrite,
      generatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      RESUME_REWRITE_STORAGE_KEY,
      JSON.stringify(nextSavedState)
    );
    notifySavedRewriteChanged();
  }, [state.rewrite, state.status]);

  function submitRewrite(formData: FormData) {
    const resumeId = formData.get("resumeId");
    const jobDescription = formData.get("jobDescription");

    lastSubmittedResumeId.current =
      typeof resumeId === "string" ? resumeId : "";
    lastSubmittedJobDescription.current =
      typeof jobDescription === "string" ? jobDescription : "";
    setHideCurrentActionResult(false);
    formAction(formData);
  }

  function clearSavedRewrite() {
    const confirmed = window.confirm("Clear this saved resume rewrite?");

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(RESUME_REWRITE_STORAGE_KEY);
    notifySavedRewriteChanged();
    setHideCurrentActionResult(true);
    setExportMessage("");
    setExportStatus("idle");
  }

  async function exportRewritePdf() {
    if (!rewrite || exportingPdf) {
      return;
    }

    if (typeof window === "undefined" || typeof document === "undefined") {
      setExportMessage("PDF export is only available in the browser.");
      setExportStatus("error");
      return;
    }

    setExportingPdf(true);
    setExportMessage("");
    setExportStatus("idle");

    try {
      const jsPDF = await loadJsPdf();
      const doc = new jsPDF({
        unit: "pt",
        format: "letter",
        orientation: "portrait",
      });

      writeResumeExportPdf(doc, rewrite);
      doc.save("talentforge-rewritten-resume.pdf");

      setExportMessage("PDF export started.");
      setExportStatus("success");
    } catch (error) {
      console.error("Resume rewrite PDF export failed", error);
      console.error("Resume rewrite PDF export debug", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        hasSummary: Boolean(rewrite.professionalSummary.trim()),
        bulletCount: rewrite.experienceBullets.length,
        skillCount: rewrite.skillsSection.length,
        atsKeywordCount: rewrite.atsKeywords.length,
        hasWindow: typeof window !== "undefined",
        hasDocument: typeof document !== "undefined",
      });
      setExportMessage("PDF export failed. Please try again.");
      setExportStatus("error");
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="space-y-10">
      <Card className={forge.cardStrong}>
        <CardHeader className="border-b border-white/10 bg-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Generate Resume Rewrite</CardTitle>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Select one parsed resume, paste a JD, and generate truthful
                recruiter-ready sections tailored to the role.
              </p>
            </div>
            <p className="text-xs font-medium uppercase text-cyan-100">
              Saved locally only
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form action={submitRewrite} className="space-y-4 pt-5">
            <div className="rounded-3xl border border-[#00E5FF]/15 bg-[linear-gradient(135deg,rgba(0,229,255,0.08),rgba(255,255,255,0.035)_48%,rgba(106,92,255,0.08))] p-4 shadow-[0_0_30px_rgba(0,229,255,0.08)]">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(260px,1.15fr)_minmax(280px,1fr)_minmax(190px,auto)] lg:items-stretch">
                <div className={forge.metric}>
                  <p className="text-xs font-medium uppercase text-cyan-100">
                    Selected resume
                  </p>
                  <label htmlFor="resumeId" className="text-sm font-medium text-zinc-200">
                    Resume
                  </label>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Only your readable uploaded resumes are available.
                  </p>
                  <select
                    key={`rewrite-resume-${validSavedRewriteState?.selectedResumeId ?? "empty"}`}
                    id="resumeId"
                    name="resumeId"
                    required
                    defaultValue={validSavedRewriteState?.selectedResumeId ?? ""}
                    className={`mt-3 ${forge.select}`}
                  >
                    <option value="">Select a resume</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id} className="bg-slate-950">
                        {resume.title} - {resume.createdAtLabel}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={forge.metric}>
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    Output status
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                    {["Summary rewrite", "Resume sections", "PDF export"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-3 py-2 text-cyan-50 shadow-[0_0_18px_rgba(0,229,255,0.08)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#00E5FF]/15 bg-[#00E5FF]/10 p-3 shadow-[0_0_28px_rgba(0,229,255,0.08)]">
                  <p className="text-xs font-medium uppercase text-cyan-100">
                    Primary action
                  </p>
                  <Button
                    type="submit"
                    disabled={pending || resumes.length === 0}
                    className={`mt-3 h-14 w-full px-6 ${forge.primaryButton}`}
                  >
                    {pending ? "Generating..." : "Generate Rewrite"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
              <div className="flex flex-col gap-1 border-b border-white/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-cyan-100">
                    Input
                  </p>
                  <label
                    htmlFor="jobDescription"
                    className="text-sm font-medium text-zinc-200"
                  >
                    Job description
                  </label>
                </div>
                <p className="text-xs leading-5 text-zinc-500">
                  Responsibilities, required skills, tools, and qualifications.
                </p>
              </div>
              <Textarea
                key={`rewrite-jd-${validSavedRewriteState?.selectedResumeId ?? "empty"}`}
                id="jobDescription"
                name="jobDescription"
                required
                rows={9}
                defaultValue={validSavedRewriteState?.jobDescription ?? ""}
                placeholder="Paste the job description you want to tailor this resume toward..."
                className={`mt-3 max-h-[52vh] min-h-60 resize-y overflow-y-auto p-4 ${forge.input}`}
              />
            </div>

            {state.message ? (
              <p
                aria-live="polite"
                className={
                  state.status === "error"
                    ? "rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-200"
                    : "rounded-md border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
                }
              >
                {state.message}
              </p>
            ) : null}

          </form>
        </CardContent>
      </Card>

      {rewrite ? (
        <section className="space-y-6">
          <div className={`${forge.panel} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-100">
                Latest Resume Rewrite
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Saved in this browser. Missing skills are suggestions, not
                added as claimed experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Button
                type="button"
                onClick={exportRewritePdf}
                disabled={exportingPdf}
                className={forge.primaryButton}
              >
                <Download />
                {exportingPdf ? "Exporting..." : "Export PDF"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearSavedRewrite}
                className={forge.secondaryButton}
              >
                Clear saved rewrite
              </Button>
            </div>
          </div>

          {exportMessage ? (
            <p
              aria-live="polite"
              className={
                exportStatus === "error"
                  ? "rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-200"
                  : "rounded-md border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
              }
            >
              {exportMessage}
            </p>
          ) : null}

          <SectionCard
            title="Rewritten Professional Summary"
            copyText={rewrite.professionalSummary}
          >
            <p className="text-sm leading-7 text-zinc-300">
              {rewrite.professionalSummary}
            </p>
          </SectionCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard
              title="Rewritten Experience Bullets"
              copyText={rewrite.experienceBullets.map((item) => `- ${item}`).join("\n")}
            >
              <BulletList items={rewrite.experienceBullets} />
            </SectionCard>

            <SectionCard
              title="Optimized Skills Section"
              copyText={rewrite.skillsSection.join(", ")}
              tone="good"
            >
              <div className="flex flex-wrap gap-2">
                {rewrite.skillsSection.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/12 px-3 py-1 text-sm text-purple-50 shadow-[0_0_18px_rgba(139,92,246,0.1)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard
              title="ATS Keyword Suggestions"
              copyText={rewrite.atsKeywords.join(", ")}
            >
              <div className="flex flex-wrap gap-2">
                {rewrite.atsKeywords.length ? (
                  rewrite.atsKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-3 py-1 text-sm text-cyan-50 shadow-[0_0_18px_rgba(0,229,255,0.1)]"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">
                    No strong ATS keyword suggestions were extracted.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Missing Skills Suggestions"
              copyText={rewrite.missingSkills.join(", ")}
              tone="warn"
            >
              {rewrite.missingSkills.length ? (
                <BulletList items={rewrite.missingSkills} tone="warn" />
              ) : (
                <p className="text-sm leading-6 text-zinc-400">
                  No major missing skills were detected from this JD.
                </p>
              )}
            </SectionCard>
          </div>

          {SHOW_REWRITE_DEBUG_PANELS ? <RewriteDebugPanels rewrite={rewrite} /> : null}
        </section>
      ) : (
        <Card className={forge.card}>
          <CardContent className="py-10 text-center">
            <p className="text-sm font-semibold uppercase text-cyan-100">
              No rewrite generated yet
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Choose a resume and paste a job description to generate a
              professional summary, rewritten bullets, optimized skills, and
              ATS keyword guidance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
