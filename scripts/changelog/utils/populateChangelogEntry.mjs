import MarkdownIt from 'markdown-it';
import { logger } from './logger.mjs';

const md = new MarkdownIt();

/**
 * Populates the changelog content with the provided entries.
 * @param {Object} entries - Entries grouped by type.
 * @param {string[]} changelogContent - The array of lines for the changelog content.
 * @returns {void} Pushes the entries to the changelog content array.
 */
export const populateChangelogEntry = (entries, changelogContent) => {
  try {
    Object.entries(entries)
      .sort()
      .forEach(([type, entries]) => {
        if (entries && entries.length > 0) {
          changelogContent.push(`\n### ${type}:\n`);
          entries.forEach(({ content }) => {
            const tokens = md.parse(content, {});
            let description = '';

            for (const token of tokens) {
              if (
                token.type === 'inline' &&
                token.content.includes('github.com/linode/manager/pull/')
              ) {
                description = token.content;
                break;
              }
            }

            if (description) {
              changelogContent.push(`- ${description}`);
            }
          });
        }
      });
  } catch (error) {
    logger.error({
      message: 'Error: Could not populate changelog entry.',
      info: error,
    });
  }
};
