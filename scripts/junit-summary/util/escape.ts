/**
 * @file String escaping and sanitization utilities for various output formats.
 */

/**
 * Escapes a string intended for HTML output.
 *
 * @param str - String to escape.
 *
 * @returns String escaped for HTML output.
 */
export const escapeHtmlString = (str: string) => {
    // Adapted from https://stackoverflow.com/a/30970751
    const lookup: { [key: string]: string } = {
        '&': "&amp;",
        '"': "&quot;",
        '\'': "&apos;",
        '<': "&lt;",
        '>': "&gt;"
    };
    return str.replace( /[&"'<>]/g, (c) => lookup[c]);
};
