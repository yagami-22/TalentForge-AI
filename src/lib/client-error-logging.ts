type ClientErrorContext = {
  route?: string;
  digest?: string;
  source?: string;
};

export function logClientError(error: unknown, context: ClientErrorContext = {}) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[client-error]", {
    ...context,
    message,
    stack,
    timestamp: new Date().toISOString(),
  });
}
