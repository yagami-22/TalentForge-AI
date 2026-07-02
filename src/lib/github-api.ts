import "server-only";

export type GitHubApiErrorKind =
  | "invalid"
  | "rate-limit"
  | "not-found"
  | "network"
  | "timeout"
  | "service-unavailable"
  | "missing-token"
  | "invalid-token"
  | "unauthorized";

export class GitHubServiceError extends Error {
  kind: GitHubApiErrorKind;
  status: number;

  constructor(kind: GitHubApiErrorKind, message: string, status = 500) {
    super(message);
    this.name = "GitHubServiceError";
    this.kind = kind;
    this.status = status;
  }
}

type GitHubRequestOptions = {
  optional?: boolean;
  paginate?: boolean;
  timeoutMs?: number;
};

const allowedGitHubOrigin = "https://api.github.com";
const defaultTimeoutMs = 12000;
const cacheTtlMs = 1000 * 60 * 3;
const responseCache = new Map<string, { expiresAt: number; data: unknown }>();
const token = process.env.GITHUB_TOKEN?.trim();
const tokenStatus = validateGitHubToken(token);

function validateGitHubToken(value: string | undefined) {
  if (!value) {
    return {
      configured: false,
      valid: false,
      message: "GITHUB_TOKEN is not configured. Public unauthenticated GitHub limits will apply.",
    };
  }

  const valid =
    /^(ghp|github_pat|gho|ghu|ghs|ghr)_/.test(value) ||
    value.length >= 30;

  return {
    configured: true,
    valid,
    message: valid
      ? "GITHUB_TOKEN is configured for server-side GitHub API requests."
      : "GITHUB_TOKEN is present but does not look like a valid GitHub token.",
  };
}

export function getGitHubConfigurationStatus() {
  return tokenStatus;
}

function assertAllowedGitHubUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.origin !== allowedGitHubOrigin) {
      throw new GitHubServiceError("invalid", "Only GitHub API URLs can be analyzed.", 400);
    }

    return parsed;
  } catch (error) {
    if (error instanceof GitHubServiceError) {
      throw error;
    }

    throw new GitHubServiceError("invalid", "Invalid GitHub API URL.", 400);
  }
}

function buildGitHubHeaders() {
  if (tokenStatus.configured && !tokenStatus.valid) {
    throw new GitHubServiceError(
      "invalid-token",
      "GITHUB_TOKEN is configured but appears invalid. Check .env.local and restart the application.",
      401
    );
  }

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "TalentForge-AI-GitHub-Analyzer",
    ...(tokenStatus.configured && token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function rateLimitMessage(response: Response) {
  const reset = response.headers.get("x-ratelimit-reset");
  const resetHint = reset
    ? ` The limit resets at ${new Date(Number(reset) * 1000).toLocaleTimeString()}.`
    : "";

  return `GitHub API rate limit reached. Try again later.${resetHint} Add GITHUB_TOKEN to .env.local for higher limits.`;
}

function nextPageUrl(linkHeader: string | null) {
  if (!linkHeader) return null;

  const nextLink = linkHeader
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.endsWith('rel="next"'));
  const match = nextLink?.match(/<([^>]+)>/);

  return match?.[1] ?? null;
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: buildGitHubHeaders(),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new GitHubServiceError(
        "timeout",
        "GitHub API request timed out. Try again in a moment.",
        504
      );
    }

    throw new GitHubServiceError(
      "network",
      "Unable to reach GitHub right now. Check your connection and try again.",
      502
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function parseResponse<T>(
  response: Response,
  options: GitHubRequestOptions
): Promise<T | null> {
  const remaining = response.headers.get("x-ratelimit-remaining");

  if ((response.status === 403 || response.status === 429) && remaining === "0") {
    throw new GitHubServiceError("rate-limit", rateLimitMessage(response), 429);
  }

  if (response.status === 401) {
    throw new GitHubServiceError(
      "invalid-token",
      tokenStatus.configured
        ? "GitHub rejected GITHUB_TOKEN. Check token permissions, expiration, and .env.local, then restart the application."
        : "GitHub rejected the unauthenticated request.",
      401
    );
  }

  if (response.status === 404) {
    if (options.optional) {
      return null;
    }

    throw new GitHubServiceError(
      "not-found",
      "GitHub username or repository resource was not found.",
      404
    );
  }

  if (response.status === 503 || response.status === 502) {
    throw new GitHubServiceError(
      "service-unavailable",
      "GitHub is temporarily unavailable. Try again shortly.",
      503
    );
  }

  if (!response.ok) {
    if (options.optional) {
      return null;
    }

    throw new GitHubServiceError(
      "network",
      "GitHub API failed to return profile data.",
      502
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchGitHubData<T>(
  url: string,
  options: GitHubRequestOptions = {}
): Promise<T | null> {
  let currentUrl: string | null = assertAllowedGitHubUrl(url).toString();
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
  const cacheKey = JSON.stringify({
    url: currentUrl,
    paginate: options.paginate === true,
    optional: options.optional === true,
    tokenMode: tokenStatus.configured ? "authenticated" : "public",
  });
  const cached = responseCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  if (!options.paginate) {
    const response = await fetchWithTimeout(currentUrl, timeoutMs);
    const data = await parseResponse<T>(response, options);
    responseCache.set(cacheKey, { data, expiresAt: Date.now() + cacheTtlMs });
    return data;
  }

  const combined: unknown[] = [];
  let pageCount = 0;

  while (currentUrl && pageCount < 10) {
    const response = await fetchWithTimeout(currentUrl, timeoutMs);
    const pageData = await parseResponse<unknown[]>(response, options);

    if (!Array.isArray(pageData)) {
      throw new GitHubServiceError(
        "network",
        "GitHub returned an unexpected paginated response.",
        502
      );
    }

    combined.push(...pageData);
    currentUrl = nextPageUrl(response.headers.get("link"));
    pageCount += 1;
  }

  responseCache.set(cacheKey, { data: combined, expiresAt: Date.now() + cacheTtlMs });

  return combined as T;
}
