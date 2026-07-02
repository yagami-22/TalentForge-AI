import { currentUser } from "@clerk/nextjs/server";

import {
  fetchGitHubData,
  getGitHubConfigurationStatus,
  GitHubServiceError,
  type GitHubApiErrorKind,
} from "@/lib/github-api";

export const runtime = "nodejs";

type GitHubProxyRequest = {
  url?: unknown;
  optional?: unknown;
  paginate?: unknown;
};

function jsonError(
  kind: GitHubApiErrorKind,
  message: string,
  status: number
) {
  return Response.json(
    {
      error: {
        kind,
        message,
        config: getGitHubConfigurationStatus(),
      },
    },
    { status }
  );
}

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return jsonError("unauthorized", "Sign in to analyze a GitHub profile.", 401);
  }

  let body: GitHubProxyRequest;

  try {
    body = (await request.json()) as GitHubProxyRequest;
  } catch {
    return jsonError("invalid", "Invalid GitHub analyzer request.", 400);
  }

  const url = parseAllowedGitHubUrl(body.url);
  const optional = body.optional === true;
  const paginate = body.paginate === true;

  if (!url) {
    return jsonError("invalid", "Only GitHub API URLs can be analyzed.", 400);
  }

  try {
    return Response.json({
      data: await fetchGitHubData(url.toString(), { optional, paginate }),
      config: getGitHubConfigurationStatus(),
    });
  } catch (error) {
    if (error instanceof GitHubServiceError) {
      if (optional && error.kind === "not-found") {
        return Response.json({ data: null, config: getGitHubConfigurationStatus() });
      }

      return jsonError(error.kind, error.message, error.status);
    }

    return jsonError("network", "GitHub analysis failed unexpectedly.", 500);
  }
}

function parseAllowedGitHubUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = new URL(value);
    return parsed.origin === "https://api.github.com" ? parsed : null;
  } catch {
    return null;
  }
}
