import React from 'react';

import { sendApiAwarenessClickEvent } from 'src/utilities/analytics';
import {
  StyledCommandDiv,
  StyledCopyTooltip,
  StyledHighlightedMarkdown,
} from './styles';

export interface Props {
  command: string;
  commandType: string;
  language: 'bash';
}

const CodeBlock = (props: Props) => {
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

export default CodeBlock;
