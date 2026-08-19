/**
 * Extracts a human-readable message from any thrown value.
 * Use this in `catch` blocks instead of typing the caught error as `any`.
 *
 * Example:
 *   try { ... } catch (err) { setError(getErrorMessage(err)); }
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return fallback;
}
