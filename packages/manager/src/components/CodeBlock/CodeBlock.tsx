import { Box, Typography } from '@linode/ui';
import React from 'react';

import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';
import { getHighlighterTheme, shiki } from 'src/utilities/syntax-highlighter';

import { CopyTooltip } from '../CopyTooltip/CopyTooltip';
import { useCodeBlockStyles } from './CodeBlock.styles';

import type { SupportedLanguage } from 'src/utilities/syntax-highlighter';

export interface CodeBlockProps {
  /**
   * A label/name for the analytics event that is captured when the user clicks the copy icon.
   * If this is not provided, no analytics event will be captured.
   */
  analyticsLabel?: string;
  /**
   * The code that will be displayed
   */
  code: string;
  /**
   * Function to optionally override the component's internal handling of the copy icon
   */
  handleCopyIconClick?: () => void;
  /**
   * The code's language. This will influence syntax highlighting.
   */
  language: SupportedLanguage;
  /**
   * Show line numbers on the code block
   * @default true
   */
  showLineNumbers?: boolean;
}

/**
 * Renders code with syntax highlighting.
 *
 * This component uses https://github.com/shikijs/shiki to power the syntax highlighting.
 */
export const CodeBlock = (props: CodeBlockProps) => {
  const {
    analyticsLabel,
    code,
    handleCopyIconClick,
    language,
    showLineNumbers = true,
  } = props;
  const { classes, cx, theme } = useCodeBlockStyles();

  const defaultHandleCopyIconClick = () => {
    if (analyticsLabel) {
      sendApiAwarenessClickEvent('Copy Icon', analyticsLabel);
    }
  };

  const unsafeHighlightedHtml = shiki.codeToHtml(code, {
    lang: language,
    theme: getHighlighterTheme(theme.palette.mode),
  });

  const sanitizedHtml = sanitizeHTML({
    allowMoreAttrs: ['class', 'style'],
    allowMoreTags: ['code', 'span', 'pre'],
    sanitizingTier: 'flexible',
    text: unsafeHighlightedHtml,
  });

  return (
    <Box
      className={cx(classes.codeblock, {
        [classes.lineNumbers]: showLineNumbers,
      })}
    >
      <Typography dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      <CopyTooltip
        className={classes.copyIcon}
        onClickCallback={handleCopyIconClick ?? defaultHandleCopyIconClick}
        text={code}
      />
    </Box>
  );
};
