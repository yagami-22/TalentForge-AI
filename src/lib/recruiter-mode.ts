import { analyzeATSOptimization } from "@/lib/ats-optimizer";
import { analyzeResume, type ResumeDiagnostics } from "@/lib/resume-analyzer";

export const RECRUITER_REPORT_STORAGE_KEY = "talentforge.recruiter.latestReport";
export const RECRUITER_HISTORY_STORAGE_KEY = "talentforge.recruiter.history";

export type RecruiterRecommendation =
  | "Strong Hire"
  | "Hire"
  | "Interview Recommended"
  | "Junior Role Recommended"
  | "Not Recommended for This Senior Role";

export type RecruiterScore = {
  label: string;
  score: number | null;
  explanation: string;
  evidenceFound?: string[];
  evidenceMissing?: string[];
  includedInOverall?: boolean;
};

export type RecruiterRisk = {
  title: string;
  reason: string;
  severity: "High" | "Medium" | "Low";
};

export type RecruiterInterviewQuestions = {
  technical: string[];
  project: string[];
  behavioral: string[];
};

export type RecruiterCandidateInput = {
  id: string;
  name: string;
  fileName: string;
  resumeText: string;
};

export type RecruiterCandidateEvaluation = {
  id: string;
  name: string;
  fileName: string;
  overallHireScore: RecruiterScore;
  scores: {
    technical: RecruiterScore;
    atsCompatibility: RecruiterScore;
    projectQuality: RecruiterScore;
    skillMatch: RecruiterScore;
    experienceRelevance: RecruiterScore;
    education: RecruiterScore;
    communication: RecruiterScore;
    leadership: RecruiterScore;
    resumeQuality: RecruiterScore;
    portfolioQuality: RecruiterScore;
    githubQuality: RecruiterScore;
  };
  recommendation: RecruiterRecommendation;
  recommendationReason: string;
  strengths: string[];
  weaknesses: string[];
  hiringRisks: RecruiterRisk[];
  recruiterInsights: {
    topTechnicalStrengths: string[];
    mostRelevantProjects: string[];
    topMatchingSkills: string[];
    areasToVerify: string[];
  };
  seniorityAssessment: {
    candidateSeniority: string;
    jobSeniority: string;
    mismatch: boolean;
    explanation: string;
    evidenceFound: string[];
    evidenceMissing: string[];
    suggestedBetterFitRoles: string[];
  };
  interviewQuestions: RecruiterInterviewQuestions;
  executiveSummary: string;
};

