import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { sendApiAwarenessClickEvent } from 'src/utilities/analytics';

import { useCodeBlockStyles } from './styles';
export interface Props {
  command: string;
  commandType: string;
  language: 'bash';
}

const CodeBlock = (props: Props) => {
  const { command, commandType, language } = props;
  const classes = useCodeBlockStyles();

  const handleCopyIconClick = () => {
    sendApiAwarenessClickEvent('Copy Icon', commandType);
  };

  return (
    <div className={classes.commandDisplay}>
      <HighlightedMarkdown
        className={classes.commandWrapper}
        language={language}
        textOrMarkdown={'```\n' + command + '\n```'}
      />
      <CopyTooltip
        className={classes.copyIcon}
        onClickCallback={handleCopyIconClick}
        text={command}
      />
    </div>
  );
};

export default CodeBlock;
