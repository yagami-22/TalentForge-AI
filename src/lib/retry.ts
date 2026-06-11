type RetryOptions = {
  retries?: number;
  delayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return /timeout|timed out|network|connection|ECONNRESET|ETIMEDOUT|fetch failed|temporar/i.test(
    message
  );
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  {
    retries = 2,
    delayMs = 150,
    shouldRetry = isTransientError,
  }: RetryOptions = {}
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retries || !shouldRetry(error)) {
        throw error;
      }

      await sleep(delayMs * (attempt + 1));
    }
  }

  throw lastError;
}
