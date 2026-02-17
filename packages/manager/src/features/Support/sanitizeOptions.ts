import type { SanitizeOptions } from 'src/utilities/sanitizeHTML';

/**
 * Centralized sanitization configuration for support ticket content
 *
 * This configuration is used when rendering user-submitted support ticket descriptions
 * and replies via the Markdown component. It allows safe Markdown formatting while
 * blocking dangerous HTML that could be used for phishing attacks.
 *
 * Security Policy:
 * - Allows: Bold, italic, lists, code blocks, headers, tables, etc. (safe formatting)
 * - Blocks: <a> tags and other potentially dangerous HTML elements
 * - Preserves: Text content when removing disallowed tags
 *
 * Rationale:
 * - Users expect Markdown formatting support for better readability
 * - Links are blocked to prevent phishing/social engineering attacks
 * - Sanitization happens at render time (not on submit) to preserve original content
 */
export const SUPPORT_TICKET_SANITIZE_OPTIONS: SanitizeOptions = {
  ALLOWED_TAGS: [
    // Text formatting
    'strong',
    'b',
    'em',
    'i',
    'u',
    'del',
    's',
    // Code blocks
    'code',
    'pre',
    'span',
    // Lists
    'ul',
    'ol',
    'li',
    // Structure
    'p',
    'br',
    'hr',
    'blockquote',
    // Headers
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Tables
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    // NO <a> tags - links are blocked to prevent phishing
  ],
  ALLOWED_ATTR: ['class', 'style'], // Only for syntax highlighting in code blocks
  KEEP_CONTENT: true, // Preserve text when removing disallowed tags
};
