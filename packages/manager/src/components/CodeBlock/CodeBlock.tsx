import { Typography } from '@linode/ui';
import React from 'react';

import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';
import { getHighlighterTheme, shiki } from 'src/utilities/syntax-highlighter';
import { useColorMode } from 'src/utilities/theme';

import { StyledCommandDiv, StyledCopyTooltip } from './CodeBlock.styles';

import type { SupportedLanguage } from 'src/utilities/syntax-highlighter';

export interface CodeBlockProps {
  /** The CodeBlock command to be displayed */
  command: string;
  /** Label for analytics */
  commandType?: string;
  /** Function to optionally override the component's internal handling of the copy icon */
  handleCopyIconClick?: () => void;
  /** The command language */
  language: SupportedLanguage;
}

export const CodeBlock = (props: CodeBlockProps) => {
  const { command, commandType, handleCopyIconClick, language } = props;
  const { colorMode } = useColorMode();

  const _handleCopyIconClick = () => {
    if (commandType) {
      sendApiAwarenessClickEvent('Copy Icon', commandType);
    }
  };

  const unsafeHighlightedHtml = shiki.codeToHtml(command.trim(), {
    lang: language,
    theme: getHighlighterTheme(colorMode),
  });

  const sanitizedHtml = sanitizeHTML({
    allowMoreAttrs: ['class', 'style'],
    allowMoreTags: ['code', 'span', 'pre'],
    sanitizingTier: 'flexible',
    text: unsafeHighlightedHtml,
  });

  return (
    <StyledCommandDiv>
      <Typography dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      <StyledCopyTooltip
        onClickCallback={handleCopyIconClick ?? _handleCopyIconClick}
        text={command}
      />
    </StyledCommandDiv>
  );
};
