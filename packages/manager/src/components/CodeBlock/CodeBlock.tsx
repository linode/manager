import React from 'react';

import { sendApiAwarenessClickEvent } from 'src/utilities/analytics/customEventAnalytics';

import {
  StyledCommandDiv,
  StyledCopyTooltip,
  StyledHighlightedMarkdown,
} from './CodeBlock.styles';

import type { SupportedLanguage } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';

export interface CodeBlockProps {
  /** The CodeBlock command to be displayed */
  command: string;
  /** Label for analytics */
  commandType: string;
  /** Function to optionally override the component's internal handling of the copy icon */
  handleCopyIconClick?: () => void;
  /** The command language */
  language: SupportedLanguage;
}

export const CodeBlock = (props: CodeBlockProps) => {
  const { command, commandType, handleCopyIconClick, language } = props;

  const _handleCopyIconClick = () => {
    sendApiAwarenessClickEvent('Copy Icon', commandType);
  };

  return (
    <StyledCommandDiv>
      <StyledHighlightedMarkdown
        language={language}
        textOrMarkdown={'```\n' + command + '\n```'}
      />
      <StyledCopyTooltip
        onClickCallback={handleCopyIconClick ?? _handleCopyIconClick}
        text={command}
      />
    </StyledCommandDiv>
  );
};
