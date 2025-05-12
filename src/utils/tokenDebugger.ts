/**
 * Token debugging utilities
 *
 * This file contains functions for debugging JWT token issues
 */

/**
 * Inspects a token and logs detailed information about it
 *
 * @param token The token to inspect
 * @param context A string describing where the inspection is happening
 */
export function inspectToken(token: string | null, context: string): void {
  console.debug(`[TokenDebugger] Inspecting token at: ${context}`);

  if (!token) {
    console.debug('[TokenDebugger] Token is null or undefined');
    return;
  }

  // Log token length and preview
  console.debug(`[TokenDebugger] Token length: ${token.length}`);
  console.debug(`[TokenDebugger] Token preview: ${token.substring(0, 20)}...`);

  // Check if token has quotes
  if (
    token.startsWith('"') ||
    token.endsWith('"') ||
    token.startsWith("'") ||
    token.endsWith("'")
  ) {
    console.debug('[TokenDebugger] WARNING: Token has quote characters');
  }

  // Check for extra whitespace
  if (token.trim() !== token) {
    console.debug('[TokenDebugger] WARNING: Token has extra whitespace');
  }

  // Check parts
  const parts = token.split('.');
  console.debug(`[TokenDebugger] Token parts count: ${parts.length}`);

  if (parts.length === 3) {
    // Log each part length
    parts.forEach((part, index) => {
      console.debug(`[TokenDebugger] Part ${index} length: ${part.length}`);

      // Check for valid base64url encoding
      const base64UrlRegex = /^[A-Za-z0-9\-_]*$/;
      if (!base64UrlRegex.test(part)) {
        console.debug(
          `[TokenDebugger] WARNING: Part ${index} has invalid characters`,
        );
        // Log the first few invalid characters
        const invalidChars = Array.from(part)
          .filter((char) => !base64UrlRegex.test(char))
          .slice(0, 5);
        console.debug(
          `[TokenDebugger] First invalid chars: ${JSON.stringify(
            invalidChars,
          )}`,
        );
      }
    });
  } else {
    console.debug('[TokenDebugger] WARNING: Token does not have 3 parts');
  }
}

/**
 * Use this at the site of an error to debug tokens
 */
export function debugTokenFromStorage(): void {
  try {
    const token = localStorage.getItem('token');
    inspectToken(token, 'localStorage');
  } catch (e) {
    console.error('Error debugging token from storage:', e);
  }
}
