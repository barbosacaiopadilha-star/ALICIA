// Logger estruturado mínimo de servidor: JSON em stdout/stderr, sem
// dependências. Não usar em componentes client. Contexto passa por
// sanitização de chaves sensíveis antes de ser serializado.
type LogLevel = "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN =
  /token|secret|password|senha|cookie|authorization|api[-_]?key|email|cpf/i;

function sanitize(context: LogContext): LogContext {
  const clean: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      clean[key] = "[redacted]";
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      clean[key] = sanitize(value as LogContext);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function emit(level: LogLevel, event: string, context?: LogContext): void {
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...(context ? { context: sanitize(context) } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function logInfo(event: string, context?: LogContext): void {
  emit("info", event, context);
}

export function logWarn(event: string, context?: LogContext): void {
  emit("warn", event, context);
}

export function logError(event: string, context?: LogContext): void {
  emit("error", event, context);
}