export type RecruiterReport = {
  id: string;
  createdAt: string;
  jobDescription: string;
  role: string;
  candidates: RecruiterCandidateEvaluation[];
  metrics: {
    candidatesReviewed: number;
    strongHirePercent: number;
    averageATS: number;
    averageSkillMatch: number;
    averageProjectScore: number;
  };
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function lines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function score(
  label: string,
  value: number | null,
  explanation: string,
  options: {
    evidenceFound?: string[];
    evidenceMissing?: string[];
    includedInOverall?: boolean;
  } = {}
): RecruiterScore {
  return {
    label,
    score: value === null ? null : clampScore(value),
    explanation,
    ...options,
  };
}

function categoryScore(analysis: ResumeDiagnostics, pattern: RegExp) {
  const category = analysis.categoryScores.find((item) => pattern.test(item.name));

  if (!category || category.maxScore <= 0) {
    return 45;
  }

  return clampScore((category.score / category.maxScore) * 100);
}

function countMatches(text: string, terms: string[]) {
  const normalized = normalize(text);
  return terms.filter((term) => normalized.includes(term.toLowerCase()));
}

function detectRole(jobDescription: string) {
  const roleLine = lines(jobDescription).find((line) =>
    /\b(?:job title|title|role|position|hiring for|job)\b\s*[:|-]/i.test(line)
  );

  if (roleLine) {
    return roleLine
      .replace(/\b(?:job title|title|role|position|hiring for|job)\b\s*[:|-]\s*/i, "")
      .slice(0, 80);
  }

  const firstRole = lines(jobDescription).find((line) =>
    /engineer|developer|analyst|designer|manager|scientist|specialist|consultant/i.test(line)
  );

  return firstRole?.slice(0, 80) ?? "Open Role";
}

function requiresExternalProof(jobDescription: string) {
  return /github|gitlab|portfolio|repository|repo|live demo|case study|deployed|open source/i.test(
    jobDescription
  );
}

function candidateName(input: RecruiterCandidateInput) {
  if (input.name.trim()) return input.name.trim();
  return input.fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Candidate";
}

function linkQuality(text: string, pattern: RegExp) {
  const linkLines = lines(text).filter((line) => pattern.test(line));
  const directLinkLines = linkLines.filter((line) =>
    /https?:\/\/|github\.com|gitlab\.com|vercel\.app|netlify\.app/i.test(line)
  );
  const evidence = directLinkLines.length;

  if (evidence >= 2) {
    return { score: 88, found: true, evidence: directLinkLines.slice(0, 3) };
  }

  if (evidence) {
    return { score: 74, found: true, evidence: directLinkLines.slice(0, 3) };
  }

  return { score: null, found: false, evidence: [] };
}

function projectLines(text: string) {
  return lines(text)
    .filter((line) =>
      /project|built|developed|implemented|designed|deployed|architecture|database|api|react|node|python|sql/i.test(line)
    )
    .slice(0, 5);
}

function leadershipScore(text: string) {
  const terms = countMatches(text, [
    "led",
    "lead",
    "managed",
    "mentored",
    "owned",
    "coordinated",
    "collaborated",
    "stakeholder",
    "team",
    "leadership",
  ]);

  return clampScore(28 + terms.length * 10);
}

function detectJobSeniority(jobDescription: string) {
  const yearMatches = Array.from(
    jobDescription.matchAll(/\b([3-9]|1[0-5])\+?\s*(?:years?|yrs?)\b/gi)
  );
  const maxYears = Math.max(
    0,
    ...yearMatches.map((match) => Number.parseInt(match[1] ?? "0", 10))
  );
  const seniorTerms = countMatches(jobDescription, [
    "senior",
    "lead",
    "staff engineer",
    "principal",
    "architect",
    "4+ years",
    "5+ years",
    "3+ years",
  ]);
  const requiresSenior = maxYears >= 3 || seniorTerms.length > 0;

  return {
    requiresSenior,
    requiredYears: maxYears || null,
    label: requiresSenior
      ? maxYears
        ? `Senior (${maxYears}+ years)`
        : "Senior / Lead"
      : "Junior / Open",
    evidence: [
      ...yearMatches.map((match) => match[0]),
      ...seniorTerms,
    ].slice(0, 6),
  };
}

function detectCandidateSeniority(
  text: string,
  analysis: ResumeDiagnostics
) {
  const lower = normalize(text);
  const juniorSignals = countMatches(lower, [
    "student",
    "fresher",
    "intern",
    "internship",
    "academic project",
    "coursework",
    "college",
    "university",
    "b.tech",
    "bachelor",
  ]);
  const professionalSignals = countMatches(lower, [
    "software engineer",
    "frontend engineer",
    "backend engineer",
    "full stack engineer",
    "developer",
    "professional experience",
    "work experience",
    "employment",
  ]);
  const seniorSignals = countMatches(lower, [
    "senior",
    "lead",
    "staff",
    "architect",
    "managed team",
    "mentored",
  ]);
  const detected = analysis.detectedSeniority;

  if (seniorSignals.length || detected === "Senior") {
    return {
      label: "Senior",
      isJunior: false,
      evidence: [...seniorSignals, detected].filter(Boolean),
    };
  }

  if (
    juniorSignals.length ||
    detected === "Student" ||
    detected === "Fresher" ||
    detected === "Early Career"
  ) {
    return {
      label: detected === "Early Career" ? "Early Career" : "Fresher / Student",
      isJunior: true,
      evidence: [...juniorSignals, detected].filter(Boolean),
    };
  }

  return {
    label: professionalSignals.length ? "Professional" : "Unknown",
    isJunior: !professionalSignals.length,
    evidence: [...professionalSignals, detected].filter(Boolean),
  };
}

function computeExperienceRelevance({
  resumeText,
  projectQuality,
  skillMatch,
  seniorityMismatch,
}: {
  resumeText: string;
  projectQuality: number;
  skillMatch: number;
  seniorityMismatch: boolean;
}) {
  const internshipSignals = countMatches(resumeText, [
    "intern",
    "internship",
    "freelance",
    "contract",
    "client",
  ]);
  const professionalSignals = countMatches(resumeText, [
    "software engineer",
    "frontend engineer",
    "backend engineer",
    "full stack engineer",
    "developer",
    "professional experience",
    "work experience",
  ]);
  const projectEvidence = projectLines(resumeText);
  const hasRelevantProjects = projectEvidence.length > 0 || projectQuality >= 45 || skillMatch >= 45;

  if (professionalSignals.length >= 2) {
    const base = skillMatch >= 70 ? 78 : 68;
    return {
      value: seniorityMismatch ? Math.min(base, 62) : base,
      evidenceFound: professionalSignals.slice(0, 4),
      evidenceMissing: seniorityMismatch ? ["senior-level years or lead ownership"] : [],
      explanation: seniorityMismatch
        ? "Professional evidence exists, but it does not clearly satisfy the senior-level years/ownership bar."
        : "Professional role-aligned experience is evidenced in the resume.",
    };
  }

  if (internshipSignals.length) {
    return {
      value: seniorityMismatch ? 52 : 60,
      evidenceFound: internshipSignals.slice(0, 4),
      evidenceMissing: seniorityMismatch ? ["3+ years senior frontend experience"] : [],
      explanation: "Internship, freelance, or partial professional experience is relevant but not senior-level.",
    };
  }

  if (hasRelevantProjects) {
    return {
      value: seniorityMismatch ? 38 : 44,
      evidenceFound: projectEvidence.slice(0, 4),
      evidenceMissing: seniorityMismatch
        ? ["4+ years professional senior frontend experience"]
        : ["professional role-aligned experience"],
      explanation: "Relevant academic/personal project evidence exists, so experience relevance is partial rather than zero.",
    };
  }

  return {
    value: 15,
    evidenceFound: [],
    evidenceMissing: ["relevant projects", "internship evidence", "professional experience"],
    explanation: "No relevant project, internship, freelance, or professional evidence was detected.",
  };
}

function weightedOverall(
  parts: Array<{ value: number | null; weight: number; include?: boolean }>
) {
  const included = parts.filter((part) => part.include !== false && part.value !== null);
  const totalWeight = included.reduce((total, part) => total + part.weight, 0);

  if (!totalWeight) return 0;

  return clampScore(
    included.reduce((total, part) => total + (part.value ?? 0) * part.weight, 0) /
      totalWeight
  );
}

function recommendationFor(
  scoreValue: number,
  risks: RecruiterRisk[],
  seniorityMismatch: boolean
): RecruiterRecommendation {
  if (seniorityMismatch && scoreValue >= 58) return "Junior Role Recommended";
  if (seniorityMismatch) return "Not Recommended for This Senior Role";

  const highRisks = risks.filter((risk) => risk.severity === "High").length;

  if (scoreValue >= 86 && highRisks === 0) return "Strong Hire";
  if (scoreValue >= 76 && highRisks <= 1) return "Hire";
  return "Interview Recommended";
}

function risksFor(input: {
  skillMatch: number;
  projectQuality: number;
  leadership: number;
  experience: number;
  communication: number;
  portfolio: number | null;
  github: number | null;
  seniorityMismatch: boolean;
}) {
  const risks: RecruiterRisk[] = [];

  if (input.seniorityMismatch) {
    risks.push({
      title: "Seniority mismatch",
      reason:
        "The JD asks for senior/3+ years experience, but the resume appears fresher/student/early-career.",
      severity: "High",
    });
  }

  if (input.skillMatch < 55) {
    risks.push({
      title: "Skill mismatch",
      reason: "Required JD skills are not strongly evidenced in the resume.",
      severity: "High",
    });
  }
  if (input.projectQuality < 55) {
    risks.push({
      title: "Limited project diversity",
      reason: "Project evidence is thin or lacks depth, deployment, or tradeoff detail.",
      severity: "Medium",
    });
  }
  if (input.leadership < 55) {
    risks.push({
      title: "Missing leadership evidence",
      reason: "Resume does not clearly show ownership, mentoring, or team leadership.",
      severity: "Low",
    });
  }
  if (input.experience < 55) {
    risks.push({
      title: "Experience relevance concern",
      reason: "Work history does not map cleanly to the target role requirements.",
      severity: "Medium",
    });
  }
  if (input.communication < 55) {
    risks.push({
      title: "Resume clarity risk",
      reason: "Resume quality suggests the candidate may need verification on communication clarity.",
      severity: "Medium",
    });
  }
  if (input.portfolio !== null && input.github !== null && input.portfolio < 40 && input.github < 40) {
    risks.push({
      title: "Few production proof links",
      reason: "No strong GitHub or portfolio evidence was detected for external validation.",
      severity: "Low",
    });
  }

  return risks.slice(0, 5);
}

function strengthsFor(input: {
  atsScore: number;
  projectQuality: number;
  skillMatch: number;
  github: number | null;
  resumeQuality: number;
  technicalTerms: string[];
}) {
  return [
    input.technicalTerms[0] ? `Strong ${input.technicalTerms[0]} evidence` : "",
    input.projectQuality >= 75 ? "Strong project quality" : "",
    input.atsScore >= 78 ? "ATS optimized" : "",
    input.resumeQuality >= 75 ? "Clear resume" : "",
    input.github !== null && input.github >= 75 ? "Excellent GitHub evidence" : "",
    input.skillMatch >= 75 ? "Strong skill match for the role" : "",
  ].filter(Boolean);
}

function weaknessesFor(input: {
  atsMissing: string[];
  projectQuality: number;
  github: number | null;
  portfolio: number | null;
  leadership: number;
  resumeQuality: number;
  seniorityMismatch: boolean;
}) {
  return [
    input.atsMissing[0] ? `Missing ${input.atsMissing[0]}` : "",
    input.projectQuality < 60 ? "Weak project depth or deployment evidence" : "",
    input.github !== null && input.github < 45 ? "Limited GitHub evidence" : "",
    input.portfolio !== null && input.portfolio < 45 ? "Limited portfolio proof" : "",
    input.leadership < 55 ? "Missing leadership indicators" : "",
    input.seniorityMismatch ? "Does not meet senior-level years/ownership requirement" : "",
    input.resumeQuality < 60 ? "Few measurable achievements or unclear resume structure" : "",
  ].filter(Boolean);
}

function buildInterviewQuestions(candidate: string, skills: string[], projects: string[]) {
  const primarySkill = skills[0] ?? "your strongest technical skill";
  const secondarySkill = skills[1] ?? "the target stack";
  const project = projects[0] ?? "your most relevant project";

  return {
    technical: [
      `How have you used ${primarySkill} in a production or project setting?`,
      `Explain a difficult debugging issue involving ${secondarySkill}.`,
      "How would you design the API and data model for a core feature in this role?",
      "What testing strategy would you use for the most critical user flow?",
      "How would you improve performance, reliability, or scalability in this stack?",
    ],
    project: [
      `Walk me through the architecture of ${project}.`,
      "What tradeoff did you make in the project, and what would you change now?",
      "How did you handle deployment, data persistence, authentication, or bugs?",
    ],
    behavioral: [
      `Tell me about a time ${candidate} owned a difficult technical decision.`,
      "Describe a conflict, failure, or ambiguous requirement using STAR.",
    ],
  };
}

export function evaluateRecruiterCandidates({
  jobDescription,
  candidates,
}: {
  jobDescription: string;
  candidates: RecruiterCandidateInput[];
}): RecruiterReport {
  const role = detectRole(jobDescription);
  const jobSeniority = detectJobSeniority(jobDescription);
  const jdRequiresExternalProof = requiresExternalProof(jobDescription);
  const evaluated = candidates.map((candidate) => {
    const name = candidateName(candidate);
    const resumeAnalysis = analyzeResume(candidate.resumeText);
    const atsAnalysis = analyzeATSOptimization({
      resumeTitle: candidate.fileName || name,
      resumeText: candidate.resumeText,
      jobDescription,
    });
    const technicalTerms = atsAnalysis.matchedATSKeywords.slice(0, 8);
    const projects = projectLines(candidate.resumeText);
    const technical = average([
      categoryScore(resumeAnalysis, /skills|keyword/i),
      atsAnalysis.keywordCoverage,
      technicalTerms.length ? 72 + technicalTerms.length * 3 : 42,
    ]);
    const projectQuality = categoryScore(resumeAnalysis, /project/i);
    const skillMatch = atsAnalysis.keywordCoverage;
    const candidateSeniority = detectCandidateSeniority(candidate.resumeText, resumeAnalysis);
    const seniorityMismatch = jobSeniority.requiresSenior && candidateSeniority.isJunior;
    const experience = computeExperienceRelevance({
      resumeText: candidate.resumeText,
      projectQuality,
      skillMatch,
      seniorityMismatch,
    });
    const experienceRelevance = experience.value;
    const education = categoryScore(resumeAnalysis, /education/i);
    const communication = average([
      categoryScore(resumeAnalysis, /format/i),
      categoryScore(resumeAnalysis, /bullet/i),
      categoryScore(resumeAnalysis, /impact/i),
    ]);
    const leadership = leadershipScore(candidate.resumeText);
    const resumeQuality = resumeAnalysis.overallScore;
    const portfolio = linkQuality(candidate.resumeText, /portfolio|vercel|netlify|live|demo|case study/i);
    const github = linkQuality(candidate.resumeText, /github|gitlab|repository|repo/i);
    const includePortfolio = portfolio.found || jdRequiresExternalProof;
    const includeGithub = github.found || jdRequiresExternalProof;
    const riskItems = risksFor({
      skillMatch,
      projectQuality,
      leadership,
      experience: experienceRelevance,
      communication,
      portfolio: portfolio.score,
      github: github.score,
      seniorityMismatch,
    });
    const overall = weightedOverall([
      { value: technical, weight: 0.16 },
      { value: atsAnalysis.atsScore, weight: 0.12 },
      { value: projectQuality, weight: 0.12 },
      { value: skillMatch, weight: 0.14 },
      { value: experienceRelevance, weight: 0.12 },
      { value: education, weight: 0.06 },
      { value: communication, weight: 0.08 },
      { value: leadership, weight: 0.07 },
      { value: resumeQuality, weight: 0.08 },
      { value: portfolio.score ?? (jdRequiresExternalProof ? 0 : null), weight: 0.025, include: includePortfolio },
      { value: github.score ?? (jdRequiresExternalProof ? 0 : null), weight: 0.025, include: includeGithub },
    ]);
    const recommendation = recommendationFor(overall, riskItems, seniorityMismatch);
    const strengths = strengthsFor({
      atsScore: atsAnalysis.atsScore,
      projectQuality,
      skillMatch,
      github: github.score,
      resumeQuality,
      technicalTerms,
    });
    const weaknesses = weaknessesFor({
      atsMissing: atsAnalysis.missingATSKeywords,
      projectQuality,
      github: github.score,
      portfolio: portfolio.score,
      leadership,
      resumeQuality,
      seniorityMismatch,
    });
    const questions = buildInterviewQuestions(name, technicalTerms, projects);
    const betterFitRoles = seniorityMismatch
      ? [
          "Junior Frontend Engineer",
          "Frontend Internship",
          "Fresher Software Engineer",
          "React Developer Intern",
        ]
      : ["Target role appears aligned"];
    const seniorityGap = seniorityMismatch
      ? `Candidate appears ${candidateSeniority.label.toLowerCase()}, while the JD requires ${jobSeniority.label.toLowerCase()}.`
      : "No seniority mismatch detected from the resume and JD evidence.";
    const technicalEvidenceSummary =
      technicalTerms.slice(0, 3).join("/") || "relevant frontend/project skills";
    const seniorRoleWarning =
      "Not recommended for this senior role, but promising for junior/fresher/frontend internship roles.";
    const recommendationReason = seniorityMismatch
      ? seniorRoleWarning
      : recommendation === "Strong Hire" || recommendation === "Hire"
        ? "Candidate shows strong role match with enough evidence to advance."
        : "Candidate has enough signal to verify through interview.";
    const executiveSummary = seniorityMismatch
      ? `${name} has strong project evidence in ${technicalEvidenceSummary} but lacks ${
          jobSeniority.requiredYears ? `${jobSeniority.requiredYears}+ years` : "senior-level"
        } professional senior frontend experience. ${seniorRoleWarning}`
      : `${name} demonstrates ${technical >= 70 ? "strong" : "developing"} technical alignment for ${role}. Recommendation: ${recommendation}. Key concerns include ${(weaknesses.length ? weaknesses : ["evidence depth"]).slice(0, 2).join(" and ")}. Recommend ${overall >= 70 ? "technical interview" : "additional screening"} to verify project depth, skill match, and communication.`;

    return {
      id: candidate.id,
      name,
      fileName: candidate.fileName,
      overallHireScore: score(
        "Overall Hire Score",
        overall,
        `Weighted recruiter score across role match, resume quality, ATS compatibility, projects, experience, and evidence links.`
      ),
      scores: {
        technical: score(
          "Technical Score",
          technical,
          `Detected ${technicalTerms.length} relevant technical skill signal${technicalTerms.length === 1 ? "" : "s"}.`,
          {
            evidenceFound: technicalTerms.slice(0, 6),
            evidenceMissing: atsAnalysis.missingATSKeywords.slice(0, 4),
          }
        ),
        atsCompatibility: score(
          "ATS Compatibility",
          atsAnalysis.atsScore,
          atsAnalysis.summary,
          {
            evidenceFound: atsAnalysis.matchedATSKeywords.slice(0, 6),
            evidenceMissing: atsAnalysis.missingATSKeywords.slice(0, 6),
          }
        ),
        projectQuality: score(
          "Project Quality",
          projectQuality,
          projects.length
            ? `Found project evidence such as: ${projects[0]}`
            : "Project evidence is limited or hard to identify.",
          {
            evidenceFound: projects,
            evidenceMissing: projects.length ? [] : ["project architecture, deployment, or impact evidence"],
          }
        ),
        skillMatch: score(
          "Skill Match",
          skillMatch,
          `${atsAnalysis.matchedATSKeywords.length} matched keywords; ${atsAnalysis.missingATSKeywords.length} missing keywords.`,
          {
            evidenceFound: atsAnalysis.matchedATSKeywords.slice(0, 8),
            evidenceMissing: atsAnalysis.missingATSKeywords.slice(0, 8),
          }
        ),
        experienceRelevance: score(
          "Experience Relevance",
          experienceRelevance,
          experience.explanation,
          {
            evidenceFound: experience.evidenceFound,
            evidenceMissing: experience.evidenceMissing,
          }
        ),
        education: score(
          "Education Score",
          education,
          "Based on education clarity, completeness, and relevance."
        ),
        communication: score(
          "Communication Score",
          communication,
          "Estimated from resume formatting, bullet clarity, and impact writing."
        ),
        leadership: score(
          "Leadership Indicators",
          leadership,
          "Estimated from ownership, collaboration, mentoring, and leadership language."
        ),
        resumeQuality: score(
          "Resume Quality",
          resumeQuality,
          resumeAnalysis.summary
        ),
        portfolioQuality: score(
          "Portfolio Quality",
          portfolio.score,
          portfolio.found
            ? "Portfolio or live project proof appears in the resume."
            : jdRequiresExternalProof
              ? "JD asks for external proof, but no portfolio or live project link was detected."
              : "Not Provided. Portfolio was not detected and is not counted unless the JD requires it.",
          {
            evidenceFound: portfolio.evidence,
            evidenceMissing: portfolio.found ? [] : ["portfolio or live project link"],
            includedInOverall: includePortfolio,
          }
        ),
        githubQuality: score(
          "GitHub Quality",
          github.score,
          github.found
            ? "GitHub or repository evidence appears in the resume."
            : jdRequiresExternalProof
              ? "JD asks for external proof, but no GitHub or repository link was detected."
              : "Not Provided. GitHub was not detected and is not counted unless the JD requires it.",
          {
            evidenceFound: github.evidence,
            evidenceMissing: github.found ? [] : ["GitHub or repository link"],
            includedInOverall: includeGithub,
          }
        ),
      },
      recommendation,
      recommendationReason,
      strengths: strengths.length ? strengths : ["Candidate has some relevant baseline signals."],
      weaknesses: weaknesses.length ? weaknesses : ["No major weakness detected from resume evidence."],
      hiringRisks: riskItems.length
        ? riskItems
        : [
            {
              title: "Evidence verification",
              reason: "Resume appears solid; verify depth and authenticity during interview.",
              severity: "Low",
            },
          ],
      recruiterInsights: {
        topTechnicalStrengths: technicalTerms.length
          ? technicalTerms.slice(0, 6)
          : ["No dominant technical strength detected."],
        mostRelevantProjects: projects.length
          ? projects.slice(0, 4)
          : ["Ask candidate to explain their most relevant project."],
        topMatchingSkills: atsAnalysis.matchedATSKeywords.slice(0, 8),
        areasToVerify: [
          ...atsAnalysis.missingATSKeywords.slice(0, 4),
          ...riskItems.map((risk) => risk.title),
        ].slice(0, 8),
      },
      seniorityAssessment: {
        candidateSeniority: candidateSeniority.label,
        jobSeniority: jobSeniority.label,
        mismatch: seniorityMismatch,
        explanation: seniorityGap,
        evidenceFound: [
          ...candidateSeniority.evidence,
          ...jobSeniority.evidence,
          ...experience.evidenceFound,
        ].slice(0, 8),
        evidenceMissing: experience.evidenceMissing,
        suggestedBetterFitRoles: betterFitRoles,
      },
      interviewQuestions: questions,
      executiveSummary,
    } satisfies RecruiterCandidateEvaluation;
  });

  return {
    id: `recruiter_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    jobDescription,
    role,
    candidates: evaluated.sort(
      (a, b) => (b.overallHireScore.score ?? 0) - (a.overallHireScore.score ?? 0)
    ),
    metrics: {
      candidatesReviewed: evaluated.length,
      strongHirePercent: evaluated.length
        ? clampScore(
            (evaluated.filter((item) => item.recommendation === "Strong Hire").length /
              evaluated.length) *
              100
          )
        : 0,
      averageATS: average(evaluated.map((item) => item.scores.atsCompatibility.score ?? 0)),
      averageSkillMatch: average(evaluated.map((item) => item.scores.skillMatch.score ?? 0)),
      averageProjectScore: average(evaluated.map((item) => item.scores.projectQuality.score ?? 0)),
    },
  };
}
