import React from 'react';

import { sendApiAwarenessClickEvent } from 'src/utilities/analytics';
import {
  StyledCommandDiv,
  StyledCopyTooltip,
  StyledHighlightedMarkdown,
} from './CodeBlock.styles';

export interface CodeBlockProps {
  command: string;
  commandType: string;
  language: 'bash';
}

export const CodeBlock = (props: CodeBlockProps) => {
  const { command, commandType, language } = props;

  const handleCopyIconClick = () => {
    sendApiAwarenessClickEvent('Copy Icon', commandType);
  };

  return (
    <StyledCommandDiv>
      <StyledHighlightedMarkdown
        language={language}
        textOrMarkdown={'```\n' + command + '\n```'}
      />
      <StyledCopyTooltip onClickCallback={handleCopyIconClick} text={command} />
    </StyledCommandDiv>
  );
};
